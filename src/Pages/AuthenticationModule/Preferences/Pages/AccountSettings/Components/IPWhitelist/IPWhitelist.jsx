import { getUserDetails } from 'Utils/modules/crypto';
import { charNumDotWithoutSpecialCharacters, onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { IPADDRESS_REGEX } from 'Constants/GlobalConstant/Regex';
import { ENTER_VALID_IP_ADDRESS, IP_ADDRESS as IP_ADDRESS_MSG, IP_ADDRESS_EXISTS } from 'Constants/GlobalConstant/ValidationMessage';
import { IP_ADDRESS } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_mini } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useEffect, useState } from 'react';
import RSModal from 'Components/RSModal';

import _isEmpty from 'lodash/isEmpty';
import _size from 'lodash/size';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { Row, Col } from 'react-bootstrap';
import RSInput from 'Components/FormFields/RSInput';
import { useFieldArray, useForm, useWatch } from 'react-hook-form';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import { getIPWhiteList, upsertIpWhiteList } from 'Reducers/preferences/accountSettings/request';
import RSTooltip from 'Components/RSTooltip';

import { resetAccountSettings } from 'Reducers/Preferences/accountSettings/reducer';

const IPWhitelistModal = ({ show, handleClose }) => {
    const dispatch = useDispatch();
    const [payloadTags, setPayloadTags] = useState([]);
    const {
        control,
        setValue,
        setError,
        getFieldState,
        trigger,
        formState: { errors },
    } = useForm({
        mode: 'onTouched',
    });
    const { fields, replace, append, remove } = useFieldArray({
        control,
        name: 'iptags',
    });
    const IPaddress = useWatch({
        control,
        name: 'ipaddress',
    });
    const { licenseTypeId } = getUserDetails();
    const { clientId, userId, departmentId, parentClientId } = useSelector((state) => getSessionId(state));
    const { whitelistedIP } = useSelector(({ accountSettingsReducer }) => accountSettingsReducer);
    const fieldState = getFieldState('ipaddress');

    useEffect(() => {
        const payload = { clientId, userId, departmentId };
        dispatch(getIPWhiteList({ payload }));
    }, []);

    useEffect(() => {
        replace(whitelistedIP);
    }, [whitelistedIP]);

    const formSubmitHandler = async () => {
        const payload = {
            clientId,
            userId,
            departmentId,
            parentClientId: licenseTypeId === '3' ? parentClientId : clientId,
            createdBy: userId,
            IpList: payloadTags?.map((tag, _) => {
                const { whitelistID, ipAddress, isActive } = tag;
                return {
                    whiteListId: whitelistID,
                    ipAddress: ipAddress,
                    isActive: isActive,
                };
            }),
        };
        const res = await dispatch(upsertIpWhiteList({ payload }));
        if (res?.status) {
            handleClose(false);
            dispatch(resetAccountSettings());
        }
    };

    return (
        <Fragment>
            <div>
                <RSModal
                    show={show}
                    size="lg"
                    header="IP whitelisting"
                    body={
                        <Fragment>
                            <Row className="form-group">
                                <Col md={3}>
                                    <label>Enter IP address</label>
                                </Col>
                                <Col md={6}>
                                    <RSInput
                                        control={control}
                                        name="ipaddress"
                                        handleOnchange={(e) => {
                                            onlyNumbersDecimalWithoutSpecialCharacters(e);
                                        }}
                                        onKeyDown={charNumDotWithoutSpecialCharacters}
                                        placeholder={IP_ADDRESS}
                                        maxLength={15}
                                        rules={{
                                            required: IP_ADDRESS_MSG,
                                            pattern: {
                                                value: IPADDRESS_REGEX,
                                                message: ENTER_VALID_IP_ADDRESS,
                                            },
                                        }}
                                    />
                                </Col>
                                <Col md={3}>
                                    <RSSecondaryButton
                                        className="color-secondary-blue"
                                        // className={_size(errors) || _isEmpty(IPaddress) ? 'click-off' : ''}
                                        onClick={() => {
                                            const findIndex = fields?.findIndex(
                                                (field) => field.ipAddress === IPaddress,
                                            );
                                            if (findIndex === -1) {
                                                if (!_isEmpty(IPaddress) && !fieldState.invalid) {
                                                    const tempTags = [...payloadTags];
                                                    const appendItem = {
                                                        whitelistID: 0,
                                                        ipAddress: IPaddress,
                                                        isActive: true,
                                                    };
                                                    append(appendItem);
                                                    setValue(`ipaddress`, '');
                                                    tempTags.push({ ...appendItem });
                                                    setPayloadTags(tempTags);
                                                } else {
                                                    trigger('ipaddress');
                                                }
                                            } else {
                                                setError('ipaddress', {
                                                    type: 'custom',
                                                    message: IP_ADDRESS_EXISTS,
                                                });
                                            }
                                        }}
                                    >
                                        Submit
                                    </RSSecondaryButton>
                                </Col>
                            </Row>
                            <Row className="form-group">
                                <Col md={3}>
                                    <label>Whitelisted IP's</label>
                                </Col>
                                <Col md={6}>
                                    <div className="rs-tags-wrapper">
                                        <ul>
                                            {fields.map((field, fieldIndex) => {
                                                const { ipAddress } = field;
                                                return (
                                                    <li key={field.id} className="rs-tag">
                                                        <span className='"rst-text'>{ipAddress}</span>
                                                        <span className="rst-tag-remove">
                                                            <RSTooltip text="Remove" position="top">
                                                                <i
                                                                    className={`${circle_minus_fill_mini} color-primary-red`}
                                                                    id='rs_data_circle_minus_fill'
                                                                    onClick={() => {
                                                                        remove(fieldIndex);
                                                                        const tempIPtags = [...fields];
                                                                        const ipTags = tempIPtags?.map(
                                                                            (tag, tagIdx) => {
                                                                                return {
                                                                                    ...tag,
                                                                                    isActive:
                                                                                        fieldIndex === tagIdx
                                                                                            ? false
                                                                                            : true,
                                                                                };
                                                                            },
                                                                        );
                                                                        setPayloadTags(ipTags);
                                                                    }}
                                                                ></i>
                                                            </RSTooltip>
                                                        </span>
                                                    </li>
                                                );
                                            })}
                                        </ul>
                                    </div>
                                    <small>Any IPs not listed here will be blocked.</small>
                                </Col>
                                <Col md={3}></Col>
                            </Row>
                        </Fragment>
                    }
                    footer={
                        <div className="d-flex justify-content-end">
                            <RSSecondaryButton onClick={() => handleClose(false)}>Cancel</RSSecondaryButton>
                            <RSPrimaryButton
                                className={_size(errors) || !_isEmpty(IPaddress) ? 'click-off' : ''}
                                onClick={() => formSubmitHandler()}
                            >
                                Save
                            </RSPrimaryButton>
                        </div>
                    }
                    handleClose={() => handleClose(false)}
                />
            </div>
        </Fragment>
    );
};

export default IPWhitelistModal;
