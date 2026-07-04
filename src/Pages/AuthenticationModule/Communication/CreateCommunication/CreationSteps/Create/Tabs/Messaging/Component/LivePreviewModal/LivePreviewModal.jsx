import { charNumatdotUnderScore, onlyNumbers } from 'Utils/modules/inputValidators';
import { Fragment, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { map as _map } from 'Utils/modules/lodashReplacements';
import RSModal from 'Components/RSModal';
import AdvanceSearch from 'Components/AdvanceSearch';
import { RSMobilePreview, PREVIEW_SOURCE } from 'Components/Previews';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import { AUTHORING_SAVE_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
import { ensureArray } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { getLiveTest } from 'Reducers/communication/createCommunication/Create/request';
import { BRAND_ID } from 'Constants/GlobalConstant/Placeholders';

const LivePreviewModal = ({
    show,
    content = '',
    audience,
    handleClose,
    sendPreview = () => {},
    previewImage,
    dataSource,
}) => {
    const dispatch = useDispatch();
    const location = useQueryParams('/communication');
    const { getValues } = useFormContext();
    const name = 'clientSmsSettingId';
    const props = {
        content,
        name: getValues(name),
        previewImage,
    };
    const [previewPropsData, setPreviewPropsData] = useState(props);
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [navigate_confirm, setNavigate_confirm] = useState(false);
    const [passportDataconfirm, setpassportData_confirm] = useState(false);
    const [passportID, setpassportID] = useState('');
    const liveSearchLoader = useApiLoader({ autoFetch: false });
    const sendToMeLoader = useApiLoader({ autoFetch: false });
    const [isSendPending, setIsSendPending] = useState(false);
    const isSubmitting = sendToMeLoader.isFetching || isSendPending;

    useEffect(() => {
        if (!show) {
            liveSearchLoader.reset();
            sendToMeLoader.reset();
            setIsSendPending(false);
        }
    }, [show]);

    const applyLiveSearchResult = (res) => {
        if (res?.status) {
            const tempData = res.passportId;
            setpassportID(tempData);
            if (tempData?.length > 1) {
                setNavigate_confirm(true);
                setpassportData_confirm(false);
                setPreviewPropsData((pre) => ({
                    ...pre,
                    content: res?.data,
                }));
            } else {
                setNavigate_confirm(false);
                setpassportData_confirm(true);
                setPreviewPropsData(props);
            }
        } else {
            setNavigate_confirm(false);
            setpassportData_confirm(true);
            setPreviewPropsData(props);
        }
        setTimeout(() => { setpassportData_confirm(false); }, 3000);
    };

    const handleSearch = async ({ type, text }) => {
        const payload = {
            content: content,
            recipientType: type.charAt(0),
            recipientTo: text,
            campaignId: location?.campaignId,
            splittype: '',
            recipientsList:
                dataSource === 'DL' && location?.campaignType === 'M'
                    ? [location?.mdcContentSetupDetails?.dynamiclistId]
                    : location?.campaignType === 'T'
                      ? [location?.dynamicListId]
                      : _map(ensureArray(audience), 'segmentationListId'),
            listType: _map(ensureArray(audience), 'listType'),
            campaignChannelId: 2,
            campaigntype: location?.campaignType,
            isFlashSmsEnabled: false,
            dataSource: '',
            clientId,
            userId,
            departmentId,
            dynamicListId:
                location?.campaignType === 'T'
                    ? location?.dynamicListId
                    : location?.campaignType === 'M'
                      ? location?.mdcContentSetupDetails?.dynamiclistId
                      : '',
            subsegmentGroupingEnabled: location?.mdcContentSetupDetails?.isGroupCommunication ?? false,
            isSubsegmentEnabled: location?.mdcContentSetupDetails?.isSubsegmentJoureny ?? false,
            subsegmentId: location?.mdcContentSetupDetails?.subSegmentId || 0,
            subsegmentLevel: location?.mdcContentSetupDetails?.subSegmentLevel || 0,
            priority: location?.mdcContentSetupDetails?.priority || 0,
        };

        const res = await liveSearchLoader.refetch({
            mode: 'create',
            loaderConfig: AUTHORING_SAVE_LOADER_CONFIG,
            fetcher: () => dispatch(getLiveTest(payload, { loading: false })),
        });
        if (res !== undefined) {
            applyLiveSearchResult(res);
        }
    };

    const handleSendToMe = () => {
        if (!navigate_confirm || isSubmitting) return;
        setIsSendPending(true);
        sendToMeLoader.refetch({
            mode: 'create',
            loaderConfig: AUTHORING_SAVE_LOADER_CONFIG,
            fetcher: async () => sendPreview(passportID),
            onSettled: () => setIsSendPending(false),
        });
    };

    const advanceSearchOptionss = ['By mobile no', 'By Brand ID'];

    return (
        <RSModal
            size={'lg'}
            className="rs-modal-preview-mobile"
            show={show}
            isCloseDisabled={isSubmitting}
            handleClose={() => {
                if (isSubmitting) return;
                setpassportData_confirm(false);
                setNavigate_confirm(false);
                handleClose();
            }}
            headerRightContent={
                <div className="advanceSearchContainer">
                    <div className="advanceSearchBlock">
                        {liveSearchLoader.isFetching ? (
                            <div className="segment_loader" />
                        ) : (
                            <AdvanceSearch
                                advanceSearchOptions={['Mobile no', BRAND_ID]}
                                tooltipOverlayClassZindex={true}
                                searchText={handleSearch}
                                onKeydown={(e) => {
                                    const currentOption = advanceSearchOptionss.find(
                                        (option) => option === e.target.placeholder,
                                    );
                                    if (currentOption === 'By mobile no') {
                                        onlyNumbers(e);
                                    } else {
                                        charNumatdotUnderScore(e);
                                    }
                                }}
                                advSearchSmall
                                hideDropdown={true}
                            />
                        )}
                    </div>
                </div>
            }
            header={'Live preview'}
            body={
                <Fragment>
                    {passportDataconfirm && <p className="color-primary-red">Invalid audience</p>}
                    <RSMobilePreview
                        channel="sms"
                        previewSource={PREVIEW_SOURCE.LIVE_PREVIEW}
                        content={previewPropsData.content}
                        previewImage={previewPropsData.previewImage}
                        senderName={previewPropsData.name}
                        className="float-none mx-auto"
                        schedule={getValues('schedule')}
                    />
                </Fragment>
            }
            footer={
                <Fragment>
                    <RSSecondaryButton
                        blockInteraction={isSubmitting}
                        onClick={() => {
                            if (isSubmitting) return;
                            setpassportData_confirm(false);
                            setNavigate_confirm(false);
                            handleClose();
                        }}
                    >
                        Cancel
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={handleSendToMe}
                        disabledClass={navigate_confirm && !isSubmitting ? '' : 'pe-none click-off'}
                        isLoading={sendToMeLoader.isFetching}
                        blockBodyPointerEvents
                    >
                        Send to me
                    </RSPrimaryButton>
                </Fragment>
            }
        />
    );
};

export default LivePreviewModal;
