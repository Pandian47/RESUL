import { NO_DATA_AVAILABEL } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium } from 'Constants/GlobalConstant/Glyphicons';
import PropTypes from 'prop-types';
import { RES_COMPONENT_CLASS } from '../../kendoDocsVariables';

import './resNoDataAvailable.scss';

const ResNoDataAvailable = ({
    className = '',
    message = NO_DATA_AVAILABEL,
    isShowIcon = true,
    showMessage = true,
}) => (
    <div className={`${RES_COMPONENT_CLASS.nodataBar} ${className}`.trim()}>
       <div className='border d-flex p5 border-r5'>
         {showMessage && (
            <>
                {isShowIcon && (
                    <i
                        className={`${alert_medium} icon-md res-nodata-bar__icon mr5 cursor-default`}
                        aria-hidden
                    />
                )}
                <p className='color-primary-black m0'>{message}</p>
            </>
        )}
       </div>
    </div>
);

ResNoDataAvailable.propTypes = {
    className: PropTypes.string,
    message: PropTypes.string,
    isShowIcon: PropTypes.bool,
    showMessage: PropTypes.bool,
};

export default ResNoDataAvailable;
