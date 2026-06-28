import { CANCEL, CHANNEL_TYPE, COMMUNICATION_TYPE, EMAIL, INTREST_TYPE, PRODUCTType, REASON_TYPE, SUBSCRIBE, SUBSCRIPTION, TERMSCONDITIONS, UNSUBSCRIBE } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import _isEmpty from 'lodash/isEmpty';
import _map from 'lodash/map';

import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import RSImageUpload from 'Components/FormFields/RSImageUpload';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import { INITIAL_STATE } from '../../../../../constants';
import { useSelector } from 'react-redux';
import { getCSSubscribeEditData } from 'Reducers/preferences/CommunicationSettings/selector';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import { maskEmailTwoCharsBeforeAndAfterDomain } from 'Utils/modules/masking';

const PreviewContent = ({ show, handleClose, modalName }) => {
    const [isShow, setIsShow] = useState(false);

    useEffect(() => {
        setIsShow(!!show);
    }, [show]);

    const { control, getValues, setValue } = useFormContext();
    const { communicationType, productType, channelType, interest, termsCondition, message, logoPath,unsubscribeURL,termsCondtionUrl } = getValues();

    const formattedInterest = interest?.map((item, index) => ({
        id: index + 1,
        name: item,
        value: item
    }));
    
    const { communicationTypes, communicationOptions } = useSelector(
        ({ communicationPlanReducer }) => communicationPlanReducer,
    );
    const productTypes = communicationOptions?.product || [];
    const subscribeUpdateData = useSelector((state) => getCSSubscribeEditData(state));
    const communicationTypeChecked = _map(communicationType, 'campaignAttributeId');
    const productTypeChecked = _map(productType, 'categoryId');
    const channelTypeChecked = _map(channelType, 'id');

    const [state, setState] = useState(INITIAL_STATE.previewData);
    // console.log('state: ', state);
    useEffect(() => {
        if(subscribeUpdateData?.emailId){
            setValue('emailId', maskEmailTwoCharsBeforeAndAfterDomain(subscribeUpdateData?.emailId));
        }
    }, [subscribeUpdateData]);
    return (
        <RSModal
            show={isShow}
            size="xl"
            isBorder
            header={modalName}
            handleClose={handleClose}
            className="rs-subunsub-modal"
            isHeaderTitle
            body={
                <Fragment>
                    <div className="d-grid pointer-event-none">
                        <Row>
                            <Col>
                                <RSImageUpload
                                    name={'logoPath'}
                                    setValue={() => {}}
                                    control={control}
                                    className="rs-picture m-auto mb32"
                                    setError={() => {}}
                                    clearErrors={() => {}}
                                    disabled
                                    note={false}
                                    isPreview
                                />
                            </Col>
                        </Row>
                        {!_isEmpty(getValues('title')) && (
                        <Row>
                            <Col sm={12}>
                                <RSInput
                                    name={'title'}
                                    control={control}
                                    className={'fs23 border-bottom-0 cursor-default color-primary-blue mb32'}
                                />
                            </Col>
                        </Row>
                        )}

                        <div className="mb32">
                        <Row>
                            <Col>
                                <div
                                    className="p15 previewHtml bg-tertiary-blue"
                                    dangerouslySetInnerHTML={{ __html: message }}
                                />
                            </Col>
                        </Row>
                        </div>
                        {!_isEmpty(getValues('emailId')) && (
                        <div className="mb32">
                        <Row>
                            <Col sm={3}>
                                <label>{EMAIL}</label>
                            </Col>
                            <Col sm={9}>
                                <RSInput
                                    name={'emailId'}
                                    control={control}
                                    className={'font-xsm border-bottom-0 cursor-default'}
                                />
                            </Col>
                        </Row>
                        </div>
                        )}

                        {!_isEmpty(communicationType) && (
                             <div className="mb32">
                            <Row>
                                <Col sm={3}>
                                    <label>{COMMUNICATION_TYPE}</label>
                                </Col>
                                <Col sm={9}>
                                    <div className="d-flex flex-wrap">
                                        {communicationType?.map((res) => (
                                            <div
                                                key={res?.campaignAttributeId}
                                                style={{ marginRight: '10px', marginBottom: '10px' }}
                                            >
                                                <RSCheckbox
                                                    name={res?.attributename}
                                                    control={control}
                                                    type="checkbox"
                                                    disabled
                                                    defaultValue={false}
                                                >
                                                    {res?.attributename}
                                                </RSCheckbox>
                                            </div>
                                        ))}
                                    </div>
                                </Col>
                            </Row>
                            </div>
                        )}

                        {!_isEmpty(productType) && (
                             <div className="mb32">
                            <Row>
                                <Col sm={3}>
                                    <label>{PRODUCTType}</label>
                                </Col>
                                <Col sm={9} className="d-flex flex-wrap">
                                    {productType?.map((res) => (
                                        <div
                                            key={res?.categoryId}
                                            style={{ marginRight: '10px', marginBottom: '10px' }}
                                        >
                                            <RSCheckbox
                                                name={res?.categoryname}
                                                control={control}
                                                type="checkbox"
                                                disabled
                                                defaultValue={false}
                                            >
                                                {res?.categoryname}
                                            </RSCheckbox>
                                        </div>
                                    ))}
                                </Col>
                            </Row>
                            </div>
                        )}

                        {!_isEmpty(channelType) && (
                             <div className="mb32">
                            <Row>
                                <Col sm={3}>
                                    <label>{CHANNEL_TYPE}</label>
                                </Col>
                                <Col sm={9} className="d-flex flex-wrap">
                                    {channelType.map((res) => (
                                        <div key={res?.id} className="mr10 mb-10">
                                            <RSCheckbox
                                                name={res?.name}
                                                control={control}
                                                type="checkbox"
                                                disabled
                                                defaultValue={false}
                                            >
                                                {res?.name}
                                            </RSCheckbox>
                                        </div>
                                    ))}
                                </Col>
                            </Row>
                            </div>
                        )}
                        {!_isEmpty(interest) && (
                            <div className="mb32">
                                <Row>
                                    <Col sm={3}>
                                        <label>{modalName === SUBSCRIPTION ? INTREST_TYPE: REASON_TYPE}</label>
                                    </Col>
                                    <Col sm={9}>
                                        <RSKendoDropdown
                                            name="selected_interest"
                                            control={control}
                                            data={formattedInterest}
                                            textField="name"
                                            dataItemKey="id"
                                            label={modalName === SUBSCRIPTION ? 'Select interest type' : 'Select reason type' }
                                        />
                                    </Col>
                                </Row>
                            </div>
                        )}

                        {termsCondition && (
                            <Row className='d-flex'>
                                <Col sm={{offset:3,span:6}}>
                                    <RSCheckbox
                                        name="termsCondition"
                                        control={control}
                                        required
                                        type="checkbox"
                                        disabled
                                        defaultValue={false}
                                        labelClass='d-flex'
                                    >
                                        {/* <a
                                            href={unsubscribeURL?unsubscribeURL :"https://www.go.resul.io/terms-and-conditions"}
                                            target="_blank"
                                            className="click-off rs-link-secondary-login position-relative top1"
                                        >
                                            {unsubscribeName ?unsubscribeName : TERMSCONDITIONS}
                                        </a> */}


                                          <span dangerouslySetInnerHTML={{ __html: termsCondtionUrl }} />

                                    </RSCheckbox>
                                </Col>
                            </Row>
                        )}
                            <div className="click-off mt32 mb19">
                            <Row>
                            <Col sm={3} />
                            <Col sm={9}>
                                    <RSSecondaryButton onClick={() => handleClose()}>{CANCEL}</RSSecondaryButton>
                                    <RSPrimaryButton onClick={() => handleClose()} className='ml17'>
                                        {modalName === SUBSCRIPTION ? SUBSCRIBE : UNSUBSCRIBE }
                                    </RSPrimaryButton>
                                </Col>
                            </Row>
                        </div>
                    </div>
                        
                </Fragment>
            }
        />
    );
};

export default PreviewContent;
