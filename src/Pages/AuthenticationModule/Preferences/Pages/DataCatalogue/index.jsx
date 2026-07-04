import { getBrandNameUIPrintable } from 'Utils/modules/brandStorage';
import { downloadCSVcommasFile } from 'Utils/modules/download';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { AVAILABLE_ATTRIBUTES } from 'Constants/GlobalConstant/Placeholders';
import { alert_medium, circle_csv_download_edge_medium, circle_list_edge_large, circle_plus_fill_edge_large, collapse_medium, expand_mini, user_star_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useRef, useState } from 'react';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import RSPageHeader from 'Components/RSPageHeader';
import RSTabbarFluid from 'Components/RSTabberFluid';
import RSSearchField from 'Components/RSSearchField';
import DataCatalogueContext from './context';

import { DATACATALOGUE_TAB_CONFIG, filterAttributes, NEW_LEGENDS } from './constant';
import NewAttributeModal from 'Pages/AuthenticationModule/Components/NewAttributeModal';
import RSTooltip from 'Components/RSTooltip';
import TruncateCell from 'Components/RSKendoGrid/TruncateCell';
import usePermission from 'Hooks/usePersmission';

import {
    getDataAttributes,
    saveDataAttribute,
    updateCatDataAttribute,
    getAttributeById,
} from 'Reducers/preferences/datacatalogue/request';
import { update_all_loading, reset_data_catalogue } from 'Reducers/preferences/datacatalogue/reducer';
import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';
import { getSessionId } from 'Reducers/globalState/selector';
import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';
import { BRAND_ID, GRID_VIEW } from 'Constants/GlobalConstant/Placeholders';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';

const DataCatalogue = () => {
    const { state } = useLocation();
    const navigate = useNavigate();
    const { permissions } = usePermission();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
    const { addAccess, updateAccess } = permissions || {};
    const dispatch = useDispatch();

    const { dataCatalogueAttrs, classifications, loading } = useSelector(
        ({ dataCatalogueReducer }) => dataCatalogueReducer,
    );

    const [showModal, setShowModal] = useState(false);
    const [warningModal, setWarningModal] = useState({
        show: false,
        type: '',
    });
    const [editData, setEditData] = useState(null);
    const [editAttributeId, setEditAttributeId] = useState(null);
    const [isExpand, setExpand] = useState(false);
    console.log('isExpand: ', isExpand);
    const [StickyExpandInfo, setStickyExpandInfo] = useState(false);
    const [dataAttributes, setDataAttributes] = useState([]);
    const [query, setQuery] = useState('');
    const scrollRef = useRef();
    const wrapperRef = useRef();
    const expandRef = useRef(false);
    const [AvailableAttribute, setAvailableAttribute] = useState(false);

    const brandDisplayName = getBrandNameUIPrintable(departmentId) || 'Setup your brand ID';

    const renderBrandNameLabel = () => (
        <TruncatedCell value={brandDisplayName} noTable={true} />
    );

    // useEffect(()=>{

    // }, [])

    // console.log(localStorage.getItem('departmentId'), 'departmentId');

    useEffect(() => {
        window.addEventListener('scroll', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    useEffect(() => {
        if (state?.add) {
            if (state?.from === 'MDM') {
                setWarningModal({
                    show: true,
                    type: '',
                });
            } else {
                setEditData(null);
                setEditAttributeId(null);
                setShowModal(true);
            }
        }
    }, [state?.add]);

    const handleScroll = () => {
        let scrollYAxis = window.scrollY;
        let bottomHeight = window.innerHeight + scrollYAxis;
        if (scrollYAxis > 80 && !expandRef.current) {
            scrollRef.current?.classList.add('stickyScrollTop');
        } else {
            scrollRef.current?.classList.remove('stickyScrollTop');
        }
        if (bottomHeight > wrapperRef.current.clientHeight - 30 && !expandRef.current) {
            scrollRef.current?.classList.add('stickyScrollBottom');
        } else {
            scrollRef.current?.classList.remove('stickyScrollBottom');
        }
    };

    useEffect(() => {
        dispatch(reset_data_catalogue());
        dispatch(update_all_loading());
        const payload = {
            departmentId,
            clientId,
            userId,
        };
        dispatch(getDataAttributes(payload, false));
    }, [departmentId, clientId, userId]);

    useEffect(() => {
        const updateDataAttributes = filterAttributes(dataCatalogueAttrs, classifications);
        setDataAttributes(updateDataAttributes);
    }, [dataCatalogueAttrs, classifications]);

    const stickIconClass = StickyExpandInfo ? collapse_medium + ' collapseIcon' : expand_mini + ' expandIcon';

    let searchAttributeResult = dataAttributes?.filter((attr) =>
        attr?.uIPrintableName?.trim() && attr?.uIPrintableName?.toLowerCase().includes(query?.toLowerCase()),
    );
    searchAttributeResult = searchAttributeResult.sort((a, b) => a.uIPrintableName.localeCompare(b.uIPrintableName));
    const handleEditAttribute = async (data) => {
        const payload = {
            departmentId,
            clientId,
            userId,
            dataAttributeId: data,
        };
        dispatch(getAttributeById({ payload, setEditData }));
    };

    const handleSave = async (data) => {
        try {
            let response;

            if (editData) {
                response = await dispatch(updateCatDataAttribute(data, setEditData, setShowModal, false));
            } else {
                response = await dispatch(saveDataAttribute(data, true, false));
                setShowModal(false);
            }

            return response;
        } catch (error) {
            return null;
        }
    };


    const handleDownload = () => {
        const attributeName = dataAttributes?.map((attr) => attr.attributeName);
        downloadCSVcommasFile(
            attributeName,
            'DataCatelogueAttributes' + '_' + new Date().toDateString().replaceAll(' ', '_'),
        );
    };

    return (
        // Contend holder starts
        <DataCatalogueContext.Provider value={{ isExpand, setExpand, dataAttributes, setAvailableAttribute }}>
            <div className="page-content-holder data-catalogue" ref={wrapperRef}>
                {/* Main page heading block starts */}
                <RSPageHeader title="Data catalog" isBack backPath={'/preferences'} isTabber rightCommonMenus />
                {/* Main page heading block ends */}

                {/* Main page content block starts */}
                {dataCatalogueAttrs?.length > 0 || loading?.attributes ? (
                    <Container fluid>
                        <div className="page-content">
                            <Container className="px0">
                                <div className={`position-relative ${isExpand ? 'expandViewContainer' : ''}`}>
                                    <Fragment>
                                        {!StickyExpandInfo && (
                                            <Row>
                                                <div
                                                    className={
                                                        isExpand
                                                            ? 'col-sm-12 data_catalogue_tab'
                                                            : 'col-sm-9 offset-sm-3 data_catalogue_tab'
                                                    }
                                                >
                                                    <RSTabbarFluid
                                                        defaultClass={`col-md-6 `}
                                                        dynamicTab={`mb0 mini rst-left-space`}
                                                        activeClass={`active`}
                                                        tabData={DATACATALOGUE_TAB_CONFIG}
                                                        className={`rs-tabs row  ${isExpand ? 'click-off' : ''}`}
                                                        componentClassname={`col-sm-12`}
                                                        defaultTab={state?.tab || 0}
                                                    />
                                                </div>
                                            </Row>
                                        )}
                                        <Container className={`${StickyExpandInfo ? 'stickyexpandViewContainer ' : ''} px0`}>
                                            <div className={`col-sm-3 sticky`} ref={scrollRef}>
                                                <div className="flex-row justify-content-end top-sub-heading position-relative mb19 align-items-center">
                                                    <span className='align-items-center d-flex left0 m0 pl4 position-absolute'>
                                                        <h4 className="m0 pl4">{AVAILABLE_ATTRIBUTES}</h4>
                                                        {StickyExpandInfo &&
                                                            <div className={`align-items-center box-design d-flex p8 ml19 ${StickyExpandInfo ? 'no-box-shadow ' : ''}`}>
                                                                <span className={`${getBrandNameUIPrintable(departmentId) ? "bg-tertiary-blue" : ""} border-r7 d-flex px8 py6 mr8`}>
                                                                    <i
                                                                        className={`cursor-default ${getBrandNameUIPrintable(departmentId)
                                                                            ? user_star_mini
                                                                            : alert_medium
                                                                            } ${getBrandNameUIPrintable(departmentId) ? 'color-primary-grey' : 'color-primary-red'} icon-md `}
                                                                    ></i></span>
                                                                <span className='mr8'>{BRAND_ID} :</span>  {` `}
                                                                <span className='dg-brandname px15 fs15'>{renderBrandNameLabel()}</span>
                                                            </div>
                                                        }
                                                    </span>
                                                    <ul className="rs-list-group-horizontal">
                                                        <li>
                                                            <RSSearchField
                                                                placeholder="Search attributes"
                                                                searchedText={(text) => setQuery(text.toLowerCase())}
                                                                debounceOnChange={true}
                                                            // activeAlways
                                                            />
                                                        </li>

                                                        {/* <li>
                                                            <RSTooltip
                                                                position="top"
                                                                text="Attributes download CSV"
                                                                className="lh0"
                                                                innerContent={false}
                                                                tooltipOverlayClass={'toolTipOverlayZindexCSS'}
                                                            >
                                                                <i
                                                                    onClick={handleDownload}
                                                                    className={`${circle_csv_download_edge_medium} icon-md color-primary-blue icon-hover-shadow-primary`}
                                                                ></i>
                                                            </RSTooltip>
                                                        </li> */}
                                                        <li>
                                                            <RSTooltip
                                                                position="top"
                                                                text={GRID_VIEW}
                                                                className="lh0"
                                                                innerContent={false}
                                                                tooltipOverlayClass={'toolTipOverlayZindexCSS'}
                                                            >
                                                                <i
                                                                    onClick={() =>
                                                                        navigate('/preferences/data-catalogue/data-table')
                                                                    }
                                                                    className={`${circle_list_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary`}
                                                                ></i>
                                                            </RSTooltip>
                                                        </li>
                                                        <li>
                                                            <RSTooltip
                                                                position="top"
                                                                text="Add attribute"
                                                                className="lh0"
                                                                innerContent={false}
                                                                tooltipOverlayClass={'toolTipOverlayZindexCSS'}
                                                            >
                                                                <i
                                                                    id="rs_data_circle_plus_fill_edge"
                                                                    className={`${circle_plus_fill_edge_large
                                                                        } icon-lg color-primary-blue icon-hover-shadow-primary ${!addAccess ? 'click-off' : ''
                                                                        }`}
                                                                    onClick={() => {
                                                                        if (addAccess) {
                                                                            setEditData(null);
                                                                            setEditAttributeId(null);
                                                                            setShowModal(true);
                                                                        }
                                                                    }}
                                                                ></i>
                                                            </RSTooltip>
                                                        </li>
                                                    </ul>
                                                </div>
                                                {/* {!StickyExpandInfo && (
                                                    <div className="data-calatalogue-custom-search mt13">
                                                        <RSSearchField
                                                            placeholder="Search attributes"
                                                            searchedText={(text) => setQuery(text.toLowerCase())}
                                                            debounceOnChange={true}
                                                            activeAlways
                                                        />
                                                    </div>
                                                )} */}
                                                {!StickyExpandInfo &&
                                                    <div className={`align-items-center box-design d-flex p8 ${StickyExpandInfo ? 'no-box-shadow w-25' : ''}`}>
                                                        <span className={`${getBrandNameUIPrintable(departmentId) ? "bg-tertiary-blue px8" : ""} border-r7 d-flex  py6 mr8`}>
                                                            <i
                                                                className={`cursor-default ${getBrandNameUIPrintable(departmentId)
                                                                    ? user_star_mini
                                                                    : alert_medium
                                                                    } ${getBrandNameUIPrintable(departmentId) ? 'color-primary-grey' : 'color-primary-red'} icon-md `}
                                                            ></i></span>
                                                        <span className='mr8'>{BRAND_ID} :</span>  {` `}
                                                        <span className='dg-brandname px15 fs15'>{renderBrandNameLabel()}</span>
                                                    </div>
                                                }
                                                <div className={`tag-list-block box-design  ${StickyExpandInfo ? 'mt60' : 'mt25'}`}>
                                                    <div className='left-grid-inside-scrollbar pr27'>
                                                        {searchAttributeResult?.length ? (
                                                            <ul>
                                                                {searchAttributeResult.map((attr) => {
                                                                    // let getLegendDetails = _get(NEW_LEGENDS, attr?.type);
                                                                    let getLegendDetails = _get(NEW_LEGENDS, attr?.dataTypeId);
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
                                                                            onClick={() => {
                                                                                if (updateAccess) {
                                                                                    handleEditAttribute(attr.dataAttributeId);

                                                                                    // setEditData(attr);
                                                                                    setShowModal(true);
                                                                                }
                                                                            }}
                                                                        >
                                                                            <TruncateCell value={attr.uIPrintableName} noTable={true} />
                                                                            {attr?.isBrandId === 1 && (
                                                                                <i className={`${user_star_mini} icon-sm position-relative top-2 left5`} />
                                                                            )}
                                                                        </li>
                                                                    );
                                                                })}
                                                            </ul>
                                                        ) : loading.attributes ? (
                                                            <RSSkeletonTable type="tag" isCustombox />
                                                        ) : (
                                                            //<NoDataAvailableRender />
                                                            <RSSkeletonTable
                                                                text={true}
                                                                message="No data available"
                                                                type="tag"
                                                                count={5}
                                                                isCustombox
                                                            />
                                                        )}
                                                    </div>
                                                    <>
                                                        <RSTooltip
                                                            text={StickyExpandInfo ? 'Collapse' : 'Expand'}
                                                            className={`expColIcon ${StickyExpandInfo ? '' : ''}`}
                                                        >
                                                            <i
                                                                className={`${stickIconClass} ${!StickyExpandInfo ? 'icon-sm' : 'icon-md right-3 lh10'} color-primary-blue`}
                                                                onClick={() => {
                                                                    window.scrollTo(0, 0);
                                                                    setStickyExpandInfo(!StickyExpandInfo);
                                                                    expandRef.current = !expandRef.current;
                                                                }}
                                                            />
                                                        </RSTooltip>
                                                    </>
                                                </div>

                                                <ul className={`data-legend ${StickyExpandInfo ? 'float-end' : ''}`}>                                                    {/* <h6 className="p3 mb10" onClick={handleDownload}>
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
                                                </ul>
                                            </div>
                                        </Container>
                                    </Fragment>
                                </div>
                            </Container>
                        </div>
                    </Container>
                ) : (
                    <>
                        <Container>
                            <RSSkeletonTable
                                text={true}
                                message="No data available"
                                type="tag"
                                count={5}
                                isCustombox
                            />
                        </Container>
                    </>
                )}
                {/* Main page content block ends */}
                {/* {Modal} */}
                {/* {departmentId === 0 ? <WarningPopup
                    show={warningModal?.show}
                    handleClose={()=>{
                        navigate("/preferences/company-list/add-companies")
                    }
                    }
                    text={'Please add department ID to proceed'}
                    showCancel = {false}
                />
                : */}
                <WarningPopup
                    show={warningModal?.show}
                    showCancel={true}
                    handleClose={(type) => {
                        setWarningModal({
                            type: type,
                            show: false,
                        });
                        if (type === 0) {
                            setTimeout(() => {
                                setShowModal(true);
                            }, 450);
                        }
                    }}
                    text={'Would you like to proceed with existing attributes?'}
                />
                {/* } */}
                <NewAttributeModal
                    show={showModal}
                    handleClose={(status) => {
                        setShowModal(status);
                        setWarningModal({
                            show: false,
                            type: '',
                        });
                        setEditData(null);
                        setEditAttributeId(null);
                    }}
                    handleSaveAttribute={handleSave}
                    editData={editData}
                    editAttributeId={editAttributeId}
                    // catType={}
                    addAudience={false}
                />
            </div>
            {getWarningPopupMessage(failureApiErrors, dispatch)}
        </DataCatalogueContext.Provider>
        // Content holder ends
    );
};

export default DataCatalogue;
