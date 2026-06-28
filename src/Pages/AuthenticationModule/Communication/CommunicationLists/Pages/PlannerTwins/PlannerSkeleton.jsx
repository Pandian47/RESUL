import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/css';
import { scolor1 } from 'Components/Skeleton/Components/constants';

const PlannerSkeleton = () => {
    return (
        <div>
            {/* Top Header Bar - Right side dropdowns and plus button */}
            <div className="d-flex justify-content-end align-items-center mb21 mt-6">
                {/* Right Side - Dropdowns and Plus Button */}
                <div className="d-flex align-items-center gap-3">
                    <Skeleton width={190} height={26} style={{ background: scolor1 }} />
                    <Skeleton width={180} height={26} style={{ background: scolor1 }} className="ml5" />
                    <Skeleton circle width={32} height={32} style={{ background: scolor1 }} className='ml5' />
                </div>
            </div>

            {/* Calendar Container */}
            <div className="box-design py19">
                {/* Calendar Navigation Header */}
                <div className="d-flex justify-content-between align-items-center mb26" style={{ height: '32px' }}>
                    {/* Left Navigation */}
                    <div className="d-flex align-items-center gap-3 mt-7">
                        <Skeleton width={35} height={28} style={{ background: scolor1 }} />
                        <Skeleton width={60} height={28} style={{ background: scolor1 }} />
                        <Skeleton width={35} height={28} style={{ background: scolor1 }} />
                    </div>

                    {/* Center - Month/Year in a dropdown box */}
                    <div className="d-flex gap-2">
                        <Skeleton width={120} height={24} style={{ background: scolor1 }} />
                        <Skeleton width={80} height={24} style={{ background: scolor1 }} />
                    </div>

                    {/* Right side empty for balance */}
                    <div style={{ width: '140px' }}></div>
                </div>

                {/* Calendar Grid */}
                <div className="border rounded overflow-hidden skeleton-shimmer mt15" style={{ borderColor: scolor1 }}>
                    {/* Day Headers Row */}
                    <div className="d-grid bg-primary-blue" style={{
                        gridTemplateColumns: 'repeat(7, 1fr)',
                        // borderRight: `1px solid ${scolor1}`,
                        borderBottom: `1px solid ${scolor1}`
                    }}>
                        {Array.from({ length: 7 }, (_, index) => (
                            <div
                                className={`d-flex justify-content-center align-items-center p-2 text-center ${index < 6 ? 'border-end' : ''}`}
                                key={index}
                                style={{
                                    height: '39px',
                                    borderColor: '#eee'
                                }}
                            >
                                {/* <Skeleton width={30} height={16} style={{ background: scolor1 }} /> */}
                            </div>
                        ))}
                    </div>
                    {/* Date Cells Grid */}
                    <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                        {/* Generate 35 cells (5 weeks x 7 days) */}
                        {Array.from({ length: 42 }, (_, index) => {
                            const row = Math.floor(index / 7);
                            const col = index % 7;


                            return (
                                <div key={index} className={`position-relative d-flex flex-column p-2 s border-end
                                ${col === 6 ? 'mr-7' : ''}
                                ${row === 5 ? 'no-bottom-border' : 'border-bottom'}
                                ${[0, 7, 14, 21, 28, 35].includes(index)
                                        ? 'bg-pink'
                                        : index % 2 === 0
                                            ? 'bg-white'
                                            : 'bg-blue'
                                    }`} style={{
                                        minHeight: '145px',
                                        borderColor: scolor1 + ' !important'
                                    }}>
                                    {/* Date Number Skeleton - positioned bottom right */}
                                    {/* <div className="position-absolute" style={{ bottom: '8px', right: '8px' }}>
                                        <Skeleton width={20} height={16} style={{ background: scolor1 }} />
                                    </div> */}

                                    {/* Event Blocks - Show in specific cells matching the image */}
                                    {/* {(index === 1 || index === 2 || index === 5 || index === 14 || index === 27 ||  index === 37) && (
                                        <div className="d-flex flex-column gap-1">
                                            <Skeleton height={18} style={{ background: scolor1 }} />
                                            <Skeleton height={18} style={{ background: scolor1 }} />
                                            <Skeleton height={18} style={{ background: scolor1 }} />
                                        </div>
                                    )} */}

                                    {/* {(index === 30 || index === 32 || index === 10 || index === 7 || index === 40 || index === 19) && (
                                        <div className="d-flex flex-column gap-1">
                                            <Skeleton height={18} style={{ background: scolor1 }} />
                                            <Skeleton height={18} style={{ background: scolor1 }} />
                                            <Skeleton height={18} style={{ background: scolor1 }} />
                                            <Skeleton height={18} style={{ background: scolor1 }} />
                                        </div>
                                    )} */}

                                    {/* {(index === 15 || index === 23 || index === 17 || index === 38) && (
                                        <div className="d-flex flex-column gap-1">
                                            <Skeleton height={18} style={{ background: scolor1 }} />
                                            <Skeleton height={18} style={{ background: scolor1 }} />
                                        </div>
                                    )} */}
                                    {/* {(index === 41 || index === 20) && (
                                        <div className="d-flex flex-column gap-1">
                                            <Skeleton height={18} style={{ background: scolor1 }} />
                                            <Skeleton height={18} style={{ background: scolor1 }} />
                                            <Skeleton height={18} style={{ background: scolor1 }} />
                                            <Skeleton height={18} style={{ background: scolor1 }} />
                                            <Skeleton height={18} style={{ background: scolor1 }} />
                                        </div>
                                    )} */}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlannerSkeleton; 