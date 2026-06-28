import { encodeUrl } from 'Utils/modules/crypto';
import { formatName } from 'Utils/modules/formatters';
import { memo, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useSelector, useDispatch } from 'react-redux';
import { useFormContext } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import KendoGrid from 'Components/RSKendoGrid';
import {
    attributeColumn,
    finalPayload_mySQL,
    getPreviewData,
    finalPayload_DyCRM,
    attributeColumnVersium,
    finalPayload_VersiumUpload,
    finalPayload_salesForce,
    finalPayload_shopify,
    finalPayload_hubspot,
    finalPayload_oracle,
    finalPayload_pipeDrive,
    finalPayload_cassandra,
    finalPayload_aeroSpike,
    finalPayload_mongodb,
    finalPayload_storehippo,
    finalPayload_postgresql,
    finalPayload_eventbrite,
    finalPayload_bigCommerce,
    finalPayload_prestashop,
    finalPayload_blackBaud,
    finalPayload_magento,
    finalPayload_leadSquare,
    finalPayload_wooCommerce,
    finalPayload_wix,
    finalPayload_dataBricks,
    finalPayload_snowflake,
    finalPayload_googleBigQuery,
    finalPayload_Insightly,
    finalPayload_Webinar,
    finalPayload_Webex,
    finalPayload_Prestodb,
    finalPayload_Commercetools,
    finalPayload_Digipop,
    finalPayload_GoogleSheets,
    isValidDateTimeType,
} from './constant';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    consfirmMYSQLData,
    dataExchange_SaveData,
    save_Versium_data,
    updateDedupeRDS,
} from 'Reducers/remoteDataSource/request';
import _map from 'lodash/map';

import { mySqlUpdate } from 'Reducers/RemoteDataSource/reducer';
import useQueryParams from 'Hooks/useQueryParams';
import { save_Digipop_Attibutes } from 'Reducers/preferences/DataExchange/request';
import { IMPORT_PREFERENCE_LABEL, IMPORT_PRESERVE_PREFERENCE_LABEL } from 'Constants/GlobalConstant/Placeholders';

const Preview = ({ show, handleClose, type, dispatchState, primaryDropDown }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { getValues } = useFormContext();
    const location = useQueryParams('/audience');
    const [errorModal, setErrorModal] = useState(false);
    const [errorModalMsg, setErrorModalMsg] = useState('');
    const { mySql, tableDropDown } = useSelector(({ remoteDataSourceReducer }) => remoteDataSourceReducer);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    useEffect(() => {
        setErrorModal(false);
        setErrorModalMsg('');
    }, []);
    const isDateFieldAvailable =
        (primaryDropDown?.filter((el) => isValidDateTimeType(el['dataType']))?.length > 0 &&
            (type?.data.remoteDataSourceID === 5 ||
                type?.data.remoteDataSourceID === 28 ||
                type?.data.remoteDataSourceID === 45)) ||
        false;
    useEffect(() => {
        if (
            mySql[getValues('table').type]?.primaryKey === undefined &&
            type?.data.remoteDataSourceID !== 40 &&
            type?.data.remoteDataSourceID !== 155
        ) {
            const data = {
                primaryKey: getValues('primaryKey'),
                foreignKey: getValues('foreignKey'),
                checkUpdate: getValues('checkUpdate'),
                attributes: mySql[getValues('table').type]?.attributes,
            };
            dispatch(
                mySqlUpdate({
                    [getValues('table').type]: {
                        ...data,
                    },
                }),
            );
        }
    }, [mySql, show]);
    const getKeyValue = (obj) => {
        let keyVal = '';
        if (!obj.foreignKey) keyVal = obj.primaryKey?.value;
        else keyVal = obj.foreignKey?.value;
        return keyVal;
    };

    const handleImportPreferencePayload = (value) => {
        const updateSpaceRemoveName = formatName(value || '');
        const updateSpacePreferenceNew = formatName(IMPORT_PREFERENCE_LABEL);
        const updateSpacePreferenceOld = formatName(IMPORT_PRESERVE_PREFERENCE_LABEL);
        const payloadConfig = {
            [updateSpacePreferenceNew]: 'update_new_data',
            [updateSpacePreferenceOld]: 'preserve_older_data',
        };
        return payloadConfig[updateSpaceRemoveName] ?? 'update_new_data';
    };

    const handleConfirm = async () => {
        let payload = {};
        if (type?.data.remoteDataSourceID === 28) {
            payload = finalPayload_DyCRM(mySql, getValues, type);
        } else if (type?.data.remoteDataSourceID === 45) {
            payload = finalPayload_hubspot(mySql, getValues, type);
        } else if (type?.data.remoteDataSourceID === 5) {
            payload = finalPayload_salesForce(mySql, getValues, type);
        } else if (type?.data.remoteDataSourceID === 22) {
            payload = finalPayload_shopify(mySql, getValues, type);
        } else if (type?.data.remoteDataSourceID === 3) {
            payload = finalPayload_oracle(mySql, getValues, type);
        } else if (type?.data.remoteDataSourceID === 39) {
            payload = finalPayload_snowflake(mySql, getValues, type);
        } else if (type?.data.remoteDataSourceID === 40) {
            payload = finalPayload_VersiumUpload(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 50) {
            payload = finalPayload_pipeDrive(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 51) {
            payload = finalPayload_cassandra(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 48) {
            payload = finalPayload_aeroSpike(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 41) {
            payload = finalPayload_mongodb(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 49) {
            payload = finalPayload_storehippo(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 52) {
            payload = finalPayload_postgresql(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 54) {
            payload = finalPayload_eventbrite(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 23) {
            payload = finalPayload_bigCommerce(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 29) {
            payload = finalPayload_prestashop(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 55) {
            payload = finalPayload_blackBaud(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 21) {
            payload = finalPayload_magento(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 156) {
            payload = finalPayload_leadSquare(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 47) {
            payload = finalPayload_wooCommerce(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 46) {
            payload = finalPayload_wix(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 53) {
            payload = finalPayload_dataBricks(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 43) {
            payload = finalPayload_googleBigQuery(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 160) {
            payload = finalPayload_Insightly(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 158) {
            payload = finalPayload_Webinar(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 106) {
            payload = finalPayload_Webex(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 159) {
            payload = finalPayload_Prestodb(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 166) {
            payload = finalPayload_Commercetools(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 168) {
            payload = finalPayload_GoogleSheets(mySql, getValues, type, tableDropDown);
        } else if (type?.data.remoteDataSourceID === 155) {
            payload = finalPayload_Digipop(mySql, getValues, type, tableDropDown);
        } else {
            payload = finalPayload_mySQL(mySql, getValues, type); //1&2
        }

        const columname = _map(mySql, (res, key) => {
            return key + '.' + getKeyValue(res);
        });
        payload = { departmentId, clientId, userId, domainName: window.location.origin, ...payload };
        payload = {
            ...payload,
            dedupeSettingId: parseInt(getValues('dedupeSettingSaveStatus')?.dedupeSettingId, 10) || 0,
            isDedupeEnabled: getValues('dedupeSettingSaveStatus')?.dedupeSettingStatus ?? false,
            importPreferences: handleImportPreferencePayload(getValues('isImportPreference')),
            isbackEnable: location?.isBack ? true : false,
            identity: location?.fromBack || '',
            referenceRid: location?.data?.remoteSettingId || 0,
        };
        let connectionRequest =
            type?.data.remoteDataSourceID === 28 ||
            type?.data.remoteDataSourceID === 45 ||
            type?.data.remoteDataSourceID === 5 ||
            type?.data.remoteDataSourceID === 22 ||
            type?.data.remoteDataSourceID === 3 ||
            type?.data.remoteDataSourceID === 39 ||
            type?.data.remoteDataSourceID === 50 ||
            type?.data.remoteDataSourceID === 51 ||
            type?.data.remoteDataSourceID === 48 ||
            type?.data.remoteDataSourceID === 41 ||
            type?.data.remoteDataSourceID === 49 ||
            type?.data.remoteDataSourceID === 52 ||
            type?.data.remoteDataSourceID === 54 ||
            type?.data.remoteDataSourceID === 23 ||
            type?.data.remoteDataSourceID === 29 ||
            type?.data.remoteDataSourceID === 55 ||
            type?.data.remoteDataSourceID === 21 ||
            type?.data.remoteDataSourceID === 156 ||
            type?.data.remoteDataSourceID === 47 ||
            type?.data.remoteDataSourceID === 46 ||
            type?.data.remoteDataSourceID === 53 ||
            type?.data.remoteDataSourceID === 43 ||
            type?.data.remoteDataSourceID === 160 ||
            type?.data.remoteDataSourceID === 158 ||
            type?.data.remoteDataSourceID === 106 ||
            type?.data.remoteDataSourceID === 159 ||
            type?.data.remoteDataSourceID === 166 ||
            type?.data.remoteDataSourceID === 168
                ? dataExchange_SaveData
                : type?.data.remoteDataSourceID === 40
                ? save_Versium_data
                : type?.data.remoteDataSourceID === 155
                ? save_Digipop_Attibutes
                : consfirmMYSQLData; //1&2
        const { data, status, message } = await dispatch(connectionRequest({ payload }));
        if (status) {
            if (type?.data.remoteDataSourceID !== 155) {
                const dedupePayload = {
                    dedupeSettingId: payload?.dedupeSettingId || 0,
                    departmentId,
                    clientId,
                    userId,
                    remotesettingid:
                        (typeof data === 'object' && data !== null ? data?.remoteSettingId : data) ||
                        location?.data?.remoteSettingId ||
                        0,
                };
                await dispatch(updateDedupeRDS({ payload: dedupePayload }));
            }
            if (type?.data.remoteDataSourceID === 40) {
                navigate(`/preferences/data-exchange`);
            } else if (type?.data.remoteDataSourceID === 155) {
                dispatchState({ type: 'UPDATE', field: 'confirmPopup', payload: false });
                dispatchState({ type: 'UPDATE', field: 'dataSyncModal', payload: true });
            } else {
                let url = '/audience/add-import-audience';
                const state = {
                    from: 'manual entry',
                    data: { audienceData: { arr: columname, data }, type },
                    isAudience: location?.isAudience,
                };
                const encryptState = encodeUrl(state);
                navigate(`${url}?q=${encryptState}`, {
                    state,
                });
                // navigate(`/audience/add-import-audience`, {
                //     state: { from: 'manual entry', data: { audienceData: { arr: columname, data } } },
                // });
            }
        } else {
            handleClose();
            dispatchState({
                type: 'UPDATE',
                field: 'apiErrorPopup',
                payload: { show: true, message: message || '' },
            });
        }
    };

    return (
        <RSModal
            show={show}
            size="xxlg"
            header={type?.data.remoteDataSourceID === 40 ? 'Attribute details' : 'Table details'}
            handleClose={handleClose}
            body={
                <Container>
                    {/* <label>No. of attributes - {_size(mySql)}</label> */}
                    {errorModal ? (
                        <p>{errorModalMsg}</p>
                    ) : (
                        <>
                            <KendoGrid
                                noBoxShadow
                                data={getPreviewData(mySql)}
                                column={
                                    type?.data.remoteDataSourceID === 40
                                        ? attributeColumnVersium
                                        : attributeColumn(type?.data.remoteDataSourceID, isDateFieldAvailable)
                                }
                            />
                        </>
                    )}
                    <div className="btn-container d-flex justify-content-end buttons-holder mt41">
                        <RSSecondaryButton onClick={handleClose} className={'mr15'}>
                            Cancel
                        </RSSecondaryButton>
                        {!errorModal && <RSPrimaryButton onClick={handleConfirm}>Confirm</RSPrimaryButton>}
                    </div>
                </Container>
            }
        />
    );
};

export default memo(Preview);
