import { eye_medium, filter_medium } from 'Constants/GlobalConstant/Glyphicons';
import { audienceReportTypes, view } from '../../../constants';
import { useEffect, useRef, useState } from 'react';
import ListView from './Components/ListView';
import CloudViews from './Components/CloudView';
import GridView from './Components/GridView';
import RSPager from 'Components/RSPager';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import { useForm } from 'react-hook-form';
import { Row } from 'react-bootstrap';
import { AudienceReportSkeleton } from 'Components/Skeleton/Skeleton';
import { useSelector } from 'react-redux';

const AudienceList = ({ users, onUserSelect, communicationDDL, setcampaingnShortCode }) => {
    const { control, setValue } = useForm({
        defaultValues: {
            communicationSelect: [],
        },
    });
    const {  audience_report_loading } = useSelector(({ aa360ViewReducer }) => aa360ViewReducer);

    const [spliceUsers, setSpliceUsers] = useState([]);
    const [isPaginationChange, setIsPaginationChange] = useState(false);

    useEffect(() => {
        if (users?.length) setSpliceUsers(users?.slice(0, 6));
    }, [users]);

    useEffect(() => {
        setValue(
            'communicationSelect',
            communicationDDL?.filter((item) => item.isChecked) ?? [],
        );
    }, [communicationDDL, setValue]);

    useEffect(() => {
    const checkPopupPosition = () => {
        const popup = document.querySelector('.k-animation-container.k-animation-container-shown');
        const dropdown = document.querySelector('.addImportAudienceDropdownListContainer');
        
        if (popup && dropdown) {
            const top = parseFloat(popup.style.top);
            dropdown.classList.toggle('position-top', top > 1800);
            dropdown.classList.toggle('position-bottom', top <= 1800);
        }
    };

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style' || mutation.type === 'childList') {
                checkPopupPosition();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });

    checkPopupPosition();

    return () => observer.disconnect();
}, []);

    const [state, setState] = useState({
        pathConversion: 'Path to conversion (Persona)',
        selectedType: audienceReportTypes[0],
        selectedCampaignGroups: {},
        selectedView: view[0],
    });
    const topVisitorsRef = useRef(null);

    const components = {
        'List view': ListView,
        'Cloud view': CloudViews,
        'Grid view': GridView,
    };
    const Component = components[state.selectedView] || ListView;
    const [params, setParams] = useState({
        pagination: {
            pageNo: 0,
            pageSize: 6,
        },
    });
    // console.log('asds::', params.pagination.pageNo, params.pagination.pageSize);
    const handlePageChange = (data, skip, take) => {
        setParams((pre) => ({
            ...pre,
            pagination: {
                pageNo: skip === 0 ? 1 : skip / take + 1,
                pageSize: take,
            },
        }));
    };
    useEffect(() => {
        if (topVisitorsRef.current && isPaginationChange) {
            const offset = 200;
            const topPosition = topVisitorsRef.current.getBoundingClientRect().top + window.pageYOffset - offset;
            window.scrollTo({
                top: topPosition,
                behavior: 'smooth',
            });
        }
    }, [spliceUsers]);
    return (
        <div className="portlet-container audienceCardBlock">
            <div className="d-flex justify-content-between mb15">
                <div className="align-items-center d-flex">
                    <h4 className="mb0">Audience report</h4>
                </div>
                <div className="report-dropdown">
                    {/* <BootstrapDropdown
                        className={'mr15'}
                        data={audienceReportTypes}
                        defaultItem={state.selectedType}
                        onSelect={(reportType) => {
                            UpdateState(setState, 'selectedType', reportType);
                        }}
                    /> */}
                    <RSMultiSelect
                        className={`${!users?.length ? 'click-off' : ''}`}
                        name="communicationSelect"
                        control={control}
                        data={communicationDDL}
                        dataItemKey="campaingnId"
                        textField="campaingnName"
                        label="By communication"
                        variant="checkbox"
                        showCheckboxFooter
                        selectAllLabel="Select all"
                        checkboxSaveLabel="OK"
                        checkboxCancelLabel="Cancel"
                        popupClass="addImportAudienceDropdownListContainer aa360-report-multiselect"
                        hideSelectedChips
                        handleChange={({ value }) => {
                            setcampaingnShortCode(
                                (value ?? []).map((item) => item.campaingnShortCode).filter(Boolean),
                            );
                        }}
                    />
                    {/* <BootstrapDropdown
                        className={'mr15'}
                        data={view}
                        alignRight
                        defaultItem={<i className={`${eye_medium} icon-md`} />}
                        onSelect={(view) => {
                            UpdateState(setState, 'selectedView', view);
                        }}
                    /> */}
                    {/* <div className="d-flex align-items-center">
                        <i className={`${filter_medium} icon-md`} />
                    </div> */}
                </div>
            </div>
            <h5 className="mb10" ref={topVisitorsRef}>
                Top visitors
            </h5>
            <div className="audienceCardList">
                <Row>
                    {spliceUsers?.length ? (
                        spliceUsers.map((list, index) => (
                            <Component users={list} key={index} onUserSelect={onUserSelect} />
                        ))
                    ) : users?.length ? (
                        <AudienceReportSkeleton isCardOnlySkeleton />
                    ) : (
                        <AudienceReportSkeleton isError={!audience_report_loading} isCardOnlySkeleton />
                    )}
                </Row>
                {/* <Component
                    users={users?.slice(params.pagination.pageNo, params.pagination.pageSize)}
                    onUserSelect={onUserSelect}
                /> */}
                {users?.length > 6 && (
                    <Row>
                        <RSPager
                            data={users}
                            change={(data) => {
                                setIsPaginationChange(true);
                                setSpliceUsers(data);
                            }}
                        />
                        {/* <RSPager
                            data={users?.slice(params.pagination.pageNo, params.pagination.pageSize)}
                            change={(data, skip, take) => handlePageChange(data, skip, take)}
                            total={users?.length}
                            take={params.pagination.pageSize}
                        /> */}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default AudienceList;
