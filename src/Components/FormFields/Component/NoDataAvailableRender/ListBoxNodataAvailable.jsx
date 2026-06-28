import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

const ListBoxNodataAvailable = ({ message = 'No attributes available for this table', isNoData = true }) => {
    return (
        <>
            <div className="listbox-skeleton-container">
                {/* Left ListBox Skeleton */}
                <div className="listbox-skeleton">
                    <div className="skeleton-header mt-35"></div>
                    <div className="skeleton-filter mt-35"></div>

                    <div className="skeleton-list">
                        {[1, 2, 3, 4, 5].map((item) => (
                            <div key={item} className="skeleton-item"></div>
                        ))}
                    </div>
                </div>

                {/* Center: Arrows and No Data */}
                <div className="center-skeleton mt50">
                    <div className="arrows-wrapper">
                        <div className="skeleton-arrow skeleton-arrow-right"></div>
                        <div className="skeleton-arrow skeleton-arrow-left"></div>
                    </div>
                    {isNoData && (
 <div className="no-data-message">
                        <NoDataAvailableRender message={message} />
                    </div>
                    )}
                   
                </div>

                {/* Right ListBox Skeleton */}
                <div className="listbox-skeleton">
                <div className="skeleton-header mt-35"></div>
                        <div className="skeleton-filter mt-35"></div>
                        <div className="skeleton-list">
                            {[1, 2, 3, 4, 5].map((item) => (
                                <div key={item} className="skeleton-item"></div>
                            ))}
                        </div>
                </div>
            </div>
        </>
    );
};

export default ListBoxNodataAvailable;
