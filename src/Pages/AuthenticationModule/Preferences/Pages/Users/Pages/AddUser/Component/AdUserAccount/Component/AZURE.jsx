import { iv, encryptWithAES } from 'Utils/modules/crypto';
import { GeneratePasswordpseudorandom } from 'Utils/modules/passwordUtils';
import { ENTER_APPLICATION_ID, ENTER_APPLICATION_SECRET, ENTER_DIRECTORY_ID, ENTER_GROUP_ID } from 'Constants/GlobalConstant/ValidationMessage';
import { Fragment, useCallback, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';

import { useDispatch, useSelector } from 'react-redux';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';

import { getSessionId } from 'Reducers/globalState/selector';
import { getAdUser, saveAdUser } from 'Reducers/preferences/users/request';

import CryptoJS from 'crypto-js';
import { CommonSkeleton } from 'Components/Skeleton/Components/SkeletonOverall';

const AdUserAzureFormSkeleton = () => (
    <div className="pref-ad-user-skeleton" aria-hidden="true">
        <Row>
            {Array.from({ length: 4 }, (_, index) => (
                <Col md={6} key={index}>
                    <div className="form-group">
                        <CommonSkeleton box height={12} width="45%" stopAnimation mainClass="mb-2" />
                        <CommonSkeleton box height={32} width="100%" stopAnimation />
                    </div>
                </Col>
            ))}
        </Row>
        <div className="buttons-holder mt0">
            <Row>
                <Col className="d-flex justify-content-end gap-3">
                    <CommonSkeleton box height={36} width={100} stopAnimation />
                    <CommonSkeleton box height={36} width={100} stopAnimation />
                </Col>
            </Row>
        </div>
    </div>
);

const AZURE = ({ handleClose }) => {
    const dispatch = useDispatch();
    const { clientId, userId } = useSelector((state) => getSessionId(state));
    const { control, handleSubmit, reset } = useForm();
    const [isAdConfigLoading, setIsAdConfigLoading] = useState(true);

    const getAd_user = useCallback(async () => {
        setIsAdConfigLoading(true);
        const payload = {
            clientId,
            userId,
        };
        const { status, data } = await dispatch(getAdUser({ payload, loading: false }));
        if (status) {
            reset({
                directoryID: data[0].directoryId,
                applicationID: data[0].applicationId,
                applicationSecret: data[0].applicationSecret,
                groupID: data[0].groupId,
            });
        }
        setIsAdConfigLoading(false);
    }, [clientId, userId, dispatch, reset]);

    useEffect(() => {
        getAd_user();
    }, [getAd_user]);
    let hasValue = GeneratePasswordpseudorandom(16); //GeneratePassword16Char();
    let byteHash = CryptoJS.enc.Utf8.parse(hasValue);
    let tempiv = iv;
    const saveAd_user = async (res) => {
        const payload = {
            clientId,
            userId,
            directoryId: encryptWithAES(CryptoJS.enc.Utf8.parse( res?.directoryID), byteHash, tempiv),
            // applicationid: res?.applicationID,
            // applicationSecret: res?.applicationSecret,
            groupId: res?.groupID || '',
            applicationId: encryptWithAES(CryptoJS.enc.Utf8.parse(res?.applicationID), byteHash, tempiv),
            applicationSecret: encryptWithAES(CryptoJS.enc.Utf8.parse(res?.applicationSecret), byteHash, tempiv),
            hashval: btoa(GeneratePasswordpseudorandom(3) + hasValue + GeneratePasswordpseudorandom(3)),
        };
        const { status, data } = await dispatch(saveAdUser({ payload }));
        if (status) {
            handleClose(false);
        }
    };
    if (isAdConfigLoading) {
        return <AdUserAzureFormSkeleton />;
    }

    return (
        <Fragment>
            <Row>
                <Col md={6}>
                    <div className="form-group">
                        <RSInput
                            type={'text'}
                            name={'directoryID'}
                            id="rs_AZURE_directoryId"
                            placeholder={'Directory ID'}
                            control={control}
                            required
                            maxLength={60}
                            rules={{ required: ENTER_DIRECTORY_ID }}
                        />
                    </div>
                </Col>
                <Col md={6}>
                    <div className="form-group">
                        <RSInput
                            type={'text'}
                            name={'applicationID'}
                            id="rs_AZURE_applicationID"
                            placeholder={'Application ID'}
                            control={control}
                            required
                            maxLength={60}
                            rules={{ required: ENTER_APPLICATION_ID }}
                        />
                    </div>
                </Col>
                <Col md={6}>
                    <div className="form-group">
                        <RSInput
                            type={'text'}
                            name={'applicationSecret'}
                            id="rs_AZURE_applicationSecret"
                            placeholder={'Application secret'}
                            control={control}
                            required
                            maxLength={60}
                            rules={{ required: ENTER_APPLICATION_SECRET }}
                        />
                    </div>
                </Col>
                <Col md={6}>
                    <div className="form-group">
                        <RSInput
                            type={'text'}
                            name={'groupID'}
                            id="rs_AZURE_groupID"
                            placeholder={'Group ID'}
                            control={control}
                            maxLength={60}
                            // required
                            // rules={{ required: ENTER_GROUP_ID }}
                        />
                    </div>
                </Col>
            </Row>
            <div className="buttons-holder mt0">
                <Row>
                    <Col>
                        <RSSecondaryButton
                            onClick={() => {
                                handleClose();
                            }}
                            id="rs_AZURE_cancel"
                        >
                            Cancel
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            onClick={handleSubmit((data) => {
                                saveAd_user(data);
                            })}
                            type="submit"
                            id="rs_AZURE_Apply"
                        >
                            Apply
                        </RSPrimaryButton>
                    </Col>
                </Row>
            </div>
        </Fragment>
    );
};

export default AZURE;
