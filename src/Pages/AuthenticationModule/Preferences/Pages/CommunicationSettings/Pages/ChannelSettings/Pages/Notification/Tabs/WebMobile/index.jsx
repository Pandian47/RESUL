import { getUserCurrentFormat } from 'Utils/modules/dateTime';
import { truncateTitle } from 'Utils/modules/displayCore';
import { getWarningPopupMessage } from 'Utils/modules/warningPopup';
import { SELECT_APP_NAME, SELECT_DOMAIN_NAME as SELECT_DOMAIN_NAME_MSG } from 'Constants/GlobalConstant/ValidationMessage';
import { ACTIONS, ADD, APP_NAME, ARE_YOU_SURE_RESET, CREATED_BY, CREATE_DATE, DELETE, DOMAIN_NAME, EDIT, RESET, ROUTER_CONFIGURATION, SELECT_DOMAIN_NAME, WEB_MOBILE_APP_LIST } from 'Constants/GlobalConstant/Placeholders';
import { arrow_left_right_medium, delete_medium, pencil_edit_medium, restart_medium, settings_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import KendoGrid from 'Components/RSKendoGrid';
import RSKendoDropDown from 'Components/FormFields/RSKendoDropdown';

import RSTooltip from 'Components/RSTooltip';
import { useForm } from 'react-hook-form';
import { RSPrimaryButton } from 'Components/Buttons';
import usePermission from 'Hooks/usePersmission.js';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import { useSelector, useDispatch } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import {
  saveWebAppList,
  deleteWebMobileAppList,
  GetDomainAppList,
} from 'Reducers/preferences/CommunicationSettings/request';

import RSConfirmationModal from 'Components/ConfirmationModal';
import RouterConfigurationModal from './RouterConfigurationModal';


const normalizeDomain = (item) => ({
  domainName: item?.domainName,
  webNotifySettingId: item?.settingId,
  webName: item?.webName
});
const normalizeApp = (item) => ({
  appName: item?.appName,
  pushNotifySettingID: item?.settingId,
  appId: item?.appId
});

const WebMobile = () => {
  const dispatch = useDispatch();
  const domainAppListApi = useApiLoader({ autoFetch: false });
  const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
  const isSaveLoading = saveApi.isFetching;
  const { control, handleSubmit, reset, setValue, clearErrors, watch } = useForm({
    defaultValues: {
      domainName: '',
      appName: '',
    },
    mode: 'onSubmit',
  });

  const { failureApiErrors } = useSelector(({ globalstate }) => globalstate);
  const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
  const [initialPagination, setInitialPagination] = useState(false);
  const [showConfig, setShowConfig] = useState({ show: false, data: {} });
  const [isDelete, setIsDelete] = useState({
    show: false,
    data: {},
  });
  const [showResetModal, setShowResetModal] = useState(false);

  const sessionPayload = useMemo(
    () => ({ clientId, userId, departmentId }),
    [clientId, userId, departmentId],
  );
  const sessionReady = Boolean(clientId && userId && departmentId);

  const apiResponse = domainAppListApi.data;
  const gridList = useMemo(
    () => (apiResponse?.status ? apiResponse?.data?.domainAppList ?? [] : []),
    [apiResponse],
  );
  const domainList = useMemo(
    () => (apiResponse?.status ? (apiResponse?.data?.domainList ?? []).map(normalizeDomain) : []),
    [apiResponse],
  );
  const appList = useMemo(
    () => (apiResponse?.status ? (apiResponse?.data?.appList ?? []).map(normalizeApp) : []),
    [apiResponse],
  );

  const reloadDomainAppList = useCallback(() => {
    if (!sessionReady) return undefined;
    return domainAppListApi.refetch({
      fetcher: (params) => dispatch(GetDomainAppList(params)),
      mode: 'create',
      loaderConfig: fieldLoaderConfig,
      params: sessionPayload,
    });
  }, [sessionReady, sessionPayload, dispatch, domainAppListApi.refetch]);

  useEffect(() => {
    reloadDomainAppList();
  }, [clientId, userId, departmentId, reloadDomainAppList]);

  const { permissions } = usePermission();
  const { addAccess, deleteAccess, updateAccess } = permissions || {};

  const [editState, setEditState] = useState(null);

  // Watch form values to detect changes
  const watchedDomainName = watch('domainName');
  const watchedAppName = watch('appName');

  // Check if form values have changed from edit state
  const hasChanges = useMemo(() => {
    if (!editState) return true;

    const getIds = (arr, key) =>
      (arr ?? []).
        map((item) => item?.[key]).
        filter(Boolean).
        sort();

    return (
      JSON.stringify(getIds(watchedDomainName, 'webNotifySettingId')) !==
      JSON.stringify(getIds(editState?.domainNam, 'webNotifySettingId')) ||
      JSON.stringify(getIds(watchedAppName, 'pushNotifySettingID')) !==
      JSON.stringify(getIds(editState?.appNam, 'pushNotifySettingID')));

  }, [editState, watchedDomainName, watchedAppName]);

  const handleFormSubmit = async (data) => {

    // Build payload matching the expected API structure

    const payload = {
      clientId,
      userId,
      departmentId,
      createdBy: userId,
      webName: data.domainName?.webName || '',
      domainName: data.domainName?.domainName || '',
      appName: data.appName?.appName || '',
      appId: data.appName?.appId || ''
      // dAI: editState?.domainAppId || isDelete?.data?.domainAppId || 0
    };

    // Call API once with the complete payload
    const { status } = await saveApi.refetch({
      fetcher: () => dispatch(saveWebAppList(payload)),
      loaderConfig: fieldLoaderConfig,
      mode: 'create',
    });

    if (status) {
      reset((formState) => ({
        ...formState,
        domainName: '',
        appName: ''
      }));
      setEditState(null);
      reloadDomainAppList();
    }
  };

  const handleEdit = (dataItem) => {
    if (updateAccess) {
      // Set edit state
      setEditState(dataItem);

      // Clear any existing validation errors
      clearErrors(['domainName', 'appName']);

      // Populate domain dropdown with selected domains
      const selectedDomains = dataItem?.domainNam || [];
      setValue('domainName', selectedDomains, { shouldValidate: false });

      // Populate app dropdown with selected apps
      const selectedApps = dataItem?.appNam || [];
      setValue('appName', selectedApps, { shouldValidate: false });
    }
  };

  const handleDelete = async (data) => {
    // Build payload with only domainAppId as per API requirement
    const payload = {
      domainAppId: data?.id,
      clientId,
      userId,
      departmentId
    };

    setIsDelete({
      show: false,
      data: null
    });

    const { status } = await dispatch(deleteWebMobileAppList(payload));

    if (status) {
      await reloadDomainAppList();
      setIsDelete({
        show: false,
        data: {}
      });
    } else {
      setIsDelete({
        show: false,
        data: {}
      });
    }
  };
  return (
    <div className="rsv-tabs-content">
      <div className="box-design bd-top-border">
        {/* Content starts */}
        <div className="form-group mt21 pl2">
          {' '}
          <form onSubmit={handleSubmit(handleFormSubmit)}>
            <Row className="align-items-center">
              {/* <Col sm={1} className="text-right"> */}
              {/* <label className="control-label-left">{WEB_MOBILE_APP_LIST}</label> */}
              {/* </Col> */}
              <Col sm={4} id="rs_WebMobile_domainName" className='position-relative top7'>
                {/* <RSMultiSelect
                     control={control}
                     name="domainName"
                     label={DOMAIN_NAME}
                     textField="domainName"
                     dataItemKey="webNotifySettingId"
                     data={domainList}
                     required
                     rules={{
                         required: SELECT_DOMAIN_NAME_MSG,
                     }}
                  /> */}
                <RSKendoDropDown
                  label={DOMAIN_NAME}
                  control={control}
                  name="domainName"
                  data={domainList}
                  textField="webName"
                  dataItemKey="webNotifySettingId"
                  isLoading={domainAppListApi.isLoading}
                  required
                  rules={{
                    required: SELECT_DOMAIN_NAME_MSG,
                  }}
                />
              </Col>
              <Col sm={1} className="text-center position-relative top7">
                <i
                  className={`${arrow_left_right_medium} icon-md position-relative top8 color-primary-blue`} />

              </Col>
              <Col sm={4} id="rs_WebMobile_appName" className='position-relative top7'>
                {/* <RSMultiSelect
                     control={control}
                     name="appName"
                     label={APP_NAME}
                     textField="appName"
                     dataItemKey="pushNotifySettingID"
                     data={appList}
                     required
                     rules={{
                         required: SELECT_APP_NAME,
                     }}
                  /> */}
                <RSKendoDropDown
                  label={APP_NAME}
                  control={control}
                  name="appName"
                  data={appList}
                  textField="appName"
                  dataItemKey="pushNotifySettingID"
                  isLoading={domainAppListApi.isLoading}
                  required
                  rules={{
                    required: SELECT_APP_NAME,
                  }}
                />
              </Col>
              <Col sm={2} className="w-auto">
                {addAccess &&
                  <RSPrimaryButton
                    type="submit"
                    disabledClass={`${editState && !hasChanges ? 'pe-none click-off' : ''}`}
                    id="rs_WebMobile_Save"
                    isLoading={isSaveLoading}
                    blockBodyPointerEvents={isSaveLoading}
                  >
                    {ADD}
                  </RSPrimaryButton>
                }
              </Col>
                 {(!!watchedDomainName || !!watchedAppName) &&
                <Col className="lh0 pl0 w-auto bottom1 position-relative">
                  <RSTooltip position="top" text={RESET} className="d-inline-block">
                    <div>
                      <i
                        className={`${restart_medium} icon-md color-primary-blue`}
                        onClick={() => {
                          setShowResetModal(true);
                        }} />

                    </div>
                  </RSTooltip>
                </Col>
              }
            </Row>
          </form>
        </div>
        <KendoGrid
          data={gridList}
          noBoxShadow
          isLoading={domainAppListApi.isFetching}
          settings={{
            total: gridList.length || 0,
          }}
          isFailure={!domainAppListApi.isFetching && !gridList.length}
          isCustomBox
          column={[
            {
              field: 'webName',
              title: SELECT_DOMAIN_NAME,
              filter: 'text',
              width: 200
            },
            {
              field: 'appName',
              title: APP_NAME,
              filter: 'text',
              width: 200
            },
            {
              field: 'createdBy',
              title: CREATED_BY,
              filter: 'text',
              width: 200,
              // cell: ({ dataItem }) =>
              //   <td>
              //     {dataItem?.createdBy?.length > 20 ?
              //       <RSTooltip text={dataItem?.createdBy} position="top" className="d-inline-block">
              //         <span className="m0">{truncateTitle(dataItem?.createdBy, 20)}</span>
              //       </RSTooltip> :

              //       <span className="m0">{dataItem?.createdBy || 'NA'}</span>
              //     }
              //   </td>

            },
            {
              field: 'createdDate',
              title: CREATE_DATE,
              width: 250,
              filter: 'date',
              cell: ({ dataItem }) =>
                <td>
                  {true && (
                    dataItem?.createdDate?.length > 20 ?
                      <RSTooltip
                        text={getUserCurrentFormat(dataItem?.createdDate)?.dateTimeFormat}
                        position="top"
                        className="d-inline-block">

                        <span className="m0">
                          {truncateTitle(
                            getUserCurrentFormat(dataItem?.createdDate)?.dateTimeFormat,
                            20
                          )}
                        </span>
                      </RSTooltip> :

                      <span className="rctcb-by-date">
                        {getUserCurrentFormat(dataItem?.createdDate)?.dateTimeFormat}
                        {/* {getUserCurrentFormat(dataItem?.createdDate)?.dateTimeFormatWithSeconds} */}
                      </span>)
                  }
                </td>

            },
            {
              field: 'action',
              title: ACTIONS,
              width: '165px',
              cell: (props) => {
                return (
                  <td>
                    <ul className="rs-list-inline rli-space-15 grid-view-icons">
                      {/* <li>
                       <RSTooltip text={EDIT} position="top">
                           <i
                               onClick={() => {
                                   if (updateAccess) {
                                       handleEdit(props?.dataItem);
                                   }
                               }}
                               className={`${
                                   pencil_edit_medium
                               } icon-md color-primary-blue ${
                                   !updateAccess ? 'click-off' : ''
                               }`}
                               id="rs_data_pencil_edit"
                           ></i>
                       </RSTooltip>
                    </li> */}
                      <li>
                        <RSTooltip text={ROUTER_CONFIGURATION} position="top">
                          <div className={`${!updateAccess ? 'pe-none click-off' : ''}`
                            }>
                          <i
                            onClick={() => {
                              if (updateAccess) {
                                setShowConfig({ show: true, data: props?.dataItem });
                              }
                            }}
                             className={`${settings_medium} icon-md color-primary-blue` }
                            id="rs_data_pencil_edit">
                          </i>
                          </div>
                        </RSTooltip>
                      </li>
                      <li>
                        <RSTooltip text={DELETE} position="top">
                          <div className={`${!deleteAccess ? 'pe-none click-off' : ''}`
                            }>
                          <i
                            onClick={() => {
                              if (deleteAccess || true) {
                                //handleDelete(props?.dataItem);
                                setIsDelete({
                                  show: true,
                                  data: props?.dataItem
                                });
                              }
                            }}
                            className={`${delete_medium} icon-md color-primary-red `}
                            id="rs_data_delete">
                          </i>
                          </div>
                        </RSTooltip>
                      </li>
                    </ul>
                  </td>);

              }
            }]
          }
          pagerChange={initialPagination}
          setInitialPagination={setInitialPagination} />


        {/* /Content ends */}
        {/* /Modals*/}
        <RSConfirmationModal
          show={isDelete?.show}
          handleConfirm={(status) => {
            if (status) {
              handleDelete(isDelete?.data);
            }
          }}
          handleClose={() => {
            setIsDelete({
              show: false,
              data: {}
            });
          }} />

        {showConfig?.show &&
          <RouterConfigurationModal
            show={showConfig?.show}
            data={showConfig?.data}
            onClose={() => {
              setShowConfig({ show: false, data: {} });
            }} />

        }
        <RSConfirmationModal
          header={RESET}
          show={showResetModal}
          text={ARE_YOU_SURE_RESET}
          handleConfirm={(status) => {
            if (status) {
              reset((formState) => ({
                ...formState,
                domainName: '',
                appName: ''
              }));
              clearErrors(['domainName', 'appName']);
            }
            setShowResetModal(false);
          }}
          handleClose={() => {
            setShowResetModal(false);
          }} />

      </div>
      {getWarningPopupMessage(failureApiErrors, dispatch)}
    </div>);

};

export default WebMobile;