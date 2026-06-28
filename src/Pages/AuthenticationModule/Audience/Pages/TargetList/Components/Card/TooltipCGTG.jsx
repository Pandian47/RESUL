import { CONTROL_GROUP_TARGET } from 'Constants/GlobalConstant/Placeholders';
import { useCallback, useContext, useState } from 'react';
import { Row, Col } from 'react-bootstrap';

import RSSwitch from 'Components/FormFields/RSSwitch';
import RSModal from 'Components/RSModal';
import SplitSlider from './SplitSlider';
import { useDispatch, useSelector } from 'react-redux';
import { getTargetListView, tl_CGTGONOFF, updateCGTGValue } from 'Reducers/audience/targetList/request';
import { TargetListContext } from '../..';
import { getSessionId } from 'Reducers/globalState/selector';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';

export const TooltipCGTG = ({ show, onHide, control, watch, listId, cgValue, tgValue, initialCgtgEnabled }) => {
    const dispatch = useDispatch();
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const { params } = useContext(TargetListContext);
    const valueOfCgTg = watch('cgtgValue');
    const cgtgSaveAPI = useApiLoader({ autoFetch: false });
    const isSaving = cgtgSaveAPI.isLoading;
    const [switchAction, setSwitchAction] = useState(null); // 'on' | 'off' | null

    const refreshTargetList = useCallback(async () => {
        await dispatch(getTargetListView({ ...params, departmentId, clientId, userId }));
    }, [clientId, departmentId, dispatch, params, userId]);

    const handleSpliter = async (selectedValue) => {
        if (isSaving) return;
        if (!initialCgtgEnabled) {
            const onRes = await cgtgSaveAPI.refetch({
                fetcher: () =>
                    dispatch(
                        tl_CGTGONOFF({
                            payload: {
                                listId,
                                flag: 1,
                                departmentId,
                                userId,
                                clientId,
                            },
                            loading: false,
                        }),
                    ),
                mode: 'create',
                loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
            });
            if (!onRes?.status) {
                return;
            }
        }
        const payload = {
            listId: listId,
            cgValue: selectedValue.count,
            tgValue: 100 - selectedValue.count,
            departmentId,
            userId,
            clientId,
        };
        const res = await cgtgSaveAPI.refetch({
            fetcher: () => dispatch(updateCGTGValue(payload, false)),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
        });
        if (res?.status) {
            await refreshTargetList();
            onHide();
        }
    };

    const cgtg_ONOFF = async (e) => {
        if (isSaving) return;
        if (e && !initialCgtgEnabled) {
            return;
        }
        setSwitchAction(e ? 'on' : 'off');
        const payload = {
            listId: listId,
            flag: e ? 1 : 0,
            departmentId,
            userId,
            clientId,
        };
        const res = await cgtgSaveAPI.refetch({
            fetcher: () => dispatch(tl_CGTGONOFF({ payload, loading: false })),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.GLOBAL },
        });
        if (res?.status) {
            await refreshTargetList();
            if (!e) {
                onHide();
            }
        }
    };

    const cgtgClose = async () => {
        if (isSaving) return;
        onHide();
        // const payload = {
        //     listId: listId,
        //     flag: valueOfCgTg ? 1 : 0,
        //     departmentId,
        //     userId,
        //     clientId,
        // };
        // const res = await dispatch(tl_CGTGONOFF({ payload }));
        // if (res?.status) {
        //     onHide();
        //     setParams((pre) => ({ ...pre, departmentId: departmentId }));
        // }
    };
    return (
        <RSModal
            show={show}
            size="md"
            header={
                <>
                    {CONTROL_GROUP_TARGET}
                    <div className="d-inline-flex align-items-center pl17">
                        <RSSwitch
                            control={control}
                            name="cgtgValue"
                            handleChange={(e) => {
                                cgtg_ONOFF(e);
                            }}
                            style={{ marginBottom: '0', marginRight: '8px' }}
                        />
                        {isSaving && switchAction === 'off' && (
                            <span className="d-inline-flex align-items-center ml5">
                                <span className="segment_loader"></span>
                            </span>
                        )}
                    </div>
                </>
            }
            handleClose={cgtgClose}
            isCloseDisabled={isSaving}
            lockBackground={isSaving}
            bodyClassName="custom_modal_tableTop"
            body={
                <div>
                    {/* <Row className="align-items-center">
                        <Col sm={7} className="pr0">
                            <label className="fs19">{CONTROL_GROUP_TARGET}</label>
                        </Col>
                        <Col sm={5}>
                            <RSSwitch
                                control={control}
                                name="cgtgValue"
                                handleChange={(e) => {
                                    cgtg_ONOFF(e);
                                }}
                            />
                        </Col>
                    </Row> */}
                    {valueOfCgTg && (
                        <SplitSlider
                            cgTgCount={100}
                            show={true}
                            splitTabs={['CG']}
                            onSave={(data) => handleSpliter(data)}
                            handleClose={cgtgClose}
                            cgValue={cgValue}
                            isSaving={isSaving}
                            disableClass={isSaving ? 'pe-none click-off' : ''}
                            initialCgtgEnabled={initialCgtgEnabled}
                        />
                    )}
                </div>
            }
        />
    );
};
