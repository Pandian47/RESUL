import { encodeUrl } from 'Utils/modules/crypto';

import { ACTION, ADD, EDIT, SUBSCRIPTION_CONTENT, UNSUBSCRIPTION_CONTENT } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_large, circle_plus_fill_edge_medium, pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import KendoGrid from 'Components/RSKendoGrid';
import RSTooltip from 'Components/RSTooltip';
import usePermission from 'Hooks/usePersmission';
import { getSessionId } from 'Reducers/globalState/selector.js';
import { getCSSubscribe, getCSUnSubscribe, isCreatedValue } from 'Reducers/preferences/CommunicationSettings/selector.js';
import { getSubscriptions, getUnSubscriptions } from 'Reducers/preferences/CommunicationSettings/request.js';
import { updateCommunicationSettings } from 'Reducers/preferences/CommunicationSettings/reducer.js';

import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';

const Subscription = ({ tabname }) => {
    const navigate = useNavigate();
    const { permissions } = usePermission();
    const { addAccess, updateAccess } = permissions || {};
    const dispatch = useDispatch();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const subscriptionGrid = useSelector((state) => getCSSubscribe(state));
    const unSubscribeData = useSelector((state) => getCSUnSubscribe(state));
    const isCreated = useSelector((state) => isCreatedValue(state));
    const [initialPagination, setInitialPagination] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const isSubscription = tabname.toLowerCase() === 'subscription';
    const isSubscriptionAddIconClickOff = !addAccess;

    const handleAddContentNavigation = (event) => {
        event?.stopPropagation?.();
        if (!addAccess) {
            return;
        }
        const url = isSubscription
            ? '/preferences/communication-settings/subscribe'
            : '/preferences/communication-settings/unsubscribe';
        const queryString = {
            mode: 'add',
            tabname,
        };
        const encryptState = encodeUrl(queryString);
        navigate(`${url}?q=${encryptState}`, {
            state: queryString,
        });
    };

    useEffect(() => {
        if (isSubscription) dispatch(getSubscriptions({ clientId, userId, departmentId }, setIsLoading));
        else if (!isSubscription) dispatch(getUnSubscriptions({ clientId, userId, departmentId }, setIsLoading));
        setInitialPagination(true);
    }, [clientId, userId, isSubscription, departmentId]);

    useEffect(() => {
        return () => {
            dispatch(updateCommunicationSettings({ field: 'subscribeData', payload: [] }));
            dispatch(updateCommunicationSettings({ field: 'unSubscribeData', payload: [] }));
            dispatch(updateCommunicationSettings({ field: 'isCreated', payload: false }));
                     }
    }, [])

    // useComponentWillUnmount(() => {
    //     dispatch(resetCommunicationSettings());
    // }, []);

    return (
        <>
            <div className="rs-sub-heading">
                <div className="align-items-center d-flex justify-content-between">
                    <h4 className="mb0">{isSubscription ? SUBSCRIPTION_CONTENT : UNSUBSCRIPTION_CONTENT}</h4>
                    <RSTooltip text={ADD} position="top" className="lh0">
                        <div className={`${!addAccess ? 'pe-none click-off' : ''}`}>
                        <i
                            onClick={() => {
                                if (addAccess) {
                                    let url = isSubscription
                                        ? '/preferences/communication-settings/subscribe'
                                        : '/preferences/communication-settings/unsubscribe'
                                    const queryString = {
                                        mode: 'add',
                                        tabname: tabname,
                                    };
                                    const encryptState = encodeUrl(queryString);
                                    navigate(`${url}?q=${encryptState}`, {
                                        state: queryString,
                                    });
                                    // navigate(
                                    //     isSubscription
                                    //         ? '/preferences/communication-settings/subscribe'
                                    //         : '/preferences/communication-settings/unsubscribe',
                                    //     {
                                    //         state: {
                                    //             mode: 'add',
                                    //             tabname: tabname,
                                    //         },
                                    //     },
                                    // );
                                }
                            }}
                            className={`icon-lg color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_large
                                }`}
                            id="rs_data_circle_plus_fill_edge"
                        ></i>
                        </div>
                    </RSTooltip>
                </div>
            </div>

            {isCreated && ((isSubscription && subscriptionGrid?.length == 0) || (!isSubscription && unSubscribeData?.length == 0)) ?
                    <RSSkeletonTable
                        text
                        isHTML
                        message={
                            <>
                                Click{' '}
                                <span
                                    className={`rs-nodata-icon-wrap position-relative bottom1 mx5${isSubscriptionAddIconClickOff ? ' cursor-not-allowed' : ''}`}
                                >
                                    <i
                                        id="rs_data_circle_plus_fill_edge"
                                        className={`icon-md color-primary-blue icon-hover-shadow-primary ${circle_plus_fill_edge_medium}${isSubscriptionAddIconClickOff ? ' click-off' : ''}`}
                                        onClick={handleAddContentNavigation}
                                    />
                                </span>
                                {' '}
                                {isSubscription
                                    ? 'to configure your subscription messages.'
                                    : 'to configure your unsubscription messages.'}
                            </>
                        }
                        isCustombox
                        isAlertIcon={false}
                    />
                    :
                    <KendoGrid
                        data={isSubscription ? subscriptionGrid : unSubscribeData}
                        noBoxShadow
                        isFailure={isSubscription ? !subscriptionGrid?.length : !unSubscribeData?.length}
                        settings={{
                            total: isSubscription ? subscriptionGrid?.length : unSubscribeData?.length,
                        }}
                        isLoading={isLoading}
                        isCustomBox
                        column={[
                            {
                                field: isSubscription ? 'subscribeName' : 'unsubscribeName',
                                title: isSubscription
                                    ? SUBSCRIPTION_CONTENT
                                    : UNSUBSCRIPTION_CONTENT,
                                filter: 'text',
                                cell: ({ dataItem }) => {
                                    const nameField = isSubscription ? dataItem?.subscribeName : dataItem?.unsubscribeName;

                                    return (
                                        <td>
                                       {nameField}
                                        </td>
                                    );
                                },
                            },
                            {
                                field: 'action',
                                title: ACTION,
                                width: 165,
                                sortingEnabled: false,
                                 sortable: false,
                                cell: (props) => {
                                    return (
                                        <td>
                                            <ul className="rs-list-inline rli-space-5 grid-view-icons">
                                                <li
                                                    onClick={() => {
                                                        if (updateAccess) {
                                                            let url = isSubscription
                                                                ? '/preferences/communication-settings/subscribe'
                                                                : '/preferences/communication-settings/unsubscribe';
                                                            const queryString = {
                                                                id: isSubscription
                                                                    ? props.dataItem?.subscribeSettingId
                                                                    : props.dataItem?.unsubscribeSettingId,
                                                                mode: 'edit',
                                                                tabname: tabname,
                                                            };
                                                            const encryptState = encodeUrl(queryString);
                                                            navigate(`${url}?q=${encryptState}`, {
                                                                state: queryString,
                                                            });
                                                            // navigate(
                                                            //     isSubscription
                                                            //         ? '/preferences/communication-settings/subscribe'
                                                            //         : '/preferences/communication-settings/unsubscribe',
                                                            //     {
                                                            //         state: {
                                                            //             id: isSubscription
                                                            //                 ? props.dataItem?.subscribeSettingId
                                                            //                 : props.dataItem?.unsubscribeSettingId,
                                                            //             mode: 'edit',
                                                            //             tabname: tabname,
                                                            //         },
                                                            //     },
                                                            // );
                                                        }
                                                    }}
                                                >
                                                    <RSTooltip text={EDIT} position="top">
                                                        <div className={`${!updateAccess ? 'pe-none click-off' : ''
                                                                }`}>
                                                        <i
                                                            id="rs_data_pencil_edit"
                                                            className={`${pencil_edit_medium
                                                                } icon-md color-primary-blue`}
                                                        ></i></div>
                                                    </RSTooltip>
                                                </li>
                                            </ul>
                                        </td>
                                    );
                                },
                            },
                        ]}
                        pagerChange={initialPagination}
                        setInitialPagination={setInitialPagination}
                    />
            }
        </>
    );
};

export default Subscription;
