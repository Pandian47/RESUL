import { COLLAPSE, EDIT, EXPAND } from 'Constants/GlobalConstant/Placeholders';
import { channel_action_medium, circle_info_mini, circle_plus_fill_edge_medium, collapse_mini, communication_target_medium, expand_mini, lock_medium, offline_conversion_medium, pencil_edit_mini, tag_offer_medium, user_form_medium, user_gdpr_medium, user_overview_medium, user_profile_completeness_medium, user_question_mark_medium, user_star_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useCallback, useContext, useEffect, useState } from 'react';
import { get as _get, split as _split } from 'Utils/modules/lodashReplacements';
import { Col, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';

import EditCategoryModal from '../../Component/EditCategoryModal';
import DataCatalogueContext from '../../context';

import { NEW_LEGENDS } from '../../constant';
import RSTooltip from 'Components/RSTooltip';
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';
import usePermission from 'Hooks/usePersmission';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import { PERSONALISATION } from 'Constants/GlobalConstant/Placeholders';

const FilterGroups = ({ groupName, customText = '' }) => {
    const { filterGroups, classifications, loading } = useSelector(({ dataCatalogueReducer }) => dataCatalogueReducer);

    const { isExpand, setExpand, dataAttributes } = useContext(DataCatalogueContext);
    const [showModal, setShowModal] = useState({ classificationModalShow: false });
    const [expandIndex, setExpandIndex] = useState(null);
    const { permissions } = usePermission();
    const { updateAccess, addAccess } = permissions || {};

    useEffect(() => {}, []);

    const availableFilterGroupAttributes = useCallback(
        (item) => dataAttributes?.filter((res) => +res.filterGroupId === item.filterGroupId),
        [dataAttributes],
    );

    const availableClassificationAttributes = useCallback(
        (item) =>
            dataAttributes?.filter((res) => {
                return _split(res?.dataClassificationId ?? '', ',')
                    .map((id) => +id)
                    .includes(item?.dataClassificationId);
            }),
        [dataAttributes],
    );

    const expandClass = isExpand
        ? collapse_mini + ' collapseIcon position-relative'
        : expand_mini + ' expandIcon position-relative';

    const renderCardHeaderTitle = (title) => (
        <h4 className="m0 mt3 flex-grow-1 min-w-0 overflow-hidden pe15" style={{ flex: '1 1 0', minWidth: 0 }}>
            <TruncateCell value={title} noTable />
        </h4>
    );

    const handleExpand = (index) => {
        if (!expandIndex) setExpandIndex(index);
        else setExpandIndex(null);
    };

    const sortedfilterGroups = filterGroups.slice(0);
    sortedfilterGroups.sort(function (a, b) {
        let x = a.filterGroupName.toLowerCase();
        let y = b.filterGroupName.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    const sortedClassification = classifications.slice(0);
    sortedClassification.sort(function (a, b) {
        let x = a.dataClassificationName.toLowerCase();
        let y = b.dataClassificationName.toLowerCase();
        return x < y ? -1 : x > y ? 1 : 0;
    });

    useEffect(() => {
        const data = document.querySelector('.expandView > .tag-list-block');
        if (data) data.scrollTop = 0;
    }, [isExpand]);
    const renderIconForClassification = (classificationName) => {
        switch (classificationName) {
            case 'Advanced analytics':
                return <i className={`${channel_action_medium} icon-md color-primary-blue`} />;
            case 'Audience base':
                return <i className={`${user_form_medium} icon-md color-primary-blue`} />;
            case 'Audience overview':
                return <i className={`${user_overview_medium} icon-md color-primary-blue`} />;
            case 'Content target':
                return <i className={`${communication_target_medium} icon-md color-primary-blue`} />;
            case 'GDPR':
                return <i className={`${user_gdpr_medium} icon-md color-primary-blue`} />;
            case 'Offers':
                return <i className={`${tag_offer_medium} icon-md color-primary-blue`} />;
            case 'Offline conversion':
                return <i className={`${offline_conversion_medium} icon-md color-primary-blue`} />;
            case 'Personalisation':
                return <i className={`${user_question_mark_medium} icon-md color-primary-blue`} />;
            case 'Profile completeness':
                return <i className={`${user_profile_completeness_medium} icon-md color-primary-blue`} />;
            case 'Sensitive data':
                return <i className={`${lock_medium} icon-md color-primary-blue`} />;
            default:
                return '';
        }
    };

    return (
        <div className={`position-relative`}>
            <Col className="px5">
                <Row>
                    {groupName?.toLowerCase() === 'classification' && (
                        <div className="align-items-center d-flex mt35 mb40">
                            <Col sm={6}>
                                {loading.classificationGroup ? (
                                    <div className="align-items-center d-flex">
                                        <div
                                            className="skeleton-shimmer"
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '50%',
                                                marginRight: '10px',
                                                backgroundColor: '#eeeeee',
                                            }}
                                        ></div>
                                        <div
                                            className="skeleton-shimmer"
                                            style={{
                                                width: '500px',
                                                height: '24px',
                                                borderRadius: '5px',
                                                backgroundColor: '#eeeeee',
                                            }}
                                        ></div>
                                    </div>
                                ) : (
                                    <div className="align-items-center d-flex">
                                        <i
                                            className={`${circle_info_mini} icon-xs color-primary-blue mr10 cursor-default`}
                                        ></i>
                                        <small className="mb0 height24">{customText}</small>
                                    </div>
                                )}
                            </Col>
                        </div>
                    )}
                    {groupName.toLowerCase() === 'classification' ? (
                        loading.classificationGroup ? (
                            <>
                                {[...Array(6)].map((_, index) => (
                                    <div key={index} className="col-sm-6 data-attribute-block ">
                                        <div className="tag-list-block box-design primary-box-shadow mt0 p0 border-tlr10 border-trr10">
                                            <div className="dataCatelogue-listbox-header clearfix border-bottom">
                                                <div className="d-flex justify-content-between align-items-center px19 py15">
                                                    <div
                                                        className="skeleton-shimmer"
                                                        style={{
                                                            width: '120px',
                                                            height: '20px',
                                                            borderRadius: '5px',
                                                            backgroundColor: '#eeeeee',
                                                        }}
                                                    ></div>
                                                    <div className="d-flex justify-content-end align-items-center">
                                                        <div
                                                            className="skeleton-shimmer"
                                                            style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                borderRadius: '5px',
                                                                marginLeft: '15px',
                                                                backgroundColor: '#eeeeee',
                                                            }}
                                                        ></div>
                                                        <div
                                                            className="skeleton-shimmer"
                                                            style={{
                                                                width: '20px',
                                                                height: '20px',
                                                                borderRadius: '5px',
                                                                marginLeft: '15px',
                                                                backgroundColor: '#eeeeee',
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid-inside-scrollbar p19">
                                                <RSSkeletonTable count={5} type="tag" isCustombox />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </>
                        ) : sortedClassification?.length ? (
                            sortedClassification?.map((item, index) => {
                                const dataAvailable = availableClassificationAttributes(item);
                                const sortedData = dataAvailable.sort((a, b) =>
                                    a.uIPrintableName.localeCompare(b.uIPrintableName),
                                );
                                return (
                                    <div
                                        key={item.dataClassificationId + '+' + item.dataClassificationName}
                                        className={`
                                        ${
                                            sortedClassification?.length - 1 !== index
                                                ? 'col-sm-6'
                                                : (sortedClassification?.length - 1) % 2 === 0
                                                ? 'col-sm-12'
                                                : 'col-sm-6'
                                        }  data-attribute-block ${expandIndex === index ? 'expandView p0' : ''} `}
                                    >
                                        <div className="tag-list-block box-design primary-box-shadow mt0 p0 border-tlr10 border-trr10">
                                            <div className="dataCatelogue-listbox-header clearfix  border-bottom">
                                                {/* <i className={`icon-md float-start mt-2 mr5`}>
                                                {renderIconForClassification(item.dataClassificationName)}
                                            </i> */}
                                                <div className="d-flex justify-content-between align-items-center px19 py15 w-100">
                                                    {renderCardHeaderTitle(
                                                        item.dataClassificationName === 'Personalisation'
                                                            ? PERSONALISATION
                                                            : item.dataClassificationName,
                                                    )}
                                                    <div className="d-flex justify-content-end align-items-center flex-shrink-0">
                                                        {item.dataClassificationId !== 5 && (
                                                            <RSTooltip
                                                                position="top"
                                                                text={EDIT}
                                                                className="lh0"
                                                            >
                                                                <div
                                                                    className={`${
                                                                        sortedData?.length ? '' : ''
                                                                    } ${!updateAccess ? 'pe-none click-off' : ''}`}
                                                                >
                                                                    <i
                                                                        id="rs_data_pencil_edit"
                                                                        className={`${pencil_edit_mini} icon-sm color-primary-blue float-end `}
                                                                        onClick={() => {
                                                                            if (updateAccess) {
                                                                                setShowModal((prev) => ({
                                                                                    name:
                                                                                        item.dataClassificationName ===
                                                                                        'Personalization'
                                                                                            ? PERSONALISATION
                                                                                            : item.dataClassificationName,
                                                                                    data: sortedData,
                                                                                    classificationModalShow:
                                                                                        !prev.classificationModalShow,
                                                                                    id: item.dataClassificationId,
                                                                                    isFilter: 'C',
                                                                                }));
                                                                            }
                                                                        }}
                                                                    ></i>
                                                                </div>
                                                            </RSTooltip>
                                                        )}
                                                        <RSTooltip
                                                            text={
                                                                expandIndex === index
                                                                    ? COLLAPSE
                                                                    : EXPAND
                                                            }
                                                            // className="expColIcon"
                                                            className="lh0 ml15"
                                                        >
                                                            <i
                                                                className={`${expandClass} icon-sm color-primary-blue`}
                                                                onClick={() => {
                                                                    // window.scrollTo(0, 0);
                                                                    // setExpand(!isExpand);
                                                                    // handleExpand(index);
                                                                    const currentIndex = !isExpand ? index : null;
                                                                    window.scrollTo(0, 0);
                                                                    setExpand(!isExpand);
                                                                    handleExpand(currentIndex);
                                                                }}
                                                            />
                                                        </RSTooltip>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid-inside-scrollbar p19">
                                                <ul>
                                                    {sortedData?.length ? (
                                                        <Fragment>
                                                            {sortedData?.map((attr) => {
                                                                let getLegendDetails = _get(
                                                                    NEW_LEGENDS,
                                                                    attr?.dataTypeId,
                                                                );
                                                                let sensitive = attr?.dataClassificationId
                                                                    .split(',')
                                                                    .includes('5');
                                                                return (
                                                                    <li
                                                                        key={attr.dataAttributeId}
                                                                        className={
                                                                            sensitive
                                                                                ? `${getLegendDetails?.className} sensitiveData-CSS`
                                                                                : `${getLegendDetails?.className}`
                                                                        }
                                                                    >
                                                                        <TruncateCell value={attr.uIPrintableName} noTable={true} />
                                                                        {/* // ICON_UPDATE {Stephen}: Update the below icon */}
                                                                        {attr?.isBrandId === 1 && (
                                                                            <i
                                                                                className={`${user_star_mini} icon-sm position-relative top-2 left5`}
                                                                            />
                                                                        )}
                                                                    </li>
                                                                );
                                                            })}
                                                        </Fragment>
                                                    ) : loading.classificationGroup ? (
                                                        <RSSkeletonTable count={4} type="tag" isCustombox />
                                                    ) : (
                                                        <RSSkeletonTable
                                                            count={5}
                                                            text
                                                            message="No attributes"
                                                            type="tag"
                                                            isCustombox
                                                        />
                                                    )}
                                                </ul>
                                            </div>
                                        </div>
                                           { expandIndex === index &&  <ul className= {`float-end  data-legend mt51`}>
                                                {/* <h6 className="p3 mb10" onClick={handleDownload}>
                                                    download
                                                </h6> */}
                                                {Object.values(NEW_LEGENDS).map((legend) => (
                                                    <li key={legend.text}>
                                                        <span
                                                            /*style={{
                                                            backgroundColor: legend.color,
                                                            border: `1px solid ${legend?.borderColor}`,
                                                        }}*/
                                                            className={legend.className}
                                                        ></span>
                                                        {legend.text}
                                                    </li>
                                                ))}
                                            </ul>}
                                    </div>
                                );
                            })
                        ) : (
                            <Col>
                                <Row className="m0">
                                    <Col className="box-design mt70">
                                        <RSSkeletonTable
                                            // text={!loading.filterGroup}
                                            text={true}
                                            message="No data available"
                                            type="tag"
                                            count={10}
                                            isCustombox
                                        />
                                    </Col>
                                </Row>
                            </Col>
                        )
                    ) : loading.filterGroup ? (
                        <>
                            <div className="align-items-center d-flex mt35 mb40">
                                <Col sm={11}>
                                    <div className="align-items-center d-flex">
                                        <div
                                            className="skeleton-shimmer"
                                            style={{
                                                width: '16px',
                                                height: '16px',
                                                borderRadius: '50%',
                                                marginRight: '10px',
                                                backgroundColor: '#eeeeee',
                                            }}
                                        ></div>
                                        <div
                                            className="skeleton-shimmer"
                                            style={{
                                                width: '500px',
                                                height: '24px',
                                                borderRadius: '5px',
                                                backgroundColor: '#eeeeee',
                                            }}
                                        ></div>
                                    </div>
                                </Col>
                                <Col sm={1} className="flex-right pr1">
                                    <div
                                        className="skeleton-shimmer"
                                        style={{
                                            width: '24px',
                                            height: '24px',
                                            borderRadius: '50%',
                                            backgroundColor: '#eeeeee',
                                        }}
                                    ></div>
                                </Col>
                            </div>
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="col-sm-6 data-attribute-block">
                                    <div className="tag-list-block box-design primary-box-shadow mt0 p0 border-tlr10 border-trr10">
                                        <div className="dataCatelogue-listbox-header clearfix border-bottom">
                                            <div className="d-flex justify-content-between align-items-center px19 py15">
                                                <div
                                                    className="skeleton-shimmer"
                                                    style={{
                                                        width: '120px',
                                                        height: '20px',
                                                        borderRadius: '5px',
                                                        backgroundColor: '#eeeeee',
                                                    }}
                                                ></div>
                                                <div className="d-flex justify-content-end align-items-center">
                                                    <div
                                                        className="skeleton-shimmer"
                                                        style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '5px',
                                                            marginLeft: '15px',
                                                            backgroundColor: '#eeeeee',
                                                        }}
                                                    ></div>
                                                    <div
                                                        className="skeleton-shimmer"
                                                        style={{
                                                            width: '20px',
                                                            height: '20px',
                                                            borderRadius: '5px',
                                                            marginLeft: '15px',
                                                            backgroundColor: '#eeeeee',
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid-inside-scrollbar p19">
                                            <RSSkeletonTable count={5} type="tag" isCustombox />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    ) : sortedfilterGroups?.length ? (
                        <>
                            <div className="align-items-center d-flex mt35 mb40">
                                <Col sm={11}>
                                    <div className="align-items-center d-flex">
                                        <i
                                            className={`${circle_info_mini} icon-xs color-primary-blue mr10 cursor-default`}
                                        ></i>
                                        <small className="mb0 height24">{customText}</small>
                                    </div>
                                </Col>
                                <Col sm={1} className="flex-right pr1">
                                    <RSTooltip
                                        position="top"
                                        text="Add filter group"
                                        className="lh0"
                                        innerContent={false}
                                        tooltipOverlayClass={'toolTipOverlayZindexCSS'}
                                    >
                                        <i
                                            id="rs_data_circle_plus_fill_edge"
                                            className={`${
                                                circle_plus_fill_edge_medium
                                            } icon-md color-primary-blue icon-hover-shadow-primary ${
                                                !addAccess ? 'click-off' : ''
                                            }`}
                                            onClick={() => {
                                                if (addAccess) {
                                                    setShowModal((prev) => ({
                                                        name: '',
                                                        data: [],
                                                        classificationModalShow: !prev.classificationModalShow,
                                                        id: '',
                                                        isFilter: 'N',
                                                    }));
                                                }
                                            }}
                                        ></i>
                                    </RSTooltip>
                                </Col>
                            </div>
                            {sortedfilterGroups?.map((item, index) => {
                                const dataAvailable = availableFilterGroupAttributes(item);
                                const sortedData = dataAvailable.sort((a, b) =>
                                    a.uIPrintableName.localeCompare(b.uIPrintableName),
                                );
                                return (
                                    <div
                                        key={item.filterGroupId + '_' + item.filterGroupName}
                                        className={`${
                                            sortedfilterGroups?.length - 1 !== index
                                                ? 'col-sm-6'
                                                : (sortedfilterGroups?.length - 1) % 2 === 0
                                                ? 'col-sm-12'
                                                : 'col-sm-6'
                                        }   data-attribute-block ${expandIndex === index ? 'expandView p0' : ''}`}
                                    >
                                        <div className="tag-list-block box-design primary-box-shadow mt0 p0 border-tlr10 border-trr10">
                                            <div className="dataCatelogue-listbox-header clearfix  border-bottom">
                                                <div className="d-flex justify-content-between align-items-center px19 py15 w-100">
                                                    {renderCardHeaderTitle(item.filterGroupName)}
                                                    <div className="d-flex justify-content-end align-items-center flex-shrink-0">
                                                        <RSTooltip position="top" text={'Edit'} className="lh0">
                                                            <div
                                                                className={`${
                                                                    item.filterGroupName.toLowerCase() === 'source' || item.filterGroupName.toLowerCase() === 'versar'    // Source or Versar filter group
                                                                        ? 'pe-none click-off'
                                                                        : ''
                                                                } ${!updateAccess ? 'pe-none click-off' : ''}`}
                                                            >
                                                                <i
                                                                    id="rs_data_pencil_edit"
                                                                    className={`${pencil_edit_mini} icon-sm color-primary-blue float-end`}
                                                                    //  ${
                                                                    //     sortedData?.length ? '' : 'click-off'
                                                                    // }
                                                                    onClick={() => {
                                                                        if (updateAccess) {
                                                                            setShowModal((prev) => ({
                                                                                name: item.filterGroupName,
                                                                                data: sortedData,
                                                                                classificationModalShow:
                                                                                    !prev.classificationModalShow,
                                                                                id: item.filterGroupId,
                                                                                isFilter: 'F',
                                                                            }));
                                                                        }
                                                                    }}
                                                                ></i>
                                                            </div>
                                                        </RSTooltip>
                                                        <RSTooltip
                                                            text={expandIndex === index ? 'Collapse' : 'Expand'}
                                                            className="lh0 ml15"
                                                        >
                                                            <i
                                                                className={`${expandClass} icon-sm color-primary-blue`}
                                                                onClick={() => {
                                                                    const currentIndex = !isExpand ? index : null;
                                                                    window.scrollTo(0, 0);
                                                                    setExpand(!isExpand);
                                                                    handleExpand(currentIndex);
                                                                }}
                                                            />
                                                        </RSTooltip>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="grid-inside-scrollbar p19">
                                                {sortedData?.length ? (
                                                    <>
                                                        <ul>
                                                            {sortedData?.map((attr) => {
                                                                let getLegendDetails = _get(
                                                                    NEW_LEGENDS,
                                                                    attr?.dataTypeId,
                                                                );
                                                                let sensitive = attr?.dataClassificationId
                                                                    .split(',')
                                                                    .includes('5');
                                                                return (
                                                                    <li
                                                                        key={attr.dataAttributeId}
                                                                        className={
                                                                            sensitive
                                                                                ? `${getLegendDetails?.className} sensitiveData-CSS`
                                                                                : `${getLegendDetails?.className}`
                                                                        }
                                                                    >
                                                                        <TruncateCell value={attr.uIPrintableName} noTable={true} />
                                                                        {/* // ICON_UPDATE {Stephen}: Update the below icon */}
                                                                        {attr?.isBrandId === 1 && (
                                                                            <i
                                                                                className={`${user_star_mini} icon-sm position-relative top-2 left5`}
                                                                            />
                                                                        )}
                                                                    </li>
                                                                );
                                                            })}
                                                        </ul>
                                                    </>
                                                ) : (
                                                    <RSSkeletonTable
                                                        text
                                                        count={5}
                                                        message="No attributes"
                                                        type="tag"
                                                        isCustombox
                                                    />
                                                )}
                                            </div>
                                        </div>
                                      { expandIndex === index &&  <ul className="float-end data-legend mt51 ">
                                                {/* <h6 className="p3 mb10" onClick={handleDownload}>
                                                    download
                                                </h6> */}
                                                {Object.values(NEW_LEGENDS).map((legend) => (
                                                    <li key={legend.text}>
                                                        <span
                                                            /*style={{
                                                            backgroundColor: legend.color,
                                                            border: `1px solid ${legend?.borderColor}`,
                                                        }}*/
                                                            className={legend.className}
                                                        ></span>
                                                        {legend.text}
                                                    </li>
                                                ))}
                                            </ul>}
                                    </div>
                                );
                            })}
                        </>
                    ) : (
                        <>
                            {[...Array(6)].map((_, index) => (
                                <div key={index} className="col-sm-6 data-attribute-block mt27">
                                    <div className="tag-list-block box-design primary-box-shadow mt0 p0 border-tlr10 border-trr10">
                                        <div className="dataCatelogue-listbox-header clearfix border-bottom">
                                            <div className="d-flex justify-content-between align-items-center px19 py15">
                                                <div className="skeleton-shimmer" style={{ width: '120px', height: '20px', borderRadius: '5px', backgroundColor: '#eeeeee' }}></div>
                                                <div className="d-flex justify-content-end align-items-center">
                                                    <div className="skeleton-shimmer" style={{ width: '20px', height: '20px', borderRadius: '5px', marginLeft: '15px', backgroundColor: '#eeeeee' }}></div>
                                                    <div className="skeleton-shimmer" style={{ width: '20px', height: '20px', borderRadius: '5px', marginLeft: '15px', backgroundColor: '#eeeeee' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="grid-inside-scrollbar p19">
                                            <RSSkeletonTable
                                                count={5}
                                                type="tag"
                                                isCustombox
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                    {/* Modal */}
                    <EditCategoryModal
                        show={showModal.classificationModalShow}
                        handleClose={(status) => {
                            setShowModal(status);
                        }}
                        categoryData={showModal}
                        categoryName={showModal.name}
                        availableAttrs={showModal.data}
                    />
                </Row>
            </Col>
        </div>
    );
};

export default FilterGroups;
