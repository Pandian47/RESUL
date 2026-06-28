import { getCarouselMultiImageSpecModalTitle, getCarouselMultiImageSpecRows } from '../constant';
import RSModal from 'Components/RSModal';
const CarouselMultiImageSpecModal = ({ show, onClose, channelType, postType }) => {
    const title = getCarouselMultiImageSpecModalTitle(channelType, postType);
    const rows = getCarouselMultiImageSpecRows(channelType, postType);

    return (
        <RSModal
            settings={{}}
            className="rs-social-carousel-spec-modal"
            size="md"
            show={show}
            handleClose={onClose}
            isBorder
            header={title}
            body={
                <div className="rs-social-carousel-spec-modal__inner">
                    <div className="rs-social-carousel-spec-modal__panel">
                        {rows.map((row, index) => (
                            <div
                                key={row.label}
                                className={
                                    index % 2 === 1
                                        ? 'rs-social-carousel-spec-modal__row rs-social-carousel-spec-modal__row--alt'
                                        : 'rs-social-carousel-spec-modal__row'
                                }
                            >
                                <span className="font-semi-bold">{row.label}</span>
                                <span className="rs-social-carousel-spec-modal__value">{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>
            }
        />
    );
};

export default CarouselMultiImageSpecModal;
