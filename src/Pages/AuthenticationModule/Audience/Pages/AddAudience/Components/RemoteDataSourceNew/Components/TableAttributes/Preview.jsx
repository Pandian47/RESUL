import { encodeUrl } from 'Utils/modules/crypto';
import { formatName } from 'Utils/modules/formatters';
import { memo, useContext, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
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
    finalPayload_cNl
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
import {
    IMPORT_PREFERENCE_LABEL,
    IMPORT_PRESERVE_PREFERENCE_LABEL,
    CONFIRM,
} from 'Constants/GlobalConstant/Placeholders';
import useApiLoader from 'Hooks/useApiLoader';
import { RDSContext } from '../constants';

/** Same remote IDs as previous `connectionRequest` ternary (data exchange save path). */
const DATA_EXCHANGE_SAVE_REMOTE_IDS = new Set([
    28, 45, 5, 22, 3, 39, 50, 51, 48, 41, 49, 52, 54, 23, 29, 55, 21, 156, 47, 46, 53, 43, 160, 158, 106, 159, 166, 168,170
]);

const FINAL_PAYLOAD_BUILDERS_3 = {
    28: finalPayload_DyCRM,
    45: finalPayload_hubspot,
    5: finalPayload_salesForce,
    22: finalPayload_shopify,
    3: finalPayload_oracle,
    39: finalPayload_snowflake,
};

const FINAL_PAYLOAD_BUILDERS_4 = {
    40: finalPayload_VersiumUpload,
    50: finalPayload_pipeDrive,
    51: finalPayload_cassandra,
    48: finalPayload_aeroSpike,
    41: finalPayload_mongodb,
    49: finalPayload_storehippo,
    52: finalPayload_postgresql,
    54: finalPayload_eventbrite,
    23: finalPayload_bigCommerce,
    29: finalPayload_prestashop,
    55: finalPayload_blackBaud,
    21: finalPayload_magento,
    156: finalPayload_leadSquare,
    47: finalPayload_wooCommerce,
    46: finalPayload_wix,
    53: finalPayload_dataBricks,
    43: finalPayload_googleBigQuery,
    160: finalPayload_Insightly,
    158: finalPayload_Webinar,
    106: finalPayload_Webex,
    159: finalPayload_Prestodb,
    166: finalPayload_Commercetools,
    168: finalPayload_GoogleSheets,
    155: finalPayload_Digipop,
    170: finalPayload_cNl
};

const Preview = ({ show, handleClose, type, primaryDropDown }) => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { getValues } = useFormContext();
    const { reducerState, dispatchState, isBiDirectionEnabled } = useContext(RDSContext);
    const { finalConfig } = reducerState;
    const location = useQueryParams('/audience');
    const { mySql, tableDropDown } = useSelector(({ remoteDataSourceReducer }) => remoteDataSourceReducer);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const uploadApi = useApiLoader({ autoFetch: false });

    const isDateFieldAvailable =
        (primaryDropDown?.filter((el) => isValidDateTimeType(el['dataType']))?.length > 0 &&
            (type?.data.remoteDataSourceID === 5 ||
                type?.data.remoteDataSourceID === 28 ||
                type?.data.remoteDataSourceID === 45)) ||
        false;
    // useEffect(() => {
    //     if (
    //         mySql[getValues('table').type]?.primaryKey === undefined &&
    //         type?.data.remoteDataSourceID !== 40 &&
    //         type?.data.remoteDataSourceID !== 155
    //     ) {
    //         const data = {
    //             primaryKey: getValues('primaryKey'),
    //             foreignKey: getValues('foreignKey'),
    //             checkUpdate: getValues('checkUpdate'),
    //             attributes: mySql[getValues('table').type]?.attributes,
    //         };
    //         dispatch(
    //             mySqlUpdate({
    //                 [getValues('table').type]: {
    //                     ...data,
    //                 },
    //             }),
    //         );
    //     }
    // }, [mySql, show]);
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
        const remoteId = type?.data.remoteDataSourceID;
        const builder4 = FINAL_PAYLOAD_BUILDERS_4[remoteId];
        const builder3 = FINAL_PAYLOAD_BUILDERS_3[remoteId];
        let payload;
        if (builder4) {
            payload = builder4(finalConfig, getValues, type, tableDropDown);
        } else if (builder3) {
            payload = builder3(finalConfig, getValues, type);
        } else {
            payload = finalPayload_mySQL(finalConfig, getValues, type);
        }

        const columname = _map(finalConfig, (res, key) => {
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
        let connectionRequest;
        if (DATA_EXCHANGE_SAVE_REMOTE_IDS.has(remoteId)) {
            connectionRequest = dataExchange_SaveData;
        } else if (remoteId === 40) {
            connectionRequest = save_Versium_data;
        } else if (remoteId === 155) {
            connectionRequest = save_Digipop_Attibutes;
        } else {
            connectionRequest = consfirmMYSQLData;
        }

        const { data, status, message } =
            (await uploadApi.refetch({
                mode: 'create',
                fetcher: async () => {
                    const response = await dispatch(connectionRequest({ payload, loading: false }));
                    if (response?.status && type?.data.remoteDataSourceID !== 155) {
                        const dedupePayload = {
                            dedupeSettingId: payload?.dedupeSettingId || 0,
                            departmentId,
                            clientId,
                            userId,
                            remotesettingid:
                                (typeof response.data === 'object' && response.data !== null
                                    ? response.data?.remoteSettingId
                                    : response.data) ||
                                location?.data?.remoteSettingId ||
                                0,
                        };
                        await dispatch(updateDedupeRDS({ payload: dedupePayload, loading: false }));
                    }
                    return response;
                },
            })) || {};

        if (status) {
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

    const isUploading = uploadApi.isLoading;
    const closePreview = () => {
        if (isUploading) return;
        handleClose();
    };

    return (
        <RSModal
            show={show}
            size="xxlg"
            header={type?.data.remoteDataSourceID === 40 ? 'Attribute details' : 'Table details'}
            handleClose={closePreview}
            isCloseDisabled={isUploading}
            lockBackground={isUploading}
            isCloseButton={!isUploading}
            settings={{ keyboard: !isUploading }}
            body={
                <Container>
                    <>
                        <KendoGrid
                            noBoxShadow
                            data={getPreviewData(finalConfig)}
                            column={
                                type?.data.remoteDataSourceID === 40
                                    ? attributeColumnVersium
                                    : attributeColumn(type?.data.remoteDataSourceID, isDateFieldAvailable)
                            }
                        />
                    </>

                    <div className="btn-container d-flex justify-content-end buttons-holder mt41">
                        <RSSecondaryButton
                            onClick={closePreview}
                            blockInteraction={isUploading}
                            className={'mr15'}
                        >
                            Cancel
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            onClick={handleConfirm}
                            isLoading={isUploading}
                            blockBodyPointerEvents={isUploading}
                        >
                            {CONFIRM}
                        </RSPrimaryButton>
                    </div>
                </Container>
            }
        />
    );
};

export default memo(Preview);
