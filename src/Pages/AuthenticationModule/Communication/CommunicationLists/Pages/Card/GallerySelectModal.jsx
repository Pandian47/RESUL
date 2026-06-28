
import RSModal from 'Components/RSModal';
import { RSSecondaryButton } from 'Components/Buttons';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
import { CampaignPerformanceSkeleton } from 'Components/Skeleton/Skeleton';

export const GallerySelectModal = ({ show, onHide, selectedItem }) => {
    return (
        <RSModal
            show={show}
            size="lg"
            header={'Preview'}
            handleClose={onHide}
            closeTooltipPosition='left'
            body={
                <>
                    {selectedItem !== '' ? (
                        <div className="pointer-event-none" dangerouslySetInnerHTML={{ __html: selectedItem }} />
                    ) : (
                        <>
                            <NoDataAvailableRender />
                            <CampaignPerformanceSkeleton />
                        </>
                    )}
                </>
            }
            footer={
                <>
                    <RSSecondaryButton onClick={onHide}>Close</RSSecondaryButton>
                </>
            }
        />
    );
};
