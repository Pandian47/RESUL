import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { ATTRIBUTE_CATEGORY, CANCEL, DATA_SERVICES, NO_DATA_AVAILABLE, DATA_AUGMENTATION_ENRICH } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import ResKendoListbox from 'Pages/KendoDocs/CommonComponents/ResKendoListbox';

import KendoGrid from 'Components/RSKendoGrid';

import { getSessionId } from 'Reducers/globalState/selector';
import {
    getAudVersionHistory,
    getDataAttributeGroup,
    getDataAttributeGroupName,
    getDataService,
    getSelectedColumns,
    saveDataAugmentation,
} from 'Reducers/audience/targetList/request';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { target_list_view } from 'Reducers/audience/targetList/reducer';
import { toast } from 'react-toastify';

import useApiLoader from 'Hooks/useApiLoader';

import { FIELD_LOADER_CONFIG } from 'Hooks/loaderTypes';

const DataAugmentation = ({ show, handleClose, list }) => {
    const dispatch = useDispatch();
    const { industryId } = useSelector(({ globalstate }) => globalstate);

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const {
        dataService = [],
        attributeGroups = [],
        selectedCols = [],
        augArrtibutes = [],
    } = useSelector(({ targetListViewReducer }) => targetListViewReducer);

    const methods = useForm({
        defaultValues: {
            data_service: '',
            api_name: '',
            selectedColumns: [],
            agree: false,
        },
        mode: 'onSubmit',
    });

    const {
        control,
        watch,
        setValue,
        handleSubmit,
        formState: { isValid },
        getValues,
        clearErrors,
    } = methods;
    // const selectedColumns = watch('selectedColumns');
    // const agreeChecked = watch('agree');
    const [selectedColumns, agreeChecked, apiNameWatch] = watch(['selectedColumns', 'agree', 'api_name']);
    const hasAnyAttributeChecked = selectedColumns?.some((col) => col?.selected === true);
    const { fields } = useFieldArray({
        control,
        name: 'selectedColumns',
    });
    const [dataAttribute, setDataAttribute] = useState({
        leftAttributes: [],
        rightAttributes: [],
    });
    const [versionHistory, setVersionHistory] = useState({
        data: [],
        status: false,
    });
    const [selectedLength, setSelectedLength] = useState(0);
    const dataServiceLoader = useApiLoader({ autoFetch: false });
    const attributeGroupLoader = useApiLoader({ autoFetch: false });
    const getDataAttributeAPI = useApiLoader({ autoFetch: false });
    const syncDataAPI = useApiLoader({ autoFetch: false });
    const isSyncLoading = syncDataAPI.isLoading;

    const sessionData = {
        departmentId,
        clientId,
        userId,
    };

    const getVersionHistory = async () => {
        const payload = {
            ...sessionData,
            partnerid: getValues('data_service')?.PartnerID || 0,
            segmentationlistid: list?.segmentationListID || 0,
        };
        const res = await dispatch(getAudVersionHistory({ payload: payload }));
        if (res?.status) {
            setVersionHistory({
                data: res?.data,
                status: true,
            });
        } else {
            setVersionHistory({
                data: [],
                status: false,
            });
        }
    };
    useEffect(() => {
        if (!show) return;

        dataServiceLoader.refetch({
            fetcher: () => dispatch(getDataService({ payload: sessionData, loading: false })),
            mode: 'create',
            loaderConfig: FIELD_LOADER_CONFIG,
        });
        getVersionHistory();
    }, [show]);

    const getDataAttrGroupName = async (e) => {
        const formState = getValues();
        const payload = {
            ...sessionData,
            userName: 'Versiu**c****ne**t', // hardcoded for now
            password: 'I******fj****TX******HpuS**ZN**Wsh******qf**==',
            url: '****t**://1**.******.**.**06/******n****t****',
            connectorName: formState?.data_service?.PartnerName || '',
            connectorId: formState?.data_service?.PartnerID || 0,
            groupAttributeId: e.value?.PartnerAttributeGroupID || '',
            groupAttributeName: e.value?.AttributeGroupName || '',
            industryId: industryId,
        };
        
         
        let attrs = await getDataAttributeAPI.refetch({
            fetcher: () => dispatch(getDataAttributeGroupName({ payload, loading: false })),
            mode: 'create',
            loaderConfig: FIELD_LOADER_CONFIG,
        });
        if (attrs?.status && attrs?.data?.length > 0) {
            const finalLeftAttributes = attrs?.data?.filter((item) => {
                if (dataAttribute?.rightAttributes?.length) {
                    const onlySolrFieldName = dataAttribute?.rightAttributes?.map((col) => col?.sOLRFieldName);
                    return !onlySolrFieldName?.includes(item?.sOLRFieldName);
                } else {
                    return true;
                }
            });

            setDataAttribute((pre) => ({
                leftAttributes: finalLeftAttributes,
                rightAttributes: [...pre.rightAttributes],
            }));
        } else {
            setDataAttribute((pre) => ({
                leftAttributes: [],
                rightAttributes: [...pre.rightAttributes],
            }));
        }
        let res = await dispatch(
            getSelectedColumns({ payload: { ...sessionData, partnerid: formState?.data_service?.PartnerID || 0 } }),
        );
        if (res?.status) {
            setValue(
                'selectedColumns',
                res?.data?.map((col) => ({
                    ...col,
                    selected: false,
                })),
            );
        }
    };

    const onSubmit = async (formState) => {
        const payload = {
            ...sessionData,
            partnerid: formState?.data_service?.PartnerID || 0,
            segmentationlistid: list?.segmentationListID || 0,
            SegmentationListName: list?.recipientsBunchName || 0,
            selectedgroup: formState?.api_name?.AttributeGroupName || '',
            selectedcol: dataAttribute?.rightAttributes?.map((item) => item?.sOLRFieldName)?.toString(),
            filtercols: formState?.selectedColumns
                ?.filter((item) => item?.selected)
                ?.map((item) => item?.selected && item?.SOLRFieldName)
                ?.toString(),
            partnername: formState?.data_service?.PartnerName || '',
        };
        const res = await syncDataAPI.refetch({
            fetcher: () => dispatch(saveDataAugmentation({ payload })),
            mode: 'create',
            loaderConfig: FIELD_LOADER_CONFIG,
        });
        if (res?.status) {
            handleClose(true);
        } else {
            toast.error('Failed to sync data', {
                autoClose: 3000,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    useEffect(() => {
        return () => {
            dispatch(target_list_view({ field: 'dataService', data: [] }));
            dispatch(target_list_view({ field: 'augArrtibutes', data: [] }));
            dispatch(target_list_view({ field: 'attributeGroups', data: [] }));
            dispatch(target_list_view({ field: 'selectedCols', data: [] }));
        };
    }, []);

    return (
        <Fragment>
            <RSModal
                show={show}
                header={DATA_AUGMENTATION_ENRICH}
                size="lg"
                handleClose={() => {
                    if (isSyncLoading) return;
                    handleClose(false);
                }}
                isCloseDisabled={isSyncLoading}
                lockBackground={isSyncLoading}
                body={
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="form-group mt20">
                            <Row>
                                <Col sm={6}>
                                    <RSKendoDropdown
                                        name={'data_service'}
                                        control={control}
                                        label={DATA_SERVICES}
                                        data={dataService}
                                        textField="PartnerName"
                                        dataItemKey={'PartnerID'}
                                        isLoading={dataServiceLoader.isLoading}
                                        handleChange={(e) => {
                                            setValue('api_name', '');
                                            setValue('selectedColumns', []);
                                            dispatch(target_list_view({ field: 'attributeGroups', data: [] }));
                                            dispatch(target_list_view({ field: 'augArrtibutes', data: [] }));
                                            dispatch(target_list_view({ field: 'selectedCols', data: [] }));
                                            setDataAttribute({
                                                leftAttributes: [],
                                                rightAttributes: [],
                                            });
                                            const payload = {
                                                ...sessionData,
                                                partnerid: e?.value?.PartnerID || 0,
                                            };
                                            attributeGroupLoader.refetch({
                                                fetcher: () =>
                                                    dispatch(
                                                        getDataAttributeGroup({ payload, loading: false }),
                                                    ),
                                                mode: 'create',
                                                loaderConfig: FIELD_LOADER_CONFIG,
                                            });
                                        }}
                                    />
                                </Col>
                                <Col sm={6}>
                                    <RSKendoDropdown
                                        name={'api_name'}
                                        control={control}
                                        label={ATTRIBUTE_CATEGORY}
                                        data={attributeGroups}
                                        textField="AttributeGroupName"
                                        dataItemKey={'PartnerAttributeGroupID'}
                                        isLoading={attributeGroupLoader.isLoading}
                                        handleChange={(e) => {
                                            getDataAttrGroupName(e);
                                        }}
                                    />
                                </Col>
                            </Row>
                        </div>
                        {!!apiNameWatch && (
                            <>
                                <Row>
                                    <Col sm={12} className="position-relative">
                                        <ResKendoListbox
                                            leftColumnValues={dataAttribute?.leftAttributes}
                                            rightColumnValues={dataAttribute?.rightAttributes}
                                            getSelectedData={(data) => {
                                                setDataAttribute({
                                                    leftAttributes: data?.leftColumnValues,
                                                    rightAttributes: data?.rightColumnValues,
                                                });
                                            }}
                                            setSelectedLength={setSelectedLength}
                                            textField={'uIPrintableName'}
                                            // customText={SELECT_LEFT_ATTRIBUTES}
                                            nodataText={NO_DATA_AVAILABLE}
                                            leftNotes={
                                                <small>Select the attributes used to augment the existing data</small>
                                            }
                                            loading={getDataAttributeAPI?.isLoading && dataAttribute?.leftAttributes?.length === 0}
                                        />
                                    </Col>
                                </Row>
                                {!(
                                    dataAttribute?.leftAttributes?.length === 0 &&
                                    dataAttribute?.rightAttributes?.length === 0
                                ) && (
                                    <>
                                        <Col sm={8}>
                                            <ul className="rs-list-inline switchwith-icon">
                                                {fields?.map((field, index) => (
                                                    <li key={field.id}>
                                                        <RSCheckbox
                                                            control={control}
                                                            name={`selectedColumns[${index}].selected`}
                                                            labelName={field?.UIPrintableName}
                                                            handleChange={() => {
                                                                const currentValues = getValues('selectedColumns');
                                                                setValue('selectedColumns', currentValues, { 
                                                                    shouldDirty: true, 
                                                                    shouldValidate: true 
                                                                });
                                                            }}
                                                        />
                                                    </li>
                                                ))}
                                            </ul>
                                        </Col>
                                        <RSCheckbox
                                            control={control}
                                            name={`agree`}
                                            labelName={'I agree to proceed'}
                                            handleChange={() => {
                                                const currentValue = getValues('agreeChecked');
                                                setValue('agreeChecked', !currentValue, {
                                                    shouldDirty: true,
                                                    shouldValidate: true,
                                                });
                                            }}
                                        />
                                    </>
                                )}
                            </>
                        )}
                        {getValues('api_name') && (
                            <div className="buttons-holder">
                                <RSSecondaryButton
                                    onClick={() => handleClose(false)}
                                    blockInteraction={isSyncLoading}
                                >
                                    {CANCEL}
                                </RSSecondaryButton>
                                <RSPrimaryButton
                                    type="submit"
                                    isLoading={isSyncLoading}
                                    blockBodyPointerEvents={isSyncLoading}
                                    disabledClass={
                                        getValues('agree') &&
                                        dataAttribute?.rightAttributes?.length &&
                                        hasAnyAttributeChecked
                                            ? ''
                                            : 'pe-none click-off'
                                    }
                                >
                                    {'Sync data'}
                                </RSPrimaryButton>
                            </div>
                        )}
                        {versionHistory?.status && (
                            <Col>
                                Version history
                                <KendoGrid
                                    data={versionHistory?.data}
                                    column={[
                                        {
                                            field: 'AudienceSize',
                                            title: 'Audience size',
                                        },
                                        {
                                            field: 'CreatedBy',
                                            title: 'Created by',
                                        },
                                        {
                                            field: 'LastUpdateDateOn',
                                            title: 'Last updated date',
                                            isTooltip: true,
                                            titleLength: 10,
                                            cell: ({ dataItem, field }) => {
                                                return (
                                                    <td>
                                                        {dataItem?.[field]
                                                            ? getUserCurrentFormat(dataItem?.[field], { isOffset: true })
                                                                  ?.dateTimeFormat ?? ''
                                                            : ''}
                                                    </td>
                                                );
                                            },
                                        },
                                        {
                                            field: 'MatchedSize',
                                            title: 'Matched size',
                                        },
                                        {
                                            field: 'UnMatchedSize',
                                            title: 'Unmatched size',
                                        },
                                    ]}
                                    noBoxShadow
                                    settings={{
                                        total: versionHistory?.data?.length,
                                    }}
                                    isScrollTop={false}
                                    pageable
                                    scrollable={'scrollable'}
                                />
                            </Col>
                        )}
                    </form>
                }
            />
        </Fragment>
    );
};

export default DataAugmentation;
