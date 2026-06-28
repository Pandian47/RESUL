import { circle_plus_fill_edge_large } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Row } from 'react-bootstrap';
import { communicationGalleryList } from './constant';
import { ResTemplateCard } from '../Card';
import RSPager from 'Components/RSPager';
import RSSearchField from 'Components/RSSearchField';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import SkeletonGalleryCard from 'Components/Skeleton/Components/SkeletonGalleryCard.jsx';

const CommunicationGallery = () => {
    const [pageState, setPageState] = useState(communicationGalleryList.data.campaignsGalleryList.slice(0, 4));
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate loading delay to show skeleton
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    return (
        <>
            <div className="flex-row justify-content-end top-sub-heading">
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
                            id="rs_data_circle_plus_fill_edge"
                        ></i>
                    </li>
                </ul>
            </div>
            {isLoading ? (
                <Row className="mt15 mb15">
                    {Array.from({ length: 4 }).map((_, idx) => (
                        <SkeletonGalleryCard key={`loading-skeleton-${idx}`} isLoading={isLoading} />
                    ))}
                </Row>
            ) : (
                <>
                    <Row>
                        {pageState.map((list, index) => (
                            <ResTemplateCard list={list} key={index} />
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
                            />
                        </Row>
                    )}
                </>
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
