import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { useEffect, useMemo, useRef, useState } from 'react';
import { PanelBar, PanelBarItem } from '@progress/kendo-react-layout';
import { useSelector } from 'react-redux';
import _isEmpty from 'lodash/isEmpty';
import _groupBy from 'lodash/groupBy';


import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

import { ensureArray } from 'Pages/AuthenticationModule/Audience/audienceDefaults';

const Notes = ({ handleClose }) => {

    const { recipientAcquisition = [] } = useSelector(({ masterDataReducer = {} }) => masterDataReducer);

    const finalListGroup = useMemo(() => {
        return _groupBy(ensureArray(recipientAcquisition), 'eventChannelName');
    }, [recipientAcquisition]);

    const [clickedOutside, setClickedOutside] = useState(false);
    const myRef = useRef();

    const handleClickOutside = (e) => {
        if (!myRef.current.contains(e.target)) {
            // setClickedOutside(true);
            handleClose(false);
        }
    };

    const handleClickInside = () => setClickedOutside(false);

    useEffect(() => {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    });

    return (
        <div ref={myRef} onClick={handleClickInside}>
            <PanelBar expandMode={'single'}>
                {_isEmpty(finalListGroup) ?
                    <ul className="panel-list css-scrollbar">
                        <NoDataAvailableRender />
                    </ul>
                    :
                    Object.keys(finalListGroup).map((item, index) => (
                        <PanelBarItem key={index} expanded={true} title={item}>
                            <ul className="panel-list css-scrollbar">
                                {ensureArray(finalListGroup[item]).map((noteItem, noteIndex) => {
                                    const { createdDate, eventChannelDescription } = noteItem ?? {};
                                    const list = (
                                        <li key={noteIndex}>
                                            <div className="heading-value text-start">
                                                <p>{eventChannelDescription ?? ''}</p>
                                                <div className="date-value">{getUserCurrentFormat(createdDate)?.dateTimeFormat}</div>
                                            </div>
                                        </li>
                                    );
                                    return list;
                                })}
                            </ul>
                        </PanelBarItem>
                    ))}
            </PanelBar>
        </div>
    );
};

export default Notes;
