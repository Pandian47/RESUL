import { mdc_template_large } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import CreateWorkFlowContext, { CreateWorkFlowOtherContext } from '../../context';
import {
    getMdcCanvasTemplateList,
    getSelectedMdcTemplateData,
} from 'Reducers/communication/createCommunication/Mdc/Canvas/request';
import { getSessionId } from 'Reducers/globalState/selector';
import SaveAsTemplate from './SaveAsTemplate';
import { targetCode, ConvertRecursivelyTraverseToReact } from './TemplateConst';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import { AUTHORING_FIELD_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';

import { useForm } from 'react-hook-form';
import ResKendoDropdown from 'Pages/KendoDocs/CommonComponents/ResKendoDropdown';
import SaveAsTemplateBtn from './SaveAsTemplateBtn';
import ClearCanvasModal from '../Modal/index';

const TemplateList = () => {
    const { control, setValue } = useForm({ defaultValues: { mdcCanvasTemplate: null } });
    const dispatch = useDispatch();

    const [campaignId, setCampaignId] = useState(0);
    const [primaryGoal, setPrimaryGoal] = useState('R');
    const locationState = useQueryParams('/communication') || {};
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const { canvasState, dispatchState } = useContext(CreateWorkFlowContext);
    const { isNewTemplateSaved, setIsNewTemplateSaved, setIsTemplateCanvasLoading } =
        useContext(CreateWorkFlowOtherContext);

    const templateListLoader = useApiLoader({ autoFetch: false });
    const { refetch: refetchTemplateList, isLoading: isTemplateListLoading, isFetching: isTemplateListFetching } =
        templateListLoader;
    const isTemplateDropdownDisabled = isTemplateListFetching;

    const isTemplateListFetchInFlightRef = useRef(false);
    const hasFetchedTemplateListRef = useRef(false);

    const [templateList, setTemplateList] = useState([]);
    const [isShowSaveAsTemplate, setShowSaveAsTemplate] = useState(false);
    const [isShowClearCanvas, setShowClearCanvas] = useState(false);
    const [selectedTemplateId, setSelectedTemplateId] = useState(0);

    useEffect(() => {
        const { campaignId: resolvedCampaignId, primaryGoal: resolvedPrimaryGoal } = locationState;
        setCampaignId(resolvedCampaignId);
        setPrimaryGoal(resolvedPrimaryGoal);
    }, [locationState]);

    useEffect(() => {
        hasFetchedTemplateListRef.current = false;
    }, [campaignId]);

    const handleTemplateList = useCallback(
        async ({ force = false } = {}) => {
            if (!campaignId || !userId || !Object.keys(targetCode)?.length) return;
            if (isTemplateListFetchInFlightRef.current && !force) return;

            isTemplateListFetchInFlightRef.current = true;

            const payload = {
                campaignId,
                departmentId,
                clientId,
                userId,
                primaryTargetCode: targetCode[primaryGoal],
            };

            try {
                const result = await refetchTemplateList({
                    fetcher: ({ payload: requestPayload }) =>
                        dispatch(getMdcCanvasTemplateList({ payload: requestPayload, loading: false })),
                    mode: 'create',
                    loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                    params: { payload },
                });

                if (result?.status && result?.data) {
                    const list = result.data.sort((a, b) => b.templateId - a.templateId);
                    setTemplateList(list);
                }
                hasFetchedTemplateListRef.current = true;
            } finally {
                isTemplateListFetchInFlightRef.current = false;
            }
        },
        [campaignId, departmentId, clientId, userId, primaryGoal, dispatch, refetchTemplateList],
    );

    useEffect(() => {
        if (hasFetchedTemplateListRef.current || !campaignId || !userId) return;
        handleTemplateList();
    }, [campaignId, departmentId, clientId, userId, primaryGoal, handleTemplateList]);

    useEffect(() => {
        if (!isNewTemplateSaved) return;
        handleTemplateList({ force: true });
        setIsNewTemplateSaved(false);
    }, [isNewTemplateSaved, handleTemplateList, setIsNewTemplateSaved]);

    const handleSelectedTemplate = (item) => {
        const { templateId } = item;
        if (templateId === 'saveAsTemplate') {
            showSaveAsTemplate();
            return;
        }
        if (templateId === 'goalType') {
            return;
        }
        setSelectedTemplateId(templateId);
        if (canvasState?.Campaign?.CanvasChannel?.activeChannel?.length || canvasState?.dataSource?.DomId) {
            setShowClearCanvas(true);
        } else {
            handleDrawCanvas({ templateId });
        }
    };

    const handleDrawCanvas = async ({ templateId }) => {
        setShowClearCanvas(false);
        if (!templateId) return;

        const payload = { templateId, departmentId, clientId, userId };
        setIsTemplateCanvasLoading?.(true);

        try {
            const result = await dispatch(getSelectedMdcTemplateData({ payload, loading: false }));
            const { status, data: canvasDataResult } = result || {};

            if (status) {
                const { templateData } = canvasDataResult[0];
                let canvasJson = JSON.parse(templateData);
                if (canvasJson['MdcType'] == 'RecursivelyTraverse') {
                    canvasJson = ConvertRecursivelyTraverseToReact(canvasJson);

                    const {
                        Campaign: {
                            CanvasChannel: { activeChannel },
                        },
                    } = canvasJson;
                    if (activeChannel && activeChannel?.length) {
                        dispatchState({
                            type: 'ASSIGN_CANVAS_DATA_RECURSIVELY_TREE',
                            payload: canvasJson,
                        });
                    }
                } else if (
                    canvasJson['MdcType'] == 'RecursivelyTraverse_React' ||
                    canvasJson['MdcType'] == 'RecursivelyTraverse_React_Template'
                ) {
                    const {
                        Campaign: {
                            CanvasChannel: { activeChannel },
                        },
                        dataSource: { Type },
                    } = canvasJson;
                    if ((activeChannel && activeChannel?.length) || Type) {
                        dispatchState({
                            type: 'ASSIGN_CANVAS_DATA',
                            payload: JSON.parse(templateData),
                        });
                    }
                }
            }
        } finally {
            setIsTemplateCanvasLoading?.(false);
        }
    };

    const showSaveAsTemplate = () => {
        setShowSaveAsTemplate(true);
    };
    const handleClose = () => {
        setShowSaveAsTemplate(false);
    };

    return (
        <>
            <div
                className={`rs-kendo-dropdown-with-search-wrapper mdc-header-template-icon position-relative ${
                    isTemplateDropdownDisabled ? 'pe-none click-off' : ''
                } ${isTemplateListLoading ? 'is-template-loading' : ''}`}
            >
                <ResKendoDropdown
                    control={control}
                    name="mdcCanvasTemplate"
                    data={templateList}
                    textField="templateName"
                    dataItemKey="templateId"
                    className="rs-dropdown mdc-header-template-dropdown"
                    popupClass="mdc-template-list"
                    label=""
                    isError={false}
                    useErrorContainer={false}
                    rightAlign
                    noBottomBorder
                    isLoading={isTemplateListLoading}
                    iconClassName={`${mdc_template_large} icon-lg color-primary-blue`}
                    footer={<SaveAsTemplateBtn showSaveAsTemplate={showSaveAsTemplate} />}
                    handleChange={(event) => {
                        if (event?.value) {
                            handleSelectedTemplate(event.value);
                        }
                        setValue('mdcCanvasTemplate', null, { shouldDirty: false });
                    }}
                />
            </div>
            {isShowSaveAsTemplate && (
                <SaveAsTemplate
                    isShowSaveAsTemplate={isShowSaveAsTemplate}
                    primaryGoal={primaryGoal}
                    handleClose={handleClose}
                    handleUpdatetemplateList={handleTemplateList}
                />
            )}
            {isShowClearCanvas && (
                <ClearCanvasModal
                    show={isShowClearCanvas}
                    handleCanvasResetCancel={() => {
                        setSelectedTemplateId(0);
                        setShowClearCanvas(false);
                    }}
                    handleConfirm={() => {
                        handleDrawCanvas({ templateId: selectedTemplateId });
                    }}
                />
            )}
        </>
    );
};

export default TemplateList;
