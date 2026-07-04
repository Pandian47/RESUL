import { useState, useCallback, useEffect, useMemo } from 'react';
import PropTypes from 'prop-types';
import ResGrid from './index';
import ListDetailCell from './ListDetailCell';
import ResNoDataAvailable from '../ResNoDataAvailable';
import { LAYOUT_CLASSES, LIST_DETAIL_EMPTY_MESSAGES } from './config';
import ListEntityImage from './ListEntityImage';
import { getStatusCls, RESGRID_DEMO_DEFAULTS } from './ResGridDocsPreview.constants';

// ---------------------------------------------------------------------------
// Detail panels — app & brand (communication/analytics use ListDetailCell)
// ---------------------------------------------------------------------------
const AppDetailCell = ({ dataItem, onCollapse }) => {
    const devices = dataItem?.appDevices || [];
    const statusClass = getStatusCls(dataItem?.isEnabled === 'Active' ? 'Active' : 'Inactive');
    const hasDevices = devices.length > 0;

    return (
        <div className={`${LAYOUT_CLASSES.detailView} rs-grid-detail-view channel-settings ${statusClass}`}>
            <table className="grid-detail-content">
                <thead>
                    <tr>
                        <th>Mobile platform</th>
                        <th>Language</th>
                        <th>Analytics platform</th>
                        <th className="text-end">Action</th>
                    </tr>
                </thead>
                {hasDevices && (
                    <tbody>
                        {devices.map((d) => (
                            <tr key={d.id}>
                                <td>{d.appDevice}</td>
                                <td>{d.language || 'Native'}</td>
                                <td>{d.analyticsPlatforms || 'NA'}</td>
                                <td className="text-end">
                                    <div className="d-flex justify-content-end position-relative">
                                        <i className="icon-rs-delete-medium icon-md color-primary-red" />
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                )}
            </table>
            {!hasDevices && (
                <div className="resgrid-detail-empty">
                    <ResNoDataAvailable message={LIST_DETAIL_EMPTY_MESSAGES.appDevices} />
                </div>
            )}
            <div className={`${statusClass} expand-plus`}>
                <ul className="camp-icon-pannel">
                    <li>
                        <i
                            className="k-icon k-i-minus cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCollapse?.(dataItem); }}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCollapse?.(dataItem); } }}
                            aria-label="Collapse row"
                        />
                    </li>
                </ul>
            </div>
        </div>
    );
};

const BrandDetailCell = ({ dataItem, onCollapse }) => {
    const shops = dataItem?.shopsDetails || [];
    const brandStatusClass = dataItem?.status === 1 ? 'status-completed' : 'status-draft';
    const hasShops = shops.length > 0;

    return (
        <div className={`${LAYOUT_CLASSES.detailView} rs-grid-detail-view brand-shop-detail ${brandStatusClass}`}>
            <table className="grid-detail-content grid-listing-comm">
                <thead>
                    <tr>
                        <th>Shop name</th>
                        <th>Location</th>
                        <th>Status</th>
                        <th className="text-end">Actions</th>
                    </tr>
                </thead>
                {hasShops && (
                    <tbody>
                        {shops.map((shop) => {
                            const shopCls = shop.status === 1 ? 'status-completed' : 'status-draft';
                            const shopText = shop.status === 1 ? 'Active' : 'Inactive';
                            return (
                                <tr key={shop.storeID}>
                                    <td>
                                        <div className="shop-name-cell">
                                            <ListEntityImage
                                                src={shop.image}
                                                alt={shop.shortName || 'Shop'}
                                                variant="shop"
                                            />
                                            <div className="shop-name-text">
                                                <span>{shop.shortName}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        {shop.city && shop.country
                                            ? `${shop.city}, ${shop.country}`
                                            : shop.city || shop.country || 'N/A'}
                                    </td>
                                    <td>
                                        <div
                                            className={`${shopCls} communication-status`}
                                            style={{ display: 'inline-block', minWidth: 64 }}
                                        >
                                            <small>{shopText}</small>
                                        </div>
                                    </td>
                                    <td className="text-end">
                                        <ul
                                            className="rs-communication-icon"
                                            style={{ justifyContent: 'flex-end', margin: 0 }}
                                        >
                                            <li>
                                                <i className="icon-rs-pencil-edit-medium icon-md color-primary-blue" />
                                            </li>
                                            <li>
                                                <i className="icon-rs-delete-medium icon-md color-primary-red" />
                                            </li>
                                        </ul>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                )}
            </table>
            {!hasShops && (
                <div className="resgrid-detail-empty">
                    <ResNoDataAvailable message={LIST_DETAIL_EMPTY_MESSAGES.brandShops} />
                </div>
            )}
            <div className={`${brandStatusClass} expand-plus`}>
                <ul className="camp-icon-pannel">
                    <li>
                        <i
                            className="k-icon k-i-minus cursor-pointer"
                            role="button"
                            tabIndex={0}
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onCollapse?.(dataItem); }}
                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onCollapse?.(dataItem); } }}
                            aria-label="Collapse row"
                        />
                    </li>
                </ul>
            </div>
        </div>
    );
};

const BASE_GRID_PROPS = {
    sortable: false,
    pageable: false,
    scrollable: 'none',
};

const useExpandableRows = (initialData = []) => {
    const [rows, setRows] = useState(initialData);

    useEffect(() => {
        setRows(initialData);
    }, [initialData]);

    const onExpandChange = useCallback((event) => {
        const id = event.dataItem?.id;
        setRows((prev) =>
            prev.map((item) => ({
                ...item,
                expanded: item.id === id ? !event.dataItem?.expanded : false,
            })),
        );
    }, []);

    const onCollapse = useCallback((dataItem) => {
        setRows((prev) =>
            prev.map((item) =>
                item.id === dataItem?.id ? { ...item, expanded: false } : item,
            ),
        );
    }, []);

    return { rows, onExpandChange, onCollapse };
};

const resolveDetailRenderer = (section, onCollapse) => {
    if (section.renderDetail) {
        return (props) => section.renderDetail({ ...props, onCollapse });
    }

    const type = section.detailType || 'communication';

    if (type === 'app') {
        return (props) => <AppDetailCell {...props} onCollapse={onCollapse} />;
    }
    if (type === 'brand') {
        return (props) => <BrandDetailCell {...props} onCollapse={onCollapse} />;
    }
    return (props) => <ListDetailCell {...props} onCollapse={onCollapse} />;
};

const ListDemoSection = ({ section, showLoadingSections, showEmptySections }) => {
    const { rows, onExpandChange, onCollapse } = useExpandableRows(section?.data);

    const renderDetail = useMemo(
        () => resolveDetailRenderer(section, onCollapse),
        [section, onCollapse],
    );

    if (!section) return null;

    const {
        title,
        description,
        columns,
        listPreset,
        listConfig,
        skeletonVariant,
        skeletonRows,
        emptyMessage,
        emptyMessageExtended,
    } = section;

    const layoutProps = {
        ...(listPreset ? { listPreset } : {}),
        ...(listConfig ? { listConfig } : {}),
        ...(skeletonVariant ? { skeletonVariant } : {}),
    };

    const mainNumber = title?.match(/^(\d+)/)?.[1] || '';

    return (
        <>
            <section className={`${LAYOUT_CLASSES.docsPreview}__section`}>
                <h4>{title}</h4>
                {description && (
                    <p style={{ fontSize: 12, color: '#888', margin: '0 0 8px' }}>{description}</p>
                )}
                <ResGrid
                    {...BASE_GRID_PROPS}
                    layout="list"
                    data={rows}
                    columns={columns}
                    dataItemKey="id"
                    expandField="expanded"
                    onExpandChange={onExpandChange}
                    detail={renderDetail}
                    skeletonRows={skeletonRows}
                    emptyMessage={emptyMessage}
                    {...layoutProps}
                />
            </section>

            {showLoadingSections && (
                <section className={`${LAYOUT_CLASSES.docsPreview}__section`}>
                    <h4>{mainNumber}a · {title?.replace(/^\d+\s*·\s*/, '')} — Loading skeleton</h4>
                    <ResGrid
                        {...BASE_GRID_PROPS}
                        layout="list"
                        data={[]}
                        columns={columns}
                        loading
                        skeletonRows={skeletonRows}
                        {...layoutProps}
                    />
                </section>
            )}

            {showEmptySections && (
                <section className={`${LAYOUT_CLASSES.docsPreview}__section`}>
                    <h4>{mainNumber}b · {title?.replace(/^\d+\s*·\s*/, '')} — Empty state</h4>
                    <ResGrid
                        {...BASE_GRID_PROPS}
                        layout="list"
                        data={[]}
                        columns={columns}
                        skeletonRows={Math.min(skeletonRows, 3)}
                        emptyMessage={emptyMessageExtended || emptyMessage}
                        {...layoutProps}
                    />
                </section>
            )}
        </>
    );
};

ListDemoSection.propTypes = {
    section: PropTypes.object,
    showLoadingSections: PropTypes.bool,
    showEmptySections: PropTypes.bool,
};

/**
 * ResGrid documentation preview — fully driven by props.
 * Defaults: RESGRID_DEMO_DEFAULTS (all statuses + channel token colours).
 */
const ResGridDocsPreview = ({
    communication = RESGRID_DEMO_DEFAULTS.communication,
    analytics = RESGRID_DEMO_DEFAULTS.analytics,
    app = RESGRID_DEMO_DEFAULTS.app,
    brand = RESGRID_DEMO_DEFAULTS.brand,
    showLoadingSections = RESGRID_DEMO_DEFAULTS.showLoadingSections,
    showEmptySections = RESGRID_DEMO_DEFAULTS.showEmptySections,
}) => {
    const sections = [communication, analytics, app, brand].filter(Boolean);

    return (
        <div className={LAYOUT_CLASSES.docsPreview}>
            {sections.map((section) => (
                <ListDemoSection
                    key={section.title}
                    section={section}
                    showLoadingSections={showLoadingSections}
                    showEmptySections={showEmptySections}
                />
            ))}
        </div>
    );
};

ResGridDocsPreview.propTypes = {
    communication: PropTypes.object,
    analytics: PropTypes.object,
    app: PropTypes.object,
    brand: PropTypes.object,
    showLoadingSections: PropTypes.bool,
    showEmptySections: PropTypes.bool,
};

export default ResGridDocsPreview;
