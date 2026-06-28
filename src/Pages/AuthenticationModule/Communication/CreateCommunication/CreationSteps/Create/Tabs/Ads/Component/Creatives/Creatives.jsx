import { selectIcon, selectIconTooltip } from 'Utils/modules/display';
import { DIGIPOP_TYPE, LIST_TYPE } from 'Constants/GlobalConstant/Placeholders';
import { DIGIPOP_TYPE as DIGIPOP_TYPE_MSG, SELECT_LIST_TYPE } from 'Constants/GlobalConstant/ValidationMessage';
import { eye_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useFormContext, useWatch } from 'react-hook-form';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTooltip from 'Components/RSTooltip';


import { digipopTypeSettings } from '../../constant';
import { GetDigiPop_grid } from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';
import Preview from './Preview';
import { digipopType } from 'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Ads/Tabs/Digipop/constant';

const Creatives = ({ fieldName, fields = [], append, remove, setDeviceTypeData, deviceTypeData }) => {
    const {
        control,
        trigger,
        watch,
        setValue,
        formState: { errors },
    } = useFormContext();
    const { userId, departmentId, clientId } = useSelector((state) => getSessionId(state));
    const dispatch = useDispatch();
    const [channelType, channel] = watch(['channelType', 'channel']);
    const creativeWatch = useWatch({ control, name: 'creatives' });
    const [previewData, setPreviewData] = useState({
        show: false,
        type: '',
        src: '',
        title: '',
    });
    const getDigipopData = async (name, ind) => {
        const payload = {
            userId,
            clientId,
            type: name?.type?.toLowerCase(),
            departmentId,
            partnerId: 41,
        };
        const { status, data } = await dispatch(GetDigiPop_grid(payload));
        if (status) {
            setDeviceTypeData((prevState) => ({
                ...prevState,
                [ind]: data,
            }));
        } else {
            setDeviceTypeData((prevState) => ({
                ...prevState,
                [ind]: [],
            }));
        }
    };

    const handleDupValue = () => {
        if (!Array.isArray(creativeWatch) || creativeWatch?.length < 2) {
            return false;
        }
        const seen = new Set();
        for (let item of creativeWatch) {
            const typeName = item?.type?.name;
            const typeValName = item?.typeVal?.name;
            if (!typeName || !typeValName) continue;
            const key = `${typeName}-${typeValName}`;
            if (seen.has(key)) {
                return true;
            }
            seen.add(key);
        }
        return false;
    };

    const handlePreview = () => {};

    const handleDigipType = () => {
        if (channelType?.type === 'generic') {
            const genericEligibleType = ['image', 'video', 'pushnotif'];
            const finalDigipoType = digipopType?.filter((type) => {
                return genericEligibleType.includes(type?.type);
            });
            return finalDigipoType;
        } else if (channelType?.type === 'connectedtv') {
            const connectedTvEligibleType = ['video'];
            const finalDigipoType = digipopType?.filter((type) => {
                return connectedTvEligibleType.includes(type?.type);
            });
            return finalDigipoType;
        } else if (channelType?.type === 'pushnotif') {
            const connectedTvEligibleType = ['pushnotif'];
            const finalDigipoType = digipopType?.filter((type) => {
                return connectedTvEligibleType.includes(type?.type);
            });
            return finalDigipoType;
        }else if (channel?.type === 'metaads') {
            const connectedTvEligibleType = ['meta'];
            const finalDigipoType = digipopType?.filter((type) => {
                return connectedTvEligibleType.includes(type?.type);
            });
            return finalDigipoType;
        }
    };

    return (
        <Fragment>
            {fields.map((field, idx) => {
                const deviceTypeValue = watch(`${fieldName}[${idx}].typeVal`);
                const currPrevData = deviceTypeData[idx]?.find(
                    (item) => item?.creativeId === deviceTypeValue?.creativeId,
                );
                const src = deviceTypeValue?.type === 'video' ? {...currPrevData?.requestBody[digipopTypeSettings[deviceTypeValue?.type]], ...currPrevData?.requestBody}
                 : currPrevData?.requestBody[digipopTypeSettings[deviceTypeValue?.type]];
                return (
                    <div className="form-group" key={field.id}>
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                {idx === 0 && <label className="control-label-left">Categories</label>}
                            </Col>
                            <Col sm={creativeWatch[0]?.type ? 2 : 6}>
                                <RSKendoDropDownList
                                    data={handleDigipType()}
                                    control={control}
                                    name={`${fieldName}[${idx}].type`}
                                    label={DIGIPOP_TYPE}
                                    dataItemKey={'id'}
                                    textField={'name'}
                                    required
                                    rules={{
                                        required: DIGIPOP_TYPE_MSG,
                                    }}
                                    handleChange={(e) => {
                                        getDigipopData(e.target.value, idx);
                                        setValue(`${fieldName}[${idx}].typeVal`, '');
                                    }}
                                />
                            </Col>
                            {creativeWatch?.length && creativeWatch[0]?.type && (
                                <>
                                    {/* <Col sm={{ span: 1 }} className="text-center">
                                        {idx === 0 && <label className="Creative-label ">List</label>}
                                    </Col> */}
                                    <Col sm={2} className={`Creative-dropdown`}>
                                        <RSKendoDropDownList
                                            data={
                                                Array.isArray(deviceTypeData?.[idx])
                                                    ? deviceTypeData[idx]
                                                          .filter((item) => item?.creativeId)
                                                          .map((item) => ({
                                                              creativeId: item.creativeId,
                                                              name: item?.requestBody?.name || '',
                                                              type: item?.requestBody?.type || '',
                                                          }))
                                                    : []
                                            }
                                            control={control}
                                            name={`${fieldName}[${idx}].typeVal`}
                                            label={LIST_TYPE}
                                            dataItemKey={'creativeId'}
                                            textField={'name'}
                                            required
                                            rules={{
                                                required: SELECT_LIST_TYPE,
                                                validate: (value) => {
                                                    const status = handleDupValue(value, idx);
                                                    if (status) {
                                                        return 'Duplicate value';
                                                    } else {
                                                        return true;
                                                    }
                                                },
                                            }}
                                        />
                                    </Col>
                                    <Col sm={1} className="fg-icons-wrapper pl0 d-flex">
                                        <div className="fg-icons mr15">
                                            <div className={`${src ? '' : 'click-off'}`}>
                                                <RSTooltip text={`Preview`}>
                                                    <i
                                                        className={`${eye_medium} icon-md color-primary-blue`}
                                                        id="rs_data_eye"
                                                        onClick={() => {
                                                            setPreviewData(() => ({
                                                                show: true,
                                                                type: creativeWatch[idx]?.type?.type,
                                                                src: src,
                                                                title: creativeWatch[idx]?.type?.name,
                                                            }));
                                                        }}
                                                    ></i>
                                                </RSTooltip>
                                            </div>
                                        </div>

                                        <div className="fg-icons">
                                            <div className="d-flex">
                                                <RSTooltip text={`${selectIconTooltip(idx)}`}>
                                                    <i
                                                        className={`${selectIcon(idx)} icon-md ${
                                                            idx === 0 &&
                                                            (Object.keys(errors)?.includes('creatives') ||
                                                                creativeWatch?.length === 10)
                                                                ? 'click-off'
                                                                : ''
                                                        }`}
                                                        onClick={(e) => {
                                                            if (idx === 0) {
                                                                const isEmptyType = creativeWatch.some(
                                                                    (list) => !list?.type,
                                                                );
                                                                const isEmptyTypeVal = creativeWatch.some(
                                                                    (list) => !list?.typeVal,
                                                                );

                                                                if (!isEmptyType && !isEmptyTypeVal) {
                                                                    append({ type: '', typeVal: '' });
                                                                } else {
                                                                    trigger('creatives');
                                                                }
                                                            } else {
                                                                remove(idx);
                                                            }
                                                        }}
                                                    />
                                                </RSTooltip>
                                            </div>
                                        </div>
                                    </Col>
                                </>
                            )}
                        </Row>
                    </div>
                );
            })}
            <Preview
                show={previewData?.show}
                handleClose={() => {
                    setPreviewData(() => ({
                        show: false,
                        type: '',
                        src: '',
                        title: '',
                    }));
                }}
                fieldName={fieldName}
                type={previewData?.type}
                source={previewData?.src}
                title={previewData?.title}
            />
        </Fragment>
    );
};

export default Creatives;
