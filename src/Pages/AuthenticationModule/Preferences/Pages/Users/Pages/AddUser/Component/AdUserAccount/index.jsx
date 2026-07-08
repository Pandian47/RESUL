import RSModal from 'Components/RSModal';
import { useState, useEffect } from 'react';
import RSTabbar from 'Components/RSTabber';
import { tabData } from './constant';
const ADUserModal = ({ handleClose, show: showModal }) => {
    const [show, setShow] = useState(false);

    useEffect(() => {
        setShow(showModal);
    }, [showModal]);

    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            header="AD Configuration"
            bodyClassName='custom_modal_tableTop'
            body={
                <RSTabbar
                    defaultClass={`col-md-2 tabTransparent `}
                    dynamicTab={`mb0 mini`}
                    activeClass={`active`}
                    defaultTab={1}
                    tabData={tabData(handleClose)}
                    className="rs-tabs row rst-right-align"
                    componentClassName={'mt30'}
                    disableSlidingIndicator
                />
            }
        />
    );
};

export default ADUserModal;
