import { PREVIEW } from 'Constants/GlobalConstant/Placeholders';
import { memo, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import RSModal from 'Components/RSModal';
import { useFormContext } from 'react-hook-form';
import { FormGeneratorContext } from './FormGenerator';
import AgreeCancel from './Components/AgreeCancel';
import FormButtons from '../InputTabs/FormButtons';
import FormCaptcha from '../InputTabs/FormCaptcha';
import { INPUT_TYPES } from '../../constant';
import { Col, Row } from 'react-bootstrap'

const Preview = ({
    show,
    onHide,
    dropAble,
    selectedColor,
    previewTemp,
    QrPreview = false,
    previewFormstate,
    isQrCaptcha = false,
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
    logoJustifyContent,
    formStylesPaginationEnabled,
    formStylesPagination,
    formStylesItemsPerPage,
    headerConfigFontSize,
    headerConfigFontFamily,
}) => {
    const { formState } = useContext(FormGeneratorContext);
    const { control, setValue, getValues, watch } = useFormContext();
    const allValues = getValues()

    // State for current page in pagination
    const [currentPage, setCurrentPage] = useState(1);

    // Helper to extract value from object
    const getValue = (val) => {
        if (typeof val === 'object' && val !== null && val.value !== undefined) {
            return val.value;
        }
        return val || 'default';
    };

    const inputStyleValue = getValue(formStylesInputStyle);
    const textFieldSizeValue = getValue(formStylesTextFieldSize);

    // Extract button alignment value - handle both object and string formats
    const buttonAlignmentValue = useMemo(() => {
        if (typeof formStylesButtonAlignment === 'object' && formStylesButtonAlignment !== null && formStylesButtonAlignment.value !== undefined) {
            return formStylesButtonAlignment.value;
        }
        return formStylesButtonAlignment || 'center';
    }, [formStylesButtonAlignment]);

    // Default values for optional props
    const logoEnabled = formStylesLogoEnabled !== undefined ? formStylesLogoEnabled : false;
    const logoStyle = formStylesLogoStyle || 'style3';
    const headerLayoutPos = headerLayoutPosition || 'top';
    const headerAlign = headerConfigAlignment || 'left';

    // Extract logo URL - handle both string and object formats
    const logoUrl = useMemo(() => {
        if (!headerConfigLogo) return '';
        if (typeof headerConfigLogo === 'string') return headerConfigLogo;
        // If it's an object, try to extract the URL from common properties
        if (typeof headerConfigLogo === 'object') {
            return headerConfigLogo.url || headerConfigLogo.imageUrl || headerConfigLogo.inputUrl || headerConfigLogo.data || '';
        }
        return '';
    }, [headerConfigLogo]);

    // Extract background image URL - handle both string and object formats
    const backgroundImageUrl = useMemo(() => {
        if (!headerConfigBackgroundImage) return '';
        if (typeof headerConfigBackgroundImage === 'string') return headerConfigBackgroundImage;
        // If it's an object, try to extract the URL from common properties
        if (typeof headerConfigBackgroundImage === 'object') {
            return headerConfigBackgroundImage.url || headerConfigBackgroundImage.imageUrl || headerConfigBackgroundImage.inputUrl || headerConfigBackgroundImage.data || '';
        }
        return '';
    }, [headerConfigBackgroundImage]);

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

    // Get logo alignment styles - memoized
    const logoAlignmentStyle = useMemo(() => {
        const align = headerConfigLogoAlignment || 'left';
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
                return { justifyContent: 'flex-start', alignItems: 'center' };
        }
    }, [headerConfigLogoAlignment]);

    // Get name alignment styles - memoized
    const getNameAlignmentStyle = useCallback((layoutDirection = 'row') => {
        const align = headerConfigNameAlignment || 'left';

        // Common alignment logic for both row and column layouts
        // textAlign works for horizontal alignment, alignSelf works for vertical alignment in flex containers
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
                    textAlign: 'left',
                    alignSelf: 'center'
                };
        }
    }, [headerConfigNameAlignment]);

    // Compute logo alignment for justifyContent
    const logoJustify = headerAlign === 'left' ? 'flex-start' : headerAlign === 'right' ? 'flex-end' : 'center';

    // Pagination logic
    const paginationEnabled = formStylesPaginationEnabled !== undefined ? formStylesPaginationEnabled : false;
    const paginationValue = getValue(formStylesPagination || 'next');
    const itemsPerPage = typeof formStylesItemsPerPage === 'number' ? formStylesItemsPerPage : (typeof formStylesItemsPerPage === 'object' && formStylesItemsPerPage?.value ? formStylesItemsPerPage.value : 5);

    // Pagination options for button text
    const paginationOptions = [
        { text: 'Next', value: 'next' },
        { text: 'Only Next', value: 'onlyNext' },
    ];

    // Get all fields with their original order and indices
    // Exclude Text fields from pagination counting, but maintain original order
    const allFieldsWithIndex = useMemo(() => {
        if (!dropAble || !Array.isArray(dropAble)) {
            return [];
        }

        return dropAble
            .map((item, originalIndex) => ({
                item,
                originalIndex,
                // TextBlock is the "Text" field type that should be excluded from pagination
                // Textbox is the "Text Box" field type that should be paginated normally
                isTextBlockType: item?.columnType === 'TextBlock' || item?.componentName === 'TextBlock',
                hasMapToValue: item?.mapToValue !== undefined && item?.mapToValue !== null
            }))
            .filter(({ item }) => !item?.field && item?.columnType !== 'Hidden');
    }, [dropAble]);

    // Get fields for pagination counting (fields with mapToValue that are NOT TextBlock type)
    // TextBlock ("Text") is excluded, but Textbox ("Text Box") is included in pagination
    const paginatableFields = useMemo(() => {
        return allFieldsWithIndex.filter(({ isTextBlockType, hasMapToValue }) => {
            // Only count fields with mapToValue AND NOT TextBlock type for pagination
            // Textbox fields should be paginated normally
            return hasMapToValue && !isTextBlockType;
        });
    }, [allFieldsWithIndex]);

    // Calculate total pages based only on fields with mapToValue that are NOT TextBlock
    const totalPages = useMemo(() => {
        if (!paginationEnabled || itemsPerPage <= 0) {
            return 1;
        }
        // If there are no paginatable fields, but pagination is enabled, check if we have any fields at all
        if (paginatableFields.length === 0) {
            // If all fields are TextBlock or don't have mapToValue, show all on one page
            return 1;
        }
        return Math.ceil(paginatableFields.length / itemsPerPage);
    }, [paginatableFields.length, paginationEnabled, itemsPerPage]);

    // Reset to page 1 when pagination settings change or modal closes/opens
    useEffect(() => {
        setCurrentPage(1);
    }, [paginationEnabled, itemsPerPage, show]);

    // Calculate items to show based on current page
    // Maintain original order: show all TextBlock fields + fields without mapToValue + exactly itemsPerPage paginatable fields
    const fieldsToShow = useMemo(() => {
        if (!paginationEnabled || itemsPerPage <= 0) {
            // If pagination disabled, show all fields
            return allFieldsWithIndex;
        }

        // If there are no paginatable fields (all are TextBlock or don't have mapToValue), show all
        if (paginatableFields.length === 0) {
            return allFieldsWithIndex;
        }

        // Get the paginated slice of paginatable fields (exactly itemsPerPage)
        // Paginatable fields = fields with mapToValue that are NOT TextBlock (includes Textbox)
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const paginatedFields = paginatableFields.slice(startIndex, endIndex);

        // Get the exact original indices of the paginated fields
        const paginatedIndices = new Set(paginatedFields.map(({ originalIndex }) => originalIndex));

        // Filter all fields maintaining original order
        // Show: TextBlock fields (always) + fields without mapToValue (always) + exactly the paginated fields with mapToValue
        const filtered = allFieldsWithIndex.filter(({ originalIndex, isTextBlockType, hasMapToValue }) => {
            // Always show TextBlock fields (the "Text" field type)
            if (isTextBlockType) return true;

            // Always show fields without mapToValue
            if (!hasMapToValue) return true;

            // For fields with mapToValue (including Textbox): only show if their originalIndex is in the paginated set
            // This ensures we show exactly itemsPerPage (or less on last page) paginatable fields
            return paginatedIndices.has(originalIndex);
        });

        return filtered;
    }, [allFieldsWithIndex, paginatableFields, paginationEnabled, itemsPerPage, currentPage]);

    // Handle next page navigation
    const handleNextPage = useCallback((e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setCurrentPage(prev => {
            const nextPage = prev + 1;
            // Check if next page is valid
            if (nextPage <= totalPages) {
                return nextPage;
            }
            return prev;
        });
    }, [totalPages]);

    // Handle previous page navigation
    const handlePreviousPage = useCallback((e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setCurrentPage(prev => {
            if (prev > 1) {
                return prev - 1;
            }
            return prev;
        });
    }, []);

    // Check if there's a next page - memoized to avoid recalculations
    const hasNextPage = useMemo(() => {
        return currentPage < totalPages;
    }, [currentPage, totalPages]);

    // Check if there's a previous page - memoized to avoid recalculations
    const hasPreviousPage = useMemo(() => {
        return currentPage > 1;
    }, [currentPage]);

    // Get pagination button text - Always show "Next" when pagination is enabled
    const paginationButtonText = useMemo(() => {
        if (!paginationEnabled) return 'Submit';
        // Always return "Next" for pagination, regardless of page
        const paginationOption = paginationOptions.find(opt => opt.value === paginationValue);
        return paginationOption ? paginationOption.text : 'Next';
    }, [paginationEnabled, paginationValue]);

    return (
        <RSModal
            show={show}
            size={formState?.layout === 'form-theme-default' ? 'xlg' : 'lg'}
            header={PREVIEW}
            handleClose={onHide}
            bodyClassName='p0'
            body={
                <div className="rs-form-builder-preview-wrapper-container" style={{ padding: '20px' }}>
                    <div
                        className={`rs-form-builder-preview-wrapper ${formState?.profilingToggle ? 'ToggleOn' : ''}`}
                        style={{
                            width: '100%',
                            overflow: 'hidden',
                            position: 'relative',
                            boxSizing: 'border-box',
                        }}
                    >
                        {/* Layout Container - Changes based on headerLayoutPosition */}
                        <div
                            className={`box-design css-scrollbar form-layout-container ${headerLayoutPos === 'top' ? 'layout-top' : 'layout-row'}`}
                            style={{
                                display: 'flex',
                                flexDirection: headerLayoutPos === 'top' ? 'column' : 'row',
                                width: '100%',
                                minHeight: '400px',
                                overflow: 'hidden',
                                borderRadius: '10px',
                                padding: "30px",
                                backgroundColor: formStylesFormBackgroundColor || '',
                                // background: formStylesFormBackgroundEnbled && (formBackgroundImageUrl
                                //     ? `url(${formBackgroundImageUrl})`
                                //     : (formStylesFormBackgroundColor || '#ffffff')),
                                backgroundSize: formStylesFormBackgroundEnabled && formBackgroundImageUrl ? 'cover' : 'auto',
                                backgroundPosition: formStylesFormBackgroundEnabled && formBackgroundImageUrl ? 'center' : 'initial',
                                backgroundRepeat: formStylesFormBackgroundEnabled && formBackgroundImageUrl ? 'no-repeat' : 'repeat',
                                backgroundClip: 'padding-box',
                                backgroundOrigin: 'padding-box',
                            }}
                        >

                            {/* Form Content Column */}
                            <div
                                className={`form-content-column box-design p0 bg-transparent no-box-shadow border ${headerLayoutPos === 'top' || !logoEnabled || formStylesFormBackgroundEnabled ? 'content-full' : 'content-with-header'} ${headerLayoutPos === 'right' ? 'content-right' : 'content-left'}`}
                                style={{
                                    flex: 1,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    order: headerLayoutPos === 'right' ? 1 : 2,
                                    minWidth: 0,
                                    maxWidth: headerLayoutPos !== 'top' && logoEnabled && !formStylesFormBackgroundEnabled ? 'calc(100% - 200px)' : '100%',
                                    overflow: 'hidden',
                                    boxSizing: 'border-box',
                                }}
                            >
                                <div
                                    className={`rsfbpw-content py21 ${formState?.layout} form-layout-${formLayout || 'horizontal'} input-style-${inputStyleValue || 'default'}`}
                                    style={{
                                        width: '100%',
                                        maxWidth: '100%',
                                        boxSizing: 'border-box',
                                        background: themeColors?.formBackground || themeColors?.formBackground || '#ffffff',
                                        backgroundSize: formStylesFormBackgroundEnabled && formBackgroundImageUrl ? 'cover' : 'auto',
                                        backgroundPosition: formStylesFormBackgroundEnabled && formBackgroundImageUrl ? 'center' : 'initial',
                                        backgroundRepeat: formStylesFormBackgroundEnabled && formBackgroundImageUrl ? 'no-repeat' : 'repeat',
                                        color: themeColors?.text || '#333333',
                                        '--label-font-family': fontValue && fontValue !== 'default' ? fontValue : 'inherit',
                                        '--label-font-color': fontColor || '#000000',
                                        '--label-font-size': `${fontSize || 19}px`,
                                        transition: 'all 0.3s ease',
                                        // CSS custom properties for input styling
                                        '--input-border': getInputStyle?.border === 'none' ? 'none' : (getInputStyle?.border || `1px solid ${themeColors?.border || '#e0e0e0'}`),
                                        '--input-border-bottom': getInputStyle?.borderBottom || (getInputStyle?.border === 'none' ? `2px solid ${themeColors?.border || '#e0e0e0'}` : (getInputStyle?.border || `1px solid ${themeColors?.border || '#e0e0e0'}`)),
                                        '--input-border-radius': getInputStyle?.borderRadius || '4px',
                                        '--input-padding': getTextFieldSize?.padding || '10px 12px',
                                        '--input-font-size': getTextFieldSize?.fontSize || '14px',
                                        '--input-background-color': themeColors?.textField02 || (themeColors?.background === 'transparent' ? '#ffffff' : themeColors?.background || '#ffffff'),
                                        '--input-color': themeColors?.textField01 || themeColors?.text || '#333333',
                                        '--input-accent-color': themeColors?.accent || '#007bff',
                                    }}
                                >
                                    {/* Header Column - Only shown when logo is enabled, form background is not enabled, and NOT on right */}
                                    {logoEnabled && headerLayoutPos !== 'right' && (
                                        <div
                                            className={`form-header-column ${headerLayoutPos === 'top' ? 'header-top' : 'header-side'} header-left`}
                                            style={{
                                                ...(headerLayoutPos === 'top' ? {
                                                    position: 'relative',
                                                    marginTop: '-21px',
                                                    padding: '15px 21px',
                                                    // Use background image if available, otherwise use background color
                                                    backgroundColor: backgroundImageUrl ? 'transparent' : (headerConfigBackgroundColor || '#00006e'),
                                                    backgroundImage: backgroundImageUrl ? `url(${backgroundImageUrl})` : 'none',
                                                    backgroundSize: 'cover',
                                                    backgroundPosition: 'center',
                                                    backgroundRepeat: 'no-repeat',
                                                    marginBottom: '21px',
                                                    order: 1,
                                                    flexShrink: 0,
                                                    boxSizing: 'border-box',
                                                    borderBottom: logoEnabled ? '1px solid rgba(0,0,0,0.1)' : 'none',
                                                    borderTopLeftRadius: '7px',
                                                    borderTopRightRadius: '7px',
                                                } : {
                                                    width: '200px',
                                                    minWidth: '200px',
                                                    maxWidth: '200px',
                                                    padding: '15px',
                                                    backgroundColor: headerConfigBackgroundColor || '#00006e',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    order: 1,
                                                    flexShrink: 0,
                                                    boxSizing: 'border-box',
                                                })
                                            }}
                                        >
                                            {/* Header content - logo and name */}
                                            <div
                                                className={`d-flex`}
                                                style={{
                                                    ...logoAlignmentStyle,
                                                    width: '100%',
                                                    flexDirection: headerLayoutPos === 'top' ? 'row' : 'column',
                                                    gap: '10px',
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
                                                        color: headerConfigColor || '#ffffff',
                                                        fontSize: headerConfigFontSize ? `${Math.max(17, Number(headerConfigFontSize))}px` : (headerLayoutPos === 'top' ? '18px' : '17px'),
                                                        fontFamily: headerConfigFontFamily?.fontFamily || 'inherit',
                                                        wordBreak: 'break-word',
                                                        textAlign: headerLayoutPos === 'top' ? (headerConfigNameAlignment || 'center') : 'left',
                                                        width: 'auto',
                                                        display: 'block',
                                                    }}>
                                                        {headerConfigName || 'Form name'}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className='rs-formPreview-content-wrapper px21'>
                                        {fieldsToShow.map(({ item, originalIndex }, displayIndex) => {
                                            const index = originalIndex; // Use the original index from dropAble array

                                            let Component;
                                            const filterData = INPUT_TYPES?.filter(
                                                (defaultInput) => defaultInput?.componentName === item?.componentName,
                                            );

                                            //  matrix component columntype radio or checkbox filter data
                                            const matrixComponentData = previewTemp?.find((item) => item?.type === 'Matrix');

                                            Component = item?.component;
                                            let hint = dropAble?.['tinyMceLable' + index];
                                            let placeholder = dropAble?.[index]?.settings?.placeholder || dropAble?.[index]?.settings?.tagsLabelName || item.placeHolder;
                                            let mandatory = item?.mandatory;

                                            if (!item?.field && item?.columnType !== 'Hidden' && item?.component) {
                                                return (
                                                    <section
                                                        key={`preview-field-${index}-${displayIndex} `}
                                                        className={`form-builder-component rs-form-component component-${item?.componentName
                                                            } ${mandatory ? 'form-section-required' : 'form-section-optional'} ${item?.componentName === 'Matrix' ? "" : "pe-none"} `}
                                                    >
                                                        <Component
                                                            index={index}
                                                            labelName={previewTemp?.[index]?.value}
                                                            placeHolder={placeholder}
                                                            mandatory={mandatory}
                                                            preview={true}
                                                            previewGridLayout={true}
                                                            mapTo={item?.mapTo}
                                                            optionData={item?.optionData}
                                                            matrixSub={previewTemp[index]?.matrixSub}
                                                            matrixTitle={previewTemp[index]?.matrixTitle}
                                                            rowDefaultValue={previewTemp[index]?.rowDefaultValue}
                                                            colDefaultValue={previewTemp[index]?.colDefaultValue}
                                                            type={item?.type}
                                                            sliderProps={previewTemp[index]}
                                                            matrixColumnValueType={matrixComponentData?.settingColumnType}
                                                            participant={previewTemp[index]?.participant}
                                                            participantTotal={previewTemp[index]?.participantTotal}
                                                        />
                                                    </section>
                                                );
                                            }
                                            return null;
                                        })}

                                        {/* Terms and Conditions and Submit/Cancel Buttons - Only show on last page when pagination is enabled, or always when pagination is disabled */}
                                        {(!paginationEnabled || (paginationEnabled && currentPage === totalPages)) && (
                                            <>
                                                {/* Terms and Conditions */}
                                                <Col md={12} className='pe-none'>
                                                    <Row>
                                                        <Col md={{ offset: allValues?.formStyles?.formLayout === 'horizontal' ? 4 : 0, span: 8 }} className={`${allValues?.formStyles?.formLayout === 'horizontal' ? '' : ' d-flex'}`}>
                                                            <section
                                                                className={`rs-form-component ${allValues?.formStyles?.formLayout === 'noLabels' ? '' : 'mt32 mb32'} ${dropAble?.['mandatoryAgree'] ? 'form-section-required' : 'form-section-optional'} ${buttonAlignmentValue === 'center' ? '-' : ''} pe-none `}
                                                            >
                                                                <AgreeCancel selectedColor={selectedColor} preview />
                                                            </section>
                                                        </Col>
                                                    </Row>
                                                </Col>

                                                {/* Captcha - Only show on last page when pagination is enabled, or always when pagination is disabled */}
                                                <Col md={12} className='pe-none'>
                                                    <Row>
                                                        <Col md={{ offset: allValues?.formStyles?.formLayout === 'horizontal' ? 4 : 0, span: 8 }} className={`${allValues?.formStyles?.formLayout === 'horizontal' ? '' : ' d-flex'}`}>
                                                            <section className={`rs-form-component mt0 pe-none`}>
                                                                <FormCaptcha
                                                                    preview
                                                                    selectedColor={selectedColor}
                                                                    themeColors={themeColors}
                                                                />
                                                            </section>
                                                        </Col>
                                                    </Row>
                                                </Col>

                                                {/* Submit and Cancel Buttons */}
                                                <Col md={12} style={{
                                                    display: 'flex',
                                                    justifyContent: buttonAlignmentValue === 'left' ? 'flex-start' :
                                                        buttonAlignmentValue === 'right' ? 'flex-end' :
                                                            buttonAlignmentValue === 'center' ? 'center' : '',
                                                    width: '100%',
                                                    alignItems: 'center',
                                                    pointerEvents: 'none',
                                                }} className='pl0'>
                                                    <Row style={{ width: '100%' }}>
                                                        <Col md={12} className={`${allValues?.formStyles?.formLayout === 'horizontal' ? '' : ' d-flex'}`}>
                                                            <section
                                                                className={`rs-form-component pe-none  w-100 mt0 ${dropAble?.['mandatoryAgree'] ? 'form-section-required' : 'form-section-optional'}`}
                                                            >
                                                                <FormButtons
                                                                    preview
                                                                    formState={formState}
                                                                    themeColors={themeColors}
                                                                    formStylesButtonRounding={formStylesButtonRounding}
                                                                    formStylesButtonAlignment={formStylesButtonAlignment}
                                                                />
                                                            </section>
                                                        </Col>
                                                    </Row>
                                                </Col>
                                            </>
                                        )}

                                        {/* Previous and Next Buttons - Always show when pagination is enabled, placed below Cancel/Submit buttons */}
                                        {paginationEnabled && (
                                            <Col md={12}>
                                                <Row>
                                                    <Col md={{ offset: (buttonAlignmentValue === 'center' && allValues?.formStyles?.formLayout === 'horizontal') ? 4 : 0, span: (buttonAlignmentValue === 'center' && allValues?.formStyles?.formLayout === 'horizontal') ? 8 : 12 }} className={` ${buttonAlignmentValue === 'center' && allValues?.formStyles?.formLayout === 'horizontal' ? 'position-relative right20' : (allValues?.formStyles?.formLayout !== 'horizontal' && buttonAlignmentValue === 'center') ? 'pl0 pr35': 'pl25 pr35'}`}>
                                                        <div
                                                            className='d-flex align-items-center'
                                                            style={{
                                                                width: '100%',
                                                                gap: '10px',
                                                                marginTop: '41px',
                                                                pointerEvents: 'auto',
                                                                justifyContent: buttonAlignmentValue === 'left' ? 'flex-start' :
                                                                    buttonAlignmentValue === 'right' ? 'flex-end' :
                                                                        (allValues?.formStyles?.formLayout !== 'horizontal' && buttonAlignmentValue === 'center') ? 'center' : ''
                                                            }}
                                                        >
                                                            {/* Previous Button - Always show, disabled only when on first page */}
                                                            {paginationValue === 'next' && (
                                                                <button
                                                                    type="button"
                                                                    className="rs-form-button rsfb-prev"
                                                                    onClick={(e) => {
                                                                        e.preventDefault();
                                                                        e.stopPropagation();
                                                                        if (hasPreviousPage && paginationValue === 'next') {
                                                                            handlePreviousPage(e);
                                                                        }
                                                                    }}
                                                                    disabled={!hasPreviousPage || paginationValue !== 'next'}
                                                                    style={{
                                                                        backgroundColor: '#007bff',
                                                                        color: '#ffffff',
                                                                        padding: '4px 10px',
                                                                        border: 'none',
                                                                        cursor: (!hasPreviousPage || paginationValue !== 'next') ? 'not-allowed' : 'pointer',
                                                                        fontSize: '14px',
                                                                        fontWeight: '500',
                                                                        pointerEvents: 'auto',
                                                                        opacity: (!hasPreviousPage || paginationValue !== 'next') ? 0.6 : 1,
                                                                        transition: 'all 0.2s ease',
                                                                    }}
                                                                >
                                                                    Prev
                                                                </button>
                                                            )}

                                                            {/* Next Button - Always show "Next", disabled when on last page */}
                                                            <button
                                                                type="button"
                                                                className="rs-form-button"
                                                                onClick={(e) => {
                                                                    e.preventDefault();
                                                                    e.stopPropagation();
                                                                    if (hasNextPage) {
                                                                        handleNextPage(e);
                                                                    }
                                                                }}
                                                                disabled={!hasNextPage}
                                                                style={{
                                                                    backgroundColor: '#007bff',
                                                                    color: '#ffffff',
                                                                    padding: '4px 10px',
                                                                    border: 'none',
                                                                    cursor: !hasNextPage ? 'not-allowed' : 'pointer',
                                                                    fontSize: '14px',
                                                                    fontWeight: '500',
                                                                    pointerEvents: 'auto',
                                                                    opacity: !hasNextPage ? 0.6 : 1,
                                                                    transition: 'all 0.2s ease',
                                                                }}
                                                            >
                                                                {paginationButtonText}
                                                            </button>
                                                        </div>
                                                    </Col>
                                                </Row></Col>
                                        )}
                                    </div>
                                </div>
                                {/* End of rsfbpw-content */}
                            </div>
                            {/* End of Form Content Column */}

                            {/* Header Column - For right alignment, render after form content */}
                            {logoEnabled && headerLayoutPos === 'right' && (
                                <div
                                    className={`form-header-column header-side header-right`}
                                    style={{
                                        width: '200px',
                                        minWidth: '200px',
                                        maxWidth: '200px',
                                        padding: '15px',
                                        backgroundColor: headerConfigBackgroundColor || '#ffffff',
                                        borderLeft: '1px solid #e0e0e0',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        order: 2,
                                        flexShrink: 0,
                                        boxSizing: 'border-box',
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
                                                minHeight: '100%',
                                                display: 'flex',
                                                ...logoAlignmentStyle,
                                                padding: '15px',
                                                gap: '10px',
                                                flexDirection: 'column',
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
                                                    color: headerConfigColor || '#ffffff',
                                                    fontSize: '18px',
                                                    fontWeight: '500',
                                                    display: 'inline-block',
                                                    width: '100%',
                                                    ...getNameAlignmentStyle('column'),
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
                                                flexDirection: 'column',
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
                                                        maxHeight: '80px',
                                                        maxWidth: '150px',
                                                        objectFit: 'contain',
                                                    }}
                                                    onError={(e) => {
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            )}
                                            {(headerConfigName || !logoUrl) && (
                                                <span style={{
                                                    color: headerConfigColor || '#ffffff',
                                                    fontSize: '16px',
                                                    fontWeight: '500',
                                                    display: 'inline-block',
                                                    width: '100%',
                                                    ...getNameAlignmentStyle('column'),
                                                }}>
                                                    {headerConfigName || ''}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        {/* End of Layout Container */}
                    </div>
                </div>
            }
        />
    );
};

export default memo(Preview);
