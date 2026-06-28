import { numberWithCommas } from 'Utils/modules/formatters';
import { ACCEPT_TERMS } from 'Constants/GlobalConstant/ValidationMessage';
import { ACTION, CANCEL, SCRUBBED_AUDIENCE_DATA, SUBMIT, TEXT, YES_I_AGREE_TO_REMOVE } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSModal from 'Components/RSModal';
import KendoGrid from 'Components/RSKendoGrid';
import { Switch } from '@progress/kendo-react-inputs';


import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { updateScrubRules } from 'Reducers/communication/createCommunication/execute/request';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import { update_failures_API_Errors } from 'Reducers/globalState/reducer';
import { updateScrubRulesData } from 'Reducers/communication/createCommunication/execute/reducer';
import { handleClickOff } from '../../constant';
const ScrubbedModal = ({ show, handleClose, tab }) => {
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();
    const scrubRulesSaveAPI = useApiLoader({ autoFetch: false });
    const { scrubRuleData, channelDetails } = useSelector(({ communicationExecuteReducer }) => communicationExecuteReducer);
    const channelId = channelDetails?.[tab]?.channelId;
    const state1 = useQueryParams('/communication');
    let scrubRules = scrubRuleData?.[tab];
    // console.log('scrubRules: ', scrubRules);
    const [pageGridChange, setPageGridChange] = useState([]);
    // console.log('pageGridChange: ', pageGridChange);
    const [agree, setAgree] = useState(false);
    const handleChange = (value, index) =>
        setPageGridChange((prev) => {
            return (prev ?? []).map((srub, ind) => {
                if (index === ind) return { ...srub, status: value };
                return srub;
            });
            //     let tempState = [...prev];
            //     tempState[index].status = value;
            //     return tempState;
        });
    const { control, setError, watch } = useFormContext();
    const { scrubbed } = watch();
    //  console.log('scrubbed: ', scrubbed);
    // const switcsh = watch('mdsj')
    // console.log('switch: ', switcsh);
    // console.log('channelDetails:', tab);
    const handleSubmit = async () => {
        let tempData = [];
        for (var i = 0; i < pageGridChange?.length; i++) {
            tempData.push({
                name: pageGridChange[i]?.scrubType,
                value: pageGridChange[i]?.status,
            });
        }
        const payload = {
            clientId,
            departmentId,
            userId,
            campaignId: state1?.campaignId,
            channelId: channelId,
            scrubRuleJson: [...tempData],
        };
        const res = await scrubRulesSaveAPI.refetch({
            fetcher: () => dispatch(updateScrubRules({ payload }, { loading: false })),
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD },
        });
        if (res?.status) {
            handleClose();
            dispatch(updateScrubRulesData({ field: tab, data: pageGridChange }));
        } else {
            handleClose();
            dispatch(
                update_failures_API_Errors({
                    field: 'UpdateScrubRules',
                    message: res?.message || 'No data available',
                }),
            );
        }
    };

    useEffect(() => {
        if (scrubRules) setPageGridChange(scrubRules);
    }, [scrubRules, show]);
    return (
        <RSModal
            show={show}
            isLoading={scrubRulesSaveAPI.isLoading}
            isCloseDisabled={scrubRulesSaveAPI.isLoading}
            header={SCRUBBED_AUDIENCE_DATA}
            body={
                <>
                    <div className="rs-kendo-table-hide-header rskt-width-90-10 mb10">
                        <KendoGrid
                            data={pageGridChange}
                            noBoxShadow
                            pageable={false}
                            column={[
                                {
                                    field: 'scrubbedDataText',
                                    title: TEXT,
                                    cell: ({ dataItem, dataIndex }) => (
                                        <td>
                                            <div className="rs-scrubbled-data-lable">
                                                {dataItem?.scrubName}{' '}
                                                {dataItem?.scrubCount ? (
                                                    <small className="d-inline-block ml3">
                                                        {'('}
                                                        {numberWithCommas(dataItem?.scrubCount)}
                                                        {')'}
                                                    </small>
                                                ) : (
                                                    <small className="d-inline-block ml3">{'(0)'}</small>
                                                )}
                                            </div>
                                        </td>
                                    ),
                                },
                                {
                                    field: 'checked',
                                    title: ACTION,
                                    width: '120px',
                                    cell: ({ dataItem, dataIndex }) => {
                                        return (
                                            <td
                                                className={`${
                                                    !dataItem?.isEditable ? 'text-right pe-none click-off' : 'text-right'
                                                }`}
                                            >
                                                <Switch
                                                    onChange={(e) => handleChange(e.target.value, dataIndex)}
                                                    checked={dataItem?.status}
                                                />
                                            </td>
                                        );
                                    },
                                },
                            ]}
                        />
                    </div>
                    <div className="mt30">
                        <RSCheckbox
                            control={control}
                            name={'scrubbed.agree'}
                            required
                            rules={{
                                required: ACCEPT_TERMS,
                            }}
                            // handleChange={(e) => {
                            //     if (e.target.value) setError('scrubbed.agree', { type: 'custom', message: 'sadfsaf' });
                            //     setAgree(!e.target.value);
                            // }}
                            labelName={YES_I_AGREE_TO_REMOVE}
                        />
                    </div>
                </>
            }
            footer={
                <span className={`m0 ${handleClickOff(channelDetails?.[tab])}`}>
                    <RSSecondaryButton
                        onClick={() => {
                            handleClose();
                        }}
                    >
                        {CANCEL}
                    </RSSecondaryButton>
                    {/* <RSPrimaryButton className={`${agree ? '' : 'click-off'}`} onClick={() => handleSubmit()}>
                        Submit
                    </RSPrimaryButton>   */}
                    <RSPrimaryButton
                        disabledClass={
                            scrubRulesSaveAPI.isLoading || !scrubbed?.agree ? 'pe-none click-off' : ''
                        }
                        onClick={handleSubmit}
                        isLoading={scrubRulesSaveAPI.isLoading}
                    >
                        {SUBMIT}
                    </RSPrimaryButton>
                </span>
            }
            handleClose={() => {
                handleClose();
            }}
            bodyClassName={handleClickOff(channelDetails?.[tab])}
        />
    );
};

export default ScrubbedModal;
