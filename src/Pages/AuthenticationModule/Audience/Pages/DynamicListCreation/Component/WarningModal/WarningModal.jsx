import { CANCEL, OK } from 'Constants/GlobalConstant/Placeholders';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
const WarningModal = ({ show, header, handleClose, removeRule, isCount, value, noHeader, isFooter = true }) => {
    return (
        <RSModal
            show={show}
            size={'md'}
            handleClose={handleClose}
            body={<p className="text-center">{value}</p>}
            header={header ? header : noHeader ? '' : 'Warning'}
            footer={
                !isCount &&
                isFooter && (
                    <div className="buttons-holder m0">
                        <RSSecondaryButton
                            onClick={() => {
                                handleClose();
                            }}
                        >
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            onClick={() => {
                                handleClose();
                                if (!isCount && value !== 'Select Form before Attributes') removeRule();
                            }}
                        >
                             {OK}
                        </RSPrimaryButton>
                    </div>
                )
            }
        />
    );
};

export default WarningModal;
