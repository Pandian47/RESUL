import { SELECT_SENDER_ID, SELECT_VALUE } from 'Constants/GlobalConstant/ValidationMessage';
import { ARE_YOU_SURE_DELETE, CANCEL, DELETE_USER_ROLE, SENDER_ID, UPDATE } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useRef, useState } from 'react';
import { useForm, FormProvider, useFieldArray } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { findIndex as _findIndex } from 'Utils/modules/lodashReplacements';

import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSConfirmationModal from 'Components/ConfirmationModal';
import usePermission from 'Hooks/usePersmission';
import {
    getClientSMSOptById,
    getInboundNoList,
    getInboundKeys,
    upserClientSMSOptSetting,
} from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { STATIC_INBOUND_NO_LIST } from './../constant';
import { selectIcon } from 'Utils/modules/display';
import RSTooltip from 'Components/RSTooltip';

const MAX_INBOUND_DETAILS = 50;

const FORM_INITIAL_STATE = {
    defaultValues: {
        senderID: '',
        inboundDetails: [
            {
                inboundList: '',
                inboundKey: '',
                responseMessage: '',
            },
        ],
    },
    mode: 'onTouched',
};

const OptInOptOutCreate = ({ config, handleCancel, setFailedApi }) => {
        const dispatch = useDispatch();
    const methods = useForm(FORM_INITIAL_STATE);
    const { permissions } = usePermission();
    const { updateAccess } = permissions || {};
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const [inboundListData, setInboundListData] = useState([]);
    const [inboundKeysData, setInboundKeysData] = useState([]);
    const [senderIdOptions, setSenderIdOptions] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [indexToRemove, setIndexToRemove] = useState(null);
    const [isDataLoading, setIsDataLoading] = useState(false);

    // Ref to track if inbound data API has been called (to prevent repeated calls on failure)
    const inboundDataFetchedRef = useRef(false);

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        watch,
        setError,
        clearErrors,
        getValues,
        trigger,
        setFocus,
        formState: { isValid, errors },
    } = methods;

    const { fields, append, remove, replace } = useFieldArray({
        control,
        name: 'inboundDetails',
    });

    const selectedSenderID = watch('senderID');
    const inboundDetailsWatch = watch('inboundDetails');
    const isEdit = !!config?.clientSmsSenderID;

    useEffect(() => {
        if (isEdit && config?.clientSmsSenderID) {
            setIsDataLoading(true);
            fetchEditData();
        }
    }, []);

    const fetchEditData = async () => {
        const payload = {
            ClientSMSSenderID: config.clientSmsSenderID,
            clientId,
            departmentId,
            userId,
        };
        const response = await dispatch(getClientSMSOptById(payload));
        
        if (response?.status && Array.isArray(response?.data)) {
            // Set sender ID options with the current sender ID from config
            setSenderIdOptions([{ senderID: config.senderID, value: config.senderID }]);
            setValue('senderID', config.senderID);

            // Fetch inbound data first and get the data directly
            const { inboundListData: fetchedInboundListData, inboundKeysData: fetchedInboundKeysData } = await fetchInboundData();

            // Map the inbound details from API response
            // response?.data is directly the array of inbound details
            const inboundDetailsArray = response?.data;
            
            // Prepare the array structure for replace
            const inboundDetailsToSet = inboundDetailsArray.length > 0
                ? inboundDetailsArray.map(item => ({
                    sbisId: item.sbisId,
                    inboundList: '',
                    inboundKey: '',
                    responseMessage: '',
                }))
                : [{
                    inboundList: '',
                    inboundKey: '',
                    responseMessage: '',
                }];

            // Replace the field array with the structure
            replace(inboundDetailsToSet);

            // Now set values for each field using setValue
            inboundDetailsArray.forEach((item, index) => {
                setValue(`inboundDetails.${index}.sbisId`, item.sbisId);

                // Find matching inbound list object from dropdown data
                const matchingInboundList = fetchedInboundListData?.find(
                    listItem => listItem.inboundNo === item.inBoundNo
                );
                if (matchingInboundList) {
                    setValue(`inboundDetails.${index}.inboundList`, matchingInboundList);
                }

                // Find matching inbound key object from dropdown data
                const matchingInboundKey = fetchedInboundKeysData?.find(
                    keyItem => keyItem.inboundkeyID === item.inBoundkeyId
                );
                if (matchingInboundKey) {
                    setValue(`inboundDetails.${index}.inboundKey`, matchingInboundKey);
                }

                setValue(`inboundDetails.${index}.responseMessage`, item.message || '');
            });

            // Use setTimeout to ensure all setValue operations are complete before showing the form
            setTimeout(() => {
                setIsDataLoading(false);
            }, 0);
        } else {
            setFailedApi('GetClientSMSOptById');
            setIsDataLoading(false);
        }
    };

    const fetchInboundData = async () => {
        // Prevent repeated API calls if already fetched (success or failure)
        if (!config?.clientSmsSenderID || inboundDataFetchedRef.current) {
            // Return current state data if already fetched
            return {
                inboundListData: inboundListData,
                inboundKeysData: inboundKeysData,
            };
        }

        // Mark as fetched to prevent repeated calls
        inboundDataFetchedRef.current = true;

        const payload = {
            ClientSMSSenderID: config.clientSmsSenderID,
            clientId,
            departmentId,
            userId,
        };

        const [inboundListResponse, inboundKeysResponse] = await Promise.all([
            dispatch(getInboundNoList(payload)),
            dispatch(getInboundKeys(payload)),
        ]);

        let inboundListDataResult = [];
        let inboundKeysDataResult = [];

        // Use API response if successful, otherwise use static fallback data
        if (inboundListResponse?.status && Array.isArray(inboundListResponse?.data)) {
            inboundListDataResult = inboundListResponse.data;
            setInboundListData(inboundListResponse.data);
        } else {
            // Use static fallback data when API fails
            if (STATIC_INBOUND_NO_LIST?.status && Array.isArray(STATIC_INBOUND_NO_LIST?.data)) {
                inboundListDataResult = STATIC_INBOUND_NO_LIST.data;
                setInboundListData(STATIC_INBOUND_NO_LIST.data);
            }
        }

        if (inboundKeysResponse?.status && Array.isArray(inboundKeysResponse?.data)) {
            inboundKeysDataResult = inboundKeysResponse.data;
            setInboundKeysData(inboundKeysResponse.data);
        } else {
        }

        return {
            inboundListData: inboundListDataResult,
            inboundKeysData: inboundKeysDataResult,
        };
    };

    const handleFormSubmit = async (formState) => {
        
        // Prepare payload for API
        const payload = {
            clientId,
            userId,
            ClientSMSSenderID: config.clientSmsSenderID,
            inboundDetails: formState.inboundDetails.map(item => ({
                sbisId: item.sbisId || 0, // 0 for new entries, existing ID for updates
                // Extract the primitive value from the inboundList object
                inBoundNo: item.inboundList?.inboundNo || item.inboundList,
                // Extract the primitive value from the inboundKey object
                inBoundkeyId: item.inboundKey?.inboundkeyID || item.inboundKey,
                message: item.responseMessage,
            })),
        };

        
        const response = await dispatch(upserClientSMSOptSetting(payload));

        if (response?.status) {
                        handleCancel(true);
        } else {
        }
    };

   const handleAddInboundDetail = () => {
    const fieldName = 'inboundDetails';
    const values = getValues(fieldName) || [];
    const findInvalidIndex = _findIndex(
        values,
        ({ inboundList, inboundKey }) => !inboundList || !inboundKey
    );

    if (findInvalidIndex !== -1) {
        setFocus(`${fieldName}.[${findInvalidIndex}].inboundList`)
        trigger(`${fieldName}.[${findInvalidIndex}]`);
        return;
    }

    if (fields.length >= MAX_INBOUND_DETAILS) {
        return;
    }
    append({
        inboundList: '',
        inboundKey: '',
        responseMessage: '',
    });
};


    const handleRemoveInboundDetail = (index) => {
        if (fields.length <= 1) return;

        // Get the current values for the field at this index
        const currentField = inboundDetailsWatch?.[index];

        // Check if any field has data
        const hasData =
            currentField?.inboundList ||
            currentField?.inboundKey ||
            (currentField?.responseMessage && currentField.responseMessage.trim() !== '');

        if (hasData) {
            // Show confirmation modal if fields have data
            setIndexToRemove(index);
            setShowConfirmModal(true);
        } else {
            // Remove directly if fields are empty
            remove(index);
        }
    };

    const handleConfirmRemove = () => {
        if (indexToRemove !== null && fields.length > 1) {
            remove(indexToRemove);
        }
        setShowConfirmModal(false);
        setIndexToRemove(null);
    };

    const handleCloseConfirmModal = () => {
        setShowConfirmModal(false);
        setIndexToRemove(null);
    };

    // Set sender ID from config when component mounts
    useEffect(() => {
        if (config?.senderID) {
            setSenderIdOptions([{ senderID: config.senderID, value: config.senderID }]);
        }
    }, [config?.senderID]);

    useEffect(() => {
        setValue('senderID', senderIdOptions[0]);
    }, [senderIdOptions]);

    // Custom validation for duplicate inboundList + inboundKey
    const isDuplicateInbound = (currentIndex, inboundListValue, inboundKeyValue) => {
        return inboundDetailsWatch.some((item, idx) => {
            if (idx === currentIndex) return false;
            const listVal = item?.inboundList?.inboundNo || item?.inboundList;
            const keyVal = item?.inboundKey?.inboundkeyID || item?.inboundKey;
            return (
                listVal && keyVal &&
                listVal === (inboundListValue?.inboundNo || inboundListValue) &&
                keyVal === (inboundKeyValue?.inboundkeyID || inboundKeyValue)
            );
        });
    };

    // Function to validate and set errors for duplicate inbound combinations
    const validateDuplicateInbound = () => {
        inboundDetailsWatch.forEach((item, idx) => {
            const inboundListVal = item?.inboundList;
            const inboundKeyVal = item?.inboundKey;
            if (
                inboundListVal && inboundKeyVal &&
                isDuplicateInbound(idx, inboundListVal, inboundKeyVal)
            ) {
                setError(`inboundDetails.${idx}.inboundList`, {
                    type: 'custom',
                    message: 'Same Inbound should not be duplicated',
                });
            } else {
                clearErrors(`inboundDetails.${idx}.inboundList`);
            }
        });
    };
    
    useEffect(() => {
        validateDuplicateInbound();
    }, [inboundDetailsWatch]);

    return (
        <FormProvider {...methods}>
            <form onSubmit={handleSubmit(handleFormSubmit)}>
                <div className="rs-sub-heading">
                    <div className="rss-left">
                        <h4>Opt in / Opt out settings</h4>
                    </div>
                </div>

                <div className="form-group">
                    <Row className="mt20">
                        <Col sm={{ offset: 0, span: 2 }}>
                            <label className="control-label-left">Sender ID</label>
                        </Col>
                        <Col sm={3} id="rs_OptInOptOut_senderID">
                            <RSKendoDropDownList
                                name={'senderID'}
                                data={senderIdOptions}
                                control={control}
                                textField={'senderID'}
                                dataItemKey={'value'}
                                label={SENDER_ID}
                                required
                                disabled={true}
                                rules={{
                                    required: SELECT_SENDER_ID,
                                }}
                            />
                        </Col>
                    </Row>
                </div>
                {(fields?.length && !isDataLoading) && (
                    <div className="rs-sub-heading">
                        <div className="align-items-center d-flex justify-content-between">
                            <h4 className='mb0'>Inbound number</h4>
                        </div>
                    </div>
                )}
                {!isDataLoading && fields.map((field, index) => (
                    <div key={field.id}>
                        <div className={`form-group mb21 p24 rs-opt-inbound-number ${index % 2 === 0 ? 'even' : 'odd'}`}
                        >
                            <Row>
                                <Col sm={3} id={`rs_OptInOptOut_inboundList_${index}`}>
                                    <RSKendoDropDownList
                                        name={`inboundDetails.${index}.inboundList`}
                                        data={inboundListData}
                                        control={control}
                                        textField={'inboundNo'}
                                        dataItemKey={'inboundNo'}
                                        label="Inbound list"
                                        required
                                        rules={{
                                            required: SELECT_VALUE,
                                            validate: (value) =>
                                                !isDuplicateInbound(index, value, inboundDetailsWatch?.[index]?.inboundKey)
                                                    || 'Same Inbound should not be duplicated',
                                        }}
                                    />
                                </Col>
                                <Col sm={2} id={`rs_OptInOptOut_inboundKey_${index}`}>
                                    <RSKendoDropDownList
                                        name={`inboundDetails.${index}.inboundKey`}
                                        data={inboundKeysData}
                                        control={control}
                                        textField={'keyName'}
                                        dataItemKey={'inboundkeyID'}
                                        label="Inbound key"
                                        required
                                        rules={{
                                            required: SELECT_VALUE,
                                        }}
                                        handleChange={validateDuplicateInbound}
                                    />
                                </Col>
                                <Col sm={7} id={`rs_OptInOptOut_responseMessage_${index}`} >
                                    <Row>
                                        <Col sm={11}>
                                            <RSTextarea
                                                name={`inboundDetails.${index}.responseMessage`}
                                                control={control}
                                                placeholder="Response message"
                                                rows={4}
                                                required
                                                maxLength={160}
                                                rules={{
                                                    required: 'Response message is required',
                                                    maxLength: {
                                                        value: 160,
                                                        message: 'Maximum 160 characters allowed',
                                                    },
                                                }}
                                            />
                                            <small className="text-end">{inboundDetailsWatch?.[index]?.responseMessage?.length || 0}/160</small>
                                        </Col>
                                        <Col sm={1} className="text-right ">
                                            {index === 0 && fields.length < MAX_INBOUND_DETAILS && (
                                                <RSTooltip text="Add" position="top" className = 'ml-5'>
                                                    <i
                                                        className={`${selectIcon(index)} icon-md cp `}
                                                        onClick={handleAddInboundDetail}
                                                    />
                                                </RSTooltip>
                                            )}
                                            {index !== 0 && (
                                                <RSTooltip text="Delete" position="top" className = 'ml-5'>
                                                    <i
                                                        className={`${selectIcon(index)} icon-md cp `}
                                                        onClick={() => handleRemoveInboundDetail(index)}
                                                    />
                                                </RSTooltip>
                                            )}
                                        </Col>
                                    </Row>
                                </Col>

                            </Row>

                        </div>

                        {/* <div className="form-group">
                            <Row>
                              
                            </Row>
                        </div> */}
                    </div>
                ))}
                <div className="buttons-holder pref-cs-buttons-outside">
                    <RSSecondaryButton type="button" onClick={() => handleCancel(true)} id="rs_OptInOptOut_Cancel">
                        {CANCEL}
                    </RSSecondaryButton>
                    {updateAccess && (
                        <RSPrimaryButton
                            type="submit"
                            className={`${!isValid ? 'click-off' : ''}`}
                            id="rs_OptInOptOut_Update"
                        >
                            {UPDATE}
                        </RSPrimaryButton>
                    )}
                </div>
            </form>

            <RSConfirmationModal
                show={showConfirmModal}
                text={ARE_YOU_SURE_DELETE}
                handleConfirm={handleConfirmRemove}
                handleClose={handleCloseConfirmModal}
                header={DELETE_USER_ROLE}
            />
        </FormProvider>
    );
};

export default OptInOptOutCreate;

