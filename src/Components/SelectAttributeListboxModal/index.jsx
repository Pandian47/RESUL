import { APPLY, CANCEL, CATEGORIES_NAME, CATEGORY_NAME_ALREADY_EXISTS, CLASSIFICATION_NAME, FILTER_GROUP_NAME, NO_DATA_ATTRIBUTES_AVAILABLE, SAVE, SELECT_LEFT_ATTRIBUTES, SELECT_PERSONALISATION_ATTRIBUTES, UPDATE } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, memo, useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import ResKendoListbox from 'Pages/KendoDocs/CommonComponents/ResKendoListbox';
import RSModal from 'Components/RSModal';
import { isEqual as _isEqual } from 'Utils/modules/lodashReplacements';
import RSInput from 'Components/FormFields/RSInput';
import { useForm } from 'react-hook-form';

const SelectAttributeListboxModal = ({
    show: showModal,
    getSelectedData,
    leftAttributes,
    rightAttributes,
    handleClose,
    header = SELECT_PERSONALISATION_ATTRIBUTES,
    InputValue = '',
    showInput = false,
    textField = 'name',
    isLabel = false,
    disabled = true,
    isNewCategory = false,
    handleNameCheck = () => {},
    isAudienceField = false,
    showCount = false,
    isApplyLoading = false,
    ...props
}) => {
    const [show, setShow] = useState(false);
    const [attributes, setAttributes] = useState({
        leftAttributes: [],
        rightAttributes: [],
    });
    const {
        control,
        setValue,
        setError,
        clearErrors,
        formState: { errors },
        watch,
    } = useForm();
    useEffect(() => {
        setShow(showModal || false);
        setValue('attributeName', InputValue);
    }, [showModal]);

    useEffect(() => {
        setAttributes({
            leftAttributes: leftAttributes,
            rightAttributes: rightAttributes,
        });
    }, [leftAttributes, rightAttributes]);
    const [selectedLength, setSelectedLength] = useState(0);
    const [isLengthChanged, setIsLengthChanged] = useState(false);
    useEffect(() => {
        const hasChanged =
            !_isEqual(attributes.leftAttributes, leftAttributes) ||
            !_isEqual(attributes.rightAttributes, rightAttributes);
        setIsLengthChanged(hasChanged);
    }, [attributes.leftAttributes, leftAttributes, attributes.rightAttributes, rightAttributes]);
    return (
        <RSModal
            show={show}
            size="lg"
            header={header}
            handleClose={handleClose}
            bodyClassName={isAudienceField ? 'custom_modal_tableTop' : ''}
            footerClassName={isAudienceField ? 'custom_modal_footer_button' : ''}
            body={
                <Fragment>
                    {showInput && (
                        <Row>
                            {isLabel ? (
                                <>
                                    <Col sm={3} className='pr0'>
                                        <div className='fs19'>
                                            {header?.includes('filter')
                                                ? FILTER_GROUP_NAME
                                                : isNewCategory
                                                ? CATEGORIES_NAME
                                                : CLASSIFICATION_NAME}
                                        </div>
                                    </Col>
                                    <Col sm={9}>
                                        <div className="form-group">
                                            <RSInput
                                                control={control}
                                                type={'text'}
                                                name={'attributeName'}
                                                // className="pointer-event-none"
                                                disabled={disabled}
                                                label={isNewCategory ? FILTER_GROUP_NAME : ''}
                                                handleOnchange={
                                                    isNewCategory
                                                        ? (e) => {
                                                              const value = e.target.value;
                                                              const status = handleNameCheck(value);
                                                              if (status) {
                                                                  setError('attributeName', {
                                                                      type: 'custom',
                                                                      message: CATEGORY_NAME_ALREADY_EXISTS,
                                                                  });
                                                              } else {
                                                                  clearErrors('attributeName');
                                                              }
                                                          }
                                                        : () => {}
                                                }
                                                required={isNewCategory ? true : false}
                                            />
                                        </div>
                                    </Col>
                                </>
                            ) : (
                                <Col sm={12}>
                                    <div className="form-group">
                                        <RSInput type={'text'} name={'attributeName'} disabled />
                                    </div>
                                </Col>
                            )}
                        </Row>
                    )}
                    <ResKendoListbox
                        textField={textField}
                        leftColumnValues={attributes.leftAttributes}
                        rightColumnValues={attributes.rightAttributes}
                        customText={SELECT_LEFT_ATTRIBUTES}
                        setSelectedLength={setSelectedLength}
                        getSelectedData={(data) =>
                            setAttributes({
                                leftAttributes: data?.leftColumnValues,
                                rightAttributes: data?.rightColumnValues,
                            })
                        }
                        {...props}
                        nodataText={NO_DATA_ATTRIBUTES_AVAILABLE}
                        searchClassName='dc-search'
                        showCount = {showCount}
                    />
                </Fragment>
            }
            footer={
                <>
                    <RSSecondaryButton onClick={handleClose}>{CANCEL}</RSSecondaryButton>
                    <RSPrimaryButton
                        disabledClass={`${
                            isNewCategory &&
                            (Object?.keys(errors)?.includes('attributeName') || !watch('attributeName'))
                                ? 'pe-none click-off'
                                : ''
                        } ${isLengthChanged ? '' : 'pe-none click-off'}`}
                        loading={isApplyLoading}
                        blockBodyPointerEvents={isApplyLoading}
                        onClick={() => getSelectedData(attributes, watch('attributeName'))}
                    >
                        {isAudienceField ? APPLY : isNewCategory ? SAVE : UPDATE}
                    </RSPrimaryButton>
                </>
            }
        />
    );
};

export default memo(SelectAttributeListboxModal);
