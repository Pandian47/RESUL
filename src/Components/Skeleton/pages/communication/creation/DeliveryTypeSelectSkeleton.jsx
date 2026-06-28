import { memo } from 'react';
import { SkeletonShimmer, SKELETON_SHIMMER_VARIANT } from 'Components/Skeleton/Components/common';

const CARD_COUNT = 3;
const INFO_LINE_COUNT = 3;
const CARD_LABEL_WIDTHS = [120, 128, 108];
const INFO_LINE_WIDTHS = [
    [177, 170, 145],
    [174, 164, 138],
    [172, 168, 152],
];

/**
 * Planning › RSTabbar type selection — each column stacks card + description for aligned text.
 */
const DeliveryTypeSelectSkeleton = () => (
    <div
        className="cc-delivery-type-skeleton delivery-type-select-skeleton"
        aria-busy="true"
        aria-label="Loading delivery method options"
    >
        <div className="cc-delivery-type-skeleton__closed">
            <div className="cc-delivery-type-skeleton__holder">
                <div className="cc-delivery-type-skeleton__heading-col">
                    <div className="cc-delivery-type-skeleton__heading-wrap">
                        <SkeletonShimmer
                            className="cc-delivery-type-skeleton__heading delivery-type-select-skeleton__heading"
                            width={220}
                            height={23}
                        />
                    </div>
                </div>
                <ul className="cc-delivery-type-skeleton__column-list delivery-type-select-skeleton__column-list">
                    {Array.from({ length: CARD_COUNT }, (_, colIndex) => (
                        <li key={colIndex} className="cc-delivery-type-skeleton__column" aria-hidden="true">
                            <div className="cc-delivery-type-skeleton__card delivery-type-select-skeleton__card">
                                <SkeletonShimmer
                                    className="cc-delivery-type-skeleton__icon delivery-type-select-skeleton__icon"
                                    variant={SKELETON_SHIMMER_VARIANT.CIRCLE}
                                    size={45}
                                    marginBottom={12}
                                />
                                <SkeletonShimmer
                                    className="cc-delivery-type-skeleton__card-label delivery-type-select-skeleton__card-label"
                                    width={CARD_LABEL_WIDTHS[colIndex]}
                                    height={19}
                                />
                            </div>
                            <div className="cc-delivery-type-skeleton__info delivery-type-select-skeleton__info">
                                {Array.from({ length: INFO_LINE_COUNT }, (_, lineIndex) => (
                                    <SkeletonShimmer
                                        key={lineIndex}
                                        className="cc-delivery-type-skeleton__info-line"
                                        variant={SKELETON_SHIMMER_VARIANT.LINE}
                                        width={INFO_LINE_WIDTHS[colIndex][lineIndex]}
                                        height={12}
                                        marginBottom={lineIndex < INFO_LINE_COUNT - 1 ? 10 : 0}
                                    />
                                ))}
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    </div>
);

export default memo(DeliveryTypeSelectSkeleton);
