import { charNumatdotUnderScore } from 'Utils/modules/inputValidators';
import { getUserDateTimeFormat } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { BRAND_ID, CANCEL, EMAIL_NAME, EMAIL_NOT_DISPLAYING, LIVE_PREVIEW, SEND_TO_ME, THE_SELECTED_EMAIL_ADDRESS, VIEW_IN_BROWSER } from 'Constants/GlobalConstant/Placeholders';
import { add_events_medium, caret_mini, menu_dot_medium, printer_medium, retarget_list_medium, smiliey_4_medium, star_medium, undo_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import parse from 'html-react-parser';
import { map as _map } from 'Utils/modules/lodashReplacements';
import RSModal from 'Components/RSModal';
import AdvanceSearch from 'Components/AdvanceSearch';
import EdmContent from './Component/EdmConent';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader from 'Hooks/useApiLoader';
import { AUTHORING_SAVE_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';
import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';
import { getLiveTest } from 'Reducers/communication/createCommunication/Create/request';
import { updateisPassport } from 'Reducers/globalState/reducer';

import RSTooltip from 'Components/RSTooltip';
import { sanitizeEmailHtmlForPreview } from 'Utils/modules/stringUtils';
const LivePreviewModal = ({
    show,
    content = '',
    audience,
    edmContent,
    emailFooter = '',
    currentTab,
    viewInBrowser,
    handleClose,
    dataSource,
    mdcContentSetupDetails,
    subjectValue,
    senderName = '',
    senderEmail = '',
    handleSave = () => {},
}) => {
    const dispatch = useDispatch();
    const location = useQueryParams('/communication');
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [navigate_confirm, setNavigate_confirm] = useState(false);
    const [passportDataconfirm, setpassportData_confirm] = useState(false);
    const [passportData, setpassportData] = useState({
        content: '',
        subjectLine: subjectValue,
    });
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
            dispatch(updateisPassport(res?.passportId));
            const tempData = res.passportId;
            setpassportID(tempData);
            if (tempData?.length > 1) {
                setpassportData({
                    content: res?.data || '',
                    subjectLine: res?.subject || subjectValue,
                });
                setNavigate_confirm(true);
                setpassportData_confirm(false);
            } else {
                setpassportData({
                    content: '',
                    subjectLine: subjectValue,
                });
                setNavigate_confirm(false);
                setpassportData_confirm(true);
            }
        } else {
            setpassportData({
                content: '',
                subjectLine: subjectValue,
            });
            setNavigate_confirm(false);
            setpassportData_confirm(true);
        }
        setTimeout(() => {setpassportData_confirm(false);}, 3000)
    };

    const handleSearch = async ({ type, text }) => {
        const payload = {
            content: currentTab === 0 ? content : edmContent,
            recipientType: type.charAt(0),
            recipientTo: text,
            campaignId: location?.campaignId,
            splittype: '',
            recipientsList:
                dataSource === 'DL' && location?.campaignType === 'M'
                    ? [mdcContentSetupDetails?.dynamiclistId]
                    : location?.campaignType === 'T'
                    ? [location?.dynamicListId]
                    : _map(audience, 'segmentationListId'),
            listType: _map(audience, 'listType'),
            campaignChannelId: 1,
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
            subject: subjectValue || '',
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

    const handleSaveTemp = () => {
        if (!navigate_confirm || isSubmitting) return;
        setIsSendPending(true);
        sendToMeLoader.refetch({
            mode: 'create',
            loaderConfig: AUTHORING_SAVE_LOADER_CONFIG,
            fetcher: async () => handleSave(passportID),
            onSettled: () => setIsSendPending(false),
        });
    };
    return (
        <RSModal
            size={'lg'}
            show={show}
            isCloseDisabled={isSubmitting}
            handleClose={() => {
                if (isSubmitting) return;
                setpassportData({
                    content: '',
                    subjectLine: '',
                });
                setpassportData_confirm(false);
                setNavigate_confirm(false);
                handleClose();
            }}
            header={LIVE_PREVIEW}
            bodyClassName="css-scrollbar"
            headerRightContent={
                <div className="advanceSearchContainer">
                    <div className="advanceSearchBlock">
                        {liveSearchLoader.isFetching ? (
                            <div className="segment_loader" />
                        ) : (
                            <AdvanceSearch
                                advanceSearchOptions={[EMAIL_NAME, BRAND_ID]}
                                searchText={handleSearch}
                                advSearchSmall
                                hideDropdown={true}
                                onKeydown={(e) => {
                                    charNumatdotUnderScore(e);
                                }}
                            />
                        )}
                    </div>
                </div>
            }
            body={
                <Fragment>
                    {passportDataconfirm && (
                        <p className="color-primary-red"> {THE_SELECTED_EMAIL_ADDRESS}</p>
                    )}
                    {/* Gmail preview start */}
                    <div className="mb15">
                        <div className="align-items-center d-flex justify-content-between mb15">
                            <div className="align-items-center d-flex">
                                {navigate_confirm ? (
                                    <span className="mr20 fs19">
                                        {passportData?.subjectLine?.length > 70 ? (
                                            <RSTooltip
                                                text={passportData?.subjectLine}
                                                position="bottom"
                                                className="modalOverlayZindexCSS"
                                            >
                                                {truncateTitle(passportData?.subjectLine, 70)}
                                            </RSTooltip>
                                        ) : (
                                            passportData?.subjectLine
                                        )}
                                    </span>
                                ) : (
                                    <span className="mr20 fs19">
                                        {subjectValue?.length > 70 ? (
                                            <RSTooltip
                                                text={subjectValue}
                                                position="bottom"
                                                className="modalOverlayZindexCSS"
                                            >
                                                {truncateTitle(subjectValue, 70)}
                                            </RSTooltip>
                                        ) : (
                                            subjectValue
                                        )}
                                    </span>
                                )}

                                {/* <i className={`${add_events_medium} fs10 color-primary-grey pointer-event-none`}></i> */}
                            </div>

                            <div className="align-items-center d-flex justify-content-between gap-3">
                                <span>
                                    {/* <RSTooltip text={'Print all'} className="ml5"> */}
                                    <i
                                        className={`${printer_medium} icon-md color-primary-grey pointer-event-none`}
                                    ></i>
                                    {/* </RSTooltip> */}
                                </span>
                                <span>
                                    <i
                                        className={`${retarget_list_medium} icon-md color-primary-grey pointer-event-none`}
                                    ></i>
                                </span>
                            </div>
                        </div>

                        <div className="align-items-center d-flex justify-content-between">
                            <div className="align-items-center d-flex justify-content-between gap-2">
                                <span className="color-primary-black fs17">
                                {senderName?.length > 15 ?  
                                <RSTooltip text= {senderName} position = 'bottom' className="modalOverlayZindexCSS">
                                    {truncateTitle (senderName,15)}
                                </RSTooltip> : senderName}
                                </span>
                                <small>&lt;{senderEmail || ''}&gt;</small>
                            </div>
                            <div className="align-items-center d-flex justify-content-between gap-3">
                                <small>{getUserDateTimeFormat(new Date(), 'formatDateTime')}</small>
                                <span>
                                    <i
                                        className={`${star_medium} icon-md color-primary-grey pointer-event-none`}
                                    ></i>
                                </span>
                                <span>
                                    <i
                                        className={`${smiliey_4_medium} icon-md color-primary-grey pointer-event-none`}
                                    ></i>
                                </span>
                                <span>
                                    <i
                                        className={`${undo_medium} icon-md color-primary-grey pointer-event-none`}
                                    ></i>
                                </span>
                                <span>
                                    <i
                                        className={`${menu_dot_medium} icon-md color-primary-grey pointer-event-none`}
                                    ></i>
                                </span>
                            </div>
                        </div>
                        <small className="align-items-center d-flex position-relative top-5">
                            to me
                            <span>
                                <i className={`${caret_mini} fs10 color-primary-grey pointer-event-none pl5`}></i>
                            </span>
                        </small>
                    </div>
                    {/* Gmail preview end */}
                    <div
                        className={`d-flex ${
                            viewInBrowser ? 'justify-content-center align-items-center' : 'justify-content-end'
                        } pe-none`}
                    >
                        {viewInBrowser && (
                            <small className="text-left smaller pe-none">
                                {EMAIL_NOT_DISPLAYING}{' '}
                                <a href="{{#VIB}}" onClick={(e) => e.preventDefault()}>
                                    {VIEW_IN_BROWSER}
                                </a>
                            </small>
                        )}
                    </div>
                    {navigate_confirm ? (
                        <div className="pe-none">
                            <div className="" dangerouslySetInnerHTML={{ __html: passportData?.content }} />
                            {/* {currentTab === 0 && <div tabcontent>{parse(content)}</div>}
                            {currentTab !== 0 && <EdmContent content={edmContent} />} */}
                            {emailFooter && <div className="d-flex justify-content-center">{parse(emailFooter)}</div>}
                        </div>
                    ) : (
                        <div className="pe-none">
                            {currentTab === 0 && <div>{parse(sanitizeEmailHtmlForPreview(content))}</div>}
                            {/* {currentTab === 1 && <div className="mt20">{edmContent}</div>} */}
                            {/* {currentTab === 1 &&  */}
                            {currentTab !== 0 && <EdmContent content={edmContent} />}
                            {/* } */}
                            {emailFooter && (
                                <div className="d-flex justify-content-center mt30 mb15">{parse(emailFooter)}</div>
                            )}
                        </div>
                    )}
                </Fragment>
            }
            footer={
                <div className='buttons-holder'>
                    <RSSecondaryButton
                        blockInteraction={isSubmitting}
                        onClick={() => {
                            if (isSubmitting) return;
                            setpassportData({
                                content: '',
                                subjectLine: '',
                            });
                            setpassportData_confirm(false);
                            setNavigate_confirm(false);
                            handleClose();
                        }}
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={handleSaveTemp}
                        className={navigate_confirm ? '' : 'click-off'}
                        isLoading={sendToMeLoader.isFetching}
                        blockBodyPointerEvents
                    >
                        {SEND_TO_ME}
                    </RSPrimaryButton>
                </div>
            }
        />
    );
};

export default LivePreviewModal;
