import { asterisk_mini, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useForm, FormProvider } from 'react-hook-form';
import parse from 'html-react-parser';

import { BODYCONFIG, SALUTATION } from '../../constant';
import { Col, Row } from 'react-bootstrap';
import RSPhoneInput from 'Components/FormFields/RSPhoneInput';
import RSInput from 'Components/FormFields/RSInput';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';

const TellAFriendPreview = ({ 
    show, 
    fromListing, 
    formData,
    themeColors,
    fontValue,
    fontSize,
    fontColor,
    formLayout,
    formStylesButtonRounding,
    formStylesButtonAlignment,
    formStylesLogoEnabled,
    formStylesLogoStyle,
    headerConfigLogo,
    headerConfigName,
    headerConfigBackgroundColor,
    headerConfigColor,
    headerConfigBackgroundImage,
    headerConfigAlignment,
    headerLayoutPosition,
    headerConfigLogoAlignment,
    headerConfigNameAlignment,
    formStylesFormBackgroundImage,
    formStylesFormBackgroundColor,
    formStylesFormBackgroundEnabled,
    formStylesInputStyle,
    formStylesTextFieldSize,
    getInputStyle,
    getTextFieldSize,
    selectedColor,
    formStylesPaginationEnabled,
    formStylesPagination,
    formStylesItemsPerPage,
    formStylesLayoutAlignment,
}) => {
        const [tellAFriendSettings, settellAFriendSettings] = useState({
        optionData: SALUTATION,
    });
    const methods = useForm();
    const {
        control,
        watch,
        reset,
        setValue,
        setError,
        clearErrors,
        formState: { isValid },
    } = methods;
    const [
        salutation,
        fullName,
        headingName,
        email,
        mobile,
       // selectedColor,
        emailMandatory,
        mobileMandatory,
        FullNameMandatory,
        LastNameMandatory,
        FirstNameMandatory,
        participantName,
        formName,
        background,
        Submit,
        Cancel,
    ] = watch([
        'Salutation',
        'Fullname',
        'headingName',
        'Email',
        'Mobile',
        //'colorPicker',
        'emailMandatory',
        'mobileMandatory',
        'FullNameMandatory',
        'LastNameMandatory',
        'FirstNameMandatory',
        'participantName',
        'formName',
        'background',
        'Submit',
        'CancelView',
    ]);
    
        const [submitCheck, setSubmitCheck] = useState(false);
    
        useEffect(() => {
            if (!Submit?.includes('background-color')) {
                setSubmitCheck(true);
            } else {
                setSubmitCheck(false);
            }
        }, [Submit]);

    // Use provided themeColors or fallback
    const finalThemeColors = themeColors || {
        background: '#ffffff',
        text: '#333333',
        accent: '#007bff',
        border: '#e0e0e0',
        formBackground: '#ffffff',
        textField01: '#333333',
        textField02: '#e0e0e0',
    };

    // Extract form background image URL - handle both string and object formats
    const formBackgroundImageUrl = useMemo(() => {
        if (!formStylesFormBackgroundImage) return '';
        if (typeof formStylesFormBackgroundImage === 'string') return formStylesFormBackgroundImage;
        // If it's an object, try to extract the URL from common properties
        if (typeof formStylesFormBackgroundImage === 'object') {
            return formStylesFormBackgroundImage.url || formStylesFormBackgroundImage.imageUrl || formStylesFormBackgroundImage.inputUrl || formStylesFormBackgroundImage.data || '';
        }
        return '';
    }, [formStylesFormBackgroundImage]);

    // Extract logo URL - handle both string and object formats
    const logoUrl = useMemo(() => {
        if (!headerConfigLogo) return '';
        if (typeof headerConfigLogo === 'string') return headerConfigLogo;
        if (typeof headerConfigLogo === 'object') {
            return headerConfigLogo.url || headerConfigLogo.imageUrl || headerConfigLogo.inputUrl || headerConfigLogo.data || '';
        }
        return '';
    }, [headerConfigLogo]);

    // Extract background image URL - handle both string and object formats
    const backgroundImageUrl = useMemo(() => {
        if (!headerConfigBackgroundImage) return '';
        if (typeof headerConfigBackgroundImage === 'string') return headerConfigBackgroundImage;
        if (typeof headerConfigBackgroundImage === 'object') {
            return headerConfigBackgroundImage.url || headerConfigBackgroundImage.imageUrl || headerConfigBackgroundImage.inputUrl || headerConfigBackgroundImage.data || '';
        }
        return '';
    }, [headerConfigBackgroundImage]);

    // Get logo alignment styles - memoized
    const logoAlignmentStyle = useMemo(() => {
        const align = headerConfigLogoAlignment || 'center';
        switch (align) {
            case 'left':
                return { justifyContent: 'flex-start', alignItems: 'center' };
            case 'right':
                return { justifyContent: 'flex-end', alignItems: 'center' };
            case 'center':
                return { justifyContent: 'center', alignItems: 'center' };
            case 'top':
                return { justifyContent: 'center', alignItems: 'flex-start' };
            case 'bottom':
                return { justifyContent: 'center', alignItems: 'flex-end' };
            default:
                return { justifyContent: 'center', alignItems: 'center' };
        }
    }, [headerConfigLogoAlignment]);

    // Get name alignment styles - memoized
    const getNameAlignmentStyle = useCallback((layoutDirection = 'row') => {
        const align = headerConfigNameAlignment || 'center';
        switch (align) {
            case 'left':
                return { 
                    textAlign: 'left', 
                    alignSelf: 'center'
                };
            case 'right':
                return { 
                    textAlign: 'right', 
                    alignSelf: 'center'
                };
            case 'center':
                return { 
                    textAlign: 'center', 
                    alignSelf: 'center'
                };
            case 'top':
                return { 
                    textAlign: 'center', 
                    alignSelf: 'flex-start'
                };
            case 'bottom':
                return { 
                    textAlign: 'center', 
                    alignSelf: 'flex-end'
                };
            default:
                return { 
                    textAlign: 'center', 
                    alignSelf: 'center'
                };
        }
    }, [headerConfigNameAlignment]);

    // Get header layout position - memoized
    const headerLayoutPos = headerLayoutPosition || 'top';
    const logoEnabled = formStylesLogoEnabled !== undefined ? formStylesLogoEnabled : false;
    const logoStyle = formStylesLogoStyle || 'style3';
    
    // Helper to get button rounding value - memoized
    const buttonRoundingValue = useMemo(() => {
        const roundingVal = typeof formStylesButtonRounding === 'object' && formStylesButtonRounding !== null
            ? formStylesButtonRounding?.value
            : formStylesButtonRounding || 'default';
        return roundingVal;
    }, [formStylesButtonRounding]);

    // Helper to get button alignment value - memoized
    const buttonAlignmentValue = useMemo(() => {
        const alignVal = typeof formStylesButtonAlignment === 'object' && formStylesButtonAlignment !== null
            ? formStylesButtonAlignment?.value
            : formStylesButtonAlignment || 'center';
        return alignVal;
    }, [formStylesButtonAlignment]);
    
    const safeParse = (value, fallback = "") => {
        try {
            if (typeof value === "string") {
            return JSON.parse(value);
            }
            return value ?? fallback; 
        } catch {
            return fallback;
        }
        };
    useEffect(() => {
        if (formData) {
            if (fromListing && formData) {
                let htmlCodeClient = safeParse(formData?.htmlCodeClient, {});
                let htmlbgcolor = safeParse(formData?.bgColor, '');
                const {
                    EmailEnable,
                    Emailnamevalidation,
                    Firstnamevalidation,
                    FullNameEnable,
                    Fullnamevalidation,
                    Lastnamevalidation,
                    MobileNoEnable,
                    Mobilenamevalidation,
                    SalutationEnable,
                    content1,
                    content2,
                    CountParticipant,
                    email,
                    mobile,
                    FirstName,
                    LastName,
                    selectField,
                    participant,
                } = htmlCodeClient;
                let temp = {
                    layoutType: '',
                    radioButtonLable: false,
                    settingsInputField: '8',
                    Salutation: SalutationEnable === '1',
                    Email: EmailEnable === '1',
                    Mobile: MobileNoEnable === '1',
                    email,
                    mobile,
                    FirstName,
                    LastName,
                    selectField,
                    emailMandatory: Emailnamevalidation === '1',
                    mobileMandatory: Mobilenamevalidation === '1',
                    FullNameMandatory: Fullnamevalidation === '1',
                    Fullname: FullNameEnable === '1',
                    FirstNameMandatory: Firstnamevalidation === '1',
                    LastNameMandatory: Lastnamevalidation === '1',
                    headingName: content1 ? JSON.parse(content1) : '',
                    participantName: content2 ? JSON.parse(content2) : '',
                    participant: participant,
                    numberOfPeopleAdded: CountParticipant,
                    isEdit: true,
                    formName: formData?.formName,
                    CancelView: '<p>Cancel</p>',
                    Submit: formData?.submitSetting.submitText,
                    formType: 'C',
                    selectedColor: htmlbgcolor?.bgColor,
                    colorPicker: htmlbgcolor?.bgColor,
                };
                reset(temp);
            } else {
                reset((formState) => ({
                    ...formState,
                    ...formData,
                }));
            }
        }
    }, [formData]);

    return (
        <FormProvider {...methods}>
            <div className= { `${formStylesFormBackgroundColor ? 'py45' :''}`}  style={{
                                display: 'flex',
                                flexDirection: headerLayoutPos === 'top' ? 'column' : 'row',
                                background: (formBackgroundImageUrl 
                                    ? `url(${formBackgroundImageUrl})` 
                                    : (formStylesFormBackgroundColor || 'transparent')),
                                backgroundSize: formStylesFormBackgroundEnabled && formBackgroundImageUrl ? 'cover' : 'auto',
                                backgroundPosition: formStylesFormBackgroundEnabled && formBackgroundImageUrl ? 'center' : 'initial',
                                backgroundRepeat: formStylesFormBackgroundEnabled && formBackgroundImageUrl ? 'no-repeat' : 'repeat',
                            }}>
            <Row >
                <Col md={{offset:1,span:10}} className='p0'>
                    <div 
                        className={`tellafriend preview box-design no-box-shadow`}
                    >
                        {/* Layout Container - Changes based on headerLayoutPosition */}
                        <div 
                            className={` css-scrollbar form-layout-container ${headerLayoutPos === 'top' ? 'layout-top' : 'layout-row'}`}
                         
                        >
                            {/* Header Column - Only shown when logo is enabled, form background is not enabled, and NOT on right */}
                            {logoEnabled && !formStylesFormBackgroundEnabled && headerLayoutPos !== 'right' && (
                                <div 
                                    className={`form-header-column ${headerLayoutPos === 'top' ? 'header-top' : 'header-side'} header-left`}
                                    style={{
                                        ...(headerLayoutPos === 'top' ? {
                                            width: '100%',
                                            padding: '15px',
                                            backgroundColor: headerConfigBackgroundColor || 'transparent',
                                            marginBottom: '15px',
                                            order: 1,
                                        } : {
                                            width: '200px',
                                            padding: '15px',
                                            backgroundColor: headerConfigBackgroundColor || 'transparent',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            order: 1,
                                        })
                                    }}
                                >
                                    {/* Style 1: Header with background image */}
                                    {logoStyle === 'style1' && backgroundImageUrl && (
                                        <div
                                            style={{
                                                backgroundImage: `url(${backgroundImageUrl})`,
                                                backgroundSize: 'cover',
                                                backgroundPosition: 'center',
                                                backgroundRepeat: 'no-repeat',
                                                width: '100%',
                                                minHeight: headerLayoutPos === 'top' ? '80px' : '100%',
                                                display: 'flex',
                                                ...logoAlignmentStyle,
                                                padding: '15px',
                                                gap: '10px',
                                                flexDirection: headerLayoutPos === 'top' ? 'row' : 'column',
                                            }}
                                        >
                                            {logoUrl && (
                                                <img
                                                    src={logoUrl}
                                                    alt="Logo"
                                                    style={{
                                                        maxHeight: '60px',
                                                        maxWidth: '200px',
                                                        objectFit: 'contain',
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            )}
                                            {(headerConfigName || !logoUrl) && (
                                                <span style={{ 
                                                    color: headerConfigColor || '#000000',
                                                    fontSize: `${fontSize || 19}px`,
                                                    fontWeight: '500',
                                                    display: 'inline-block',
                                                    width: headerLayoutPos === 'top' ? 'auto' : '100%',
                                                    ...getNameAlignmentStyle(headerLayoutPos === 'top' ? 'row' : 'column'),
                                                }}>
                                                    {headerConfigName || ''}
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    {/* Regular Header - shown when Style 1 background image is not active */}
                                    {!(logoStyle === 'style1' && backgroundImageUrl) && (
                                        <div
                                            className={`d-flex`}
                                            style={{
                                                ...logoAlignmentStyle,
                                                width: '100%',
                                                flexDirection: headerLayoutPos === 'top' ? 'row' : 'column',
                                                gap: '10px',
                                                ...(backgroundImageUrl && {
                                                    backgroundImage: `url(${backgroundImageUrl})`,
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    backgroundRepeat: 'no-repeat',
                                                    padding: '15px',
                                                }),
                                            }}
                                        >
                                            {logoUrl && (
                                                <img
                                                    src={logoUrl}
                                                    alt="Logo"
                                                    style={{
                                                        maxHeight: headerLayoutPos === 'top' ? '60px' : '80px',
                                                        maxWidth: headerLayoutPos === 'top' ? '200px' : '150px',
                                                        objectFit: 'contain',
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            )}
                                            {(headerConfigName || !logoUrl) && (
                                                <span style={{ 
                                                    color: headerConfigColor || '#000000',
                                                    fontSize: `${fontSize || 19}px`,
                                                    fontWeight: '500',
                                                    display: 'inline-block',
                                                    width: headerLayoutPos === 'top' ? 'auto' : '100%',
                                                    ...getNameAlignmentStyle(headerLayoutPos === 'top' ? 'row' : 'column'),
                                                }}>
                                                    {headerConfigName || ''}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Form Content Column */}
                            <div 
                                className={`form-content-column ${headerLayoutPos === 'top' || !logoEnabled || formStylesFormBackgroundEnabled ? 'content-full' : 'content-with-header'} ${headerLayoutPos === 'right' ? 'content-right' : 'content-left'}`}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    order: headerLayoutPos === 'right' ? 1 : 2,
                                }}
                            >
                                <div className={`tellafriend ${'pe-none'}`}>
                                    <div className="rs-builder-elements-dropped-wrapper rsbedw-form-builder">
                                        <div 
                                            className={`rs-builder-elements-content-wrapper form-layout-${formLayout || 'horizontal'} input-style-${(typeof formStylesInputStyle === 'object' && formStylesInputStyle !== null ? formStylesInputStyle?.value : formStylesInputStyle) || 'default'}`}
                                            style={{
                                            //    background: finalThemeColors.background,
                                                color: finalThemeColors.text,
                                                fontFamily: fontValue || 'inherit',
                                                '--label-font-color': fontColor || '#000000',
                                                '--label-font-size': `${fontSize || 19}px`,
                                                transition: 'all 0.3s ease',
                                                // CSS custom properties for input styling
                                                '--input-border': getInputStyle?.border === 'none' ? 'none' : (getInputStyle?.border || `1px solid ${finalThemeColors.border || '#e0e0e0'}`),
                                                '--input-border-bottom': getInputStyle?.borderBottom || (getInputStyle?.border === 'none' ? `2px solid ${finalThemeColors.border || '#e0e0e0'}` : (getInputStyle?.border || `1px solid ${finalThemeColors.border || '#e0e0e0'}`)),
                                                '--input-border-radius': getInputStyle?.borderRadius || '4px',
                                                '--input-padding': getTextFieldSize?.padding || '10px 12px',
                                                '--input-font-size': getTextFieldSize?.fontSize || '14px',
                                                '--input-background-color': finalThemeColors.textField02 || (finalThemeColors.background === 'transparent' ? 'transparent' : finalThemeColors.background || 'transparent'),
                                                '--input-color': finalThemeColors.textField01 || finalThemeColors.text || '#333333',
                                                '--input-accent-color': finalThemeColors.accent || '#007bff',
                                            }}
                                        >
                                            <Row className='p10' style={{ 
                                                background: !formStylesFormBackgroundEnabled ? (selectedColor || finalThemeColors.formBackground) : 'transparent',
                                                color: finalThemeColors.text,
                                            }}>
                                    <div>
                                        <div className="rsbecw-row mb30">
                                            <div className="" style={{
                                                fontSize: `${fontSize || 19}px`,
                                                color: fontColor || '#000000',
                                            }}>
                                                {/* <Text
                                                                index={1}
                                                                labelName={formData?.headingName}
                                                            /> */}
                                                {typeof headingName === 'string'
                                                    ? parse(headingName)
                                                    : headingName ?? ''}
                                            </div>
                                        </div>
                                        {/* <div className="rsbecw-row"> */}
                                        <div className="rs-pop-view mb30">
                                            <Row>
                                                {salutation && (
                                                    <Col>
                                                        <RSKendoDropDownList
                                                            name={'selectField'}
                                                            data={tellAFriendSettings?.optionData}
                                                            // required
                                                            label={'Salutation'}
                                                            disabled
                                                            // rules={{
                                                            //     required: THIS_FIELD_IS_REQUIRED,
                                                            // }}
                                                        />
                                                    </Col>
                                                )}
                                                {fullName ? (
                                                    <Col className="flex-right">
                                                        <RSInput
                                                            name={'FullName'}
                                                            placeholder={'Full name'}
                                                            // required
                                                            // rules={{
                                                            //     required: 'Enter your full name',
                                                            // }}
                                                            disabled={true}
                                                        />
                                                        <i
                                                            className={`mt12 ml15 ${asterisk_mini} icon-xs ${
                                                                FullNameMandatory
                                                                    ? 'color-primary-red'
                                                                    : 'color-secondary-grey'
                                                            }`}
                                                            onClick={() => {
                                                                setValue('FullNameMandatory', !FullNameMandatory);
                                                            }}
                                                        />
                                                    </Col>
                                                ) : (
                                                    <>
                                                        <Col className="flex-right">
                                                            <RSInput
                                                                name={'FirstName'}
                                                                placeholder={'First name'}
                                                                // required
                                                                // rules={{
                                                                //     required: 'Enter your first name',
                                                                // }}
                                                                disabled={true}
                                                            />
                                                            <i
                                                                className={`mt12 ml15 ${asterisk_mini} icon-xs ${
                                                                    FirstNameMandatory
                                                                        ? 'color-primary-red'
                                                                        : 'color-secondary-grey'
                                                                }`}
                                                                onClick={() => {
                                                                    setValue('FirstNameMandatory', !FirstNameMandatory);
                                                                }}
                                                            />
                                                        </Col>
                                                        <Col className="flex-right">
                                                            <RSInput
                                                                control={control}
                                                                name={'LastName'}
                                                                placeholder={'Last name'}
                                                                // required
                                                                // rules={{
                                                                //     required: 'Enter your last name',
                                                                // }}
                                                                disabled={true}
                                                            />
                                                            <i
                                                                className={`mt12 ml15 ${asterisk_mini} icon-xs ${
                                                                    LastNameMandatory
                                                                        ? 'color-primary-red'
                                                                        : 'color-secondary-grey'
                                                                }`}
                                                                onClick={() => {
                                                                    setValue('LastNameMandatory', !LastNameMandatory);
                                                                }}
                                                            />
                                                        </Col>
                                                    </>
                                                )}
                                                {email && (
                                                    <Col className="flex-right">
                                                        <RSInput
                                                            control={control}
                                                            name={'email'}
                                                            placeholder={'Email'}
                                                            // required
                                                            // rules={{
                                                            //     required: 'Enter your email',
                                                            // }}
                                                            disabled={true}
                                                        />
                                                        <i
                                                            className={`mt12 ml15 ${asterisk_mini} icon-xs ${
                                                                emailMandatory
                                                                    ? 'color-primary-red'
                                                                    : 'color-secondary-grey'
                                                            }`}
                                                            onClick={() => {
                                                                setValue('emailMandatory', !emailMandatory);
                                                            }}
                                                        />
                                                    </Col>
                                                )}
                                                {mobile && (
                                                    <Col className="flex-right">
                                                        <RSPhoneInput
                                                            control={control}
                                                            name={'mobile'}
                                                            label={'Mobile number'}
                                                            enableSearch={true}
                                                            setError={setError}
                                                            clearErrors={clearErrors}
                                                            disabled={true}
                                                        />
                                                        <i
                                                            className={`mt12 ml15 ${asterisk_mini} icon-xs ${
                                                                mobileMandatory
                                                                    ? 'color-primary-red'
                                                                    : 'color-secondary-grey'
                                                            }`}
                                                            onClick={() => {
                                                                setValue('mobileMandatory', !mobileMandatory);
                                                            }}
                                                        />
                                                    </Col>
                                                )}
                                            </Row>
                                        </div>
                                        {/* </div> */}
                                        <div className="rsbecw-row mb30 d-flex align-items-end">
                                            <div className="" style={{
                                                fontSize: `${fontSize || 19}px`,
                                                color: fontColor || '#000000',
                                            }}>
                                                {/* <Text
                                                                index={2}
                                                                labelName={formData?.participantName}
                                                            /> */}
                                                {typeof participantName === 'string'
                                                    ? parse(participantName)
                                                    : participantName ?? ''}
                                            </div>
                                            {/* <div className="ml15">
                                                            <RSTooltip text={'Set referral limit'} position="top" className="lh0">
                                                                <i
                                                                    className={`${settings_medium} icon-md color-primary-blue`}
                                                                    onClick={() => {
                                                                        setSettingsModal(true);
                                                                    }}
                                                                />
                                                            </RSTooltip>
                                                        </div> */}
                                        </div>
                                        {/* <div className="rsbecw-row"> */}
                                        <div className="rs-pop-view mb30">
                                            <Row>
                                                {salutation && (
                                                    <Col>
                                                        <RSKendoDropDownList
                                                            name={'participant.selectField'}
                                                            data={tellAFriendSettings?.optionData}
                                                            control={control}
                                                            //  required
                                                            label={'Salutation'}
                                                            // rules={{
                                                            //     required: THIS_FIELD_IS_REQUIRED,
                                                            // }}
                                                            disabled
                                                        />
                                                    </Col>
                                                )}
                                                {fullName ? (
                                                    <Col>
                                                        <RSInput
                                                            control={control}
                                                            name={'participant.FullName'}
                                                            placeholder={'Full name'}
                                                            // required
                                                            // rules={{
                                                            //     required: 'Enter your full namae',
                                                            // }}
                                                            disabled={true}
                                                        />
                                                    </Col>
                                                ) : (
                                                    <>
                                                        <Col>
                                                            <RSInput
                                                                control={control}
                                                                name={'participant.FirstName'}
                                                                placeholder={'Firstname'}
                                                                // required
                                                                // rules={{
                                                                //     required: 'Enter your first name',
                                                                // }}
                                                                disabled={true}
                                                            />
                                                        </Col>
                                                        <Col>
                                                            <RSInput
                                                                control={control}
                                                                name={'participant.LastName'}
                                                                placeholder={'Lastname'}
                                                                // required
                                                                // rules={{
                                                                //     required: 'Enter your last name',
                                                                // }}
                                                                disabled={true}
                                                            />
                                                        </Col>
                                                    </>
                                                )}
                                                {email && (
                                                    <Col>
                                                        <RSInput
                                                            control={control}
                                                            name={'participant.email'}
                                                            placeholder={'Email'}
                                                            // required
                                                            // rules={{
                                                            //     required: 'Enter your Email',
                                                            // }}
                                                            disabled={true}
                                                        />
                                                    </Col>
                                                )}
                                                {mobile && (
                                                    <Col>
                                                        <RSPhoneInput
                                                            control={control}
                                                            name={'participant.mobile'}
                                                            label={'Mobile number'}
                                                            enableSearch={true}
                                                            setError={setError}
                                                            clearErrors={clearErrors}
                                                            disabled={true}
                                                        />
                                                    </Col>
                                                )}
                                            </Row>
                                        </div>

                                        <div className="rs-pop-view position-relative mt41">
                                            <div
                                                className={`form-builder-component`}
                                                style={{ 
                                                    background: !formStylesFormBackgroundEnabled ? selectedColor : 'transparent',
                                                }}
                                            >
                                                <ul 
                                                    className="rs-list-inline"
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: buttonAlignmentValue === 'left' ? 'flex-start' :
                                                                    buttonAlignmentValue === 'right' ? 'flex-end' :
                                                                    'center',
                                                        width: '100%',
                                                        alignItems: 'center',
                                                    }}
                                                >
                                                    <li>
                                                        <button
                                                            type="button"
                                                            className="rs-form-button rsfb-cancel pe-none"
                                                            style={{
                                                                backgroundColor: `${background?.cancelColor || 'transparent'}`,
                                                                color: '#0018f9',
                                                                borderRadius: buttonRoundingValue === 'full' ? '50px' :
                                                                            buttonRoundingValue === 'none' ? '0px' :
                                                                            '4px',
                                                                fontSize: getTextFieldSize?.fontSize || '14px',
                                                            }}
                                                        >
                                                            <RSEditorPopup
                                                                name={`CancelView`}
                                                                control={control}
                                                                initialValue={!!Cancel ? Cancel : 'Cancel'}
                                                                init={BODYCONFIG}
                                                                disabled={true}
                                                            />
                                                        </button>
                                                    </li>
                                                    <li>
                                                        {' '}
                                                        <button
                                                            type="button"
                                                            className={`rs-form-button rsfb-submit ${submitCheck ? 'submitini' : ''}`}
                                                            style={{ 
                                                                backgroundColor: `${background?.submitColor || finalThemeColors.accent || '#007bff'}`,
                                                                borderRadius: buttonRoundingValue === 'full' ? '50px' :
                                                                            buttonRoundingValue === 'none' ? '0px' :
                                                                            '4px',
                                                                fontSize: getTextFieldSize?.fontSize || '14px',
                                                            }}
                                                        >
                                                            <RSEditorPopup
                                                                name={`Submit`}
                                                                control={control}
                                                                initialValue={!!Submit ? Submit : 'Submit'}
                                                                init={BODYCONFIG}
                                                                disabled={true}
                                                            />
                                                        </button>
                                                    </li>
                                                </ul>
                                            </div>
                                        </div>
                                    </div>
                                </Row>
                            </div>
                        </div>
                    </div>
                            </div>
                            {/* End of Form Content Column */}
                        </div>
                        {/* End of Layout Container */}
                    </div>
                </Col>
            </Row></div>
        </FormProvider>
    );
};

export default memo(TellAFriendPreview);
