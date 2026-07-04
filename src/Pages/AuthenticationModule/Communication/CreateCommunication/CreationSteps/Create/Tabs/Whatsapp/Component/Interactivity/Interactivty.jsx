import { Fragment, useContext } from 'react';
import { map as _map } from 'Utils/modules/lodashReplacements';
import { Row, Col } from 'react-bootstrap';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';


import RSEmojiPickerInput from 'Components/EmojiPickerInput';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';


import { SELECT_BUTTON_TEXT } from 'Constants/GlobalConstant/ValidationMessage';
import { selectIcon } from 'Utils/modules/display';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import useQueryParams from 'Hooks/useQueryParams';
import MessagingContext from '../../context';

const Interactivity = ({ isCarousel, fieldName, isSplitTabs }) => {
    const dispatch = useDispatch();
    const location = useQueryParams('/communication');

    const { control, trigger, setValue, watch, clearErrors, setFocus, unregister, resetField, getValues, setError } =
        useFormContext();
    const { smartLinks, buildChannelPayload } = useContext(MessagingContext);

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));

    const actionsName = isCarousel || isSplitTabs ? `${fieldName}.actions` : 'actions';

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
                actionValue: '',
            });
        } else {
            remove(idx);
        }
    };
    return (
        <Fragment>
            {_map(fields, (field, idx) => {
                const name = `${actionsName}.${idx}`;
                const controls = field?.actionControls;
                return (
                    <Fragment key={field.id}>
                        <div className={`rs-mb-nm0`}>
                            <Row className="position-relative interactivity_emoji whatsapp-interactivity">
                                <Col>
                                    <RSKendoDropdown
                                        control={control}
                                        name={`${name}.actionType`}
                                        data={[{ text: 'URL', value: 1 }]}
                                        label="Button type"
                                        // isCustomRender
                                        dataItemKey={'value'}
                                        textField={'text'}
                                        disabled={true}
                                        // itemRender={(props) => renderItem(props)}
                                        handleChange={async (e) => {
                                            setValue(`${name}.actionName`, '');
                                            setValue(`${name}.actionValue`, '');
                                        }}
                                        rules={{
                                            required: SELECT_BUTTON_TEXT,
                                        }}
                                        required
                                    />
                                </Col>
                                <Col>
                                    <RSEmojiPickerInput
                                        inputName={`${name}.actionName`}
                                        isPersonalize={false}
                                        placeholder={'Button name'}
                                        inputSettings={{
                                            disabled: !controls?.isNameEditable,
                                        }}
                                        //disabled={true}
                                        maxLength={15}
                                        required
                                        rules={{}}
                                        iconTopspace
                                        isEmoji={false}
                                    />
                                </Col>
                                {/* {buttonText[idx]?.text?.id >= 0 && ( */}
                                <>
                                    <Col className={`d-flex position-relative`}>
                                        <RSEmojiPickerInput
                                            inputName={`${name}.actionValue`}
                                            isPersonalize={false}
                                            isHighlight={true}
                                            placeholder={'Value'}
                                            inputSettings={{
                                                disabled: !controls?.isValueEditable,
                                            }}
                                            //disabled={true}
                                            //maxLength={15}
                                            required
                                            rules={{}}
                                            iconTopspace
                                            isEmoji={false}
                                            isSmartLink={controls?.isValueEditable}
                                            smartLinks={smartLinks}
                                            getPayload={buildChannelPayload}
                                            onlySmartCode
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
