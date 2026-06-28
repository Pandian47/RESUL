import { circle_arrow_right_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment } from 'react';
import RSAlert from 'Components/RSAlert';

const AlertModal = ({ show }) => {
    return (
        <RSAlert
            show={show}
            body={
                <Fragment>
                    <ul>
                        <li>
                            <i className={`${circle_arrow_right_medium} icon-md color-white cursor-normal`} />
                            <span>Web field track mode enabled.</span>
                        </li>
                    </ul>
                </Fragment>
            }
        />
    );
};

export default AlertModal;
