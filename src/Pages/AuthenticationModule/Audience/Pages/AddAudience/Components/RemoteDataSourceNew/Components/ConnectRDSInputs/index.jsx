import { charNumDotWithoutSpecialCharacters, onlyNumbers, onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { safeParseJSON } from 'Utils/modules/stringUtils';
import { maskStringRandomly, maskStringRandomlyNew } from 'Utils/modules/masking';
import { IPADDRESS_REGEX, PORT_LENGTH, PORTNUMBER_REGEX } from 'Constants/GlobalConstant/Regex';
import { CONTAINS_INVALID_FILES, FILENAME_EXIST, INSTANCE_NAME as INSTANCE_NAME_MSG, MAX_CSV_FILES } from 'Constants/GlobalConstant/ValidationMessage';
import { INSTANCE_NAME } from 'Constants/GlobalConstant/Placeholders';
import { close_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useFormContext } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import _find from 'lodash/find';
import RSTooltip from 'Components/RSTooltip';
import RSInput from 'Components/FormFields/RSInput';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { checkFriendlyNameExists } from 'Reducers/remoteDataSource/request';
import { LIST_NAME_RULES } from 'Pages/AuthenticationModule/Audience/audienceFormRules';
import ListNameExists from 'Components/ListNameExists';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';


import { get_BigqueryDetail } from 'Reducers/preferences/DataExchange/request';
import useQueryParams from 'Hooks/useQueryParams';
import { RenderConnecter } from './constants';
import RSDropdownFooterBtn from 'Components/DropdownFooterBtn';

var existingListName = '';

const ConnectRDSInputs = ({
    disable,
    setLoading,
    setFileName,
    fileName,
    loading,
    setVersiumCreds,
    versiumCreds,
    showTableFlag,
}) => {
    const {
        control,
        clearErrors,
        setError,
        watch,
        setValue,
        formState: { errors },
        reset,
        getValues,
    } = useFormContext();
    // console.log('watch: ', watch());
    const dispatch = useDispatch();
    const { state } = useLocation();
    const location = useQueryParams('/audience');
    //   console.log('location@: ', location);
    const isEdit = location?.mode === 'edit';
    const { csvFiles } = useSelector(({ addAudienceReducer }) => addAudienceReducer);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { versiumData } = useSelector(({ remoteDataSourceReducer }) => remoteDataSourceReducer);
    // console.log('versiumData: ', versiumData);
    const [encodedFile, setEncodedFile] = useState(null);
    const listnameError = Object.hasOwn(errors, 'instanceName');
    const friendlyNameError = Object.hasOwn(errors, 'friendlyName');
    const defineRow = state === 'CRM' ? 3 : 4;
    const hasUploadError = !!_find(csvFiles, ['isValid', false]) || false;
    const listType = watch('listType');
    const [isValidFriendlyname, setIsValidFriendlyname] = useState(true);
    const validateFileUpload = (fileData) => {
        let fileNameExists = csvFiles.some((list) => list.fileName === fileData.name);
        if (fileNameExists) {
            setError('csvFiles', { type: 'custom', message: FILENAME_EXIST });
        } else if (csvFiles?.length > 4) {
            setError('csvFiles', { type: 'custom', message: MAX_CSV_FILES });
        } else if (hasUploadError) {
            setError('csvFiles', { type: 'custom', message: CONTAINS_INVALID_FILES });
        }
    };

    // const audienceUploadValidation = (fileData) => {
    //     const fSize = _get(fileData, 'size') || 0;
    //     let reader = new FileReader();
    //     reader.readAsDataURL(fileData);
    //     reader.onload = async function () {
    //         let encodedData = reader.result.split(',')[1];
    //         const type = getCsvListType(listType);
    //         fileData = { name: _get(fileData, 'name'), size: fSize, encodedData, clientId, userId, type };
    //         setEncodedFile(fileData.encodedData);
    //         const file = {
    //             fileName: fileData.name,
    //             fileSize: fileData.size,

    //             encodedData: fileData.encodedData,
    //         };
    //         dispatch(updateCsvFiles({ file }));
    //         // setValue('csvFiles', null);
    //     };
    // };
    const audienceUploadValidation = (fileData) => {
        let reader = new FileReader();
        reader.readAsText(fileData);
        reader.onload = async function () {
            try {
                const jsonData = safeParseJSON(reader.result, null);
                if (!jsonData) return;
                const payload = { ...jsonData };
                const { status, data } = await dispatch(get_BigqueryDetail(payload));
                if (status) {
                    const { jsonFilePath } = data;
                    setValue('jsonFilePath', jsonFilePath);
                    setFileName(fileData?.name);
                } else {
                    setValue('jsonFilePath', '');
                    setFileName('');
                }
            } catch (error) {
            }
        };

        reader.onerror = function (error) {
        };
    };
    useEffect(() => {
        if (location?.data?.remoteDataSourceID === 55 && !isEdit) {
            reset((formState) => ({
                ...formState,
                userName: maskStringRandomly(location?.data?.emailId, 4),
            }));
        }
    }, [location]);
    useEffect(() => {
        if (location?.data?.remoteDataSourceID === 158 && !isEdit) {
            reset((formState) => ({
                ...formState,
                userName: maskStringRandomly(location?.data?.emailId, 4),
            }));
        }
    }, [location]);

    // useEffect(() => {

    //     if (Object.keys(versiumData)?.length > 0 && isEdit) {
    //         const creds = versiumData?.remotesetting?.[0];
    //         let tempresource = maskStringRandomlyNew(creds?.url);
    //         let tempuserName = maskStringRandomlyNew(creds?.userName);
    //         let tempuserpassword = maskStringRandomlyNew(creds?.password);
    //         //const credential = versiumCreds?.data?.find((item) => item?.FriendlyName === )
    //         reset((formState) => ({
    //             ...formState,
    //             resource: tempresource, //versiumData?.remotesetting[0]?.url,
    //             userName: tempuserName, //versiumData?.remotesetting[0]?.userName,
    //             password: tempuserpassword, //versiumData?.remotesetting[0]?.password,
    //         }));
    //     }
    // }, [versiumData]);

    useEffect(() => {
        if (isEdit) {
            let tempresource = maskStringRandomly('http://10.150.0.206/Connector', 16);
            // let tempDomain = maskStringRandomly(location?.data?.ipAddress, 4);
            // let tempInstanceName = maskStringRandomly(location?.data?.friendlyName, 14);
            // debugger
            if (location?.data?.remoteDataSourceID === 28) {
                reset((formState) => ({
                    ...formState,
                    tenantDomain: location?.data?.ipAddress,
                    clientDomain: location?.data?.username,
                    clientSecret: location?.data?.password,
                    resource: location?.data?.databaseName,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 55) {
                reset((formState) => ({
                    ...formState,
                    userName: maskStringRandomly(location?.data?.username, 4),
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 1) {
                reset((formState) => ({
                    ...formState,
                    ipAddress: location?.data?.ipAddress,
                    portNumber: location?.data?.port,
                    userName: location?.data?.username,
                    password: location?.data?.password,
                    databaseName: location?.data?.databaseName,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 2) {
                reset((formState) => ({
                    ...formState,
                    ipAddress: location?.data?.ipAddress,
                    portNumber: location?.data?.port,
                    userName: location?.data?.username,
                    password: location?.data?.password,
                    databaseName: location?.data?.databaseName,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 3) {
                reset((formState) => ({
                    ...formState,
                    ipAddress: location?.data?.ipAddress,
                    portNumber: location?.data?.port,
                    userName: location?.data?.username,
                    password: location?.data?.password,
                    databaseName: location?.data?.schemaName,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 23) {
                reset((formState) => ({
                    ...formState,
                    shopName: location?.data?.username,
                    storehash: location?.data?.ipAddress,
                    accesstoken: location?.data?.password,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 29) {
                reset((formState) => ({
                    ...formState,
                    shopName: location?.data?.username,
                    resource: location?.data?.password,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 45) {
                reset((formState) => ({
                    ...formState,
                    hubid: location?.data?.username,
                    accesstoken: location?.data?.password,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 22) {
                reset((formState) => ({
                    ...formState,
                    shopName: location?.data?.username,
                    resource: location?.data?.ipAddress,
                    accesstoken: location?.data?.password,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 54) {
                reset((formState) => ({
                    ...formState,
                    accesstoken: location?.data?.password,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 52) {
                reset((formState) => ({
                    ...formState,
                    ipAddress: location?.data?.ipAddress,
                    portNumber: location?.data?.port,
                    databaseName: location?.data?.databaseName,
                    schema: location?.data?.schemaName,
                    userName: location?.data?.username,
                    password: location?.data?.password,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 5) {
                reset((formState) => ({
                    ...formState,
                    securityToken: location?.data?.databaseName,
                    userName: location?.data?.username,
                    password: location?.data?.password,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 39) {
                reset((formState) => ({
                    ...formState,
                    accountName: location?.data?.ipAddress,
                    databaseName: location?.data?.databaseName,
                    schema: location?.data?.schemaName,
                    instanceName: location?.data?.friendlyName,
                    userName: location?.data?.username,
                    password: location?.data?.password,
                }));
            } else if (location?.data?.remoteDataSourceID === 50) {
                reset((formState) => ({
                    ...formState,
                    resource: location?.data?.password,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 51) {
                reset((formState) => ({
                    ...formState,
                    portNumber: location?.data?.port,
                    ipAddress: location?.data?.ipAddress,
                    databaseName: location?.data?.schemaName,
                    instanceName: location?.data?.friendlyName,
                    userName: location?.data?.username,
                    password: location?.data?.password,
                }));
            } else if (location?.data?.remoteDataSourceID === 48) {
                reset((formState) => ({
                    ...formState,
                    portNumber: location?.data?.port,
                    ipAddress: location?.data?.ipAddress,
                    databaseName: location?.data?.schemaName,
                    instanceName: location?.data?.friendlyName,
                    userName: location?.data?.username,
                    password: location?.data?.password,
                }));
            } else if (location?.data?.remoteDataSourceID === 41) {
                reset((formState) => ({
                    ...formState,
                    portNumber: location?.data?.port,
                    ipAddress: location?.data?.ipAddress,
                    databaseName: location?.data?.schemaName,
                    instanceName: location?.data?.friendlyName,
                    userName: location?.data?.username,
                    password: location?.data?.password,
                }));
            } else if (location?.data?.remoteDataSourceID === 49) {
                reset((formState) => ({
                    ...formState,
                    shopName: location?.data?.username,
                    accesstoken: location?.data?.password,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 54) {
                reset((formState) => ({
                    ...formState,
                    accesstoken: location?.data?.password,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 156) {
                reset((formState) => ({
                    ...formState,
                    apiHost: location?.data?.ipAddress,
                    accessKey: location?.data?.username,
                    secretKey: location?.data?.password,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 21) {
                reset((formState) => ({
                    ...formState,
                    resource: location?.data?.ipAddress,
                    accesstoken: location?.data?.databaseName,
                    userName: location?.data?.username,
                    password: location?.data?.password,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 47) {
                reset((formState) => ({
                    ...formState,
                    apiHost: location?.data?.ipAddress,
                    accessKey: location?.data?.username,
                    secretKey: location?.data?.password,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 46) {
                reset((formState) => ({
                    ...formState,
                    authId: location?.data?.ipAddress,
                    siteId: location?.data?.username,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 43) {
                reset((formState) => ({
                    ...formState,
                    projectInfo: location?.data?.password,
                    datasetInfo: location?.data?.schemaName,
                    projectName: location?.data?.username,
                    jsonFilePath: location?.data?.ipAddress,
                    instanceName: location?.data?.friendlyName,
                }));
                setFileName(location?.data?.ipAddress);
            } else if (location?.data?.remoteDataSourceID === 160) {
                reset((formState) => ({
                    ...formState,
                    resource: location?.data?.password,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 158) {
                reset((formState) => ({
                    ...formState,
                    userName: location?.data?.username,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 106) {
                reset((formState) => ({
                    ...formState,
                    instanceName: location?.data?.friendlyName,
                }));
            } else if (location?.data?.remoteDataSourceID === 166) {
                reset((formState) => ({
                    ...formState,
                    instanceName: location?.data?.friendlyName,
                    clientDomain: location?.data?.username,
                    clientSecret: location?.data?.password,
                    projectName: location?.data?.databaseName,
                    resource: location?.data?.ipAddress,
                }));
            } else if (location?.data?.remoteDataSourceID === 168) {
                reset((formState) => ({
                    ...formState,
                    instanceName: location?.data?.friendlyName,
                    jsonFilePath: location?.data?.ipAddress,
                    spreadsheetId: location?.data?.password,
                }));
                setFileName(location?.data?.ipAddress);
            }else if (location?.data?.remoteDataSourceID === 170) {
                reset((formState) => ({
                    ...formState,
                    instanceName: location?.data?.friendlyName,
                    accesstoken: location?.data?.password,
                }));
            }
            // else if(location?.data?.remoteDataSourceID === 59){
            //     reset((formState) => ({
            //         ...formState,
            //         instanceName: location?.data?.friendlyName,
            //         property:location.data.username,
            //         jsonFilePath: location?.data?.ipAddress,
            //     }));
            // }
        }
    }, [location]);

    return (
        <>
            <Row className="rs-space-y-1">
                {(location?.data.remoteDataSourceID !== 40 || versiumCreds?.isNewCred) && (
                    <>
                        <Col sm={defineRow} className="form-group">
                            <ListNameExists
                                name={`instanceName`}
                                control={control}
                                field="friendlyname"
                                apiCallback={checkFriendlyNameExists}
                                condition={(data) => {
                                    const { status } = data;
                                    setLoading(status);
                                    return !status;
                                }}
                                rules={LIST_NAME_RULES(INSTANCE_NAME_MSG)}
                                placeholder={INSTANCE_NAME}
                                extraPayload={{ remoteDataSourceID: location?.data.remoteDataSourceID }}
                                disabled={disable}
                                callback={() => {
                                    setLoading(true);
                                }}
                            />
                            {versiumCreds?.isNewCred && !loading && !showTableFlag && (
                                <RSTooltip position="top" text={'Cancel'} className="position-absolute top0 right5">
                                    <i
                                        className={`${close_medium}  color-primary-red`}
                                        onClick={() => {
                                            setVersiumCreds((prev) => ({ ...prev, isNewCred: false }));
                                            clearErrors();
                                            setValue('credentials', '');
                                        }}
                                    ></i>
                                </RSTooltip>
                            )}
                        </Col>
                    </>
                )}

                {location?.data.remoteDataSourceID === 40 && !versiumCreds?.isNewCred && (
                    <>
                        <Col sm={defineRow} className="form-group">
                            <RSKendoDropDownList
                                control={control}
                                name="credentials"
                                data={versiumCreds?.data}
                                label={'Credentials List'}
                                textField="FriendlyName"
                                dataItemKey="PartnerConfigId"
                                required
                                rules={{
                                    required: 'Select credential',
                                }}
                                handleChange={({ value }) => {
                                    let tempresource = maskStringRandomlyNew(value?.ConnectionUrl);
                                    let tempuserName = maskStringRandomlyNew(value?.UserName);
                                    let tempuserpassword = maskStringRandomlyNew(value?.Password);
                                    setValue('resource', tempresource);
                                    setValue('userName', tempuserName);
                                    setValue('password', tempuserpassword);
                                    clearErrors();
                                }}
                                disabled={disable}
                                footer={
                                    versiumCreds?.status ? (
                                        <RSDropdownFooterBtn
                                            title={'Add new credential'}
                                            handleClick={() => {
                                                setVersiumCreds((prev) => ({ ...prev, isNewCred: true }));
                                                let tempresource = maskStringRandomly(versiumConfigData[0]?.url, 16)
                                                setValue('resource', tempresource);
                                                setValue('userName', '');
                                                setValue('password', '');
                                                setValue('instanceName', '');
                                            }}
                                        />
                                    ) : (
                                        false
                                    )
                                }
                            />
                        </Col>
                    </>
                )}
                {location?.data.remoteDataSourceID &&
                    RenderConnecter({ remoteDataSourceID: location?.data.remoteDataSourceID })?.fields?.map(
                        (field, index) => (
                            <Col sm={defineRow} className="form-group" key={index}>
                                <RSInput
                                    label={field.placeHolder}
                                    name={field.name}
                                    control={control}
                                    disabled={
                                        disable ||
                                        (location?.data?.remoteDataSourceID === 40 && !versiumCreds?.isNewCred)
                                        || (location?.data?.remoteDataSourceID === 40 && versiumCreds?.isNewCred && field.name === 'resource')
                                    }
                                    required
                                    rules={{
                                        required: field.required,
                                        pattern:
                                            field.name === 'ipAddress'
                                                ? { value: IPADDRESS_REGEX, message: field.required }
                                                : field.name === 'portNumber'
                                                ? { value: PORTNUMBER_REGEX, message: field.required }
                                                : undefined,
                                    }}
                                    maxLength={field.name === 'portNumber' ? PORT_LENGTH : undefined}
                                    viewEye={
                                        location?.data?.remoteDataSourceID === 40 && !versiumCreds?.isNewCred
                                            ? false
                                            : field.viewEye
                                    }
                                    handleOnchange={
                                        field.name === 'ipAddress'
                                            ? (e) => onlyNumbersDecimalWithoutSpecialCharacters(e)
                                            : field.name === 'portNumber'
                                            ? (e) => onlyNumbers(e)
                                            : undefined
                                    }
                                    onKeyDown={
                                        field.name === 'ipAddress'
                                            ? charNumDotWithoutSpecialCharacters
                                            : field.name === 'portNumber'
                                            ? onlyNumbers
                                            : undefined
                                    }
                                    type={field.type}
                                    handleOnBlur={(e) => {
                                        setValue(field.name, e.target.value?.trim(), {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        });
                                    }}
                                    handleOnPaste={(e) => {
                                        e.preventDefault();
                                        const pastedData = e.clipboardData.getData('text');
                                        const cleaned = pastedData.trim();
                                        setValue(field.name, cleaned, {
                                            shouldValidate: true,
                                            shouldDirty: true,
                                        });
                                    }}
                                />
                            </Col>
                        ),
                    )}

                {(location?.data.remoteDataSourceID == 43 || location?.data.remoteDataSourceID == 168) && (
                    <Col sm={defineRow} className={`${disable ? 'click-off' : ''} form-group`}>
                        <RSFileUpload
                            control={control}
                            name="jsonFilePath"
                            accept={'.json'}
                            clearErrors={clearErrors}
                            setError={setError}
                            required
                            disabled={disable}
                            handleChange={(e) => {
                                audienceUploadValidation(e.target.files[0]);
                            }}
                            onClick={(event) => {
                                event.target.value = null;
                            }}
                            watch={watch}
                            size={10485760}
                            placeholder={fileName}
                        />
                        <small className="text-muted d-block mt5">Only .json file</small>
                    </Col>
                )}
            </Row>
        </>
    );
};

export default ConnectRDSInputs;
