import { checkIsBrandExists } from 'Utils/modules/brandStorage';
import {
    onlyNumbersDecimalWithoutSpecialCharacters,
    onlyNumbers,
    charNumDotWithoutSpecialCharacters,
} from 'Utils/modules/inputValidators';
import { INITIAL_STATE, STATE_REDUCER, getDisableStatus, getListType } from './constant';
import {
    IPADDRESS_REGEX,
    MAX_LENGTH15,
    MAX_LENGTH250,
    MAX_LENGTH75,
    PORTNUMBER_REGEX,
    PORT_LENGTH,
} from 'Constants/GlobalConstant/Regex';
import {
    ENTER_FOLDER_PATH,
    ENTER_FRIENDLY_NAME,
    ENTER_PASSWORD,
    ENTER_USERNAME,
    ENTER_VALID_IP_ADDRESS,
    ENTER_VALID_PORT_NUMBER,
    IP_ADDRESS as IP_ADDRESS_MSG,
    PORT_NUMBER as PORT_NUMBER_MSG,
    SELECT_LIST_TYPE,
    SELECT_SOURCE,
    UPDATE_CYCLE as UPDATE_CYCLE_MSG,
} from 'Constants/GlobalConstant/ValidationMessage';
import {
    ARE_YOU_SURE_WANT_TO_RESET,
    AUDIENCE_FILE_STORED,
    CHILD_ATTRIBUTE,
    FOLDER_PATH,
    FRIENDLY_NAME,
    IP_ADDRESS,
    LIST_TYPE,
    PASSWORD,
    PORT_NUMBER,
    RESET,
    USER_NAME,
    UPDATE_CYCLE,
} from 'Constants/GlobalConstant/Placeholders';
import { restart_medium, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useReducer, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import RSKendoDropdownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';
import { checkFriendlyNameExists } from 'Reducers/audience/addAudience/request';
import { useDispatch, useSelector } from 'react-redux';

import { FRIENDLYNAME_RULES } from 'Pages/AuthenticationModule/Audience/audienceFormRules';
import { setConnectionStatus } from 'Reducers/audience/addAudience/reducer';
import { getSessionId } from 'Reducers/globalState/selector';
import ConfirmationPopup from '../CSV/Components/ConfirmationPopup/ConfirmationPopup';
import ChildAttrModal from '../ChildAttrModal';
import RSTooltip from 'Components/RSTooltip';
import { getUpdateCycleFrequency } from 'Reducers/remoteDataSource/request';
import { updateCycleFrequency } from 'Reducers/RemoteDataSource/reducer';
import RSConfirmationModal from 'Components/ConfirmationModal';
import ListNameExists from 'Components/ListNameExists';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

const FTP = ({ audRefData }) => {
    const [state, dispatchState] = useReducer(STATE_REDUCER, INITIAL_STATE);
    const {
        control,
        setValue,
        watch,
        reset,
        formState: { isValid },
        setError,
        trigger,
    } = useFormContext();
    const [isReset, setIsReset] = useState({
        show: false,
    });
    const [childAttrModal, setChildAttrModal] = useState({
        show: false,
    });
    const { updateCycleList } = useSelector(({ remoteDataSourceReducer }) => remoteDataSourceReducer);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const [listType, connectMessage] = watch(['listType', 'connectMessage']);
    const { ftpConnectionStatus } = useSelector(({ remoteDataSourceReducer }) => remoteDataSourceReducer);

    const dispatch = useDispatch();
    const isAdHocList = listType === 'Ad-hoc list';
    const updateCycleFrequencyApi = useApiLoader();

    const handleFieldBlur = (fieldName) => (e) => {
        const rawValue = e?.target?.value;
        if (typeof rawValue === 'string') {
            setValue(fieldName, rawValue.trim(), { shouldValidate: true, shouldDirty: true });
            return;
        }
        void trigger(fieldName);
    };

    const handleDropdownBlur = (fieldName) => () => {
        void trigger(fieldName);
    };

    useEffect(() => {
        dispatch(setConnectionStatus(isValid));
    }, [isValid]);

    useEffect(() => {
        if (listType && !isAdHocList && checkIsBrandExists(departmentId)) {
            handleCloseModal();
        }
    }, [listType]);
    useEffect(() => {
        if (listType !== 'Target list' || updateCycleList?.length) return;
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        void updateCycleFrequencyApi.refetch({
            fetcher: (params) => dispatch(getUpdateCycleFrequency({ payload: params, loading: false })),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
            params: payload,
        });
    }, [listType]);

    const handleCloseModal = () => {
        dispatchState({
            type: 'UPDATE',
            payload: !state.show,
            field: 'show',
        });
    };

    const openChildAttributeModal = () => {
        setChildAttrModal({ show: true });
    };

    useEffect(() => {
        return () => {
            dispatch(updateCycleFrequency([]));
        };
    }, []);

    return (
        <>
            {/* <div className="form-group">
                <Row>
                    <Col sm={{ span: 3, offset: 1 }} className="text-right">
                        <label className="control-label-left">{SOURCE}</label>
                    </Col>
                    <Col sm={4}>
                        <ul className="rs-list-inline">
                            <li>
                                <RSRadioButton
                                    control={control}
                                    name="source"
                                    id="rs_FTP_ftp"
                                    labelName={FTP_LABEL}
                                    defaultValue={SFTP}
                                    className={'click-off'}
                                    rules={{
                                        required: SELECT_SOURCE,
                                    }}
                                    isError={true}
                                />
                            </li>
                            <li>
                                <RSRadioButton
                                    control={control}
                                    name="source"
                                    labelName={SFTP}
                                    id="rs_FTP_sftp"
                                    defaultValue={SFTP}
                                    rules={{
                                        required: SELECT_SOURCE,
                                    }}
                                    isError={false}
                                />
                            </li>
                        </ul>
                    </Col>
                </Row>
            </div> */}
            <div className="form-group">
                <Row>
                    <Col sm={{ span: 3, offset: 1 }} className="text-right">
                        <label className="control-label-left">{LIST_TYPE}</label>
                    </Col>
                    <Col sm={4}>
                        <RSKendoDropdownList
                            control={control}
                            name="listType"
                            label={LIST_TYPE}
                            data={getListType(audRefData)}
                            required
                            rules={{ required: SELECT_LIST_TYPE }}
                            disabled={getDisableStatus(listType)}
                            handleOnBlur={handleDropdownBlur('listType')}
                            // className={getDisableStatus(listType) ? 'click-off' : ''}
                            handleChange={(e) => {
                                if (e.value?.toLowerCase()?.includes('ad-hoc list')) {
                                    dispatchState({
                                        type: 'UPDATE',
                                        payload: true,
                                        field: 'isAdhocModal',
                                    });
                                    dispatchState({
                                        type: 'UPDATE',
                                        payload: false,
                                        field: 'isTLtype',
                                    });
                                } else {
                                    dispatchState({
                                        type: 'UPDATE',
                                        payload: true,
                                        field: 'isTLtype',
                                    });
                                }
                            }}
                        />
                    </Col>
                    {listType && (
                        <Col md={1} className="pl0">
                            <RSTooltip position="top" className="d-inline-flex lh0 position-relative top6" text={RESET}>
                                <i
                                    id="rs_data_refresh"
                                    className={`${restart_medium} icon-md color-primary-blue`}
                                    onClick={() => {
                                        setIsReset({
                                            show: true,
                                        });
                                    }}
                                />{' '}
                            </RSTooltip>
                            {listType === 'Target list' && (
                                <RSTooltip
                                    position="top"
                                    className="d-inline-flex lh0 position-relative top6 ml10"
                                    text={CHILD_ATTRIBUTE}
                                >
                                    <i
                                        id="rs_child_attribute"
                                        className={`${settings_medium} icon-md color-primary-blue cursor-pointer`}
                                        onClick={() => {
                                            openChildAttributeModal();
                                        }}
                                    />
                                </RSTooltip>
                            )}
                        </Col>
                    )}
                </Row>
            </div>

            {listType && (
                <>
                    <div className="form-group">
                        <Row>
                            <Col sm={4}>
                                <ListNameExists
                                    name="friendlyName"
                                    id="rs_FTP_friendlyname"
                                    control={control}
                                    field="friendlyname"
                                    apiCallback={checkFriendlyNameExists}
                                    condition={(data) => {
                                        const { status } = data;
                                        setValue('FTP.friendlyNameLoading', status);
                                        return !status;
                                    }}
                                    rules={FRIENDLYNAME_RULES}
                                    customErrorMessage={ENTER_FRIENDLY_NAME}
                                    placeholder={FRIENDLY_NAME}
                                    extraPayload={{ remoteDataSourceID: 8 }}
                                    callback={() => {
                                        setValue('FTP.friendlyNameLoading', true);
                                    }}
                                />
                                {/* <RSInput
                                    control={control}
                                    name="friendlyName"
                                    id="rs_FTP_friendlyname"
                                    placeholder={FRIENDLY_NAME}
                                    handleOnBlur={handleFriendlyName}
                                    maxLength={MAX_LENGTH75}
                                    handleOnchange={() => {
                                        if (friendlyNameError) clearErrors('friendlyName');
                                    }}
                                    required
                                    rules={{
                                        ...FRIENDLYNAME_RULES,
                                        validate: friendlyNameError ? _get(errors, 'friendlyName') : true,
                                    }}
                                /> */}
                            </Col>
                            <Col sm={4}>
                                <RSInput
                                    control={control}
                                    name="ipAddress"
                                    id="rs_FTP_ipAddress"
                                    required
                                    handleOnchange={(e) => {
                                        onlyNumbersDecimalWithoutSpecialCharacters(e);
                                        setValue(`connectMessage`, '');
                                    }}
                                    handleOnBlur={handleFieldBlur('ipAddress')}
                                    onKeyDown={charNumDotWithoutSpecialCharacters}
                                    placeholder={IP_ADDRESS}
                                    rules={{
                                        required: IP_ADDRESS_MSG,
                                        pattern: {
                                            value: IPADDRESS_REGEX,
                                            message: ENTER_VALID_IP_ADDRESS,
                                        },
                                    }}
                                    maxLength={MAX_LENGTH15}
                                />
                            </Col>
                            <Col sm={4}>
                                <RSInput
                                    control={control}
                                    name="portNumber"
                                    id="rs_FTP_portNumber"
                                    placeholder={PORT_NUMBER}
                                    required
                                    maxLength={PORT_LENGTH}
                                    // onKeyDown={(e) => onlyNumbers(e)}
                                    handleOnchange={(e) => {
                                        onlyNumbers(e);
                                        setValue(`connectMessage`, '');
                                    }}
                                    handleOnBlur={handleFieldBlur('portNumber')}
                                    rules={{
                                        required: PORT_NUMBER_MSG,
                                        pattern: {
                                            value: PORTNUMBER_REGEX,
                                            message: ENTER_VALID_PORT_NUMBER,
                                        },
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                    <div className="form-group">
                        <Row>
                            <Col sm={4}>
                                <RSInput
                                    control={control}
                                    name="userName"
                                    id="rs_FTP_username"
                                    required
                                    placeholder={USER_NAME}
                                    handleOnBlur={handleFieldBlur('userName')}
                                    rules={{ required: ENTER_USERNAME }}
                                    maxLength={MAX_LENGTH250}
                                />
                            </Col>
                            <Col sm={4}>
                                <RSInput
                                    control={control}
                                    id="rs_FTP_password"
                                    name="password"
                                    type="password"
                                    required
                                    viewEye
                                    placeholder={PASSWORD}
                                    handleOnBlur={handleFieldBlur('password')}
                                    rules={{ required: ENTER_PASSWORD }}
                                    maxLength={MAX_LENGTH250}
                                />
                            </Col>
                            <Col sm={4}>
                                <RSInput
                                    control={control}
                                    name="folderPath"
                                    id="rs_FTP_folderPath"
                                    required
                                    placeholder={FOLDER_PATH}
                                    handleOnBlur={handleFieldBlur('folderPath')}
                                    rules={{ required: ENTER_FOLDER_PATH }}
                                    maxLength={MAX_LENGTH250}
                                    rightTooltip={AUDIENCE_FILE_STORED}
                                />
                            </Col>
                        </Row>
                    </div>
                    {(state.isTLtype || watch('isTargetListType')) && (
                        <div className="form-group">
                            <Row>
                                {/* <Col sm={6}>
                            <h4 className="mt15 mb0">{IMPORT_PREFERENCES}</h4>
                            <RSRadioButton
                                control={control}
                                name="isImportPreference"
                                labelName={IMPORT_PREFERENCE_LABEL}
                                defaultValue={'Update new data - if a match is found, overwrite the older record'}
                            />
                        </Col> */}
                                <Col sm={4} id="rs_FTP_updatedcycle">
                                    {/* <label>{UPDATE_CYCLE}</label> */}
                                    <RSKendoDropdownList
                                        control={control}
                                        name="updatedCycle"
                                        label="Update cycle"
                                        data={updateCycleList}
                                        required
                                        textField="type"
                                        dataItemKey="typeId"
                                        isLoading={updateCycleFrequencyApi?.isLoading}
                                        handleOnBlur={handleDropdownBlur('updatedCycle')}
                                        rules={{
                                            required: UPDATE_CYCLE_MSG,
                                            // validate: (data) => (data.typeId !== 0 ? true : false),
                                        }}
                                    />
                                </Col>
                            </Row>{' '}
                        </div>
                    )}

                    {connectMessage && (
                        <div
                            className={`mx-auto d-flex justify-content-end pt-3 ${
                                ftpConnectionStatus?.status ? 'text-success' : 'text-danger'
                            }`}
                        >
                            {connectMessage}
                        </div>
                    )}
                    {ftpConnectionStatus?.message || (
                        <div
                            className={`d-flex justify-content-end ${
                                ftpConnectionStatus?.status ? 'text-success' : 'text-danger'
                            }`}
                        >
                            {ftpConnectionStatus?.message}
                        </div>
                    )}
                </>
            )}
            {/* Modals */}
            <ConfirmationPopup
                show={state.isAdhocModal}
                type={'adhoclist'}
                handleClose={() => {
                    dispatchState({
                        type: 'UPDATE',
                        payload: false,
                        field: 'isAdhocModal',
                    });
                    setValue('listType', '');
                }}
                handleConfirm={() => {
                    dispatchState({
                        type: 'UPDATE',
                        payload: false,
                        field: 'isAdhocModal',
                    });
                    setValue('listType', 'Ad-hoc list');
                }}
            />
            {/* <AdhocListModal
                show={state.isAdhocModal}
                handleClose={() => {
                    dispatchState({
                        type: 'UPDATE',
                        payload: false,
                        field: 'isAdhocModal',
                    });
                    setValue('listType', '');
                }}
                handleConfirm={() => {
                    dispatchState({
                        type: 'UPDATE',
                        payload: false,
                        field: 'isAdhocModal',
                    });
                    setValue('listType', 'Ad-hoc list');
                }}
            /> */}
            {isReset?.show && (
                <RSConfirmationModal
                    header={RESET}
                    show={isReset?.show}
                    isCloseButton={false}
                    text={ARE_YOU_SURE_WANT_TO_RESET}
                    handleConfirm={(status) => {
                        if (status) {
                            reset((formState) => ({
                                ...formState,
                                listType: '',
                                friendlyName: '',
                                ipAddress: '',
                                portNumber: '',
                                userName: '',
                                password: '',
                                folderPath: '',
                                updatedCycle: '',
                                catType: '',
                                categoryType: '',
                                categoryTypeText: '',
                            }));
                            setIsReset({
                                show: false,
                            });
                        }
                    }}
                    handleClose={() => {
                        setIsReset({
                            show: false,
                        });
                    }}
                />
            )}
            <ConfirmationPopup
                show={state.show}
                type={'brand'}
                handleClose={() => {
                    setValue('listType', '');
                    handleCloseModal();
                }}
                handleConfirm={() => handleCloseModal()}
            />
            {childAttrModal?.show && <ChildAttrModal
                show={childAttrModal?.show}
                onClose={() => setChildAttrModal({ show: false })}
            />}
        </>
    );
};

export default FTP;
