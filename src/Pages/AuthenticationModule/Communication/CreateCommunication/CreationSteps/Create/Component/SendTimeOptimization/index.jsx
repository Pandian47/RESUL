import { CANCEL, IF_QUIET_TIME, PROCEED, SEND_TIME_OPTIMIZATION, THIS_COMMUNICATION_WILL_BE_SENT, THIS_FEATURE_IS_NOT_RECOMMENDED } from 'Constants/GlobalConstant/Placeholders';
import { circle_arrow_right_mini } from 'Constants/GlobalConstant/Glyphicons';
import PropTypes from 'prop-types';
import { Container } from 'react-bootstrap';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

const SendTimeOptimization = ({ onAgree = () => {}, oncancel }) => {
    return (
        <div className="rs-overlay-modal">
            <div className="rs-overlay-bg"></div>
            <div className="rs-overlay-content">
                <Container className="py30">
                    <h1 className='mb15'>{SEND_TIME_OPTIMIZATION}:</h1>
                    <ul>
                        <li>
                            <i className={`${circle_arrow_right_mini} icon-xs color-white`} />
                            <span>
                                {THIS_COMMUNICATION_WILL_BE_SENT}
                            </span>
                        </li>
                        <li>
                            <i className={`${circle_arrow_right_mini} icon-xs color-white`} />
                            <span>{THIS_FEATURE_IS_NOT_RECOMMENDED}</span>
                        </li>
                        <li>
                            <i className={`${circle_arrow_right_mini} icon-xs color-white`} />
                            <span>
                               {IF_QUIET_TIME}
                            </span>
                        </li>
                    </ul>
                    <div className="buttons-holder mt30">
                        <RSSecondaryButton
                            onClick={(e) => oncancel(false)}
                            className="white"
                            id="rs_SendTimeoptimization_Cancel"
                        >
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSPrimaryButton onClick={(e) => onAgree(true)} id="rs_SendTimeoptimization_agree&proceed">
                             {PROCEED}
                        </RSPrimaryButton>
                    </div>
                </Container>
            </div>
        </div>
    );
};

SendTimeOptimization.propTypes = {
    onAgree: PropTypes.func,
};

export default SendTimeOptimization;
