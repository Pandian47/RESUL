import { memo } from 'react';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';

const InfoRowSkeleton = ({ labelWidth = 120, valueWidth = '72%' }) => (
    <div className="info-row">
        <span className="label fs-14 d-block">
            <CommonSkeleton box height={14} width={labelWidth} stopAnimation />
        </span>
        <span className="value d-block">
            <CommonSkeleton box height={18} width={valueWidth} stopAnimation />
        </span>
    </div>
);

/** Matches Account information card — 3 columns × 3 rows + optional footer action. */
const LicenceInfoSkeleton = ({ showAction = true }) => (
    <>
        <div className="box-design p0 pref-license-info-panel-skeleton">
            <h4 className="border-bottom mb0 pb13 pt19 px19">Account information</h4>
            <div className="account-info">
                <div className="d-flex gap-4">
                    <div className="flex-1">
                        <InfoRowSkeleton labelWidth={130} valueWidth="68%" />
                        <InfoRowSkeleton labelWidth={110} valueWidth="55%" />
                        <InfoRowSkeleton labelWidth={50} valueWidth="88%" />
                    </div>
                    <div className="flex-1">
                        <InfoRowSkeleton labelWidth={75} valueWidth="62%" />
                        <InfoRowSkeleton labelWidth={65} valueWidth="58%" />
                        <InfoRowSkeleton labelWidth={115} valueWidth="52%" />
                    </div>
                    <div className="flex-1">
                        <InfoRowSkeleton labelWidth={85} valueWidth="48%" />
                        <InfoRowSkeleton labelWidth={95} valueWidth="56%" />
                        <InfoRowSkeleton labelWidth={90} valueWidth="40%" />
                    </div>
                </div>
            </div>
        </div>
        {showAction ? (
            <div className="buttons-holder gap-0 justify-content-end pref-license-info-actions-skeleton">
                <CommonSkeleton box width={220} height={36} stopAnimation />
            </div>
        ) : null}
    </>
);

export default memo(LicenceInfoSkeleton);
