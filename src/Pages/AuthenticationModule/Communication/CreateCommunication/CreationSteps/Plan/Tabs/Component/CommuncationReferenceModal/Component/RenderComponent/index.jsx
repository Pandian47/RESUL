import { circle_question_mark_medium, refresh_medium } from 'Constants/GlobalConstant/Glyphicons';
import { LIST_NAME_CREATION, NUMBER_REGEX } from 'Constants/GlobalConstant/Regex';
import { ALLOWED_FORMATS } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import _get from 'lodash/get';
import { Col, Row } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSFileUpload from 'Components/FormFields/RSFileUpload';
import RSTextarea from 'Components/FormFields/RSTextarea';

import { formatColumnName } from '../../../../../constants';
import { useDispatch } from 'react-redux';
import { upload_CommunicationDocket } from 'Reducers/communication/createCommunication/plan/request';
const RenderComponent = (props) => {
    const dispatch = useDispatch();
    const {
        control,
        watch,
        setError,
        clearErrors,
        setValue,
        reset,
        formState: { errors },
    } = useFormContext();
    const {friendlyName, columnValue, columnValueConfig, value = '', docketFilename, reducerState, editMode, ...restValue } = props;
    const watchCommDocket = watch('Communication Docket');

    // useEffect(() => {
    //     restValue?.fileName && setUpdateDocketFileName(restValue?.fileName);
    // }, [restValue]);

    const [updateDocketFilename, setUpdateDocketFileName] = useState(docketFilename);
    const [isDocketUploading, setIsDocketUploading] = useState(false);

    useEffect(() => {
        if (Object.keys(errors)?.includes('Communication Docket')) {
            setUpdateDocketFileName('');
        }
    }, [errors]);

    const {...rest } = columnValueConfig ?? {};
    const rules = columnValueConfig?.rules ?? {};
    const type = columnValueConfig?.type ?? 0;
    const validationPattern = _get(rules, 'pattern', '') || _get(rest, 'pattern', '');
    const formatted = formatColumnName(friendlyName);
    const lowercaseFirstLetter = formatted?.charAt(0)?.toLowerCase() + formatted?.slice(1);
    const handleRequire = (shouldValidate) => {
        if (shouldValidate && _get(rules, 'required', false)) {
            return 'Upload your' + ' ' + lowercaseFirstLetter;
        }
        return '';
    };

    // useEffect(() => {
    //     reducerState?.edit?.communicationReference?.forEach((ref) => {
    //         const { value, columnValue } = ref;
    //         setValue(columnValue, value);
    //         setValue(columnValue.replace(' ', ''), value);
    //     });
    // }, [reducerState]);

    useEffect(() => {
        if (columnValue?.toLowerCase()?.includes('docket')) {
            setValue(columnValue, value);
        }
    }, [columnValue]);

    switch (type) {
        case 1: {
            const min = _get(rules, 'min', 0);
            const max = _get(rules, 'max', 0);
            const req = _get(rules, 'required', false);
            const formatted = formatColumnName(friendlyName);
            const lowercaseFirstLetter = formatted?.charAt(0)?.toLowerCase() + formatted?.slice(1);
            
            return (
                <div className={` ${editMode ? 'click-off' : ''}`}>
                    <RSInput
                        control={control}
                        placeholder={formatColumnName(columnValue)}
                        name={columnValue}
                        required={req}
                        // type={validationPattern === 'numeric' ? 'number' : 'text'}
                        defaultValue={value}
                        maxLength={max}
                        rules={{
                            ...(_get(rules, 'required') && { required: 'Enter your ' + friendlyName}),
                            ...(min > 0 && {
                                minLength: {
                                    value: min,
                                    message: 'Enter ' + friendlyName + ' min. ' + min + ' characters',
                                },
                            }),
                            ...(max > 0 && {
                                maxLength: {
                                    value: max,
                                    message:
                                        'Enter ' + friendlyName + ' less than ' + max + validationPattern === 'alphanumeric'
                                            ? ' characters'
                                            : '',
                                },
                            }),
                            ...(validationPattern && {
                                pattern: {
                                    value: validationPattern === 'alphanumeric' ? LIST_NAME_CREATION : NUMBER_REGEX,
                                    message: 'Enter valid ' + friendlyName,
                                },
                            }),
                        }}
                    />
                </div>
            );
        }
        case 2:
            return (
                <Col sm={6}>
                    {/* <label htmlFor={config.name}>{label}</label> */}
                    <div className={`${editMode ? 'click-off' : ''}`}>
                        {/* <div className={className && className}> </div> */}
                        <RSTextarea
                            control={control}
                            required
                            placeholder={columnValue}
                            name={columnValue}
                            rules={{
                                ...(_get(rules, 'required') && { required: 'Enter your ' + columnValue }),
                            }}
                        />
                    </div>
                </Col>
            );
        case 3:
            return (
                <Col sm={6}>
                    {/* <label htmlFor={config.name}>{label}</label> */}
                    <div className={`${editMode ? 'click-off' : ''}`}>
                        {/* <div className={className && className}> </div> */}
                        <RSKendoDropdown
                            control={control}
                            label={columnValue}
                            defaultValue={value}
                            data={_get(rest, 'data', [])}
                            name={columnValue}
                            rules={{
                                ...(_get(rules, 'required') && { required: 'Enter your ' + columnValue }),
                            }}
                        />
                    </div>
                </Col>
            );
        case 4:
            return (
                <Col sm={6}>
                    {/* <label htmlFor={config.name}>{label}</label> */}
                    <div className={`${editMode ? 'click-off' : ''}`}>
                        {/* <div className={className && className}> </div> */}
                        <RSCheckbox
                            control={control}
                            // data={_get(rest, 'data', [])}
                            label={columnValue}
                            name={columnValue}
                            rules={{
                                ...(_get(rules, 'required') && { required: 'Enter your ' + columnValue }),
                            }}
                        />
                    </div>
                </Col>
            );
        case 5:
            return (
                <Col sm={6}>
                    {/* <label htmlFor={config.name}>{label}</label> */}
                    <div className={`${editMode ? 'click-off' : ''}`}>
                        {/* <div className={className && className}> </div> */}
                        <RSRadioButton
                            control={control}
                            // data={_get(rest, 'data', [])}
                            labelName={columnValue}
                            name={columnValue}
                            // rules={{
                            //     ...(_get(rules, 'required') && { required: 'Enter your ' + columnValue }),
                            // }}
                        />
                    </div>
                </Col>
            );
        case 6:
            return (
                <Row>
                    <Col md={12}>
                        {/* <label htmlFor={config.name}>{label}</label> */}
                        <div className={`${editMode ? 'click-off' : ''} pr2`}>
                            {/* <div className={className && className}> </div> */}
                            <RSFileUpload
                                control={control}
                                name={columnValue}
                                text="Upload"
                                disabled={isDocketUploading}
                                accept={validationPattern}
                                placeholder={updateDocketFilename || 'Choose file'}
                                clearErrors={clearErrors}
                                setError={setError}
                                containerClass="communication-reference-uploadbtn"
                                isRefresh
                                fileCol={8}
                                resetValue={() => {
                                    setValue('Communication Docket', '');
                                    setValue('docketFileName', '');
                                    setUpdateDocketFileName('');
                                }}
                                rules={{
                                    required:
                                        updateDocketFilename || docketFilename
                                            ? handleRequire(false)
                                            : handleRequire(true),
                                }}
                                required={_get(rules, 'required')}
                                handleChange={async (e) => {
                                    const file = e.target.files[0];
                                    const formData = new FormData();
                                    formData.append('file', file, file.name);
                                    setIsDocketUploading(true);
                                    try {
                                        const response = await dispatch(
                                            upload_CommunicationDocket({
                                                payload: formData,
                                                loading: false,
                                            }),
                                        );
                                    if (response?.status) {
                                        setValue(columnValue, response?.data);
                                        setValue(`docketFileName`, file.name);
                                    } else {
                                        setError(columnValue, {
                                            type: 'server',
                                            message: response?.message || 'Exception occurs',
                                        });
                                    }
                                    } finally {
                                        setIsDocketUploading(false);
                                    }
                                    
                                    // let reader = new FileReader();
                                    // reader.readAsDataURL(file);
                                    // reader.onload = async () => {
                                    //     if (reader.result) {
                                    //         const base64String = reader.result.replace(
                                    //             /^data:text\/[a-z]+;base64,/,
                                    //             '',
                                    //         );
                                    //         setValue(columnValue, base64String);
                                    //         setValue(`docketFileName`, file.name);
                                    //     } else {
                                    //         console.error('Problem with converting file to base64');
                                    //     }
                                    // };
                                    // reader.onerror = (error) => {
                                    //     console.error(error);
                                    // };
                                    // validateFileUpload(e.target.files[0]);
                                }}
                                isbase64
                                onClick={(event) => {
                                    event.target.value = null;
                                }}
                                watch={watch}
                                // size={10485760}
                            />
                        </div>
                    </Col>
                    {/* <Col sm={1} className="pl0 pr10 text-center">
                        {' '}
                        <div className={` ${editMode ? 'click-off' : ''}`}>
                            <RSTooltip
                                position="top"
                                text={`Allowed formats: ${validationPattern?.split(' ').join(',').toLowerCase()}`}
                                className="lh0 mt5"
                            >
                                <i className={`${circle_question_mark_medium}   icon-md color-primary-blue `}></i>
                            </RSTooltip>
                        </div>
                    </Col> */}
                    {/* {watchCommDocket?.length > 0 && (
                        <Col sm={1} className="mt5 d-flex flex-right">
                            <RSTooltip text={'Reset'} className="lh0" position="top">
                                <i
                                    id="rs_data_refresh"
                                    className={`${refresh_medium} icon-md color-primary-blue`}
                                    onClick={() => {
                                        clearErrors();
                                        setValue('Communication Docket', '');
                                        setValue('docketFileName', '');
                                        setUpdateDocketFileName('');
                                    }}
                                />
                            </RSTooltip>
                        </Col>
                    )} */}
                    <small className="small-text-space-top">
                        {ALLOWED_FORMATS}{' '}
                        {validationPattern ? validationPattern.split(' ').join(', ').toLowerCase() : ''}
                    </small>
                </Row>
            );
        // case 3:
        //     return (
        //         <Col sm={6}>
        //             <label htmlFor={config.name}>{label}</label>
        //             <RSMultiSelect control={control} />
        //         </Col>
        //     );
        // default:
        //     return (
        //         <Col sm={6}>
        //             <label htmlFor={config.name}>{label}</label>
        //             <RSInput {...config} control={control} />
        //         </Col>
        //     );
    }
};

export default RenderComponent;
