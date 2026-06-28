import { scolor1, scolor2 } from './constants';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
const ROW_COUNT = 5;

const RoiChartSkeleton = ({ isError = false }) => {
    const rows = Array.from({ length: ROW_COUNT });
    const sp = {
        baseColor: scolor1,
        highlightColor: scolor2,
        enableAnimation: !isError,
    };

    return (
        <div className="position-relative" style={{ maxWidth: 580, margin: '30px auto', width: '100%' }}>
            {isError ? (
                <div
                    className="position-absolute d-flex align-items-center justify-content-center w-100 h-100"
                    style={{ top: 0, left: 0, zIndex: 1, pointerEvents: 'none' }}
                >
                    <NoDataAvailableRender />
                </div>
            ) : null}
            {/* Total audience header line — mirrors the arrow ← Total audience: x → */}
            <div className="d-flex justify-content-center align-items-center mb23" style={{ gap: 8 }}>
                <Skeleton width={22} height={22} {...sp} />
                <Skeleton width={180} height={22} {...sp} />
                <Skeleton width={22} height={22} {...sp} />
            </div>

            {/* Channel rows */}
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {rows.map((_, index) => (
                    <li
                        key={index}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            height: 46,
                            marginBottom: index < ROW_COUNT - 1 ? 20 : 0,
                            overflow: 'hidden',
                            borderRadius: 4,
                        }}
                    >
                        {/* Icon + name — mirrors .attri-icon-set (min/max-width: 220px) */}
                        <div style={{ minWidth: 220, maxWidth: 220, height: '100%' }}>
                            <Skeleton height="100%" width="100%" borderRadius={0} {...sp} />
                        </div>

                        {/* Progress bar — mirrors ul.attri-progress-set (flex: 1, full width) */}
                        <div style={{ flex: 1, height: '100%' }}>
                            <Skeleton height="100%" width="100%" borderRadius={0} {...sp} />
                        </div>

                        {/* ROI value badge — mirrors .roi-value-box */}
                        <div style={{ marginLeft: 16, flexShrink: 0 }}>
                            <Skeleton height={26} width={90} borderRadius={20} {...sp} />
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default RoiChartSkeleton;
