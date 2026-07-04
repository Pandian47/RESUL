import { ENTER_RETARGET_LIST_NAME, LIST_NAME_EXISTS, RETARGET_LIST_FAILURE, RETARGET_LIST_SUCCESSFUL } from 'Constants/GlobalConstant/ValidationMessage';
import { getChannelId } from 'Utils/modules/communicationChannels';
import { numberWithCommas } from 'Utils/modules/formatters';
import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { MAX_LENGTH75 } from 'Constants/GlobalConstant/Regex';
import { SAVE } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_tick_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';

import { useNavigate } from 'react-router-dom';

import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton } from 'Components/Buttons';
import { getSummaryList } from 'Reducers/analytics/analyticsSummary/selector';
import RSInput from 'Components/FormFields/RSInput';
import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';
import { save_Retargetlist } from 'Reducers/analytics/communicationAnalytics/request';
import { checkTargetListName } from 'Reducers/audience/targetListCreation/request';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { handleCountPayload } from '../Constants';
import { DID_NOT_CLICKS } from 'Constants/GlobalConstant/Placeholders';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const ANALYTICS_FIELD_LOADER_CONFIG = { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD };

var listName = '';
const RetargetList = ({
    count = '',
    label = '',
    isDashboard = false,
    isUninstall,
    mainClass,
    iconColor,
    channelId,
    blastId,
    handleDlNavigation = () => {},
}) => {
    const navigate = useNavigate();
    const summary = useSelector((state) => getSummaryList(state));
    const [show, setShow] = useState(false);
    const [showMsg, setShowMsg] = useState({ status: false, msg: '' });
    const [showTick, setShowTick] = useState(false);
    const [isCheckingName, setIsCheckingName] = useState(false);
    const retargetSaveLoader = useApiLoader({
        autoFetch: false,
        loaderConfig: ANALYTICS_FIELD_LOADER_CONFIG,
    });
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const { control, handleSubmit, setValue, clearErrors, setError } = useForm({
        defaultValues: {
            listName: '',
        },
        mode: 'onTouched',
    });
    const dispatch = useDispatch();
    const handleFormSubmit = async (data) => {
        if (retargetSaveLoader.isFetching || isCheckingName || !showTick) return;

        const {
            recipientCountEmail,
            recipientCountMobile,
            recipientCountMobilePush,
            recipientCountWebPush,
            recipientCountWhatsApp,
        } = handleCountPayload(channelId, count);

        const payload = {
            segmentationName: listName,
            listType: 10,
            recipientCount: count ?? 0,
            departmentId: departmentId,
            uid: userId,
            ccid: clientId,
            channelName: getChannelId(channelId)?.label,
            actionName: label === 'Link clicked' ? 'Link click' : label,
            guid: summary?.campaignGuid?.replaceAll('-', '_'),
            b2: blastId,
            recipientCountEmail,
            recipientCountMobile,
            recipientCountMobilePush,
            recipientCountWebPush,
            recipientCountWhatsApp,
        };

        const res = await retargetSaveLoader.refetch({
            fetcher: async ({ payload: savePayload }) => dispatch(save_Retargetlist({ payload: savePayload })),
            params: { payload },
        });

        if (res?.status) {
            setShowTick(false);
            setShowMsg((prev) => ({ status: true, msg: RETARGET_LIST_SUCCESSFUL }));
            setTimeout(() => {
                handleCloseModal();
            }, 2000);
        } else {
            setShowTick(true);
            setShowMsg((prev) => ({ status: true, msg: RETARGET_LIST_FAILURE }));
        }
    };
    const isDashboardData = [
        // { name: 'AI customer journery', path: '/communication/communication-creation' },
        // { name: 'Target list', path: '/audience/create-target-list' },
        { name: 'Dynamic list', path: '/audience/create-dynamic-list' },
    ];
    const isUninstallData = [
        { name: 'Create target list', path: '/audience/create-target-list' },
        { name: 'Create dynamic list', path: '/audience/create-dynamic-list' },
    ];
    const isRetargetData = [{ name: 'Retarget list', path: '' }];

    const handleNavigation = (path, name) => {
        if (name === 'Dynamic list') {
            handleDlNavigation();
        } else if (name === 'Target list') {
            return navigate(path, {
                state: {
                    mode: 'edit',
                    segmentationListID: 91,
                    recipientsBunchName: 'Select you Country',
                },
            });
        } else if (name === 'AI customer journery') {
            return navigate(path, {
                state: {
                    type: 'aiDriven',
                },
            });
        }
    };
    const handleNavigationUninstall = (path, name) => {
        if (name === 'Create dynamic list') {
            return navigate(path);
        } else if (name === 'Create target list') {
            return navigate(path);
        }
    };
    const handleCloseModal = () => {
        if (retargetSaveLoader.isFetching || isCheckingName) return;
        setShow(false);
        clearErrors('listName');
        setShowMsg({ status: false, msg: '' });
        setShowTick(false);
        setIsCheckingName(false);
        retargetSaveLoader.reset();
    };

    const isListnameExists = async (name) => {
        setIsCheckingName(true);
        setShowTick(false);
        const payloadData = {
            departmentId,
            clientId,
            userId,
            listName: name,
            listId: 0,
        };
        listName = name;
        try {
            const res = await dispatch(checkTargetListName(payloadData));
            if (res?.status) {
                setError('listName', {
                    type: 'custom',
                    message: LIST_NAME_EXISTS,
                });
                setShowTick(false);
            } else {
                clearErrors('listName');
                setShowTick(true);
            }
        } finally {
            setIsCheckingName(false);
        }
    };
    useEffect(() => {
        setValue('listName', `RTL_${summary?.campaignName}_${label}`);
    }, [summary, show]);

    return (
        <div className={`${mainClass ?? ''}`}>
            <BootstrapDropdown
                className={'mr15 no_caret reTarget_List'}
                isObject
                fieldKey={'name'}
                showUpdate={false}
                data={isDashboard ? isDashboardData : isUninstall ? isUninstallData : isRetargetData}
                defaultItem={<i className={`icon-rs-retarget-list-medium icon-md ${iconColor}`} />}
                onSelect={({ path, name }) => {
                    isDashboard
                        ? handleNavigation(path, name)
                        : isUninstall
                        ? handleNavigationUninstall(path, name)
                        : setShow(true);
                }}
            />
            <RSModal
                show={show}
                size={'md'}
                isMarginTop={false}
                handleClose={handleCloseModal}
                lockBackground={retargetSaveLoader.isLoading}
                isCloseDisabled={retargetSaveLoader.isLoading || isCheckingName}
                bodyClassName={retargetSaveLoader.isLoading ? 'pe-none' : ''}
                header="Retarget list"
                headerRightContent={
                    <>
                        <h4 className="mb0">
                            {label}: <span className="font-bold font-md">{numberWithCommas(count)}</span>
                        </h4>
                    </>
                }
                body={
                    <form onSubmit={handleSubmit(handleFormSubmit)}>
                        {channelId === 1 && label === 'Unique opens' && (
                            <RSCheckbox
                                className="smaller"
                                name={`isDidnotclicks`}
                                control={control}
                                labelName={DID_NOT_CLICKS}
                                containerClass="mb15"
                            />
                        )}
                          {showMsg.status ? (
                            <div
                                className={`alert border-r7 align-items-stretch mb27 ${showMsg.msg?.includes('not')  ? 'alert-danger' : 'alert-success'
                                    }`}
                            >
                                <i
                                    className={`position-relative mr10 p8 white border-tlr7 border-blr7 d-flex align-items-center ${showMsg.msg?.includes('not') 
                                            ? alert_medium
                                            : circle_tick_medium 
                                        }  ${showMsg?.msg?.includes('not') ? 'bg-primary-red' : 'bg-primary-green'
                                        } icon-md `}
                                ></i>
                                <span className='align-content-center'>
                                    {showMsg?.msg}
                                </span>
                            </div>
                        ) : (
                            <></>
                        )}
                        <div className="position-relative retargetlist">
                            <RSInput
                                name="listName"
                                control={control}
                                required
                                defaultValue={`RTL_${summary?.campaignName}_${label}`}
                                rules={{ required: ENTER_RETARGET_LIST_NAME }}
                                isLoading={isCheckingName}
                                isValidIcon={showTick && !isCheckingName}
                                disabled={retargetSaveLoader.isLoading}
                                handleOnchange={() => {
                                    clearErrors('listName');
                                    setShowTick(false);
                                }}
                                handleOnBlur={(e) => {
                                    let value = e.target.value;
                                    if (value) {
                                        isListnameExists(value);
                                    } else {
                                        setShowTick(false);
                                    }
                                }}
                                onKeyDown={charNumUnderScore}
                                maxLength={MAX_LENGTH75}
                            />
                        </div>

                      
                        <div className="buttons-holder mt30">
                            <RSPrimaryButton
                                type="submit"
                                isLoading={retargetSaveLoader.isLoading}
                                blockBodyPointerEvents
                                disabledClass={
                                    showTick && !isCheckingName && !retargetSaveLoader.isLoading
                                        ? ''
                                        : 'pe-none click-off'
                                }
                            >
                                {SAVE}
                            </RSPrimaryButton>
                        </div>
                    </form>
                }
            />
        </div>
    );
};
export default RetargetList;
