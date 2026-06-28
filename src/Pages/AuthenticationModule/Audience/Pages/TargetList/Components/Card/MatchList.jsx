import { getDateWithDaynoFormat, getYYMMDD } from 'Utils/modules/dateTime';
import { APPLY, CANCEL, SELECT_ATTRIBUTES, SELECT_LIST } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import RSModal from 'Components/RSModal';
import { useDispatch, useSelector } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { FormProvider, useForm } from 'react-hook-form';
import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { parseAudienceJsonArray } from 'Pages/AuthenticationModule/Audience/audienceDefaults';
import { getSessionId } from 'Reducers/globalState/selector';

import { get_attribute_name, get_match_list, ml_list_save } from 'Reducers/audience/targetList/request';
import { AUDIENCE_LIST_LAST_30_DAYS_OFFSET } from '../../../../audienceModuleDefaults';
export const MatchList = ({ list, show, onHide, listType }) => {
    const dispatch = useDispatch();
    const [isSaving, setIsSaving] = useState(false);
    const methods = useForm({
        defaultValues: {
            attributes: [],
            inputList: [],
        },
    });
    const { control, watch } = methods;
    const [inputList, attributes] = watch(['inputList', 'attributes']);
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const [inputListData, setInputListData] = useState([]);
    const [attributesListData, setAttributeListData] = useState([]);

    useEffect(() => {
        async function fetchData() {
            let payload = {
                departmentId,
                listType,
                clientId,
                userId,
            };
            let { status, data } = await dispatch(get_match_list({ payload }));
            if (status) {
                setInputListData(parseAudienceJsonArray(data, []));
            }
        }
        fetchData();
    }, []);
    const handeInputChange = async ({ target: { value } }) => {
        let payload = {
            departmentId,
            clientId,
            userId,
            segmentationListId: value.segmentationListId,
        };
        let { status, data } = await dispatch(get_attribute_name({ payload }));
        if (status) {
            setAttributeListData(parseAudienceJsonArray(data, []));
        }
    };

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        try {
        let payload = {
            departmentId,
            listType,
            segmentationListId: list.segmentationListID,
            listinputId: inputList.segmentationListId,
            selectedAttributeId: attributes.map((e) => e.sOLRFieldName && e.sOLRFieldName).join(),
        };
        let params = {
            departmentId: departmentId,
            clientId,
            userId: userId,
            pagination: {
                pageNo: 1,
                pageSize: 9,
            },
            isFilteration: false,
            isAdvanceSearch: false,
            filteration: {
                listName: '',
                listType: String(userId),
                createdBy: '',
                approvalStatus: '',
                searchBy: '',
                searchValue: '',
                isContains: false,
                isDateFilter: false,
                dateFilter: {
                    fromDate: getYYMMDD(getDateWithDaynoFormat(AUDIENCE_LIST_LAST_30_DAYS_OFFSET)),
                    toDate: getYYMMDD(new Date()),
                },
                status:'',
            },
        };
        let { status, data } = await dispatch(ml_list_save({ payload }));
        if (status) {
            onHide();
            window.location.reload();
        }
        } finally {
            setIsSaving(false);
        }
    };
    const handleClose = () => {
        if (isSaving) return;
        onHide();
    };
    return (
        <RSModal
            show={show}
            size="md"
            header={`${listType === 2 ? 'Match' : 'Suppression'} input list`}
            handleClose={handleClose}
            isCloseDisabled={isSaving}
            lockBackground={isSaving}
            body={
                <div>
                    <FormProvider {...methods}>
                    <div className={`form-group ${!!attributesListData?.length ? '' : 'mb0'}`}>
                            <Row>
                                <Col>
                                    <RSKendoDropDownList
                                        data={inputListData}
                                        control={control}
                                        name={'inputList'}
                                        required
                                        textField={'recipientsBunchName'}
                                        label={SELECT_LIST}
                                        dataItemKey={'segmentationListId'}
                                        handleChange={handeInputChange}
                                    />
                                </Col>
                            </Row>
                        </div>
                        
                            {!!attributesListData?.length && (
                                <div className="form-group mb0">
                                <Row>
                                    <Col>
                                        <RSMultiSelect
                                            control={control}
                                            name={'attributes'}
                                            data={attributesListData}
                                            textField={'uIPrintableName'}
                                            dataItemKey={'dataAttributeId'}
                                            label={SELECT_ATTRIBUTES}
                                            required
                                            handleChange={(e) => {}}
                                        />
                                    </Col>
                                </Row>
                                </div>
                            )}
                        
                    </FormProvider>
                </div>
            }
            footer={
                <>
                    <RSSecondaryButton onClick={handleClose} blockInteraction={isSaving}>
                        {CANCEL}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        disabledClass={`${!attributes?.length || isSaving ? 'pe-none click-off' : ''}`}
                        onClick={handleSave}
                        isLoading={isSaving}
                        blockBodyPointerEvents={isSaving}
                    >
                    {APPLY}
                    </RSPrimaryButton>
                </>
            }
        />
    );
};
