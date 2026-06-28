import { Fragment, useContext } from 'react';
import _map from 'lodash/map';
import { Row, Col } from 'react-bootstrap';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import RSEmojiPickerInput from 'Components/EmojiPickerInput';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';


import { SELECT_BUTTON_TEXT } from 'Constants/GlobalConstant/ValidationMessage';
import { selectIcon } from 'Utils/modules/display';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import { getRcsList } from 'Reducers/communication/createCommunication/Create/selectors';
import { INTERACTIVITY_DATA } from '../../constant';
import { RCSProvider } from '../../RCS';

const hasSmartLinkPlaceholder = (value) => /\{\{.*?\}\}/.test(value || '');

const Interactivity = ({ isSplitAB, fieldName }) => {
    const dispatch = useDispatch();
    const location = useQueryParams('/communication');
    const { buildChannelPayload } = useContext(RCSProvider);

    const { control, trigger, setValue, watch, clearErrors, setFocus, unregister, resetField, getValues, setError } =
    useFormContext();
    const { templateContentDetail } = useSelector((state) => getRcsList(state));

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const actionsName = isSplitAB ? `${fieldName}.actions` : 'actions';
    const frequencyName = isSplitAB ? `${fieldName}.frequency` : 'frequency';
    const ratingName = isSplitAB ? `${fieldName}.rating` : 'rating';
    const interactivityName = isSplitAB ? `${fieldName}.interactivity` : 'interactivity';

    const { fields, remove, append, update } = useFieldArray({
        control,
        name: actionsName,
    });

    const interactivityWatch = useWatch({
        control,
        name: actionsName,
    });
    // console.log('watch: ', watch(actionsName));
    const addAction = (idx) => {
        if (idx === 0) {
            append({
                actionName: '',
                actionType: '',
                actionUrl: '',
            });
        } else {
            remove(idx);
        }
    };
    return (
        <Fragment>
            {_map(fields, (field, idx) => {
                const name = `${actionsName}.${idx}`;
                const actionUrlValue = interactivityWatch?.[idx]?.actionUrl;
                const enableSmartLink = hasSmartLinkPlaceholder(actionUrlValue);
                return (
                    <Fragment key={field.id}>
                                 <div className={`rs-mb-nm0`}>
                            <Row className="position-relative interactivity_emoji">
                                <Col>
                                    <RSKendoDropdown
                                        control={control}
                                        name={`${name}.actionType`}
                                        data={INTERACTIVITY_DATA}
                                        label="Button type"
                                        // isCustomRender
                                        dataItemKey={'value'}
                                        textField={'text'}
                                        disabled={true}
                                        // itemRender={(props) => renderItem(props)}
                                        handleChange={async () => {
                                            setValue(`${name}.actionName`, '');
                                            setValue(`${name}.actionUrl`, '');
                                        }}
                                        rules={{
                                            required: SELECT_BUTTON_TEXT,
                                        }}
                                        required
                                    />
                                </Col>
                                {/* {buttonText[idx]?.text?.id >= 0 && ( */}
                                <>
                                    <Col>
                                        <RSEmojiPickerInput
                                            inputName={`${name}.actionName`}
                                            isPersonalize={false}
                                            placeholder={'Button name'}
                                            inputSettings={{
                                                disabled: field?.actionType?.actionName !== '',
                                            }}
                                            maxLength={15}
                                            required
                                            rules={{}}
                                            iconTopspace
                                            isEmoji={false}
                                        />
                                    </Col>
                                    <Col className="d-flex position-relative">
                                        <RSEmojiPickerInput
                                            inputName={`${name}.actionUrl`}
                                            isPersonalize={false}
                                            isHighlight={true}
                                            placeholder={'Value'}
                                            inputSettings={{
                                                disabled: !field?.actionUrl
                                            }}
                                            rules={{}}
                                            isEmoji={false}
                                            isSmartLink={enableSmartLink}
                                            getPayload={buildChannelPayload}
                                            onlySmartCode
                                            insertOption={{ beforeSpace: false, afterSpace: false }}
                                        />
                                        {/* <i
                                            className={`${selectIcon(idx)} icon-md d-flex align-items-center cp ${
                                                fields?.length > 1 && idx == 0 ? 'click-off' : ''
                                            }`}
                                            onClick={() => addCustomButtom(idx)}
                                        /> */}
                                    </Col>
                                    {/* <Col sm={1}>
                                        <RSTooltip text={idx === 0 ? 'Add' : 'Remove'}>
                                            <i
                                                className={`${selectIcon(idx)} icon-md d-flex align-items-center cp  ${
                                                    fields?.length > 1 && idx == 0 ? 'click-off' : 'click-off'
                                                }`}
                                                onClick={() => addAction(idx)}
                                            />
                                        </RSTooltip>
                                    </Col> */}
                                </>
                            </Row>
                        </div>
                    </Fragment>
                );
            })}
        </Fragment>
    );
};

export default Interactivity;
