import { selectIcon, selectIconTooltip } from 'Utils/modules/display';
import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { CHAR_NUM_UNDERSCORE } from 'Constants/GlobalConstant/Regex';
import { SMART_LINK_POPUP } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_medium, editor_smart_link_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useRef } from 'react';
import { findIndex as _findIndex } from 'Utils/modules/lodashReplacements';

import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import RSInput from 'Components/FormFields/RSInput';
import RSTooltip from 'Components/RSTooltip';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';


import { SMARTLINK_BOOTSTRAP_DROPDOWN_DEFAULT_ID } from 'Constants/GlobalConstant/InputLimit';

const AdsName = ({ fieldName, formState, updateSmartLink, fields, append, remove, setAdInputValue, adInputValue, smartLinks, smartLinkLoading = false, smartLinkLoadingIndex = null, handleSmartLinkDropdown, handleOpenWithAdd, maxSmartLinksReached }) => {
    const {
        control,
        trigger,
        watch,
        formState: { errors },
        setError,
        setValue,
    } = useFormContext();
    // const { fields, append, remove } = useFieldArray({
    //     control,
    //     name: fieldName,
    // });
    const adsName = watch(fieldName);
    const names = adsName?.map((item) => item.name);
    const skipSmartLinkBlurRef = useRef(false);

    return (
        <Fragment>
            {fields?.map((field, idx) => {
                const placeholderText = idx === 0 ? '' : idx;
                return (
                    <div className="form-group" key={field.id}>
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">Ad name {placeholderText + 1}</label>
                            </Col>
                            <Col sm={6}>
                                <RSInput
                                    control={control}
                                    name={`${fieldName}.${idx}.name`}
                                    placeholder={`Ad name ${placeholderText + 1}`}
                                    required
                                    maxLength={30}
                                    onKeyDown={charNumUnderScore}
                                    rules={{
                                        //required: 'Enter ad name ' + placeholder,
                                        required: 'Enter ad name',
                                        validate: (value) => {
                                            const specialCharRegex = CHAR_NUM_UNDERSCORE;

                                            if (specialCharRegex.test(value)) {
                                                return 'Special characters not allowed';
                                            }

                                            const isDuplicates = names?.filter((name) => name?.toLowerCase()?.trim() === value?.toLowerCase()?.trim())?.length > 1;
                                            if (isDuplicates) {
                                                return 'Ad name must be unique';
                                            }
                                            return true;
                                        },
                                    }}
                                    handleOnBlur={(e) => {
                                        if (skipSmartLinkBlurRef.current) {
                                            skipSmartLinkBlurRef.current = false;
                                            return;
                                        }
                                        const value = e.target.value.trim();
                                        const specialCharRegex = CHAR_NUM_UNDERSCORE;

                                        const hasSpecialChars = specialCharRegex.test(value);
                                        const isDuplicates = names?.filter((name) => name?.toLowerCase()?.trim() === value?.toLowerCase()?.trim())?.length > 1;
                                        const status = adInputValue === null ? true : adInputValue[idx] !== value;

                                        if (!hasSpecialChars && !isDuplicates && value?.length && status) {
                                            updateSmartLink(e.target.value, fields?.length - 1, idx);
                                        }
                                    }}
                                    handleOnchange={(e) => {
                                        setValue(`${fieldName}.${idx}.url`, '');
                                    }}
                                />
                            </Col>
                            <Col sm={1} className="fg-icons-wrapper pl0">
                                <div className="fg-icons">
                                    <div className="d-flex align-items-center">
                                        <RSTooltip text={`${selectIconTooltip(idx)}`}>
                                            <i
                                                className={`${selectIcon(idx)} icon-md ${
                                                    Object.keys(errors).includes('adsName') && idx === 0
                                                        ? 'click-off'
                                                        : formState?.length > 2 && !idx
                                                        ? 'click-off'
                                                        : ''
                                                }`}
                                                onClick={(e) => {
                                                    if (!idx) {
                                                        const findErrorIndex = _findIndex(
                                                            formState,
                                                            (list) => !list.name,
                                                        );
                                                        if (findErrorIndex === -1) {
                                                            append({ name: '' });
                                                        } else {
                                                            trigger(`${fieldName}.${findErrorIndex}.name`);
                                                        }
                                                    } else {
                                                        remove(idx);
                                                    }
                                                }}
                                            />
                                        </RSTooltip>
                                        {formState?.[idx]?.name && (
                                            smartLinkLoading && smartLinkLoadingIndex === idx ? (
                                                <span
                                                    className="d-inline-flex align-items-center justify-content-center ml5 mt-5"
                                                    id={`rs_AdsName_smartlink_loader_${idx}`}
                                                    style={{ minWidth: 24, minHeight: 24 }}
                                                >
                                                    <span className="segment_loader"></span>
                                                </span>
                                            ) : (
                                                <RSTooltip text={SMART_LINK_POPUP} className="ml10">
                                                    <span
                                                        onMouseDown={() => {
                                                            skipSmartLinkBlurRef.current = true;
                                                        }}
                                                    >
                                                        <RSBootstrapdown
                                                            data={smartLinks}
                                                            flatIcon
                                                            isObject
                                                            idKey="id"
                                                            fieldKey="menuLabel"
                                                            defaultItem={{
                                                                id: SMARTLINK_BOOTSTRAP_DROPDOWN_DEFAULT_ID,
                                                                menuLabel: (
                                                                    <i
                                                                        className={`${editor_smart_link_medium} icon-md`}
                                                                    />
                                                                ),
                                                            }}
                                                            showUpdate={false}
                                                            name={`smartlink-${idx}`}
                                                            className="no_caret mt-5"
                                                            popupSettings={{
                                                                popupClass: `addImportSmartLinkDropdownListContainer`,
                                                            }}
                                                            onSelect={(e) => handleSmartLinkDropdown(e, idx)}
                                                            footer={
                                                                !maxSmartLinksReached ? (
                                                                    <div
                                                                        className="dropdown-footer-item"
                                                                        onMouseDown={(e) => {
                                                                            e.preventDefault();
                                                                            e.stopPropagation();
                                                                        }}
                                                                        onClick={handleOpenWithAdd}
                                                                    >
                                                                        <span>Add Smart Link</span>
                                                                        <i className={`${circle_plus_fill_medium} icon-md color-primary-blue`} />
                                                                    </div>
                                                                ) : null
                                                            }
                                                        />
                                                    </span>
                                                </RSTooltip>
                                            )
                                        )}
                                    </div>
                                </div>
                            </Col>
                            {/* <Col sm={1}>
                                
                            </Col> */}
                        </Row>
                    </div>
                );
            })}
        </Fragment>
    );
};

export default AdsName;
