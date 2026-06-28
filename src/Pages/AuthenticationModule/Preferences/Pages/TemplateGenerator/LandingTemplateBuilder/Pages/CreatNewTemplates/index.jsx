import { circle_plus_fill_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { Row } from 'react-bootstrap';
import { communicationGalleryList } from './constant';
import Card from '../Card';
import RSPager from 'Components/RSPager';
import RSSearchField from 'Components/RSSearchField';
import RSDateRangePicker from 'Components/RSDateRangePicker';

const CommunicationGallery = () => {
    const [pageState, setPageState] = useState(communicationGalleryList.data.campaignsGalleryList.slice(0, 4));
    return (
        <>
            <div className="flex-row justify-content-end my23 top-sub-heading">
                <ul className="rs-list-group-horizontal">
                    <li>
                        <RSDateRangePicker onDatePickerClosed={() => {}} />
                    </li>
                    <li>
                        <RSSearchField />
                    </li>
                    <li>
                        <i
                            className={`${circle_plus_fill_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary`}
                            id='rs_data_circle_plus_fill_edge'
                        ></i>
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
            <ul className="rs-legend mt20">
                <li>
                    <span className="rsl-status legend-drafted"></span>Not used
                </li>
                {/* <li>
                    <span className="rsl-status legend-alerted"></span>Alerted
                </li> */}
                <li>
                    <span className="rsl-status legend-scheduled"></span>Scheduled
                </li>
                <li>
                    <span className="rsl-status legend-completed"></span>Completed
                </li>
            </ul>
        </>
    );
};

export default CommunicationGallery;
