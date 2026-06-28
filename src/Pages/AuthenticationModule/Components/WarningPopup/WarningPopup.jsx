import { CANCEL, NOTE, SCHEDULED_ATTRIBUTES, THE_ATTRIBUTE, WILL_ACT } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useSelector } from 'react-redux';
import { getGlobalBUList, getSessionId } from 'Reducers/globalState/selector';
const WarningPopup = ({
    show = false,
    handleClose,
    name = '',
    text = '',
    type = '',
    showCancel = false,
    isheader = true,
    customHeader,
    isPrimary = true,
    isPrimaryText = 'Proceed',
    isCloseButton = true,
    content = SCHEDULED_ATTRIBUTES,
    customSize = 'md',
    isFooter = true,
}) => {
    const { departmentId } = useSelector((state) => getSessionId(state));
    const departmentList = useSelector((state) => getGlobalBUList(state));
    const [departmentName, setDepartmentName] = useState('');

    useEffect(() => {
        if (type === 'New Attribute') {
            let temp = departmentList?.filter((item) => item.departmentId === departmentId);
            setDepartmentName(temp?.[0]?.departmentName);
        }
    }, []);

    return (
        <RSModal
            show={show}
            size={customSize}
            handleClose={handleClose}
            header={customHeader ? customHeader : isheader ? NOTE : ''}
            isCloseButton={isCloseButton}
            {...(isFooter && {
                footer: (
                    <>
                        {showCancel && (
                            <RSSecondaryButton onClick={() => handleClose(0)}>{CANCEL}</RSSecondaryButton>
                        )}
                        {isPrimary && (
                            <RSPrimaryButton
                                onClick={() => {
                                    handleClose(1);
                                }}
                            >
                                {isPrimaryText}
                            </RSPrimaryButton>
                        )}
                    </>
                ),
            })}
            body={
                <Fragment>
                    {type === 'New Attribute' && (
                        <p>
                            {THE_ATTRIBUTE} <span className="text-bold">"{name}"</span>{' '}
                            {WILL_ACT}
                        </p>
                    )}
                    {type === 'Edit Category' && <p className="text-center">{content}</p>}

                    <p className="text-center"> {text}</p>
                </Fragment>
            }
        />
    );
};

WarningPopup.propTypes = {
    handleClose: PropTypes.func,
    showCancel: PropTypes.bool,
    type: PropTypes.string,
    name: PropTypes.string,
    text: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
    header: PropTypes.string,
    isheader: PropTypes.bool,
    isPrimary: PropTypes.bool,
    isPrimaryText: PropTypes.string,
    isCloseButton: PropTypes.bool,
    content: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
};
export default WarningPopup;
