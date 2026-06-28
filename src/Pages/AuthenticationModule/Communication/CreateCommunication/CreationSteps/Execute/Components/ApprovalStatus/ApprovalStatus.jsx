import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { ApprovalStatusSkeleton } from 'Components/Skeleton/Skeleton';
import { APPROVAL_STATUS, APPROVED_BY } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useState } from 'react';
import RSTabberFluid from 'Components/RSTabberFluid';
import { 
    APPROVAL_STATUS_ENUM
} from './constant';

import { useSelector } from 'react-redux';

const ApprovalStatus = ({ tab }) => {
    const [statusTab, setStatusTab] = useState('Communication');
    const { channelDetails, approvalStatusByLevel, campaignDetails, isCampaignAnalyzeListLoading } = useSelector(({ communicationExecuteReducer }) => communicationExecuteReducer);
    const value = channelDetails[tab]?.contentDetail?.approvalStatus;
    const campaignType = campaignDetails?.campaignType;
    
    const approvalList = campaignType === 'M' ? approvalStatusByLevel : value?.campaignApprovalStatus;
    
    // Check if data is loading (API is pending) vs no data (value exists but arrays are empty)
    const isLoading = isCampaignAnalyzeListLoading;
    const hasNoData = value && !approvalList?.length && !value?.listApprovalStatus?.length;
    
    return (
        <Fragment>
            <div className="portlet-container portlet-md p0">
                <div className="portlet-header p19 mb0" style={{ height: "auto" }}>
                    <h4>{APPROVAL_STATUS}</h4>
                    <div className="float-end">
                        <RSTabberFluid
                            defaultClass={`col-md-2 tabTransparent `}
                            dynamicTab={`mb0 mini`}
                            activeClass={`active`}
                            tabData={[
                                { id: 1, text: 'Communication', disable: false, component: () => {} },
                                { id: 1, text: 'List', disable: false, component: () => {} },
                            ]}
                            className="rs-tabs row"
                            componentClassName={'mt20'}
                            defaultTab={0}
                            callBack={(data) => {
                                setStatusTab(text);
                            }}
                        />
                    </div>
                </div>
                {isLoading ? (
                    <ApprovalStatusSkeleton isError={false} selectedTab={statusTab} />
                ) : hasNoData ? (
                    <ApprovalStatusSkeleton isError={true} selectedTab={statusTab} />
                ) : (
                    <div className="portlet-body css-scrollbar px2">
                        {statusTab === 'Communication' && (
                            <>
                                {!approvalList || approvalList?.length === 0 ? (
                                    <ApprovalStatusSkeleton isError={true} selectedTab={statusTab} />
                                ) : (
                                    <div>
                                        {approvalList?.map((item, idx) => {
                                            return (
                                                <ul
                                                    className="align-items-center d-flex justify-content-between approval_list"
                                                    key={idx}
                                                >
                                                    <li>
                                                        <small>
                                                            {/* {getDateWithDayfullFormat(item.campaignApporvedDate)} */}
                                                            {getUserCurrentFormat(item.campaignApporvedDate)?.dateTimeFormat}
                                                        </small>
                                                        <h5>{item.campaignApproverName}</h5>
                                                        <span>{item.campaignApproverEmail}</span>
                                                    </li>
                                                    <li className="text-right">
                                                        <h4
                                                            className={
                                                                APPROVAL_STATUS_ENUM[item.campaignApproverStatus] ===
                                                                'Approved'
                                                                    ? 'color-primary-green'
                                                                    : item.campaignApproverStatus === 12
                                                                    ? 'color-primary-orange'
                                                                    : 'color-primary-red'
                                                            }
                                                        >
                                                            {APPROVAL_STATUS_ENUM[item.campaignApproverStatus]}
                                                        </h4>
                                                    </li>
                                                </ul>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                        {statusTab === 'List' && (
                            <>
                                {!value?.listApprovalStatus || value?.listApprovalStatus?.length === 0 ? (
                                    <ApprovalStatusSkeleton isError={true} selectedTab={statusTab} />
                                ) : (
                                    <div>
                                        <div className="align-items-center d-flex justify-content-between approval_list mb0 p19 border-0">
                                            <h4 className="color-primary-green">{APPROVED_BY}</h4>
                                            <h5><strong>{value?.listApprovalStatus[0]?.segmentationListName}</strong></h5>
                                        </div>
                                        {value?.listApprovalStatus?.map((item, idx) => {
                                            return (
                                                <ul className="align-items-center d-flex justify-content-between approval_list" key={idx}>
                                                    <li>
                                                        <h5>{item.listApproverName}</h5>
                                                        <span>{item.listApproverEmail}</span>
                                                    </li>
                                                    <li>
                                                        <small>
                                                            {getUserCurrentFormat(item.listApporvedDate)?.dateTimeFormat}
                                                        </small>
                                                    </li>
                                                </ul>
                                            );
                                        })}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>
        </Fragment>
    );
};

export default ApprovalStatus;
