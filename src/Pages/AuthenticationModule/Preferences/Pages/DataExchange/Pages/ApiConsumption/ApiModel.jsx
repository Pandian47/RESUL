import { truncateTitle } from 'Utils/modules/displayCore';
import { SUBMIT, SUBMITTING } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import RSModal from 'Components/RSModal';
import RSInput from 'Components/FormFields/RSInput';
import { RSPrimaryButton } from 'Components/Buttons';
import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';
import { save_ApiConsumption } from 'Reducers/preferences/DataExchange/request';
import RSTooltip from 'Components/RSTooltip';

const ApiModel = ({ show, handleClose, setSelectedItem, selcectedData, editData, isEdit, onSaveSuccess }) => {
    //console.log('editData: ', editData);
    const {
        control,
        watch,
        reset,
        formState: { errors },
    } = useForm();
    const dispatch = useDispatch();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { apiKey, apiUrl, apiName } = watch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const handleSave = async () => {
        if (isSubmitting) return;

        const payload = {
            departmentId,
            clientId,
            userId,
            apiname: apiName,
            apiUrl: apiUrl,
            apiTypeId:
                editData?.length === 0 ? selcectedData?.details?.remoteDataSourceID : editData.remoteDataSourceID,
            APIConsumptionsDetailsID: editData?.length === 0 ? 0 : editData?.apiConsumptionsDetailsId,
            apiKey: apiKey,
        };

        setIsSubmitting(true);
        try {
            const res = await dispatch(save_ApiConsumption({ payload, loading: false }));
            if (res?.status) {
                onSaveSuccess?.();
                handleClose(false);
            }
        } finally {
            setIsSubmitting(false);
        }
    };
    useEffect(() => {
        reset((formState) => ({
            ...formState,
            apiName: editData?.apiname,
            apiUrl: editData?.apiUrl,
            apiKey: editData?.apiKey,
        }));
    }, [editData]);
    const headerName = `API integrated systems - ${
        !isEdit ? selcectedData?.details?.sourceName : editData?.sourceName
    }`;

    return (
        <RSModal
            show={show}
            size="md"
            header={
                headerName?.length > 40 ? (
                    <>
                        <RSTooltip text={headerName}>{truncateTitle(headerName, 40)}</RSTooltip>
                    </>
                ) : (
                    <>{headerName}</>
                )
            }
            handleClose={handleClose}
            body={
                <Fragment>
                    <div className="form-group">
                        <RSInput control={control} name="apiName" placeholder={'API name'} />
                    </div>
                    <div className="form-group">
                        <RSInput control={control} name="apiUrl" placeholder={'API URL'} />
                    </div>
                    <div className="mb0">
                        <RSInput control={control} name="apiKey" placeholder={'API key'} />
                    </div>
                </Fragment>
            }
            footer={
                <div className="btn-container d-flex justify-content-end m0">
                    <RSPrimaryButton
                        onClick={handleSave}
                        isLoading={isSubmitting}
                        loadingText={SUBMITTING}
                        disabledClass={isSubmitting ? 'pe-none click-off' : ''}
                    >
                        {SUBMIT}
                    </RSPrimaryButton>
                </div>
            }
        />
    );
};

export default ApiModel;
