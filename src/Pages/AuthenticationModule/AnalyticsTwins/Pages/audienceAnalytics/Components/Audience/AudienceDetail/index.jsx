import { arrow_left_medium, arrow_right_medium, circle_plus_fill_edge_large, collapse_medium, download_medium, expand_medium, menu_dot_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useRef, useState } from 'react';
import { Button, ButtonGroup, Col, Row } from 'react-bootstrap';

import RSAdvanceSearch from 'Components/AdvanceSearch';
import {
    SEARCH_CONFIG,
    SEARCH_CONFIG_AUDIENCE,
    SEARCH_FORM_STATE,
    detailedAudienceReportComponent,
    downloadIcons,
} from '../../../constants';
import Profile from './Components/Profile';
import RSTooltip from 'Components/RSTooltip';
import { BootstrapDropdown } from 'Components/RSBootstrapDropDown';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { aa_Search, aa_UserInfo, aa_audience_dataAttributes, aa_audience_timeLineview } from 'Reducers/analyticsTwins/aa360/request';
import { buildUserInfo } from '../constants';
import { HorizontalSkeleton, AudienceProfileSkeleton } from 'Components/Skeleton/Skeleton';

const AudienceDetail = ({ selectedUser, setSelectedUser, isUserDetailInitializing = false }) => {
    const [screen, setScreen] = useState(detailedAudienceReportComponent[0].name || '');
    const divRef = useRef(null);

    const Component = detailedAudienceReportComponent.find((component) => component.name === screen).component;
    const [pageWidth, setPageWidth] = useState(true);
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const [isExpand, setIsExpand] = useState(false);
    const {
        audience_details_loading,
        dataAttributes_loading,
        data_Attributes,
    } = useSelector(({ aa360ViewReducer }) => aa360ViewReducer);
    const passportId = useSelector(({ aa360ViewReducer }) => aa360ViewReducer.passportId);

    const dispatch = useDispatch();
    const lastDataAttributePassportRef = useRef(null);

    const handleDataAttributeClick = () => {
        const currentPassport = passportId;
        if (currentPassport && lastDataAttributePassportRef.current !== currentPassport) {
            const payload = {
                departmentId,
                userId,
                clientId,
                passportId: currentPassport,
            };
            dispatch(aa_audience_dataAttributes(payload));
            lastDataAttributePassportRef.current = currentPassport;
        }
    };

    const handleSearch = async (target) => {
        let { searchValue } = target;
        let payload = {
            clientId,
            departmentId,
            SearchValue: searchValue || '',
        };
        let res = await dispatch(aa_Search(payload));
        if (res?.data?.status) {
            let month = new Date().getMonth() + 1;
            let year = new Date().getFullYear();
            const payload = {
                departmentId,
                userId,
                clientId,
                passportId: res?.data?.passportId,
            };
            let [res_info, res_Time] = await Promise.allSettled([
                dispatch(aa_UserInfo(payload)),
                dispatch(
                    aa_audience_timeLineview({
                        ...payload,
                        month,
                        year,
                    }),
                ),
            ]);
            if (res_info?.status !== 'fulfilled') return;
            const data = res_info.value?.data;
            if (!data) return;
            let obj = buildUserInfo(data);
            setSelectedUser(obj);
        }
    };
    const toggleFullScreen = () => {
        if (!document.fullscreenElement) {
            divRef.current.requestFullscreen().catch(err => {})
            setIsExpand(true);
        } else {
            document.exitFullscreen().catch(err => {})
            setIsExpand(false);
        }
    };

    const isProfileLoading = audience_details_loading || isUserDetailInitializing;
    const showProfileNoData = !isProfileLoading && Object.keys(selectedUser)?.length === 0;

    return (
        <div ref={divRef} className={isExpand ? 'audience360Expand portlet-container css-scrollbar' : 'portlet-container'}>
            <div className="d-flex justify-content-between mb20">
                <div className="align-items-center d-flex">
                    <h4 className="mb0">Audience details</h4>
                </div>
                <ul className="rs-list-group-horizontal advanceSearchContainer align-items-center">
                    <li className="advanceSearchBlock ">
                        <RSAdvanceSearch
                            advanceSearchOptions={SEARCH_CONFIG}
                            disabledAdvanceOptions={['Channel', 'Campaign']}
                            config={SEARCH_CONFIG_AUDIENCE}
                            formInitialState={SEARCH_FORM_STATE}
                            searchText={handleSearch}
                            advanceSearchText={(filterValues) => {}}
                            allClearField={(item) => {}}
                            searchClearField={(item) => {}}
                            isNoFillIcon={true}
                            hideDropdown
                        />
                    </li>
                    {/*<li><i className={` ${circle_plus_fill_edge_large} icon-lg color-primary-blue`} /></li>
                    <li><i className={` ${download_medium} icon-lg color-primary-blue`} /></li>*/}
                    <li className="ml15" onClick={() => toggleFullScreen()}>
                        <RSTooltip
                            position={isExpand ? 'bottom' : 'top'}
                            text={isExpand ? 'Minimize' : 'Expand'}
                            className="lh0"
                            innerContent={!isExpand ? false : true}
                        >
                            <i
                               className={`${isExpand ? collapse_medium : expand_medium} icon-lg color-primary-blue`}
                                id="rs_AudienceDetail_expand"
                            />
                        </RSTooltip>
                    </li>
                </ul>
            </div>
            <Row className="audienceDetailBlock m0">
                {pageWidth && (
                    <Col sm={3} className="leftProfileBlock pr30 pl0">
                        {isProfileLoading ? (
                            <AudienceProfileSkeleton />
                        ) : showProfileNoData ? (
                            <AudienceProfileSkeleton showNoData />
                        ) : (
                            <Profile user={selectedUser} />
                        )}
                    </Col>
                )}
                <Col sm={pageWidth ? 9 : 12} className="rightTimelineBlock bg-quaternary-grey p0">
                    <Row>
                        <Col className="text-left ">
                            {screen === 'Data attribute (Beta)' ? <h4 className="pl15 pt15 m0">Data attributes</h4> : ' '}
                        </Col>
                        <Col className="text-right btnTab">
                            <ButtonGroup aria-label="First group">
                                {detailedAudienceReportComponent?.map((component, index) => (
                                    <RSTooltip text={component.name} key={component.name} className="lh0">
                                        <Button
                                            key={index}
                                            variant={screen === component.name ? 'primary' : 'light'}
                                            onClick={() => {
                                                setScreen(component.name);
                                                if (component.name === 'Data attribute (Beta)') {
                                                    handleDataAttributeClick();
                                                }
                                            }}
                                            disabled={component.disabled || false}
                                        >
                                            <i
                                                className={`${component.icon} icon-md`}
                                                id="rs_AudienceDeail_component"
                                            />
                                        </Button>
                                    </RSTooltip>
                                ))}
                                 <RSTooltip position="top" text="Downloads" className="lh0">
                                <div className="pe-none click-off">
                                   
                                        <div className={`btn py0 px10 border-r0 ${screen === 'Menu' ? 'btn-primary' : 'btn-light'} p0`}>
                                            <BootstrapDropdown
                                                data={downloadIcons}
                                                flatIcon
                                                defaultItem={
                                                    <i
                                                        className={`${menu_dot_medium} icon-md`}
                                                        id="rs_AudienceDetail_menu"
                                                    />
                                                }
                                                showUpdate={false}
                                                className="no_caret"
                                                alignRight
                                                onSelect={() => {}}
                                            />
                                        </div>
                                   
                                </div>
                                 </RSTooltip>
                            </ButtonGroup>
                        </Col>
                    </Row>
                    <div
                        className={`${pageWidth ? 'expandIcon' : 'expandIcon active'}`}
                        onClick={() => setPageWidth(!pageWidth)}
                    >
                        <i
                            className={`${
                                pageWidth ? arrow_left_medium : arrow_right_medium
                            } white icon-xs`}
                        ></i>
                    </div>
                    
                    { (screen === 'Data attribute (Beta)' && dataAttributes_loading) ? (
                        <div className='p15'>
                            <HorizontalSkeleton count={15} />
                        </div>
                    ) : (
                        <Component
                            selectedUser={selectedUser}
                            isUserDetailInitializing={isUserDetailInitializing}
                        />
                    )}
                      {/* {
                        Object.keys(selectedUser)?.length  ? <Component /> :  <div className='p10'><HorizontalSkeleton count={15} isError/></div>
                     } */}
                </Col>
            </Row>
        </div>
    );
};

export default AudienceDetail;
