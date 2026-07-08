import { CONTROL_GROUP_TARGET } from 'Constants/GlobalConstant/Placeholders';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { Row, Col } from 'react-bootstrap';

import RSSwitch from 'Components/FormFields/RSSwitch';
import RSModal from 'Components/RSModal';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { updateCGTGCampaignValue } from 'Reducers/communication/createCommunication/execute/request';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import SplitSlider from 'Pages/AuthenticationModule/Audience/Pages/TargetList/Components/Card/SplitSlider';
import { handleClickOff } from '../../constant';

const CGTGModal = ({ show, handleClose, tab, data, cgTgValues, setCgTgValues, isCgTgEnabled, setIsCgTgEnabled, handleCGTGValidated }) => {
    const { control, watch, setValue, reset } = useFormContext();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    // const { state } = useLocation();
    const state = useQueryParams('/communication');
    const { channelDetails } = useSelector(({ communicationExecuteReducer }) => communicationExecuteReducer);
    const channelId = channelDetails?.[tab]?.channelId;
    const TGCG = data?.TGCG;
    const isCGTGEnabled = TGCG?.isTGCGEnabled;
    const contentDetail = data?.contentDetail;
    //console.log('isCGTGEnabled: ', isCGTGEnabled);
    const dispatch = useDispatch();
    const cgtgSaveAPI = useApiLoader({ autoFetch: false });
    const valueOfCgTg = watch(`${tab}.cgtgValue`);
    // console.log("cgTgValues",cgTgValues)
    const cgValue = Number(TGCG?.cG); //10
    const tgValue = Number(TGCG?.tG); //90
    // useEffect(() => {
    //     if(valueOfCgTg === false){
    //         setCgTgValues({
    //             cgVal: cgValue,
    //             tgVal: tgValue,
    //         })
    //     }
    // },[valueOfCgTg])
    const handleSpliter = async (selectedValue) => {
        const payload = {
            clientId,
            departmentId,
            userId,
            campaignId: state?.campaignId,
            cgValue: selectedValue.count,
            tgValue: 100 - selectedValue.count,
            isEnabled: true,
            totalAudience: Number(contentDetail?.listquality?.totalAudience) ?? 0,
        };
        const res = await cgtgSaveAPI.refetch({
            fetcher: () => dispatch(updateCGTGCampaignValue(payload, { loading: false })),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD },
        });

        if (res?.status) {
            setTimeout(() => {
                setCgTgValues((prev) => ({
                    ...prev,
                    [tab]: {
                        cgVal: selectedValue.count,
                        tgVal: 100 - selectedValue.count,
                    },
                }));
            }, 5);
            setIsCgTgEnabled((prev) => ({
                ...prev,
                [tab]: true,
            }));

            if (handleCGTGValidated) {
                handleCGTGValidated(tab);
            }
            handleClose();
        } else {
            handleClose();
        }
    };

    useEffect(() => {
        // if (TGCG?.isTGCGEnabled) {

        if (show) {
            setValue(`${tab}.cgtgValue`, isCgTgEnabled[tab]);
        }
    }, [isCgTgEnabled, show]);
    const handleCGTGChange = async (e) => {
        if (!e) {
            const payloadCampaign = {
                clientId,
                departmentId,
                userId,
                campaignId: state?.campaignId,
                cgValue: 0,
                tgValue: 100,
                isEnabled: e,
                channelId: channelId,
                totalAudience: Number(contentDetail?.listquality?.totalAudience) ?? 0,
            };
            const response = await cgtgSaveAPI.refetch({
                fetcher: () => dispatch(updateCGTGCampaignValue(payloadCampaign, { loading: false })),
                mode: 'create',
                loaderConfig: { create: LOADER_TYPE.FIELD },
            });

            if (response?.status) {
                setIsCgTgEnabled((prev) => ({
                    ...prev,
                    [tab]: false,
                }));
                setCgTgValues((prev) => ({
                    ...prev,
                    [tab]: {
                        cgVal: 0,
                        tgVal: 100,
                    },
                }));
                if (handleCGTGValidated) {
                    handleCGTGValidated(tab);
                }
            } else {
                handleClose();
            }
        }
    };

    return (
        <div>
            <RSModal
                show={show}
                size={'md'}
                handleClose={() => {
                    handleClose();
                }}
                header={CONTROL_GROUP_TARGET}
                body={
                    <>
                        <Row className='align-items-center'>
                            <Col sm={7} className="pr0">
                                <label className="fs19">{CONTROL_GROUP_TARGET}</label>
                            </Col>
                            <Col sm={5} className={`${handleClickOff(channelDetails?.[tab])} pl0 d-flex align-items-center`}>
                                <RSSwitch
                                    control={control}
                                    name={`${tab}.cgtgValue`}
                                    handleChange={(e) => handleCGTGChange(e)}
                                />
                                {cgtgSaveAPI.isLoading && !valueOfCgTg && (
                                    <span className="d-inline-flex align-items-center ml5">
                                        <span className="segment_loader" />
                                    </span>
                                )}
                            </Col>
                        </Row>
                        {valueOfCgTg && (
                            <SplitSlider
                                cgTgCount={cgTgValues[tab]?.tgVal ?? tgValue}
                                disableClass={`${handleClickOff(channelDetails?.[tab])}`}
                                show={true}
                                splitTabs={['CG']}
                                onSave={(data) => handleSpliter(data)}
                                handleClose={handleClose}
                                cgValue={cgTgValues[tab]?.cgVal ?? cgValue}
                                isSaving={cgtgSaveAPI.isLoading}
                            />
                        )}
                    </>
                }
                // bodyClassName={`${handleClickOff(channelDetails[tab])}`}
            />
        </div>
    );
};

export default CGTGModal;
