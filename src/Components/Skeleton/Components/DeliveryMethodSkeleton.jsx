import { memo } from 'react';
import PropTypes from 'prop-types';

import { SkeletonShimmer } from 'Components/Skeleton/Components/common';
import { communicationCreationSkeletonCriticalCss } from 'Components/Skeleton/pages/communication/creation/communicationCreationSkeletonCriticalCss';

const CHANNEL_LINE_COUNT = 7;
const ANALYTICS_LINE_COUNT = 5;
const FREQUENCY_TAB_COUNT = 5;

const InputLine = ({ fieldMod = 'full' }) => (
    <SkeletonShimmer
        className={`dm-skeleton__field delivery-method-skeleton__field dm-skeleton__field--${fieldMod} skeleton-shimmer--field`}
        height={24}
    />
);

const SkeletonRow = ({ labelMod = 'w72', rowMod = '', alignTop = false, children }) => (
    <div
        className={[
            'dm-skeleton__row',
            'delivery-method-skeleton__row',
            rowMod,
            alignTop ? 'dm-skeleton__row--align-top' : '',
        ]
            .filter(Boolean)
            .join(' ')}
    >
        <div className="dm-skeleton__label-col delivery-method-skeleton__label-col">
            <SkeletonShimmer
                className={`dm-skeleton__label delivery-method-skeleton__label dm-skeleton__label--${labelMod} skeleton-shimmer--label`}
                height={24}
            />
        </div>
        <div className="dm-skeleton__field-col delivery-method-skeleton__field-col">{children}</div>
    </div>
);

const SkeletonRowWithCheckbox = ({ labelMod, checkboxMod = 'w180', rowMod = 'dm-skeleton__row--with-checkbox' }) => (
    <SkeletonRow labelMod={labelMod} rowMod={rowMod} alignTop>
        <InputLine />
        <SkeletonShimmer
            className={`dm-skeleton__checkbox delivery-method-skeleton__checkbox dm-skeleton__checkbox--${checkboxMod}`}
            height={24}
        />
    </SkeletonRow>
);

const SkeletonRowTwoFields = ({ labelMod, rowMod = '' }) => (
    <SkeletonRow labelMod={labelMod} rowMod={rowMod}>
        <div className="dm-skeleton__field-pair delivery-method-skeleton__field-pair">
            <div className="dm-skeleton__field-half delivery-method-skeleton__field-half">
                <InputLine />
            </div>
            <div className="dm-skeleton__field-half delivery-method-skeleton__field-half">
                <InputLine />
            </div>
        </div>
    </SkeletonRow>
);

const FrequencyTabsSkeleton = () => (
    <div className="dm-skeleton__row delivery-method-skeleton__row dm-skeleton__row--frequency">
        <div className="dm-skeleton__label-col delivery-method-skeleton__label-col">
            <SkeletonShimmer
                className="dm-skeleton__label delivery-method-skeleton__label dm-skeleton__label--w48 skeleton-shimmer--label"
                height={24}
            />
        </div>
        <div className="dm-skeleton__field-col delivery-method-skeleton__field-col">
            <ul className="dm-skeleton__freq-tab-list delivery-method-skeleton__freq-tab-list">
                {Array.from({ length: FREQUENCY_TAB_COUNT }, (_, index) => (
                    <li key={index} className="dm-skeleton__freq-tab delivery-method-skeleton__freq-tab">
                        <SkeletonShimmer
                            className={`dm-skeleton__freq-tab-shimmer delivery-method-skeleton__freq-tab-shimmer dm-skeleton__freq-tab-shimmer--${index}`}
                            height={32}
                        />
                    </li>
                ))}
            </ul>
        </div>
    </div>
);

const InlineLines = ({ count, lineMod = 'w64' }) => (
    <div className={`dm-skeleton__inline-lines delivery-method-skeleton__inline-lines dm-skeleton__inline-lines--${lineMod}`}>
        {Array.from({ length: count }).map((_, index) => (
            <SkeletonShimmer
                key={index}
                className="dm-skeleton__inline-line delivery-method-skeleton__inline-line"
                height={24}
            />
        ))}
    </div>
);

const CoreFormSkeleton = () => (
    <>
        <SkeletonRowWithCheckbox labelMod="w68" checkboxMod="w160" rowMod="dm-skeleton__row--with-checkbox dm-skeleton__row--mt20" />
        <SkeletonRowWithCheckbox labelMod="w65" checkboxMod="w220" />
        <SkeletonRowTwoFields labelMod="w78" />
        <SkeletonRowTwoFields labelMod="w58" />
        <SkeletonRow labelMod="w60">
            <InputLine />
        </SkeletonRow>
    </>
);

const DeliveryMethodSkeleton = ({ type = 'single', embed = false }) => {
    const showChannelAndAnalytics = type === 'single' || type === 'event';
    const showRoi = type === 'single';
    const showDynamicList = type === 'event';
    const showFrequency = type === 'event';

    const skeleton = (
        <div className="dm-skeleton delivery-method-skeleton" aria-busy="true" aria-label="Loading communication plan">
            <div className="dm-skeleton__panel delivery-method-skeleton__panel">
                <CoreFormSkeleton />

                {showRoi && (
                    <SkeletonRow labelMod="w40">
                        <SkeletonShimmer className="dm-skeleton__toggle delivery-method-skeleton__toggle" borderRadius={20} height={36} />
                    </SkeletonRow>
                )}

                {showDynamicList && (
                    <SkeletonRowWithCheckbox labelMod="w55" checkboxMod="w140" />
                )}

                <SkeletonRow labelMod="w70">
                    <div className="dm-skeleton__field-pair delivery-method-skeleton__field-pair">
                        <div className="dm-skeleton__field-half delivery-method-skeleton__field-half">
                            <InputLine />
                        </div>
                        <div className="dm-skeleton__field-half delivery-method-skeleton__field-half">
                            <InputLine />
                        </div>
                    </div>
                </SkeletonRow>

                {showChannelAndAnalytics && (
                    <SkeletonRow labelMod="w52" rowMod="dm-skeleton__row--mt50">
                        <InlineLines count={CHANNEL_LINE_COUNT} lineMod="w64" />
                    </SkeletonRow>
                )}

                {showChannelAndAnalytics && (
                    <SkeletonRow labelMod="w58">
                        <InlineLines count={ANALYTICS_LINE_COUNT} lineMod="w56" />
                    </SkeletonRow>
                )}

                {showFrequency && <FrequencyTabsSkeleton />}

                {showFrequency && (
                    <SkeletonRow labelMod="w42">
                        <InputLine fieldMod="w55" />
                    </SkeletonRow>
                )}
            </div>

            <div className="dm-skeleton__footer delivery-method-skeleton__footer">
                <SkeletonShimmer className="dm-skeleton__footer-btn dm-skeleton__footer-btn--wide delivery-method-skeleton__footer-btn" height={36} />
                <SkeletonShimmer className="dm-skeleton__footer-btn delivery-method-skeleton__footer-btn" height={36} />
                <SkeletonShimmer className="dm-skeleton__footer-btn delivery-method-skeleton__footer-btn" height={36} />
            </div>
        </div>
    );

    if (embed) {
        return skeleton;
    }

    return (
        <>
            <style>{communicationCreationSkeletonCriticalCss}</style>
            <div className="communication-creation-skeleton-scope communication-creation-inline-skeleton dm-skeleton-scope">
                {skeleton}
            </div>
        </>
    );
};

DeliveryMethodSkeleton.propTypes = {
    type: PropTypes.oneOf(['single', 'event', 'multi']),
    /** When true, parent already provides scope + critical CSS (e.g. route/page skeleton). */
    embed: PropTypes.bool,
};

export default memo(DeliveryMethodSkeleton);
