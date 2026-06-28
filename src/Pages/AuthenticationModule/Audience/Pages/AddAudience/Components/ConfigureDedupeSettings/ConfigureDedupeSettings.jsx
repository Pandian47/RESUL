import { onlyNumbersDecimalWithoutSpecialCharactersUpto3Digits } from 'Utils/modules/inputValidators';
import { ENTER_ATTRIBUTE } from 'Constants/GlobalConstant/ValidationMessage';
import { CANCEL, COMBINED, COMBINED_TOOLTIP, SAVE, SINGLE_COLUMN, SINGLE_COLUMN_TOOLTIP } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_medium, settings_large, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';

import RSTooltip from 'Components/RSTooltip';
import RSModal from 'Components/RSModal';
import KendoGrid from 'Components/RSKendoGrid';
import GridLoadingSkeleton from 'Pages/KendoDocs/CommonComponents/ResKendoGrid/GridLoadingSkeleton';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSPPophover from 'Components/RSPPophover';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { parseAudienceJsonArray } from 'Pages/AuthenticationModule/Audience/audienceDefaults';

import { useDispatch, useSelector } from 'react-redux';
import { getDedupAttributes, saveDedupAttribute, getDedupeSettingById } from 'Reducers/audience/addAudience/request';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    buildPayload,
    handleAttributeDuplicates,
    handleValueRange,
    mapFieldType,
    mapDedupeSettingResponseToForm,
} from './constant';

/** Only these form keys are owned by this modal — merge into existing form state so listType / audienceBy / CSV flows stay stable */
const DEDUPE_FORM_PATCH_KEYS = ['settings', 'single', 'combined'];
const DEDUPE_GRID_COLUMN_COUNT = 4;
const DEDUPE_GRID_SKELETON_ROWS = 5;
const MIN_COLUMN_NAME_FILTER_COUNT = 25;
const DEDUPE_FILTER_POPUP_Z_INDEX = 10010;

const ConfigureDedupeSettings = ({ type = 'addAudience' }) => {
    const dispatch = useDispatch();
    const SINGLE_THRESHOLD_DEFAULT = 0.7;
    const COMBINED_THRESHOLD_DEFAULT = 0.001;
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const {
        control,
        getValues,
        reset,
        setValue,
        formState: { errors },
    } = useFormContext();
    const [show, setShow] = useState(false);
    const errorKeys = ['combined', 'settings', 'single'];
    const isError = errorKeys.some((key) => key in errors);
    const [dedupeSettingsGridData, setDedupeSettingsGridData] = useState([]);
    const [isDedupeLoading, setIsDedupeLoading] = useState(false);
    const [isDedupeSaving, setIsDedupeSaving] = useState(false);
    const dedupeGridRef = useRef(null);

    const isColumnNameFilterEnabled = dedupeSettingsGridData.length >= MIN_COLUMN_NAME_FILTER_COUNT;

    /** Apply only dedupe fields so parent Add Audience / CSV effects (e.g. audienceBy identity) are not disturbed more than necessary */
    const patchDedupeFormFields = useCallback(
        (patch) => {
            reset((formState) => {
                const next = { ...formState };
                DEDUPE_FORM_PATCH_KEYS.forEach((key) => {
                    if (Object.prototype.hasOwnProperty.call(patch, key)) {
                        next[key] = patch[key];
                    }
                });
                return next;
            });
        },
        [reset],
    );

    const handleDefaultReset = (dedupeSettingsData) => {
        const formattedSettings = dedupeSettingsData.map((item) => ({
            name: item,
            weight: 0.5,
            compare: mapFieldType(item.FieldTypeID),
            grams: 3,
        }));
        patchDedupeFormFields({
            settings: formattedSettings,
            single: SINGLE_THRESHOLD_DEFAULT,
            combined: COMBINED_THRESHOLD_DEFAULT,
        });
        return formattedSettings;
    };

    useEffect(() => {
        if (!show) {
            setIsDedupeLoading(false);
            setIsDedupeSaving(false);
            return undefined;
        }

        const fetchData = async () => {
            setIsDedupeLoading(true);
            try {
                if (type === 'catalogue') {
                    try {
                        const dedupeId = getValues('dedupeSettingSaveStatus')?.dedupeSettingId || 0;
                        const savedSettingsResponse = await handleDedupeSettingByIdAPI(dedupeId);
                        const responseData = Array.isArray(savedSettingsResponse?.data)
                            ? savedSettingsResponse?.data?.[0]
                            : savedSettingsResponse?.data || savedSettingsResponse;

                        let attributesFromResponse = [];
                        if (responseData?.inputAttributesJSON) {
                            if (typeof responseData?.inputAttributesJSON === 'string') {
                                attributesFromResponse = parseAudienceJsonArray(
                                    responseData.inputAttributesJSON,
                                    [],
                                );
                            } else if (Array.isArray(responseData?.inputAttributesJSON)) {
                                attributesFromResponse = responseData.inputAttributesJSON;
                            } else {
                                attributesFromResponse = [];
                            }
                        }
                        setDedupeSettingsGridData(attributesFromResponse);

                        const mappedFormData = mapDedupeSettingResponseToForm(responseData, attributesFromResponse);

                        if (mappedFormData) {
                            patchDedupeFormFields(mappedFormData);
                        } else {
                            const formattedSettings = attributesFromResponse.map((item) => ({
                                name: item,
                                weight: 0.5,
                                compare: mapFieldType(item.FieldTypeID),
                                grams: 3,
                            }));
                            patchDedupeFormFields({
                                settings: formattedSettings,
                                single: SINGLE_THRESHOLD_DEFAULT,
                                combined: COMBINED_THRESHOLD_DEFAULT,
                            });
                        }
                    } catch (error) {
                        setDedupeSettingsGridData([]);
                    }
                } else {
                    const attributesResponse = dedupeSettingsGridData?.length
                        ? { data: dedupeSettingsGridData }
                        : await handleDedupattributeAPI();
                    const dedupeSettingsData = attributesResponse?.data || [];
                    setDedupeSettingsGridData(dedupeSettingsData);

                    const savedDedupeId = getValues('dedupeSettingSaveStatus')?.dedupeSettingId;
                    const hasSavedDedupe = savedDedupeId && parseInt(savedDedupeId, 10) > 0;

                    if (hasSavedDedupe) {
                        try {
                            const savedSettingsResponse = await handleDedupeSettingByIdAPI(
                                savedDedupeId,
                                type,
                            );
                            const responseData = Array.isArray(savedSettingsResponse?.data)
                                ? savedSettingsResponse?.data?.[0]
                                : savedSettingsResponse?.data || savedSettingsResponse;

                            const mappedFormData = mapDedupeSettingResponseToForm(responseData, dedupeSettingsData);

                            if (mappedFormData) {
                                patchDedupeFormFields(mappedFormData);
                            } else {
                                const formattedSettings = dedupeSettingsData.map((item) => ({
                                    name: item,
                                    weight: 0.5,
                                    compare: mapFieldType(item.filedTypeId),
                                    grams: 3,
                                }));
                                patchDedupeFormFields({
                                    settings: formattedSettings,
                                    single: SINGLE_THRESHOLD_DEFAULT,
                                    combined: COMBINED_THRESHOLD_DEFAULT,
                                });
                            }
                        } catch (error) {
                            handleDefaultReset(dedupeSettingsData);
                        }
                    } else {
                        handleDefaultReset(dedupeSettingsData);
                    }
                }
            } catch (error) {
                setDedupeSettingsGridData([]);
            } finally {
                setIsDedupeLoading(false);
            }
        };
        fetchData();
    }, [show, type, patchDedupeFormFields]);

    const knownKeys = ['settings', 'single', 'combined'];
    const otherErrorCount = Object.keys(errors || {}).filter((key) => !knownKeys.includes(key)).length;

    useEffect(() => {
        if (!show || otherErrorCount === 0) {
            return;
        }
        setShow(false);
    }, [show, otherErrorCount]);

    const handleDedupattributeAPI = async () => {
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        const response = await dispatch(getDedupAttributes({ payload }));
        return response;
    };

    const handleDedupeSettingByIdAPI = async (dedupeId = 0, fromType) => {
        const payload = {
            departmentId,
            clientId,
            from: fromType || type || 'addAudience',
            JobID: parseInt(dedupeId, 10),
            userId,
        };
        const response = await dispatch(getDedupeSettingById({ payload }));
        return response;
    };

    const handleGridData = () => {
        const finalGridFormatData = dedupeSettingsGridData?.map((attributeData) => {
            return {
                ...attributeData,
                weight: 0.5,
                compare: 'Numeric',
                grams: '3',
            };
        });
        return finalGridFormatData;
    };

    const formSubmit = async (formState) => {
        // Additional deduplication check before saving
        if (formState?.settings && Array.isArray(formState.settings)) {
            const seenIds = new Set();
            const duplicates = formState.settings.filter((setting) => {
                const attributeId = setting?.name?.dataAttributeID;
                if (attributeId) {
                    if (seenIds.has(attributeId)) {
                        return true; // This is a duplicate
                    }
                    seenIds.add(attributeId);
                }
                return false;
            });

            if (duplicates.length > 0) {
            }
        }

        const userDetails = {
            departmentId,
            clientId,
            userId,
        };
        const payload = buildPayload(formState, userDetails, type);
        setIsDedupeSaving(true);
        try {
            const saveResponse = await dispatch(saveDedupAttribute({ payload }));
            if (saveResponse?.status) {
                setValue('dedupeSettingSaveStatus', {
                    dedupeSettingId: saveResponse?.data,
                    dedupeSettingStatus: true,
                });
                setShow(false);
            } else {
                setValue('dedupeSettingSaveStatus', {
                    dedupeSettingId: 0,
                    dedupeSettingStatus: false,
                });
            }
        } catch (err) {
            setValue('dedupeSettingSaveStatus', {
                dedupeSettingId: 0,
                dedupeSettingStatus: false,
            });
        } finally {
            setIsDedupeSaving(false);
        }
    };

    const handleClose = () => {
        setShow(false);
        setIsDedupeLoading(false);
        setIsDedupeSaving(false);
    };

    const alignDedupeFilterPopup = useCallback(() => {
        const gridWrapper = dedupeGridRef.current;
        if (!gridWrapper) return;

        const filterAnchor = gridWrapper.querySelector(
            '.rs-kendo-header-filter-slot .k-grid-header-menu, .rs-kendo-header-filter-slot .k-grid-column-menu',
        );
        const popup = document.querySelector(
            '.k-animation-container.k-animation-container-shown .k-popup.k-grid-columnmenu-popup',
        );
        if (!filterAnchor || !popup) return;

        const container = popup.closest('.k-animation-container');
        if (!container) return;

        const anchorRect = filterAnchor.getBoundingClientRect();
        const popupWidth = container.offsetWidth || 220;
        const popupHeight = container.offsetHeight || 280;

        let top = anchorRect.bottom + 4;
        if (top + popupHeight > window.innerHeight - 8) {
            top = Math.max(8, anchorRect.top - popupHeight - 4);
        }

        let left = anchorRect.left;
        if (left + popupWidth > window.innerWidth - 8) {
            left = Math.max(8, window.innerWidth - popupWidth - 8);
        }

        container.style.position = 'fixed';
        container.style.top = `${Math.round(top)}px`;
        container.style.left = `${Math.round(left)}px`;
        container.style.zIndex = String(DEDUPE_FILTER_POPUP_Z_INDEX);

        container.querySelectorAll('.k-child-animation-container').forEach((child) => {
            child.style.zIndex = String(DEDUPE_FILTER_POPUP_Z_INDEX);
        });
    }, []);

    useEffect(() => {
        if (!show) return undefined;

        const syncFilterPopupPosition = () => {
            requestAnimationFrame(alignDedupeFilterPopup);
        };

        const observer = new MutationObserver(syncFilterPopupPosition);
        observer.observe(document.body, { childList: true, subtree: true });
        window.addEventListener('resize', syncFilterPopupPosition);
        window.addEventListener('scroll', syncFilterPopupPosition, true);

        return () => {
            observer.disconnect();
            window.removeEventListener('resize', syncFilterPopupPosition);
            window.removeEventListener('scroll', syncFilterPopupPosition, true);
        };
    }, [show, alignDedupeFilterPopup]);

    const dedupeGridColumns = useMemo(
        () => [
        {
            field: 'name',
            title: 'Column name',
            ...(isColumnNameFilterEnabled ? { filter: 'text' } : {}),
            cell: ({ dataIndex }) => {
                return (
                    <td>
                        <RSKendoDropdown
                            name={`settings[${dataIndex}].name`}
                            control={control}
                            data={dedupeSettingsGridData}
                            defaultValue={dedupeSettingsGridData[dataIndex]}
                            dataItemKey={'dataAttributeID'}
                            textField={'uIPrintableName'}
                            rules={{
                                validate: (value) => {
                                    const allSettings = getValues('settings');
                                    return handleAttributeDuplicates(allSettings, value);
                                },
                            }}
                            className="mt10"
                            popupSettings={{
                                popupClass: 'addImportAudienceDropdownListContainer',
                            }}
                        />
                    </td>
                );
            },
        },
        {
            field: 'weight',
            title: 'Weight',
            cell: ({ dataIndex, dataItem }) => (
                <td>
                    <RSInput
                        className={'text-center mt10'}
                        labelClassName="mt5"
                        name={`settings[${dataIndex}].weight`}
                        control={control}
                        defaultValue={dataItem?.weight}
                        onKeyDown={onlyNumbersDecimalWithoutSpecialCharactersUpto3Digits}
                        maxLength={3}
                        rules={{
                            required: ENTER_ATTRIBUTE,
                            validate: (value) => {
                                return handleValueRange(value, 0, 1);
                            },
                        }}
                        required
                    />
                </td>
            ),
            headerCell: () => (
                <div className='d-flex align-items-center justify-content-between'>
                    <span>Weight</span>
                        <RSPPophover
                            position={'top'}
                            pophover={
                                'Weights can be given in any scale but should be in comparison to each column A column is considered for dedup only if the weight is > 0.'
                            }
                            className="modalOverlayZindexCSS"
                        >
                            <i className={`${circle_question_mark_medium} icon-md`}></i>
                        </RSPPophover>
                    </div>
            ),
        },
        {
            field: 'compare',
            title: 'Compare as',
            cell: ({ dataIndex, dataItem }) => {
                const handleFieldType = (fieldId) => {
                    switch (fieldId) {
                        case 1:
                            return 'Text';
                        case 3:
                            return 'Decimal';
                        case 4:
                            return 'Integers';
                        case 5:
                            return 'Date';
                        default:
                            return 'Text';
                    }
                };
                return (
                    <td>
                        <RSKendoDropdown
                            name={`settings[${dataIndex}].compare`}
                            control={control}
                            data={['Text', 'Decimal', 'Integers', 'Date']}
                            defaultValue={handleFieldType(dataItem?.filedTypeId)}
                            className="pe-none click-off mt10"
                        />
                    </td>
                );
            },
            headerCell: () => (
                <div className='d-flex align-items-center justify-content-between'>
                   <span> Compare as</span>
                        <RSPPophover
                            position={'top'}
                            pophover={
                                'Comparison can be done as either Alphanumeric or Numeric.'
                            }
                            className="modalOverlayZindexCSS"
                        >
                            <i className={`${circle_question_mark_medium} icon-md`}></i>
                        </RSPPophover>
                </div>
            ),
        },
        {
            field: 'grams',
            title: 'N-grams length',
            cell: ({ dataIndex, dataItem }) => {
                return (
                    <td>
                        <RSInput
                            className={'text-center mt10'}
                            labelClassName="mt5"
                            name={`settings[${dataIndex}].grams`}
                            control={control}
                            defaultValue={dataItem?.grams}
                            onKeyDown={onlyNumbersDecimalWithoutSpecialCharactersUpto3Digits}
                            maxLength={3}
                            rules={{
                                required: ENTER_ATTRIBUTE,
                                validate: (value) => {
                                    return handleValueRange(value, 3, 5);
                                },
                            }}
                            required
                        />
                    </td>
                );
            },
            headerCell: () => (
                <div className='d-flex align-items-center justify-content-between'>
                    <span>N-grams length</span>
                        <RSPPophover
                            position={'top'}
                            pophover={
                                'Number of characters contained is each substring for comparison.'
                            }
                            className="modalOverlayZindexCSS"
                        >
                            <i className={`${circle_question_mark_medium} icon-md`}></i>
                        </RSPPophover>
                    </div>
            ),
        },
    ],
        [control, dedupeSettingsGridData, getValues, isColumnNameFilterEnabled],
    );

    const dedupeModalBody = isDedupeLoading ? (
        <div className="pref-dedupe-modal-grid-skeleton rs-kendo-grid-table" aria-hidden="true">
            <GridLoadingSkeleton
                rows={DEDUPE_GRID_SKELETON_ROWS}
                columns={DEDUPE_GRID_COLUMN_COUNT}
                wrapperClassName="p0"
            />
        </div>
    ) : (
        <form>
            <div className="pref-dedupe-modal-grid" ref={dedupeGridRef}>
            <KendoGrid
                data={handleGridData()}
                noBoxShadow
                isLoading={false}
                column={dedupeGridColumns}
            />
            </div>
            {!dedupeSettingsGridData?.length ? null : (
                <Row>
                    <Col sm={6}>
                        <Row className="mt20">
                            <Col sm={6}>
                                <label>{SINGLE_COLUMN}</label>
                            </Col>
                            <Col sm={6} className="d-flex">
                                <RSInput
                                    className={'text-center'}
                                    name="single"
                                    control={control}
                                    defaultValue={0.3}
                                    rules={{
                                        required: ENTER_ATTRIBUTE,
                                        validate: (value) => {
                                            return handleValueRange(value, 0, 1);
                                        },
                                    }}
                                    rightTooltip={SINGLE_COLUMN_TOOLTIP}
                                    required
                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharactersUpto3Digits}
                                />

                            </Col>
                        </Row>
                    </Col>
                    <Col sm={6}>
                        <Row className="mt20">
                            <Col sm={6}>
                                <label>{COMBINED}</label>
                            </Col>
                            <Col sm={6} className="d-flex">
                                <RSInput
                                    className={'text-center'}
                                    name="combined"
                                    control={control}
                                    defaultValue={COMBINED_THRESHOLD_DEFAULT}
                                    rules={{
                                        required: ENTER_ATTRIBUTE,
                                        validate: (value) => {
                                            return handleValueRange(value, 0, 1);
                                        },
                                    }}
                                    rightTooltip={COMBINED_TOOLTIP}
                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharactersUpto3Digits}
                                    required
                                />

                            </Col>
                        </Row>
                    </Col>
                </Row>
            )}
            {!dedupeSettingsGridData?.length ? null : (
                <div className="buttons-holder">
                    <RSSecondaryButton
                        className="mr15"
                        onClick={handleClose}
                        blockInteraction={isDedupeSaving}
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        disabledClass={isDedupeSaving ? 'click-off pe-none' : isError ? 'click-off pe-none' : ''}
                        onClick={() => formSubmit(getValues())}
                        isLoading={isDedupeSaving}
                        blockBodyPointerEvents={isDedupeSaving}
                    >
                        {SAVE}
                    </RSPrimaryButton>
                </div>
            )}
        </form>
    );

    return (
        <>
            <RSTooltip position="top" text="Deduplication settings" className={`lh0 ${type !== 'catalogue' ? 'mr10 mt5' : ''}`}>
                <i
                    className={`color-primary-blue ${type === 'catalogue'
                            ? `${settings_large} icon-lg mr15`
                            : `${settings_medium} icon-md`
                        }`}
                    onClick={() => setShow(true)}
                />
            </RSTooltip>
            <RSModal
                show={show}
                handleClose={handleClose}
                header="Configure dedupe input settings"
                size="xxlg"
                className="pref-dedupe-settings-modal"
                bodyClassName="pref-dedupe-modal-body"
                body={dedupeModalBody}
            />
        </>
    );
};

export default memo(ConfigureDedupeSettings);
