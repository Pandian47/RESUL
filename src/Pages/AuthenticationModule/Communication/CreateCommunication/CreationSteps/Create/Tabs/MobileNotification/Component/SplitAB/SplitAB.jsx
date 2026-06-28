import { getDateWithAddMinutes } from 'Utils/modules/dateTime';
import { IN_PAGE_SPLIT_CONTENT_DEFAULTS, refreshFieldsOnSplitAB } from '../../constant';
import { Fragment, useContext, useEffect, useMemo } from 'react';
import _get from 'lodash/get';
import _cloneDeep from 'lodash/cloneDeep';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-bootstrap';
import { useFormContext, useWatch } from 'react-hook-form';

import { getContentSetupStatus, COMMUNICATION_CHANNEL_ID } from '../../../../constant';
import RSTabber from 'Components/RSTabber';
import Scheduler from '../../../../Component/Scheduler';
import NotificationProvider from '../../context';


import { SPLIAB_TABBER_CONFIG, TABBER_CONFIG } from './constant';
import { useDispatch, useSelector } from 'react-redux';
import { updateNotificationMobile } from 'Reducers/communication/createCommunication/Create/reducer';
import { getMobileAppId } from 'Reducers/communication/createCommunication/smartlink/selectors';
import useQueryParams from 'Hooks/useQueryParams';
import MobilePreviewConfig from './Component/MobilePreviewConfig/MobilePreviewConfig';
import { isInPageBannerSelected } from '../../../Notification/constant';

const SplitAB = ({ fieldName = '', isSplit = false, index, setDirtyReset }) => {
    const { type } = useContext(NotificationProvider);
    const dispatch = useDispatch();

    const { notification } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const mobileAppId = useSelector((state) => getMobileAppId(state));

    const location = useQueryParams('/communication') || {};

    const {
        control,
        formState: { errors },
        watch,
        setValue,
        clearErrors,
        reset,
        getValues,
    } = useFormContext();

    const importTabFormValues = useWatch({ control });
    const isContentSetupForSchedule = useMemo(
        () =>
            getContentSetupStatus(importTabFormValues, isSplit ? fieldName : '', {
                channelId: COMMUNICATION_CHANNEL_ID.MOBILE_NOTIFICATION,
                splitTabList: importTabFormValues?.splitTabList,
            }),
        [importTabFormValues, fieldName, isSplit],
    );

    const [layoutPosition] = watch(['layoutPosition']);

    const currentTabName = isSplit ? `${fieldName}.currentTabIndex` : 'currentTabIndex';
    const tabErrorText = isSplit ? `${fieldName}.tabErrorText` : 'tabErrorText';
    const contentInputName = isSplit ? `${fieldName}.contentInput` : 'contentInput';
    const [deliveryType, currentPage = null, contentInput, approvalList, scheduleAlert, mobileApp, inPageBanner] =
        watch([
            'deliveryType',
            currentTabName,
            contentInputName,
            'approvalList',
            'scheduleAlert',
            'mobileApp',
            'inPageBanner',
        ]);

    const isDeliverTypeOverlay = deliveryType?.value === 'Alert/rich push';
    const isInPageContent = deliveryType?.id === 5;

    const tabErrorMessage = _get(errors, `${tabErrorText}.message`, null);

    useEffect(() => {
        const qparam = new URLSearchParams(window.location.search);
        if (qparam.get('typeId')?.length > 0) {
            setValue(currentTabName, parseInt(qparam.get('typeId'), 10));
        }
        if (isSplit) {
            dispatch(
                updateNotificationMobile({
                    data: fieldName,
                    field: 'fieldNameIndex',
                }),
            );
        }
    }, []);

    useEffect(() => {
        if (deliveryType?.id !== 5) return;
        if (!isInPageBannerSelected(inPageBanner)) return;

        setValue(currentTabName, 1);
        setValue(contentInputName, 'import');
    }, [deliveryType?.id, fieldName, isSplit, inPageBanner, currentTabName, contentInputName, setValue]);
    // console.log(deliveryType?.value,'deliveryType?.value');

    // console.log('Errors :::: ', isSplit, layoutPosition?.value === 'Carousel', index);

    // Calculate minimum date for scheduler based on previous split tab's schedule
    const splitTabLetters = ['A', 'B', 'C', 'D', 'E'];
    const currentTabLetter = fieldName?.replace('split', '').toUpperCase() || '';
    const currentTabIndex = splitTabLetters.indexOf(currentTabLetter);

    // Get the previous tab's schedule field name to watch
    const previousTabScheduleFieldName = useMemo(() => {
        if (!isSplit || currentTabIndex <= 0) return null;
        const previousTabLetter = splitTabLetters[currentTabIndex - 1];
        return `split${previousTabLetter}.schedule`;
    }, [isSplit, fieldName, currentTabIndex]);

    // Watch the previous tab's schedule
    const previousTabSchedule = previousTabScheduleFieldName ? watch([previousTabScheduleFieldName])[0] : null;

    // Calculate minimum date: previous schedule + 5 minutes
    const getMinDateForScheduler = useMemo(() => {
        if (!isSplit || !fieldName || currentTabIndex <= 0) return null;

        // If previous tab has a schedule, add 5 minutes to it
        if (previousTabSchedule && previousTabSchedule instanceof Date && !isNaN(previousTabSchedule.getTime())) {
            return getDateWithAddMinutes(previousTabSchedule, 5);
        }

        return null;
    }, [isSplit, fieldName, currentTabIndex, previousTabSchedule]);

    return (
        <Fragment>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 10 }}>
                        {tabErrorMessage && <p className="color-primary-red">{tabErrorMessage}</p>}
                        <RSTabber
                            dynamicTab={`rs-content-tabs-flat col-sm-9 ${isDeliverTypeOverlay
                                ? 'notification-alertpush-tabs'
                                : 'notification-inpage-overlay-tabs'
                                }`}
                            extraClassName={'mx0'}
                            activeClass={`active`}
                            //heading={deliveryType}
                            heading={deliveryType?.value}
                            flatTabs
                            refresh={currentPage !== null && deliveryType?.id !== 1 && deliveryType?.id !== 5}
                            isRefreshConfirmation={true}
                            defaultTab={currentPage}
                            // extraClassName={'col-md-10 offset-md-1'}
                            disableOtherTabs={currentPage !== null}
                            onRefresh={() => {
                                if (isSplit) {
                                    reset(
                                        (formState) => ({
                                            ...formState,
                                            [fieldName]: {
                                                ..._cloneDeep(refreshFieldsOnSplitAB),
                                                ...(deliveryType?.id === 5
                                                    ? IN_PAGE_SPLIT_CONTENT_DEFAULTS
                                                    : {}),
                                                pushNotifyChannelDetailId:
                                                    formState[fieldName]?.pushNotifyChannelDetailId,
                                            },
                                            splitscehdule: {
                                                autoSchedule: false,
                                                communicationPerformanceBy: 'SubjectLine',
                                                duration: '',
                                                time: 'Hour(s)',
                                            },
                                        }),
                                        {
                                            keepDirty: true,
                                        },
                                    );
                                } else {
                                    reset(
                                        (formState) => ({
                                            ...formState,
                                            ..._cloneDeep(refreshFieldsOnSplitAB),
                                        }),
                                        {
                                            keepDirty: true,
                                        },
                                    );
                                }
                                setDirtyReset(true);
                            }}
                            tabData={
                                isSplit
                                    ? SPLIAB_TABBER_CONFIG(
                                          fieldName,
                                          deliveryType?.id === 1,
                                          deliveryType?.id,
                                          [],
                                          index,
                                      )
                                    : TABBER_CONFIG(deliveryType?.id === 1)
                            }
                            callBack={(data, tabIndex) => {
                                // console.log('ASDADASDASDASDD_____ ', data);
                                setValue(currentTabName, tabIndex);
                                setValue('channelType', 'mobile');
                                // console.log('Rest :::: ', data);
                                setValue(contentInputName, data?.id);
                                // setContentInput(id);
                                if (tabErrorMessage) clearErrors(tabErrorText);
                            }}
                        />
                    </Col>
                </Row>
            </div>
            <MobilePreviewConfig
                fieldName={fieldName}
                isSplit={isSplit}
                index={index}
                variant="splitAB"
            />
            {(location?.campaignType === 'S' ||
                (location?.campaignType === 'M' &&
                    location?.mdcContentSetupDetails?.levelNumber === 1 &&
                    location?.mdcContentSetupDetails?.dataSource === 'TL')) &&
                isContentSetupForSchedule && (
                <Scheduler
                    isSplitTabs={isSplit && layoutPosition?.id !== 4}
                    fieldName={fieldName}
                    isRequired={isSplit && scheduleAlert ? true : false || approvalList?.requestApproval ? true : false}
                    isClose={true}
                    isSendTimeRecommendation={false}
                    splitABminDate={getMinDateForScheduler}
                    isRfaEnabled={true}
                />
            )}
        </Fragment>
    );
};

SplitAB.propTypes = {
    isSplit: PropTypes.bool,
    fieldName: PropTypes.string,
};

export default SplitAB;
