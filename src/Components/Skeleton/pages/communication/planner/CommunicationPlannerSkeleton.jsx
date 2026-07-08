import { memo } from 'react';
import PropTypes from 'prop-types';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

import { scolor1 } from '../../../Components/constants';

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKS = 6;
const skeletonProps = { enableAnimation: false, style: { background: scolor1 } };

/** Communication › Planner — `calendarOnly` for in-page overlay (real toolbar stays visible). */
const CommunicationPlannerSkeleton = ({ showToolbar = false, calendarOnly = false }) => {
    const hideToolbar = calendarOnly || !showToolbar;

    return (
        <div className="communication-planner-skeleton">
            {!hideToolbar ? (
                <div className="flex-row justify-content-end top-sub-heading my21">
                    <div className="d-flex align-items-center gap-3">
                        <Skeleton width={190} height={32} {...skeletonProps} />
                        <Skeleton width={180} height={32} {...skeletonProps} />
                        <Skeleton circle width={32} height={32} {...skeletonProps} />
                    </div>
                </div>
            ) : null}

            <div className="box-design py19 rs-planner-calendar-skeleton">
                <div className="d-flex justify-content-between align-items-center mb26" style={{ minHeight: 32 }}>
                    <div className="d-flex align-items-center gap-2 mt-7">
                        <Skeleton width={35} height={28} {...skeletonProps} />
                        <Skeleton width={60} height={28} {...skeletonProps} />
                        <Skeleton width={35} height={28} {...skeletonProps} />
                    </div>
                     <div className="d-flex align-items-center gap-2 mt-7">
                        <Skeleton width={120} height={28} {...skeletonProps} />
                        <Skeleton width={80} height={28} {...skeletonProps} />
                    </div>
                    <div style={{ width: 128 }} aria-hidden="true" />
                </div>

                <div className="border rounded overflow-hidden mt15" style={{ borderColor: '#e0e0e0' }}>
                    <div
                        className="d-grid bg-primary-blue"
                        style={{
                            gridTemplateColumns: 'repeat(7, 1fr)',
                            borderBottom: '1px solid #eee',
                        }}
                    >
                        {DAY_LABELS.map((day) => (
                            <div
                                key={day}
                                className="d-flex justify-content-center align-items-center text-center border-end"
                                style={{ height: 39, borderColor: '#eee', color: '#fff', fontSize: 13 }}
                            >
                                {day}
                            </div>
                        ))}
                    </div>

                    <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
                        {Array.from({ length: WEEKS * 7 }, (_, index) => {
                            const col = index % 7;
                            const isSundayCol = col === 0;

                            return (
                                <div
                                    key={index}
                                    className={`border-end border-bottom ${
                                        isSundayCol ? 'bg-pink' : index % 2 === 0 ? 'bg-white' : 'bg-blue'
                                    }`}
                                    style={{ minHeight: 120, borderColor: '#e8e8e8' }}
                                    aria-hidden="true"
                                />
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
};

CommunicationPlannerSkeleton.propTypes = {
    showToolbar: PropTypes.bool,
    calendarOnly: PropTypes.bool,
};

export default memo(CommunicationPlannerSkeleton);
