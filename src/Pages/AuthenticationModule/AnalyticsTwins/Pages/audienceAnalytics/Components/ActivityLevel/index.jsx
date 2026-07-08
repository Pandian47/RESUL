import { getUserDetails } from 'Utils/modules/crypto';
import { ACTIVITY_LEVEL, AUDIENCE_DESIRED_ACTION, AUDIENCE_EFFECTIVENESS, AUDIENCE_INTERACTION, AUDIENCE_RAPID_CIRCULATION, CONVERSION, ENGAGEMENT, REACH, TOTAL_AUDIENCE, TRANSFORMATION_TEXT, VIRALITY } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { A360ActivityLevelBodySkeleton } from 'Components/Skeleton/pages/analytics';
import { numberWithCommas } from 'Utils/modules/formatters';
import { useSelector, useDispatch } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { aa_Overview } from 'Reducers/analyticsTwins/aa360/request';

const ActivityLevel = () => {
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();
    const { isAgency } = getUserDetails();
    const {accountAdmin, company_clientId} = useSelector(({ globalstate }) => globalstate);
    let isAgencyAccountAdmin = isAgency && accountAdmin?.clientId === company_clientId?.clientId;
    const { overView, overView_loading } = useSelector(({ aa360ViewReducer }) => aa360ViewReducer);
    const [hasOverviewSettled, setHasOverviewSettled] = useState(false);
    const isActivityLoading = Boolean(overView_loading);
    const hasActivityData = overView?.reachCount !== null && overView?.reachCount !== undefined;

    useEffect(() => {
        if (!overView_loading) {
            setHasOverviewSettled(true);
        }
    }, [overView_loading]);
    useEffect(() => {
        if(!isAgencyAccountAdmin){
        const payload = {
            departmentId,
            userId,
            clientId,
        };
        dispatch(aa_Overview(payload));
        }
        // return () => {
        //     dispatch(resetAAData());
        // };
    }, [clientId, departmentId]);
    return (
        <div
            className={`portlet-container portlet-md areaspline-x-axis-labels ${
                hasActivityData ? 'h-auto' : ''
            }`}
        >
            <div className="portlet-header">
                <h4>{ACTIVITY_LEVEL}</h4>
                <h4 className="mb0 d-flex align-items-center">
                    {TOTAL_AUDIENCE}:{' '}
                    <span className="font-bold font-md ml5"> {numberWithCommas(overView?.recipientCount || 0)} </span>
                </h4>
            </div>
            {/* <p className="mb15">
               {TRANSFORMATION_TEXT}
            </p> */}
            <div
                className={`portlet-body ${
                    hasActivityData ? 'd-inline h-auto' : 'an-sk-a360-portlet-body'
                }`}
            >
                {isActivityLoading || !hasOverviewSettled ? (
                    <A360ActivityLevelBodySkeleton />
                ) : hasActivityData ? (
                   <ul className="activityLevelBlock" key={overView?.recipientCount}>
                                          <li>
                                              <h1>
                                                  {overView?.reachCount}
                                                  <span className='font-smd'>%</span>
                                              </h1>
                                              <div className="desc">
                                                  <h3>
                                                      <span>{REACH}</span> {overView?.reachCount}
                                                      <span className='font-xs'>%</span>
                                                  </h3>
                                                  {AUDIENCE_EFFECTIVENESS}
                                              </div>
                                          </li>
                                          <li>
                                              <h1>
                                                  {overView?.interactionCount}
                                                  <span className='font-smd'>%</span>
                                              </h1>
                                              <div className="desc">
                                                  <h3>
                                                      <span>{ENGAGEMENT} </span> {overView?.interactionCount}
                                                      <span className='font-xs'>%</span>
                                                  </h3>
                                                  {AUDIENCE_INTERACTION}
                                              </div>
                                          </li>
                                          <li>
                                              <h1>
                                                  {overView?.conversionCount}
                                                  <span className='font-smd'>%</span>
                                              </h1>
                                              <div className="desc right">
                                                  <h3>
                                                      <span>{CONVERSION} </span> {overView?.conversionCount}
                                                      <span className='font-xs'>%</span>
                                                  </h3>
                                                 {AUDIENCE_DESIRED_ACTION}
                                              </div>
                                          </li>
                                          <li>
                                              <h1>
                                                  {overView?.viralCount}
                                                  <span className='font-smd'>%</span>
                                              </h1>
                                              <div className="desc right">
                                                  <h3>
                                                      <span>{VIRALITY}</span> {overView?.viralCount}
                                                      <span className='font-xs'>%</span>
                                                  </h3>
                                                {AUDIENCE_RAPID_CIRCULATION}
                                              </div>
                                          </li>
                                      </ul>
                ) : (
                    <A360ActivityLevelBodySkeleton isError />
                )}
            </div>
        </div>
    );
};

export default ActivityLevel;
