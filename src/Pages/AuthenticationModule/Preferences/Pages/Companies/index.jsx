import { dateTimeFormat } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { NO_DATA_AVAILABEL } from 'Constants/GlobalConstant/Placeholders';
import { circle_grid_fill_edge_large, circle_hierarchy_fill_edge_large, circle_info_mini, circle_plus_fill_edge_large, settings_medium, user_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useMemo, useState } from 'react';
import { map as _map } from 'Utils/modules/lodashReplacements';
import { useNavigate } from 'react-router-dom';
import { Container, Row } from 'react-bootstrap';

import { useDispatch, useSelector } from 'react-redux';
import RSPager from 'Components/RSPager';
import RSTooltip from 'Components/RSTooltip';
import KendoGrid from 'Components/RSKendoGrid';
import RSPageHeader from 'Components/RSPageHeader';
import CompaniesCard from '../Companies/Component/Card';
import CompanyHierarchyGraph from './Component/HierarchyGraph';

import { getUserDetails } from 'Utils/modules/crypto';
import { clientbranchtype, licenseTypeContent } from './constants';
import { checkNewCompanyValidation, getCompanyDetails } from 'Reducers/preferences/Companies/request';
import { getGlobalClientList, getSessionId } from 'Reducers/globalState/selector';

import { updateBUByClientCompany, updateCurrentPageConfig, updatedisLicenseId } from 'Reducers/globalState/reducer';
import usePreferencesSubPageApi from 'Hooks/usePreferencesSubPageApi';
import PreferencesSubPageSkeletonGate from 'Components/Skeleton/Components/PreferencesSubPageSkeletonGate';
import {
    PREFERENCES_SUBPAGE_VARIANT,
    CompaniesListSkeleton,
    persistCompanyWizardPage,
} from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import { updateCompaniesList } from 'Reducers/preferences/Companies/reducer';

const BRANCH = { GHQ: 1, RHQ: 2, LOC: 3 };

const toBranchType = (company) => parseInt(company?.clientbranchTypeId, 10) || 0;

const isSameId = (a, b) => a != null && b != null && String(a) === String(b);

// const belongsToParent = (child, parent) =>
//   isSameId(child?.parentclientId, parent?.clientId) ||
//   isSameId(child?.parentclientId, parent?.parentclientId) ||
//   isSameId(child?.parentclientId, parent?.gid);
const belongsToParent = (child, parent) => {
  if (child?.gid != null && child?.gid !== 0) {
    if (isSameId(parent?.parentclientId, child?.gid)) {
      return true;
    }
  }
  return isSameId(child?.parentclientId, parent?.clientId);
};

// const belongsToGhQGroup = (child, ghq) =>
//   isSameId(child?.gid, ghq?.gid) || isSameId(child?.gid, ghq?.parentclientId);
// 
// const sharesGroup = (child, parent) =>
//   isSameId(child?.gid, parent?.gid) ||
//   isSameId(child?.gid, parent?.parentclientId) ||
//   isSameId(child?.parentclientId, parent?.gid);
// 
// const isGhQLinkedChild = (child, list) =>
//   list.some(
//     (parent) =>
//       toBranchType(parent) === BRANCH.GHQ &&
//       parent.clientId !== child.clientId &&
//       belongsToGhQGroup(child, parent) &&
//       toBranchType(child) !== BRANCH.GHQ,
//   );
// 
// const getGhQChildren = (parent, list) =>
//   list.filter(
//     (c) =>
//       c.clientId !== parent.clientId &&
//       belongsToGhQGroup(c, parent) &&
//       toBranchType(c) !== BRANCH.GHQ,
//   );
// 
// const getDirectChildren = (parent, list) => {
//   if (!parent) {
//     const minHidByGid = {};
//     list.forEach((c) => {
//       if (c.gid != null && c.hid != null) {
//         if (minHidByGid[c.gid] == null || c.hid < minHidByGid[c.gid]) {
//           minHidByGid[c.gid] = c.hid;
//         }
//       }
//     });
//     return list.filter((c) => {
//       const isRootByGid = c.gid == null || c.hid === minHidByGid[c.gid];
//       if (!isRootByGid) return false;
//       if (toBranchType(c) === BRANCH.LOC) {
//         const hasRhqParent = list.some(
//           (p) => toBranchType(p) === BRANCH.RHQ && belongsToParent(c, p)
//         );
//         if (hasRhqParent) return false;
//       }
//       return !isGhQLinkedChild(c, list);
//     });
//   }
// 
//   const parentType = toBranchType(parent);
// 
//   if (parentType === BRANCH.GHQ) {
//     return getGhQChildren(parent, list);
//   }
// 
//   if (parentType === BRANCH.RHQ) {
//     return list.filter(
//       (c) =>
//         sharesGroup(c, parent) &&
//         toBranchType(c) === BRANCH.LOC &&
//         belongsToParent(c, parent),
//     );
//   }
// 
//   return [];
// };

const getDirectChildren = (parent, list) => {
  if (!parent) {
    // Return all companies that do NOT have a parent in the list
    return list.filter((c) => !list.some((p) => p.clientId !== c.clientId && belongsToParent(c, p)));
  }

  // Return all direct children of the parent
  return list.filter((c) => belongsToParent(c, parent));
};

const hasDirectChildren = (company, list) => getDirectChildren(company, list).length > 0;

import { preferencesSkeletonCriticalCss } from 'Components/Skeleton/Components/preferencesSkeletonCriticalCss';

const isPreferencesApiSuccess = (status) =>
    status === true || status === 1 || status === 'true' || status === 'True';

const Companies = ({ permissions }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { clientId, isAgency, accountAdmin } = getUserDetails();
  const { userId, clientId: currClientId, departmentId } = useSelector((state) => getSessionId(state));
  const clientList = useSelector((state) => getGlobalClientList(state));

  const { addAccess, updateAccess } = permissions || {};
  
  const { companies: companiesList, isLoading: isCompanyListLoading, currentPageConfig } = useSelector(
    ({ companiesReducer }) => companiesReducer || {}
  );

  const canFetchCompanies = Boolean(accountAdmin?.clientId && userId);

  const companies = useMemo(() => {
    const list = Array.isArray(companiesList) ? companiesList : [];
    return list.map((item) => ({
      ...item,
      parentclientId: item?.parentclientId ?? item?.parentClientID ?? null,
      gid: item?.gid > 0 ? item?.gid : null
    }));
  }, [companiesList]);


  const [view, setView] = useState(true);
  const [showHierarchy, setShowHierarchy] = useState(false);
  const [pageState, setPageState] = useState([]);

  const [breadcrumb, setBreadcrumb] = useState([]); // stack of { id, name }

  const companiesApi = usePreferencesSubPageApi({
    enabled: canFetchCompanies,
    mode: 'edit',
    deps: [accountAdmin?.clientId, userId],
    fetcher: async () => {
      const res = await dispatch(
        getCompanyDetails({
          payload: {
            clientId: accountAdmin?.clientId,
            userId,
            departmentId: 0,
          },
          loading: false,
        }),
      );
      const rows = Array.isArray(res?.data) ? res.data : [];
      if (!isPreferencesApiSuccess(res?.status) || !rows.length) {
        throw new Error(res?.message || NO_DATA_AVAILABEL);
      }
      return res;
    },
  });

  const showCompaniesNoData = canFetchCompanies && companiesApi.isError;
  const showCompaniesSkeleton =
    !canFetchCompanies || companiesApi.isPageLoading || (isCompanyListLoading && !showCompaniesNoData);

  const currentParent = breadcrumb.length ? breadcrumb[breadcrumb.length - 1] : null;
  const displayedCompanies = useMemo(() => {
    const list = companies || [];
    return getDirectChildren(currentParent, list).sort((a, b) => {
      const hidA = a?.hid != null ? a.hid : Infinity;
      const hidB = b?.hid != null ? b.hid : Infinity;
      return hidA - hidB;
    });
  }, [companies, currentParent]);


  const handleDrillDown = (company) => {
    if (hasDirectChildren(company, companies || [])) {
      setBreadcrumb((prev) => [...prev, { ...company, name: company.clientName }]);
    }
  };

  const handleBack = () => {
    setBreadcrumb((prev) => prev.slice(0, -1));
  };

  // Card stats (RHQ/LOC/LOB-BU/Total entities) derived from `gid` + `departmentCount`
  const statsByClientId = useMemo(() => {
    const list = companies || [];
    const childrenByParent = new Map();
    for (const c of list) {
      const parentId = c?.gid ?? null;
      if (!childrenByParent.has(parentId)) childrenByParent.set(parentId, []);
      childrenByParent.get(parentId).push(c);
    }

    const memo = new Map();
    const countDesc = (id) => {
      if (memo.has(id)) return memo.get(id);

      const res = { RHQ: 0, LOC: 0, BU: 0 };
      memo.set(id, res);

      const children = childrenByParent.get(id) || [];
      for (const ch of children) {
        const t = parseInt(ch?.clientbranchTypeId, 10);
        if (t === 2) res.RHQ += 1;
        if (t === 3) {
          res.LOC += 1;
          res.BU += Number(ch?.departmentCount || 0);
        }

        const childKey = ch?.clientId ?? ch?.clientid;
        if (childKey != null && childKey !== id) {
          const sub = countDesc(childKey);
          res.RHQ += sub.RHQ;
          res.LOC += sub.LOC;
          res.BU += sub.BU;
        }
      }

      return res;
    };

    const out = {};
    for (const c of list) {
      const key = c.parentclientId;
      const base = countDesc(key);
      out[key] = {
        RHQ: base.RHQ || 0,
        LOC: base.LOC || 0,
        BU: base.BU || 0,
        _total: (base.RHQ || 0) + (base.LOC || 0) + (base.BU || 0)
      };
    }
    return out;
  }, [companies]);

  useEffect(() => {
    setPageState(displayedCompanies.slice(0, 6));
  }, [JSON.stringify(displayedCompanies)]);

  const onNavigate = async (state, company, add) => {
    if (!add && !company?.isActivated || !add && !company?.licenseKey) {
      const payload = {
        clientId: state?.clientId,
        userId: userId,
        departmentId: 0,
        parentClientId: accountAdmin?.clientId
      };
      dispatch(checkNewCompanyValidation(payload, navigate, company));
    } else {
      if (state?.mode === 'create') {
        dispatch(updateCurrentPageConfig({ state: state }));
        persistCompanyWizardPage(state?.page || 'NEW_COMPANY');
        navigate('/preferences/company-list/add-companies', {
          state
        });
      } else {
        let tempClientID = clientList?.find((e) => e?.clientId === state?.clientId);
        let currClient = clientList?.find((e) => e?.clientId === currClientId);
        //const result = await dispatch(getBUList({ userId, clientId: state?.clientId }, tempClientID, true));
        // if (result?.status) {

        //     dispatch(updateBUByClientCompany(tempClientID));
        // }
        dispatch(updatedisLicenseId(parseInt(state?.licenseTypeId, 10)));
        dispatch(
          updateBUByClientCompany({
            company_clientId: tempClientID,
            company_departmentList: []
            // company_departmentId: {
            //     departmentId: 0,
            //     departmentName: 'All',
            //     clientId: tempClientID?.clientId,
            // },
          })
        );

        let locationState = {
          ...state,
          currClientId: tempClientID?.clientId,
          currDepartmentId: departmentId,
          currClient: tempClientID
        };
        dispatch(updateCurrentPageConfig({ state: locationState }));
        persistCompanyWizardPage(locationState?.page || 'NEW_COMPANY');
        navigate('/preferences/company-list/add-companies', {
          state: locationState
        });
      }
    }
  };

  useEffect(() => {
    return () => {
      dispatch(updateCompaniesList([]));
    };
  }, []);

  const isToolbarDisabled =
    !addAccess ||
    (parseInt(companies?.[0]?.clientbranchTypeId, 10) === 3 && !isAgency) ||
    showCompaniesSkeleton;

  const renderCompaniesToolbar = () => (
    <div className="flex-row justify-content-end mt0 top-sub-heading">
      <ul className="rs-list-group-horizontal">
        <li>
          <RSTooltip position="top" text={showHierarchy ? 'Grid view' : 'Hierarchy view'}>
            <div className={isToolbarDisabled ? 'pe-none click-off' : ''}>
            <i
              className={`${
                showHierarchy
                  ? circle_grid_fill_edge_large
                  : circle_hierarchy_fill_edge_large
              } icon-lg color-primary-blue icon-hover-shadow-primary` }
              onClick={() => setShowHierarchy(!showHierarchy)}
            />
            </div>
          </RSTooltip>
        </li>
        <li>
          <RSTooltip position="top" text="Add" className="lh0 mt-4">
            <div className={isToolbarDisabled ? 'pe-none click-off' : ''}>
            <i
              onClick={() => {
                if (addAccess) {
                  onNavigate(
                    {
                      mode: 'create',
                      page: isAgency ? 'ACCOUNT_TYPE' : 'NEW_COMPANY',
                    },
                    {},
                    'add',
                  );
                }
              }}
              className={`${circle_plus_fill_edge_large} icon-lg color-primary-blue icon-hover-shadow-primary`}
              id="rs_data_circle_plus_fill_edge"
            />
            </div>
          </RSTooltip>
        </li>
      </ul>
    </div>
  );

  return (
    
    // Contend holder starts
    <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader
        title={`${isAgency ? 'Clients list' : 'Companies list'}`}
        isBack
        backPath="/preferences"
        isHeaderLine
        onBack={() => {
          if (breadcrumb.length > 0) {
            handleBack();
            return;
          }
          navigate('/preferences');
        }} />
      
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container fluid>
                <div className="page-content pc-company-list">
                    <Container className="px0">
                        {showCompaniesNoData ? (
                            <div className="preferences-skeleton-scope preferences-subpage-skeleton-scope">
                                <style>{preferencesSkeletonCriticalCss}</style>
                                {renderCompaniesToolbar()}
                                <CompaniesListSkeleton showNoData />
                            </div>
                        ) : (
                            <PreferencesSubPageSkeletonGate
                                variant={PREFERENCES_SUBPAGE_VARIANT.COMPANY_LIST}
                                isLoading={showCompaniesSkeleton}
                                ariaLabel="Loading companies"
                            >
                                {renderCompaniesToolbar()}
                                <Fragment>
                                {showHierarchy ?
              <div>
                                        <CompanyHierarchyGraph companies={companies} />
                                        <ul className="rs-legend mt20">
                                            <li>
                                                <span className="rsl-status legend-ghq"></span>GHQ
                                            </li>
                                            <li>
                                                <span className="rsl-status legend-rhq"></span>RHQ
                                            </li>
                                            <li>
                                                <span className="rsl-status legend-lhq"></span>LOC
                                            </li>
                                            <li>
                                                <span className="rsl-status legend-bu"></span>BU(s)
                                            </li>
                                        </ul>
                                    </div> :

              <div>
                                        {!!breadcrumb.length &&
                <div className="d-flex align-items-center mb16">
                                                <h3 className="color-primary-blue">
                                                    {breadcrumb[breadcrumb.length - 1]?.name || ''}
                                                </h3>
                                            </div>
                }
                                        <Row>
                                            {_map(pageState, (list) =>
                  <CompaniesCard
                    list={list}
                    key={list?.clientId}
                    onNavigate={onNavigate}
                    hasChildren={hasDirectChildren(list, companies)}
                    onDrillDown={handleDrillDown}
                    counts={statsByClientId?.[list?.parentclientId]} />

                  )}
                                            {/* {pageState?.length < 6 &&
                       [...Array(6 - pageState?.length)]?.map((_, idx) => (
                           <SkeletonCompaniesCard
                               key={`skeleton-${idx}`}
                               isMessage={isFailure}
                               isDataReady={isDataReady}
                           />
                       ))} */}
                                        </Row>
                                        {displayedCompanies?.length > 6 &&
                <Row>
                                                <RSPager
                    data={displayedCompanies}
                    change={(data) => setPageState(data)} />
                  
                                            </Row>
                }
                                    </div>
              }
                                {!showHierarchy && !view &&
              <div>
                                        <Row>
                                            <KendoGrid
                    data={companies}
                    column={[
                    {
                      field: 'clientName',
                      title: 'Name',
                      width: 500,
                      filter: 'text',
                      cell: ({ dataItem }) =>
                      <td>
                                                                {dataItem?.clientName?.length > 50 ?
                        <RSTooltip
                          text={dataItem?.clientName}
                          position="top">
                          
                                                                        <span>
                                                                            {truncateTitle(dataItem?.clientName, 50)}
                                                                        </span>
                                                                    </RSTooltip> :

                        <span>{dataItem?.clientName}</span>
                        }
                                                            </td>

                    },
                    {
                      field: 'ClientBranchTypeId',
                      title: 'Branch type',
                      width: 150,
                      filter: 'text',
                      cell: ({ dataItem }) => {
                        return (
                          <td>
                                                                    {clientbranchtype(
                              dataItem?.clientbranchTypeId || 0
                            )}
                                                                </td>);

                      }
                    },
                    {
                      field: 'licenseTypeId',
                      title: 'License type',
                      width: 150,
                      filter: 'text',
                      cell: ({ dataItem }) => {
                        return (
                          <td>{licenseTypeContent(dataItem?.licenseTypeId)}</td>);

                      }
                    },
                    {
                      field: 'createdDate',
                      title: 'Created on',
                      filter: 'date',
                      cell: ({ dataItem }) => {
                        return (
                          <td>
                                                                    {dateTimeFormat(
                              dataItem?.createdDate,
                              'formatDateTime'
                            )}
                                                                </td>);

                      }
                    },
                    {
                      field: 'description',
                      title: 'Action',
                      width: '165px',
                      cell: ({ dataItem }) => {
                        return (
                          <td>
                                                                    <ul
                              className={`rs-list-inline rli-space-15 ${
                              !updateAccess ? 'pe-none click-off' : ''}`
                              }>
                              
                                                                        <li>
                                                                            <RSTooltip
                                  text="Info"
                                  position="top"
                                  innerContent={false}
                                  className="lh0">
                                  
                                                                                <i
                                    onClick={() => {
                                      if (updateAccess)
                                      onNavigate(
                                        {
                                          clientId:
                                          dataItem?.clientId,
                                          mode: 'edit',
                                          licenseTypeId:
                                          dataItem?.licenseTypeId,
                                          page: 'NEW_COMPANY'
                                        },
                                        dataItem
                                      );
                                    }}
                                    className={`${circle_info_mini}  icon-md color-primary-blue`}
                                    id="rs_Companies_info">
                                  </i>
                                                                            </RSTooltip>
                                                                        </li>
                                                                        <li
                                onClick={() => {
                                  if (updateAccess)
                                  onNavigate(
                                    {
                                      clientId: dataItem?.clientId,
                                      mode: 'edit',
                                      screen: 'userrole',
                                      licenseTypeId:
                                      dataItem?.licenseTypeId,
                                      page: 'ASSIGN_ROLE'
                                    },
                                    dataItem
                                  );
                                }}>
                                
                                                                            <RSTooltip
                                  text="Users"
                                  position="top"
                                  innerContent={false}
                                  className="lh0">
                                  
                                                                                <i
                                    className={`${user_medium} icon-md color-primary-blue`}>
                                  </i>
                                                                            </RSTooltip>
                                                                        </li>
                                                                        <li
                                onClick={() => {
                                  if (updateAccess)
                                  onNavigate(
                                    {
                                      clientId: dataItem?.clientId,
                                      mode: 'edit',
                                      licenseTypeId:
                                      dataItem?.licenseTypeId,
                                      page: 'COMPANY_LOCALIZATION'
                                    },
                                    dataItem
                                  );
                                }}>
                                
                                                                            <RSTooltip
                                  text="Settings"
                                  position="top"
                                  innerContent={false}
                                  className="lh0">
                                  
                                                                                <i
                                    className={`${settings_medium} icon-md color-primary-blue`}
                                    id="rs_Companies_Settings">
                                  </i>
                                                                            </RSTooltip>
                                                                        </li>
                                                                    </ul>
                                                                </td>);

                      }
                    }]
                    }
                    pageable
                    scrollable={'scrollable'}
                    settings={{
                      total: companies?.length
                    }} />
                  
                                        </Row>
                                    </div>
              }
                                </Fragment>
                            </PreferencesSubPageSkeletonGate>
                        )}
                    </Container>
                </div>
            </Container>
            {/* Main page content block ends */}
        </div>
    // Content holder ends
  );
};

export default Companies;