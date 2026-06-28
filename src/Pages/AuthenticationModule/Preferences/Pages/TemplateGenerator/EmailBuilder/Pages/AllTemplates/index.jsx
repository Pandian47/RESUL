import { circle_plus_fill_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { Row } from 'react-bootstrap';

import { communicationGalleryList } from './constant';
import Card from '../Card';
import RSPager from 'Components/RSPager';
import RSSearchField from 'Components/RSSearchField';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import RSTooltip from 'Components/RSTooltip';
import { useNavigate } from 'react-router-dom';
import TemplateModal from '../CreatNewTemplates/Components/Modals/Templates';

const CommunicationGallery = ({ text, id }) => {
    const navigate = useNavigate();
    const [pageState, setPageState] = useState(communicationGalleryList.data.campaignsGalleryList.slice(0, 4));
    const [templateFlag, setTemplateFlag] = useState(false);

    const handleTemplateClose = (status) => {
        if (status) {
            navigate('/preferences/template-gallery/email-builder-page');
        }
        setTemplateFlag(false);
    };
    return (
        <>
            <div className="flex-row justify-content-end my23 py10 top-sub-heading">
                <ul className="rs-list-group-horizontal">
                    <li>
                        <RSDateRangePicker onDatePickerClosed={() => {}} />
                    </li>
                    <li>
                        <RSSearchField />
                    </li>
                    <li>
                        <RSTooltip position="top" text="Create new template">
                            <i
                                 id='rs_data_circle_plus_fill_edge'
                                className={`${circle_plus_fill_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary`}
                                onClick={() => {
                                    setTemplateFlag(true);
                                }}
                            ></i>
                        </RSTooltip>
                    </li>
                </ul>
            </div>
            <Row>
                {pageState.map((list, index) => (
                    <Card list={list} key={index} />
                ))}
            </Row>
            {communicationGalleryList.data.campaignsGalleryList?.length > 4 && (
                <Row>
                    <RSPager
                        isGallery
                        data={communicationGalleryList.data.campaignsGalleryList}
                        change={(data) => {
                            setPageState(data);
                        }}
                        className="mt0"
                    />
                </Row>
            )}
         
            <TemplateModal show={templateFlag} handleClose={(status) => handleTemplateClose(status)} />
        </>
    );
};

export default CommunicationGallery;
