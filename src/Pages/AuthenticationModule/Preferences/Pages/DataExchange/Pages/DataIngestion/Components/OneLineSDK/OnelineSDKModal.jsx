import { circle_plus_fill_edge_medium, eye_mini } from 'Constants/GlobalConstant/Glyphicons';
import { selectIcon } from 'Utils/modules/display';
import { DOMAIN_URL as DOMAIN_URL_MSG, NOTIFICATION_APP_KEY as NOTIFICATION_APP_KEY_MSG, PROJECT_ID as PROJECT_ID_MSG } from 'Constants/GlobalConstant/ValidationMessage';
import { LIST_NAME_RULES } from 'Constants/GlobalConstant/Rules';
import { DOMAIN_URL, NOTIFICATION_APP_KEY, PROJECT_ID } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { useForm, useFieldArray, useWatch } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import RSModal from 'Components/RSModal';
import SdkComponent from './SdkComponent';
import { sdkData } from '../../../constant';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import WebSDKModal from '../WebSDK/WebSDKModal';
import OnlineLineSDKGenerate from '../OnlineLineSDKGenerate/OnlineLineSDKGenerate';

const OneLineSDKModal = ({ show, handleCloseOnleLine, setOneLineSDKFlag }) => {
    const { control, handleSubmit, watch, register } = useForm({
        defaultValues: {
            oneLineSDK: '',
            oneLineSDKData: [{ domainURL: '', projectID: '', key: '' }],
        },
    });
    const viewData = Object.keys(sdkData);
    const [isShow, setIsShow] = useState(false);
    const [openWebSDK, setOpenWebSDK] = useState(false);
    const [openGenerateSDK, setOpenGenerateSDK] = useState(false);
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'oneLineSDKData',
    });

    const oneLineSDKDataWatch = useWatch({
        control,
        name: 'oneLineSDKData',
    });
    const addoneLineSDKData = (index) => {
        if (index === 0) {
            append({ domainURL: '', projectID: '', key: '' });
        } else {
            remove(index);
        }
    };
    const [oneLineSDK] = watch(['oneLineSDK']);

    useEffect(() => {
        setIsShow(show);
    }, [show]);

    const handleSave = (data) => {
        
        handleCloseOnleLine(false);
        setOpenGenerateSDK(true);
    };

    const handleOPenWebSDk = () => {
        setOpenWebSDK(true);
        handleCloseOnleLine(true);
    };

    return (
        <>
            <RSModal
                show={isShow}
                size="xlg"
                header={'One-line SDK'}
                handleClose={handleCloseOnleLine}
                body={
                    <form onSubmit={handleSubmit(handleSave)} className="form-group mb20">
                        <Row>
                            <Col>
                                <h4 className="mb10">Web domain</h4>
                                <p>Add the web domain to enable web push notifications.</p>
                            </Col>
                        </Row>
                        {fields.map((ele, index) => {
                            
                            return (
                                <Row className="my30" key={ele.id}>
                                    {/* <Col sm={4} className="text-right">
                                <label className="control-label-left">One-line SDK</label>
                            </Col>
                            <Col sm={4}>
                                <RSInput type={'text'} name={'oneLineSDK'} control={control} ref={register} />
                            </Col>
                            <Col sm={4}>
                                <i className={eye_mini} onClick={handleOPenWebSDk}></i>
                            </Col> */}
                                    <div className="width95p">
                                        <Row>
                                            <Col>
                                                <RSInput
                                                    control={control}
                                                    name={`oneLineSDKData[${index}].domainURL`}
                                                    placeholder={DOMAIN_URL}
                                                    rules={LIST_NAME_RULES(DOMAIN_URL_MSG)}
                                                    required
                                                    ref={register}
                                                />
                                            </Col>
                                            <Col>
                                                <RSInput
                                                    control={control}
                                                    name={`oneLineSDKData[${index}].projectID`}
                                                    placeholder={PROJECT_ID}
                                                    rules={LIST_NAME_RULES(PROJECT_ID_MSG)}
                                                    required
                                                    ref={register}
                                                />
                                            </Col>
                                            <Col>
                                                <RSInput
                                                    control={control}
                                                    name={`oneLineSDKData[${index}].key`}
                                                    placeholder={NOTIFICATION_APP_KEY}
                                                    rules={LIST_NAME_RULES(NOTIFICATION_APP_KEY_MSG)}
                                                    required
                                                    ref={register}
                                                />
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="pl0 width5p d-flex align-items-end">
                                        <Row>
                                            <Col className="d-flex align-items-end">
                                                <i
                                                    onClick={() => addoneLineSDKData(index)}
                                                    className={`${selectIcon(index)} icon-md cp ${
                                                        fields?.length > 4 && index == 0 ? 'click-off' : ''
                                                    }`}
                                                ></i>
                                                {/* <i
                                            className={`${circle_plus_fill_edge_medium} color-primary-blue icon-md`}
                                            
                                            onClick={handleClick}
                                        ></i> */}
                                            </Col>
                                        </Row>
                                    </div>
                                </Row>
                            );
                        })}
                        <Row className="mb30">
                            <Col>
                                <h4 className="mb10">Integrated systems</h4>
                                <p>Select integrated systems to include in RESUL SDK tracking.</p>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                                {/* <h4 className="mb10">Web analytics</h4> */}
                                {viewData?.map((item, index) => {
                                    return (
                                        <div className="sourceCategory" key={index}>
                                            <h4 className="pl0">{item}</h4>
                                            <Row>
                                                <SdkComponent dataExchange={sdkData[item]} />
                                            </Row>
                                        </div>
                                    );
                                })}
                            </Col>
                        </Row>
                        <Row>
                            <div className="btn-container d-flex justify-content-end mt0">
                                <RSSecondaryButton
                                    className={'mr15'}
                                    onClick={() => {
                                        handleCloseOnleLine(false);
                                    }}
                                >
                                    Cancel
                                </RSSecondaryButton>
                                <RSPrimaryButton type="submit">Generate</RSPrimaryButton>
                            </div>
                        </Row>
                    </form>
                }
            />
            <WebSDKModal
                show={openWebSDK}
                handleCloseWeb={(status) => {
                    if (!status) {
                        setOpenWebSDK(false);
                        handleCloseOnleLine(false);
                    }
                }}
                value={oneLineSDK}
            />
            <OnlineLineSDKGenerate
                show={openGenerateSDK}
                handleCloseGenerate={(status) => {
                    if (!status) {
                        setOpenGenerateSDK(false);
                    }
                }}
                handleSaveGenerate={(status) => {
                    if (!status) {
                        setOpenGenerateSDK(false);
                        setOpenWebSDK(true);
                    }
                }}
                value={oneLineSDK}
            />
        </>
    );
};

export default OneLineSDKModal;
