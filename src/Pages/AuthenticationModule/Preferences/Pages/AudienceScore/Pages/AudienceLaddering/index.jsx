import { useCallback, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { CRITICS, INITIAL_STATE, SPECTATOR } from './constant';
import LadderingCard from '../Components/LadderingCard';
import { AudienceScoreTabContentSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import usePermission from 'Hooks/usePersmission';
import { getSessionId } from 'Reducers/globalState/selector';
import {
    get_AudienceLaddering,
    get_LadderKeys,
    get_LadderSentimentKeys,
    save_AudienceLaddering,
} from 'Reducers/preferences/audienceScore/request';
import {
    asAudienceScoreList,
    getAudienceScoreListFromResponse,
} from '../Components/constants';



const AudienceLaddering = () => {
    const methods = useForm(INITIAL_STATE);
    const navigate = useNavigate();
    const { permissions } = usePermission();
    const { addAccess, updateAccess } = permissions || {};
    const dispatch = useDispatch();
    const { departmentId, clientId, userId, departmentName } = useSelector((state) => getSessionId(state));
    const { handleSubmit } = methods;
    const [audienceLadderingData, setAudienceLadderingData] = useState([]);
    const [ladderKeysData, setladderKeysData] = useState([]);
    const [sentimentKeysData, setsentimentKeysData] = useState([]);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const saveApi = useApiLoader({
        autoFetch: false,
        loaderConfig: fieldLoaderConfig,
        mode: audienceLadderingData?.length ? 'edit' : 'create',
    });
    const isSaveLoading = saveApi.isFetching;

    const handleSave = async (data) => {
        if (isSaveLoading || !data) return;

        let tempLadderKeys = Object.keys(data);
        tempLadderKeys = tempLadderKeys?.filter((e) => e && e !== 'undefined');

        let tempPayload = [];

        tempLadderKeys.map((e, index) => {
            let tempDataObj = data[e];
            if (data[e]?.arrayValues === undefined || data[e]?.arrayValues?.length === 0)
                delete tempDataObj['arrayValues'];
            else {
                let tempObj = {};
                data[e]?.arrayValues?.map((item) => {
                    tempObj = {
                        ...tempObj,
                        [item?.key?.LadderingKeyName]: {
                            condition: item?.condition,
                            value: item?.value,
                        },
                    };
                });
                tempDataObj = { ...data[e], ...tempObj };
                delete tempDataObj['arrayValues'];
            }
            let tempKeys = Object.keys(tempDataObj);
            let temp = Object.values(tempDataObj).map((data, ind) => {
                return {
                    condition: data?.valueTwo === undefined || data?.valueTwo === '' ? data?.condition : '[]',
                    key: data?.key !== undefined ? data?.key?.LadderingKeyName : tempKeys[ind],
                    sentiment: data?.sentiment?.sentimentKeyName || '',
                    value:
                        data?.valueTwo === undefined || data?.valueTwo === ''
                            ? parseInt(data?.value, 10)
                            : parseInt(data?.value, 10) + ':' + parseInt(data?.valueTwo, 10),
                };
            });
            let total = Object.values(tempDataObj)

                .map((e) => e?.value)
                .reduce((a, b) => Number(a) + Number(b), 0);

            tempPayload.push({
                audienceLadderingId: index + 1,
                ladderingRule: temp,
                ladderingScore: total,
                ladderingType: tempLadderKeys[index],
            });
        });
        const payload = {
            clientId,
            departmentId,
            userId,
            audienceLaddering: tempPayload,
        };
        const result = await saveApi.refetch({
            fetcher: () => dispatch(save_AudienceLaddering(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: audienceLadderingData?.length ? 'edit' : 'create',
        });
        if (result?.status) {
            navigate(`/preferences`);
        }
    };
    const bootstrapAudienceLaddering = useCallback(() => {
        if (!clientId || !departmentId || !userId) {
            return undefined;
        }
        const payload = { clientId, departmentId, userId };
        return pageLoadApi.refetch({
            fetcher: async () => {
                const [audienceLaddering, ladderKeys, sentimentKeys] = await Promise.all([
                    dispatch(get_AudienceLaddering(payload)),
                    dispatch(get_LadderKeys(payload)),
                    dispatch(get_LadderSentimentKeys(payload)),
                ]);
                return { audienceLaddering, ladderKeys, sentimentKeys };
            },
            onSuccess: ({ audienceLaddering, ladderKeys, sentimentKeys }) => {
                setAudienceLadderingData(getAudienceScoreListFromResponse(audienceLaddering));
                setladderKeysData(getAudienceScoreListFromResponse(ladderKeys));
                setsentimentKeysData(getAudienceScoreListFromResponse(sentimentKeys));
            },
            onError: () => {
                setAudienceLadderingData([]);
                setladderKeysData([]);
                setsentimentKeysData([]);
            },
        });
    }, [clientId, departmentId, userId, dispatch, pageLoadApi.refetch]);

    useEffect(() => {
        bootstrapAudienceLaddering();
    }, [bootstrapAudienceLaddering]);

    return (
        <FormProvider {...methods}>
            <AudienceScoreTabContentSkeletonGate isLoading={pageLoadApi.isFetching} variant="laddering">
            <form className="rsv-tabs-content" onSubmit={(event) => event.preventDefault()}>
                <div className="box-design bd-top-border">
                    {/* Content starts */}

                    <Row className="mb10">
                        <Col sm={8}>
                            <h4 className="m0">Audience laddering</h4>
                        </Col>
                    </Row>
                    <Row>
                        <LadderingCard
                            name={audienceLadderingData[0]?.ladderingType}
                            status={'above'}
                            dropdownlist={sentimentKeysData}
                            ladderKeys={ladderKeysData}
                            constants={asAudienceScoreList(audienceLadderingData[0]?.ladderingRule)}
                        />
                        <LadderingCard
                            name={audienceLadderingData[1]?.ladderingType}
                            status={'below'}
                            dropdownlist={sentimentKeysData}
                            ladderKeys={ladderKeysData}
                            constants={asAudienceScoreList(audienceLadderingData[1]?.ladderingRule)}
                        />
                        <LadderingCard
                            name={audienceLadderingData[2]?.ladderingType}
                            status={CRITICS}
                            dropdownlist={sentimentKeysData}
                            ladderKeys={ladderKeysData}
                            constants={asAudienceScoreList(audienceLadderingData[2]?.ladderingRule)}
                        />
                        <LadderingCard
                            name={audienceLadderingData[3]?.ladderingType}
                            status={SPECTATOR}
                            dropdownlist={sentimentKeysData}
                            ladderKeys={ladderKeysData}
                            constants={asAudienceScoreList(audienceLadderingData[3]?.ladderingRule)}
                        />
                    </Row>
                </div>
                {/* Buttons Row */}
                <div className="buttons-holder">
                    <RSSecondaryButton
                        blockInteraction={isSaveLoading}
                        onClick={() => {
                            if (isSaveLoading) return;
                            navigate(`/preferences`);
                        }}
                    >
                        Cancel
                    </RSSecondaryButton>
                    {(addAccess || updateAccess) && (
                        <>
                            <RSPrimaryButton
                                isLoading={isSaveLoading}
                                blockBodyPointerEvents={isSaveLoading}
                                onClick={handleSubmit(handleSave)}
                            >
                                Save
                            </RSPrimaryButton>
                        </>
                    )}
                </div>
            </form>
            </AudienceScoreTabContentSkeletonGate>
        </FormProvider>
    );
};

export default AudienceLaddering;
