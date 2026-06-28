import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import 'Pages/KendoDocs/CommonComponents/ResKendoListbox/resKendoListbox.scss';

import { CommonSkeleton } from './SkeletonOverall';

const DEFAULT_ROW_COUNT = 6;
const LISTBOX_HEIGHT = 196;

const ListColumnSkeleton = ({ rowCount = DEFAULT_ROW_COUNT }) => (
    <div
        className="k-list border"
        style={{
            height: LISTBOX_HEIGHT,
            width: '100%',
            borderRadius: 5,
            overflow: 'hidden',
            boxSizing: 'border-box',
        }}
    >
        {Array.from({ length: rowCount }, (_, index) => (
            <div
                key={`listbox-skeleton-row-${index}`}
                style={{
                    padding: 10,
                    backgroundColor: index % 2 === 0 ? '#fff' : '#f0f5f9',
                }}
            >
                <Skeleton height={14} width={`${55 + (index % 3) * 12}%`} />
            </div>
        ))}
    </div>
);

const TransferToolbarSkeleton = () => (
    <div className="k-listbox-actions" aria-hidden="true">
        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li>
                <Skeleton width={24} height={24} />
            </li>
            <li>
                <Skeleton width={24} height={24} />
            </li>
        </ul>
    </div>
);

const KendoListboxSkeleton = ({ rowCount = DEFAULT_ROW_COUNT, attributeMode = false }) => (
    <div className="reskendolist-wrapper kendolist-wrapper" aria-busy="true" aria-live="polite">
        <div className="multiSelect">
            <div className="multiClm multiLftClm">
                <h4 className="m0 py10">
                    <Skeleton width={attributeMode ? 220 : 180} height={18} />
                </h4>
                <div className="position-relative">
                    <div className="rs-search-filter">
                        <CommonSkeleton width={31} height={31} circle />
                    </div>
                    <div className="k-listbox">
                        <ListColumnSkeleton rowCount={rowCount} />
                        <TransferToolbarSkeleton />
                    </div>
                    {!attributeMode && (
                        <div className="d-grid">
                            <div className="text-right">
                                <Skeleton width={72} height={12} />
                            </div>
                            <div className="align-items-center d-flex mt10">
                                <CommonSkeleton width={16} height={16} circle />
                                <span className="ml5 flex-fill">
                                    <Skeleton height={12} width="85%" />
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="multiClm multiRghtClm">
                <h4 className="m0 py10">
                    <Skeleton width={attributeMode ? 260 : 180} height={18} />
                </h4>
                {attributeMode && (
                    <div className="attributeDropdown">
                        <CommonSkeleton width={20} height={20} circle />
                    </div>
                )}
                <div className="position-relative">
                    <div className="k-listbox">
                        <ListColumnSkeleton rowCount={rowCount} />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

export default KendoListboxSkeleton;
