import { scolor1, scolor2 } from './constants';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';
const MAP_SKELETON_HEIGHT = 300;

const MapChartSkeleton = ({ isError = false }) => {
    const sp = {
        baseColor: scolor1,
        highlightColor: scolor2,
        enableAnimation: !isError,
    };

    return (
        <div className="skeleton-span-con position-relative" style={{ width: '100%', minHeight: MAP_SKELETON_HEIGHT }}>
            {isError && (
                <div
                    className="position-absolute d-flex align-items-center justify-content-center w-100"
                    style={{
                        top: 0,
                        left: 0,
                        height: MAP_SKELETON_HEIGHT,
                        zIndex: 2,
                        pointerEvents: 'none',
                    }}
                >
                    <NoDataAvailableRender />
                </div>
            )}
            {/* Map area */}
            <Skeleton height={MAP_SKELETON_HEIGHT} width="100%" borderRadius={4} style={{ display: 'block' }} {...sp} />

            {/* Zoom controls — grouped card in top-right */}
            <div
                style={{
                    position: 'absolute',
                    top: 8,
                    right: 8,
                    background: '#ffffff',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    zIndex: 1,
                }}
            >
                {['+', '−'].map((symbol, i) => (
                    <div
                        key={symbol}
                        style={{
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: 18,
                            fontWeight: 400,
                            color: '#374151',
                            borderBottom: i === 0 ? '1px solid #e2e8f0' : 'none',
                            userSelect: 'none',
                        }}
                    >
                        {symbol}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MapChartSkeleton;
