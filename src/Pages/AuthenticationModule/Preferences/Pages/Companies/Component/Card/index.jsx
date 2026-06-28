import { getPermissions, getUserDetails } from 'Utils/modules/crypto';

import { truncateTitle } from 'Utils/modules/displayCore';
import { ACCOUNT_ACIVATION_MESSAGE, ACCOUNT_ACTIVATED, ACCOUNT_ACTIVATION_INPROGRESS, ACCOUNT_NOT_ACTIVATED, ACCOUNT_STATUS, APPROVE, CLICK_HERE_TO_ACTIVATE, INFO, OK, REJECT, SETTING, USERS } from 'Constants/GlobalConstant/Placeholders';
import { circle_info_mini, settings_mini, users_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { Col } from 'react-bootstrap';
import _find from 'lodash/find';

import RSTooltip from 'Components/RSTooltip';
import { clientbranchtype, licenseTypeIcon, licenseType } from '../../constants';
import usePermission from 'Hooks/usePersmission';
import { BrandIcon, Building } from 'Assets/Images';

import RSModal from 'Components/RSModal';
import CompanyUsersModal from '../CompanyUsersModal';
import EntityInfoModal from '../EntityInfoModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getCompanyUserList, approveClientStatus, rejectClientMapping, getCompanyDetails } from 'Reducers/preferences/Companies/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';

const TYPE_STATS = {
  1: [
  { key: 'RHQ', label: 'RHQ' },
  { key: '_total', label: 'Total entities' }],

  2: [
  { key: 'LOC', label: 'LOC' },
  { key: 'BU', label: 'BU(s)' }],

  3: [{ key: 'BU', label: 'BU(s)' }]
};

const CompaniesCard = ({ list, onNavigate, hasChildren = false, onDrillDown, counts = {} }) => {

  const { permissions } = usePermission();
  const { addAccess, updateAccess } = permissions || {};
  const permissionList = getPermissions();
  const { viewAccess: userViewAccess } = _find(permissionList, { featureId: 12 });
  const { userId } = useSelector((state) => getSessionId(state));
  const dispatch = useDispatch();

  const {
    licenseTypeId,
    logoPath,
    clientName,
    createdDate = new Date(),
    clientId,
    clientbranchTypeId,
    accStatus,
    isActivated,
    parentclientId
  } = list;

  const [showUsersModal, setShowUsersModal] = useState({
    show: false,
    userList: [],
    isLoading: false,
  });

  const [showInfoModal, setShowInfoModal] = useState(false);
  const { companies: companiesList } = useSelector(
    ({ companiesReducer }) => companiesReducer || {}
  );


  const companyLogoPath = logoPath ? logoPath : BrandIcon;

  const [show, setShow] = useState(false);

  const totalEntities = Number(counts?._total || 0);
  const countsWithTotal = { ...counts, _total: totalEntities };
  const statDefs = TYPE_STATS[parseInt(clientbranchTypeId, 10)] || [];
  const visibleStats = statDefs.map((s) => ({
    ...s,
    value: countsWithTotal?.[s.key] ?? 0
  }));
  const hasAnyValue = Object.entries(countsWithTotal || {}).
  some(([key, val]) => key !== '_total' && val > 0);
  const showHandler = () => {
    setShow(true);
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleCardClick = () => {
    if (typeof onDrillDown === 'function' && isActivated && hasChildren) {
      onDrillDown(list);
      return;
    }
    if (!isActivated) {
      const normalizedMessage = (accStatus || '').trim().toLowerCase();
      if (normalizedMessage === ACCOUNT_NOT_ACTIVATED) {
        showHandler();
      } else {
        onNavigate(
          {
            clientId,
            mode: 'edit',
            clientName,
            licenseTypeId: licenseTypeId,
            page: 'NEW_COMPANY'
          },
          list
        );
      }
    }
  };

  return (
    <>
            <Col sm={4}>
                <div
          onClick={handleCardClick}
          className={`rs-card-02 rc-tl ${isActivated ? licenseType(licenseTypeId) : 'activateAlert'} ${
          hasChildren || hasAnyValue ? 'cp' : ''}`
          }>
          
                    <div className="rc-top">
                        <div className="license_type">
                            <img src={licenseTypeIcon(licenseTypeId, clientbranchTypeId)} />
                        </div>
                    </div>

                    <div className="rc-info">
                        <div className="rci-left px7">
                            <div className="company_logo">
                                <img
                  src={`data:image/jpg;base64,${companyLogoPath}`}
                  alt="Company image"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = Building;
                    e.target.classList.add('default_company_logo');
                  }}
                  className='pb10' />
                
                            </div>
                        </div>

                        <div className="rci-right">
                            <div className="rci-company d-flex align-items-center gap-2">
                                <span className="rc-company-title">
                                    {clientName?.length > 21 ?
                  <RSTooltip text={clientName} position="top">
                                            <span>{truncateTitle(clientName, 21)}</span>
                                        </RSTooltip> :

                  clientName
                  }
                                </span>
                                {clientbranchtype(clientbranchTypeId) &&
                <span className="rc-badge-grey">{clientbranchtype(clientbranchTypeId)}</span>
                }
                            </div>
                              {list?.statusId !== 10 && list?.accStatus !== ACCOUNT_ACTIVATED && <small
            className={`color-primary-blue mt5 text-left ${
            list?.accStatus === ACCOUNT_ACTIVATED ? '' : 'cursor-pointer'}`
            }>
            
                        {list?.accStatus === ACCOUNT_ACTIVATED ? '' : CLICK_HERE_TO_ACTIVATE}
                    </small>}
                        </div>
                    </div>

                  

                    {isActivated &&
          <div className="d-flex align-items-center justify-content-between mt5">
                            <div className="d-flex align-items-center text-left rc-stats-wrapper">
                                {visibleStats.map((s) =>
              <div key={s.key} className="rc-stat">
                                        <span className="rcs-num">{countsWithTotal?.[s.key] || 0}</span>
                                        <small className="rcs-label">{s.label}</small>
                                    </div>
              )}
                            </div>

                            <div className="rc-bottom d-flex align-items-center justify-content-between mt10">
                                {list?.statusId === 10 ? (
                                    <div className="d-flex align-items-center gap-2">
                                        <RSSecondaryButton 
                                            className="px10 py5" 
                                            color="green"
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                const approvePayload = { clientId: list?.clientId || list?.clientid };
                                                console.log('Approve Payload:', approvePayload, 'Original List Item:', list);
                                                dispatch(approveClientStatus(approvePayload, (res) => {
                                                    if (res?.status) {
                                                        const { accountAdmin } = getUserDetails();
                                                        dispatch(getCompanyDetails({ payload: { clientId: accountAdmin?.clientId, userId, departmentId: 0 } }));
                                                    }
                                                }));
                                            }}>
                                            {APPROVE}
                                        </RSSecondaryButton>
                                        <RSSecondaryButton 
                                            className="px10 py5" 
                                            onClick={(e) => { 
                                                e.stopPropagation(); 
                                                const rejectPayload = { 
                                                    clientId: list?.parentClientID || list?.parentclientId, 
                                                    mapClientId: list?.clientid || list?.clientId 
                                                };
                                                console.log('Reject Payload:', rejectPayload, 'Original List Item:', list);
                                                dispatch(rejectClientMapping(rejectPayload, (res) => {
                                                    if (res?.status) {
                                                        const { accountAdmin } = getUserDetails();
                                                        dispatch(getCompanyDetails({ payload: { clientId: accountAdmin?.clientId, userId, departmentId: 0 } }));
                                                    }
                                                }));
                                            }}>
                                            {REJECT}
                                        </RSSecondaryButton>
                                    </div>
                                ) : (
                                <ul
                className={`rs-list-inline rli-al-2 text-right mb0 ${
                list?.accStatus === ACCOUNT_ACTIVATION_INPROGRESS ? 'd-none' : ''}`
                }>
                
                                    <li>
                                        <RSTooltip position="top" text={INFO}>
                                            <div className={`${!updateAccess ? 'pe-none click-off' : ''}`}>
                                                <i
                        className={`${circle_info_mini} icon-mini`}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowInfoModal(true);
                          /* onNavigate(
                            {
                              clientId,
                              mode: 'edit',
                              clientName,
                              licenseTypeId,
                              page: 'NEW_COMPANY'
                            },
                            list
                          ); */
                        }} />
                      
                                            </div>
                                        </RSTooltip>
                                    </li>
                                    <li>
                                        <RSTooltip position="top" text={USERS}>
                                            <div className={`${!updateAccess || !userViewAccess ? '' : ''}`}>
                                                <i
                        className={`${users_mini} icon-mini`}
                        onClick={async (e) => {
                          e.stopPropagation();
                          setShowUsersModal({
                            show: true,
                            userList: [],
                            isLoading: true,
                          });
                          const res = await dispatch(
                            getCompanyUserList({
                              payload: { clientId, userId },
                              loading: false,
                            }),
                          );
                          setShowUsersModal({
                            show: true,
                            userList: Array.isArray(res?.data) ? res.data : [],
                            isLoading: false,
                          });


                          // onNavigate(
                          //     {
                          //         clientId,
                          //         clientName,
                          //         mode: 'edit',
                          //         licenseTypeId,
                          //         screen: 'userrole',
                          //         page: 'ASSIGN_ROLE',
                          //     },
                          //     list,
                          // );
                        }} />
                      
                                            </div>
                                        </RSTooltip>
                                    </li>
                                    <li>
                                        <RSTooltip position="top" text={SETTING}>
                                            <div className={`${!updateAccess ? 'pe-none click-off' : ''}`}>
                                                <i
                        className={`${settings_mini} icon-mini`}
                        onClick={(e) => {
                          e.stopPropagation();
                          onNavigate(
                            {
                              clientId,
                              clientName,
                              mode: 'edit',
                              licenseTypeId,
                              page: 'COMPANY_LOCALIZATION'
                            },
                            list
                          );
                        }} />
                      
                                            </div>
                                        </RSTooltip>
                                    </li>
                                </ul>
                                )}
                            </div>
                        </div>
          }
                </div>
            </Col>

            <RSModal
        show={show}
        size="md"
        header={ACCOUNT_STATUS}
        handleClose={handleClose}
        body={<h4 className="text-center mb-5">{ACCOUNT_ACIVATION_MESSAGE}</h4>}
        footer={
        <RSPrimaryButton
          onClick={() => {
            if (addAccess) {
              handleClose();
            }
          }}>
          
                        {OK}
                    </RSPrimaryButton>
        } />
      
            <CompanyUsersModal
        companyName={clientName}
        list={list}
        node={'t'}
        show={showUsersModal?.show}
        userList={showUsersModal?.userList}
        isLoading={showUsersModal?.isLoading}
        onClose={() => {
          setShowUsersModal({
            show: false,
            userList: [],
            isLoading: false,
          });
        }}
        onAdd={() => {
          setShowUsersModal({
            show: false,
            userList: [],
            isLoading: false,
          });
          onNavigate(
            {
              clientId,
              clientName,
              mode: 'edit',
              licenseTypeId,
              screen: 'userrole',
              page: 'ASSIGN_ROLE'
            },
            list
          );
        }} />
      
            <EntityInfoModal
        show={showInfoModal}
        handleClose={() => setShowInfoModal(false)}
        companyName={clientName}
        clientId={clientId}
        companiesList={companiesList} />
      
        </>);

};

export default CompaniesCard;