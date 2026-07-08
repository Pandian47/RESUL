import { checkIsBrandExists } from 'Utils/modules/brandStorage';
import { BRAND_ID_CHECK } from 'Utils/modules/communicationChannels';
import { getCsvListType } from 'Utils/modules/browserUtils';
import { getYYYYMMDDHHMMSS } from 'Utils/modules/dateTime';
import { getListType, limitConfigBUWiseList, modalType } from './constant';
import { FILECOUNT, FILECOUNT_TL, MAX_LENGTH200 } from 'Constants/GlobalConstant/Regex';
import {
    ENTER_IMPORT_DESCRIPTION,
    SELECT_LIST_TYPE,
} from 'Constants/GlobalConstant/ValidationMessage';
import {
    ARE_YOU_SURE_WANT_TO_RESET,
    ENTER_LIST_NAME,
    FILTER_GROUP_TEXT,
    IMPORT_DESCRIPTION,
    LIST_TYPE,
    RESET,
    CHILD_ATTRIBUTE,
} from 'Constants/GlobalConstant/Placeholders';
import {
    circle_question_mark_mini,
    restart_medium,
    settings_medium,
} from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useMemo, useRef, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';

import RSTooltip from 'Components/RSTooltip';
import ListNameExists from 'Components/ListNameExists';
import RSKendoDropdownList from 'Components/FormFields/RSKendoDropdown';
import ConfirmationPopup from './Components/ConfirmationPopup/ConfirmationPopup';

import { getSessionId } from 'Reducers/globalState/selector';
import {
    deleteCsvFiles,
    resetCsvFiles,
    updateHeaderColumns,
    updateListAnalysisData,
    updateResponseHeader,
} from 'Reducers/audience/addAudience/reducer';
import { checkImportDescriptionExists, getAudienceBUWiseListCount } from 'Reducers/audience/addAudience/request';
import { LIST_NAME_RULES } from 'Pages/AuthenticationModule/Audience/audienceFormRules';
import RSConfirmationModal from 'Components/ConfirmationModal';
import ListAnalysis from '../../../AddImportAudience/Components/ListAnalysis';
import useQueryParams from 'Hooks/useQueryParams';
import CSVUpload from './Components/CSVUpload';
import ExcelUpload from './Components/ExcelUpload';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { getListsConstant } from './Components/ConfirmationPopup/constant';
import ChildAttrModal from '../ChildAttrModal';

const LIST_TYPE_MODAL_KEY_BY_VALUE = {
    'Ad-hoc list': 'adhoclist',
    'Seed list': 'seedList',
    'Match input list': 'matchList',
    'Suppression input list': 'supressionList',
};

const resolveListTypeTooltipText = (selectedListType, fileType = 'CSV') => {
    if (selectedListType === 'Target list') {
        return FILTER_GROUP_TEXT;
    }

    const modalKey = LIST_TYPE_MODAL_KEY_BY_VALUE[selectedListType];
    if (!modalKey) return undefined;

    const { options = [] } = getListsConstant(fileType)[modalKey] || {};
    return options[0]?.text;
};

const CSV = ({ audRefData, fetchAudienceInsight }) => {
    const state = useQueryParams('/audience');
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const audienceListCountApi = useApiLoader();
    const [listAnalysisInfoModal, setListAnalysisInfoModal] = useState({
        show: false,
        fileName: '',
    });
    const [modal, setModal] = useState({
        show: false,
        type: null,
    });
    const [isDelete, setIsDelete] = useState({
        show: false,
        deleteIndex: null,
        data: {},
    });
    const [isReset, setIsReset] = useState({
        show: false,
    });
    const [childAttrModal, setChildAttrModal] = useState({
        show: false,
    });
    const [isValidListname, setIsValidListname] = useState(false);
    const [invalidFiles, setInvalidFiles] = useState([]);
    const { csvFiles, path, headerColumns, responseHeaders, fileWiseListAnalysisData } = useSelector(
        ({ addAudienceReducer }) => addAudienceReducer,
    );

    const hasUploadError = !!csvFiles?.find((item) => item['isValid'] === false) || false;

    const {
        control,
        setValue,
        setError,
        clearErrors,
        watch,
        reset,
        formState: { errors },
    } = useFormContext();
    const [listType, audienceBy] = watch(['listType', 'audienceBy']);
    /** Primitive deps so form reset() (e.g. dedupe modal) does not re-fire effects when audienceBy object identity changes */
    const audienceByTypeId = audienceBy?.typeId;
    const hasListTypeError = Object.hasOwn(errors, 'listType');
    const isAdHocList = listType === 'Ad-hoc list';
    const isSeedList = listType === 'Seed list';
    const isTargetList = listType === 'Target list';
    const isMatchList = listType === 'Match input list';
    const isSuppressionList = listType === 'Suppression input list';

    useEffect(() => {
        return () => {
            dispatch(updateResponseHeader([]));
            dispatch(resetCsvFiles());
        };
    }, []);
    useEffect(() => {
        setValue('isColumnHeader', true);
        if (listType && BRAND_ID_CHECK.includes(listType) && checkIsBrandExists(departmentId)) {
            setModal({ show: true, type: 'brand' });
        }
    }, [departmentId, listType]);

    const csvType = audienceBy;
    const isNamePrefilledRef = useRef(false);

    useEffect(() => {
        if (state && audienceByTypeId && state?.from === 'targetList' && state?.type) {
            const { finalValue, listType: listTypeFromQuery } = modalType(state);

            if (finalValue && state?.mode !== 'inputList') {
                getModal({ value: finalValue });
            }
            setValue('listType', listTypeFromQuery);

            if (state?.mode === 'inputList' && !isNamePrefilledRef.current) {
                const prefix = state.type === 'match-list' ? 'ML' : 'SuL';
                const name = state.recipientsBunchName || '';

                const formattedDateTime = getYYYYMMDDHHMMSS();

                // setValue('listName', `${prefix}_${name}_${formattedDateTime}`);
                setValue('listName', `${name}_${formattedDateTime}`);
                isNamePrefilledRef.current = true;
                setTimeout(() => {
                    const input = document.getElementById('listName');
                    if (input) {
                        input.focus();
                        input.blur();
                    }
                }, 300);
            }
        }
    }, [state, audienceByTypeId, setValue]);

    const getModal = (e) => {
        const value = e.value?.toLowerCase();
        if (value.includes('ad-hoc list')) {
            setModal({ show: true, type: 'adhoclist' });
        } else if (value.includes('suppression input list') || value.includes('suppression list')) {
            setModal({ show: true, type: 'supressionList' });
        } else if (value.includes('match input list') || value.includes('match list')) {
            setModal({ show: true, type: 'matchList' });
        } else if (value.includes('seed list')) {
            setModal({ show: true, type: 'seedList' });
        }
    };

    let CSVLength = 0;
    if (isTargetList) CSVLength = FILECOUNT_TL;
    else if (isAdHocList) CSVLength = FILECOUNT;
    else if (isSeedList) CSVLength = 1;
    else if (isMatchList) CSVLength = FILECOUNT_TL;
    else if (isSuppressionList) CSVLength = FILECOUNT_TL;

    const removeUploadedFile = (deleteIndex, data = {}) => {
        dispatch(deleteCsvFiles(deleteIndex));
        dispatch(
            updateListAnalysisData({
                fileName: data?.fileName,
                data: {},
            }),
        );
        if (deleteIndex === 0 && csvFiles?.length === 1) {
            dispatch(resetCsvFiles());
        }
    };

    const handleErrorandValue = () => {
        // setValue('listName', '');
        clearErrors('csvFiles', '');
        clearErrors('listName', '');
        //setValue('csvFiles', '');
    };

    const openChildAttributeModal = () => {
        setChildAttrModal({ show: true });
        handleErrorandValue()
    };

    const maxLimitCheckList = [3];

    const checkListCount = async (type) => {
        const payload = { departmentId, clientId, userId, listType: type };
        const response = await audienceListCountApi.refetch({
            fetcher: (params) => dispatch(getAudienceBUWiseListCount({ payload: params, loading: false })),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
            params: payload,
        });
        if (response?.status) {
            return {
                status: true,
                count: response?.data || 0,
            };
        } else {
            return {
                status: false,
                count: 0,
            };
        }
    };

    const listTypeRightTooltip = useMemo(() => {
        if (listType && state?.from === 'targetList' && state?.mode === 'inputList') {
            return (
                <RSTooltip position="top" className="lh0 d-inline-flex" text="Guidelines">
                    <i
                        className={`${circle_question_mark_mini} icon-xs color-primary-blue cursor-pointer`}
                        onClick={() => {
                            const modalTypeValue = state?.type === 'match-list' ? 'matchList' : 'supressionList';
                            setModal({ show: true, type: modalTypeValue });
                        }}
                    />
                </RSTooltip>
            );
        }

        return resolveListTypeTooltipText(listType, csvType?.type);
    }, [csvType?.type, listType, state?.from, state?.mode, state?.type]);

    return (
        <>
            <div className="form-group">
                <Row>
                    <Col sm={{ span: 3, offset: 1 }} className="text-right">
                        <label className="control-label-left">{LIST_TYPE}</label>
                    </Col>
                    <Col sm={4}>
                        <RSKendoDropdownList
                            control={control}
                            name="listType"
                            label={LIST_TYPE}
                            required
                            data={getListType(audRefData)}
                            rules={{ required: SELECT_LIST_TYPE }}
                            disabled={!!listType}
                            isLoading={audienceListCountApi?.isLoading}
                            rightTooltip={listTypeRightTooltip}
                            handleChange={async (e) => {
                                const type = getCsvListType(e?.value);
                                const maxLimit = limitConfigBUWiseList(type);
                                if (maxLimitCheckList?.includes(type)) {
                                    const countResponse = await checkListCount(type);
                                    if (countResponse?.count > maxLimit) {
                                        setError('listType', {
                                            type: 'custom',
                                            message: `Max. ${maxLimit} ${e?.value} are allowed`,
                                        });
                                        return;
                                    } else {
                                        if (!listType) {
                                            getModal(e);
                                        }
                                    }
                                } else {
                                    getModal(e);
                                }
                            }}
                            popupClass={'CSV_ListType_custom_CSS'}
                        />
                    </Col>
                    {listType && state?.from !== 'targetList' && (
                        <Col md={1} className="pl0">
                            <RSTooltip position="top" className="d-inline-flex position-relative" text={RESET}>
                                <i
                                    id="rs_data_refresh"
                                    className={`${restart_medium} icon-md color-primary-blue mt-9`}
                                    onClick={() => {
                                        setIsReset({
                                            show: true,
                                        });
                                    }}
                                />{' '}
                            </RSTooltip>
                            {listType === 'Target list' && (
                                <RSTooltip
                                    position="top"
                                    className="d-inline-flex position-relative ml10"
                                    text={CHILD_ATTRIBUTE}
                                >
                                    <i
                                        id="rs_child_attribute"
                                        className={`${settings_medium} icon-md color-primary-blue cursor-pointer mt-9`}
                                        onClick={() => {
                                            openChildAttributeModal();
                                        }}
                                    />
                                </RSTooltip>
                            )}
                        </Col>
                    )}
                </Row>
            </div>
            {listType && (
                <Fragment>
                    <div className="form-group">
                        <Row>
                            <Col sm={{ span: 3, offset: 1 }} className="text-right">
                                <label className="control-label-left">
                                    {listType === 'Target list' ? IMPORT_DESCRIPTION : ENTER_LIST_NAME}
                                </label>
                            </Col>
                            <Col sm={4}>
                                <ListNameExists
                                    name="listName"
                                    field="importDescription"
                                    onValid={(valid) => setIsValidListname(valid)}
                                    apiCallback={checkImportDescriptionExists}
                                    condition={(data) => {
                                        const { status, message } = data;
                                        if (status) return false;
                                        else if (!status && message === 'Import description does not exist')
                                            return true;
                                        else if (!status && message === 'List name does not exist') return true;
                                        else return false;
                                    }}
                                    rules={LIST_NAME_RULES(
                                        isTargetList ? ENTER_IMPORT_DESCRIPTION : ENTER_LIST_NAME,
                                        false,
                                        MAX_LENGTH200,
                                    )}
                                    customErrorMessage={
                                        listType === 'Target list' ? ENTER_IMPORT_DESCRIPTION : ENTER_LIST_NAME
                                    }
                                    placeholder={listType === 'Target list' ? IMPORT_DESCRIPTION : ENTER_LIST_NAME}
                                    extraPayload={{ listType: getCsvListType(listType) }}
                                    maxLength={MAX_LENGTH200}
                                    onChange={() => {
                                        setValue('validatedImportDescriptionName', false);
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    {csvType?.type === 'CSV' ? (
                        <CSVUpload
                            isValidListname={isValidListname}
                            uploadType={'csv'}
                            listType={listType}
                            fetchAudienceInsight={fetchAudienceInsight}
                        />
                    ) : (
                        <ExcelUpload
                            isValidListname={isValidListname}
                            uploadType={'excel'}
                            listType={listType}
                            fetchAudienceInsight={fetchAudienceInsight}
                        />
                    )}
                </Fragment>
            )}
            {/* Modals */}
            {modal.show && (
                <ConfirmationPopup
                    show={modal.show}
                    type={modal.type}
                    csvType={csvType?.type}
                    handleClose={() => {
                        setValue('listType', '');
                        setModal({ show: false, type: null });
                    }}
                    handleConfirm={() => setModal({ show: false, type: null })}
                />
            )}
            <RSConfirmationModal
                show={isDelete?.show}
                isCloseButton={false}
                handleConfirm={(status) => {
                    if (status) {
                        removeUploadedFile(isDelete?.deleteIndex, isDelete?.data);
                        setIsDelete({
                            show: false,
                            deleteIndex: null,
                            data: {},
                        });
                        setInvalidFiles([]);
                    }
                }}
                handleClose={() => {
                    setIsDelete({
                        show: false,
                        deleteIndex: null,
                        data: {},
                    });
                    setInvalidFiles([]);
                }}
            />
            {isReset?.show && (
                <RSConfirmationModal
                    header={RESET}
                    show={isReset?.show}
                    isCloseButton={false}
                    text={ARE_YOU_SURE_WANT_TO_RESET}
                    handleConfirm={(status) => {
                        if (status) {
                            reset((formState) => ({
                                ...formState,
                                listType: '',
                                attributeMapping: '',
                                listName: '',
                                categoryTypeText: '',
                                categoryType: '',
                                csvFiles: null,
                                isColumnHeader: true,
                            }));
                            dispatch(updateResponseHeader([]));
                            dispatch(updateHeaderColumns(''));
                            dispatch(resetCsvFiles());
                            setIsReset({
                                show: false,
                            });
                            setInvalidFiles([]);
                        }
                    }}
                    handleClose={() => {
                        setIsReset({
                            show: false,
                        });
                        setInvalidFiles([]);
                    }}
                />
            )}
            {childAttrModal?.show && (
                <ChildAttrModal
                    show={childAttrModal?.show}
                    onClose={() => setChildAttrModal({ show: false })}
                />
            )}
            {listAnalysisInfoModal?.show && (
                <ListAnalysis
                    type={'addAudience'}
                    close={() => {
                        setListAnalysisInfoModal({
                            show: false,
                            fileName: '',
                        });
                    }}
                    show={listAnalysisInfoModal?.show}
                    dispatchState={() => {}}
                    isProceed={false}
                    listAnalysisData={
                        fileWiseListAnalysisData[listAnalysisInfoModal?.fileName]
                            ? fileWiseListAnalysisData[listAnalysisInfoModal?.fileName]
                            : {}
                    }
                    listType={listType}
                />
            )}
        </>
    );
};

export default CSV;
