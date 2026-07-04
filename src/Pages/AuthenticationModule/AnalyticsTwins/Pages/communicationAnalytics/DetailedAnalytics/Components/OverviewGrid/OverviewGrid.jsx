import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { OVERVIEW, showAdditionalInfo } from './constants';
import { ADDITIONAL_INFO, AS_ON, PREVIEW } from 'Constants/GlobalConstant/Placeholders';
import { circle_info_medium, eye_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import RSTooltip from 'Components/RSTooltip';
import { getCommunicationDocket } from 'Reducers/analyticsTwins/details/request';

import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';

import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const ANALYTICS_FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };
const OverviewGrid = ({
    isTime = false,
    segmentList,
    calendar,
    infoIcon,
    previewImage,
    date,
    channelType,
    handlePreviewDetails,
    campaignId,
    channelId,
    isPreview = true,
    downloadUI = false,
}) => {
    const dispatch = useDispatch();
    const docketLoader = useApiLoader({ autoFetch: false, loaderConfig: ANALYTICS_FIELD_LOADER_CONFIG });
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const [isShowAdditionalInfo, setIsShowAdditionalInfo] = useState(false);
    const { docketDetails } = useSelector(({ analyticsDetails }) => analyticsDetails);

    const handleAdditionalInfoClick = async () => {
        setIsShowAdditionalInfo(true);

        const payload = {
            campaignId: parseInt(campaignId, 10),
            departmentId,
            clientId,
            userId,
            channelId,
        };

        await docketLoader.refetch({
            fetcher: () => dispatch(getCommunicationDocket({ payload })),
            mode: 'create',
            loaderConfig: ANALYTICS_FIELD_LOADER_CONFIG,
        });
    };
    return (
        <>
            <div className="d-flex justify-content-between mb10 mt10 clear-both position-relative z-1">
                <div className="d-flex align-items-center">
                    <h3 className="pr10 mb-0">{OVERVIEW}</h3>
                    {isTime && <small className="pr10 font-xsm position-relative top1">({AS_ON}:  {getUserCurrentFormat(date,{isOffset:true})?.utcformat})</small>}
                    <span className={`${downloadUI ? 'mt-3' : ''}`}>
                        <RSTooltip text={PREVIEW} className="lh0">
                            {isPreview && (
                                <i
                                    id="rs_data_eye"
                                    className={`${eye_medium} icon-md color-primary-blue`}
                                    onClick={() => handlePreviewDetails(true)}
                                ></i>
                            )}
                        </RSTooltip>
                    </span>
                </div>
                <div>
                    <div className="d-flex align-items-center">
                        {infoIcon ? (
                            <ul className="d-flex ml15 position-relative top4">
                                <li className={`d-flex`}>
                                    <RSTooltip text={ADDITIONAL_INFO} position="top" className="lh0">
                                        <div
                                            className={`${docketDetails.length ? '' : 'pe-none click-off'}`}
                                        >
                                            <i
                                                id="rs_data_circle_info"
                                                className={`${circle_info_medium} icon-md color-primary-grey`}
                                                onClick={handleAdditionalInfoClick}
                                            />
                                        </div>
                                    </RSTooltip>
                                </li>
                            </ul>
                        ) : null}
                    </div>
                </div>
            </div>
            {showAdditionalInfo({
                isShowAdditionalInfo,
                setIsShowAdditionalInfo,
                isDocketLoading: docketLoader.isLoading,
            })}
        </>
    );
};

export default OverviewGrid;
