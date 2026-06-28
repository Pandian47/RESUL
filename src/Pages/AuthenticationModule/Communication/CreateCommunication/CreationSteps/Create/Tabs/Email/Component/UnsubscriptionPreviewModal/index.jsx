import { CANCEL, CHANNEL_TYPE, COMMUNICATION_TYPE, EMAIL, PRODUCTType, REASON_TYPE, UNSUBSCRIBE } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useForm, FormProvider } from 'react-hook-form';
import _isEmpty from 'lodash/isEmpty';

import RSModal from 'Components/RSModal';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSInput from 'Components/FormFields/RSInput';
import RSImageUpload from 'Components/FormFields/RSImageUpload';
import RSCheckbox from 'Components/FormFields/RSCheckbox';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import { maskEmailTwoCharsBeforeAndAfterDomain } from 'Utils/modules/masking';

const UnsubscriptionPreviewModal = ({ show, handleClose, previewData }) => {
    const [isShow, setIsShow] = useState(false);
    const methods = useForm({
        defaultValues: {
            logoPath: '',
            title: '',
            message: '',
            emailId: '',
            communicationType: [],
            productType: [],
            channelType: [],
            reason: [],
            termsCondition: false,
            termsCondtionUrl: '',
            selected_reason: null,
        },
    });

    const { control, setValue, getValues } = methods;

    useEffect(() => {
        setIsShow(!!show);
    }, [show]);

    useEffect(() => {
        if (previewData && show) {
            // Set form values directly from preview data
            if (previewData.logoPath) setValue('logoPath', previewData.logoPath);
            if (previewData.title) setValue('title', previewData.title);
            if (previewData.message) setValue('message', previewData.message);
            if (previewData.emailId) setValue('emailId', maskEmailTwoCharsBeforeAndAfterDomain(previewData.emailId));
            if (previewData.communicationType) setValue('communicationType', previewData.communicationType);
            if (previewData.productType) setValue('productType', previewData.productType);
            if (previewData.channelType) setValue('channelType', previewData.channelType);
            if (previewData.reason) {
                setValue('reason', previewData.reason);
                if (previewData.reason.length > 0) {
                    const formattedReason = previewData.reason.map((item, index) => ({
                        id: index + 1,
                        name: item,
                        value: item
                    }));
                    setValue('selected_reason', '');
                }
            }
            if (previewData.termsCondition !== undefined) setValue('termsCondition', previewData.termsCondition);
            if (previewData.termsCondtionUrl) setValue('termsCondtionUrl', previewData.termsCondtionUrl);
        }
    }, [previewData, show, setValue]);

    if (!previewData || !show) {
        return null;
    }

    const formattedReason = previewData.reason?.map((item, index) => ({
        id: index + 1,
        name: item,
        value: item
    })) || [];

    return (
        <FormProvider {...methods}>
            <RSModal
                show={isShow}
                size="xl"
                isBorder
                header={UNSUBSCRIBE}
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
                                            dangerouslySetInnerHTML={{ __html: getValues('message') || '' }}
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

                            {!_isEmpty(getValues('communicationType')) && (
                                <div className="mb32">
                                    <Row>
                                        <Col sm={3}>
                                            <label>{COMMUNICATION_TYPE}</label>
                                        </Col>
                                        <Col sm={9}>
                                            <div className="d-flex flex-wrap">
                                                {getValues('communicationType')?.map((item, index) => (
                                                    <div
                                                        key={index}
                                                        style={{ marginRight: '10px', marginBottom: '10px' }}
                                                    >
                                                        <RSCheckbox
                                                            name={`communicationType_${index}`}
                                                            control={control}
                                                            type="checkbox"
                                                            disabled
                                                        >
                                                            {item}
                                                        </RSCheckbox>
                                                    </div>
                                                ))}
                                            </div>
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {!_isEmpty(getValues('productType')) && (
                                <div className="mb32">
                                    <Row>
                                        <Col sm={3}>
                                            <label>{PRODUCTType}</label>
                                        </Col>
                                        <Col sm={9} className="d-flex flex-wrap">
                                            {getValues('productType')?.map((item, index) => (
                                                <div
                                                    key={index}
                                                    style={{ marginRight: '10px', marginBottom: '10px' }}
                                                >
                                                    <RSCheckbox
                                                        name={`productType_${index}`}
                                                        control={control}
                                                        type="checkbox"
                                                        disabled
                                                    >
                                                        {item}
                                                    </RSCheckbox>
                                                </div>
                                            ))}
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {!_isEmpty(getValues('channelType')) && (
                                <div className="mb32">
                                    <Row>
                                        <Col sm={3}>
                                            <label>{CHANNEL_TYPE}</label>
                                        </Col>
                                        <Col sm={9} className="d-flex flex-wrap">
                                            {getValues('channelType')?.map((item, index) => (
                                                <div key={index} className="mr10 mb-10">
                                                    <RSCheckbox
                                                        name={`channelType_${index}`}
                                                        control={control}
                                                        type="checkbox"
                                                        disabled
                                                    >
                                                        {item}
                                                    </RSCheckbox>
                                                </div>
                                            ))}
                                        </Col>
                                    </Row>
                                </div>
                            )}
                            {!_isEmpty(getValues('reason')) && (
                                <div className="mb32">
                                    <Row>
                                        <Col sm={3}>
                                            <label>{REASON_TYPE}</label>
                                        </Col>
                                        <Col sm={9}>
                                            <RSKendoDropdown
                                                name="selected_reason"
                                                control={control}
                                                data={formattedReason}
                                                textField="name"
                                                dataItemKey="id"
                                                label="Reason type"
                                                disabled
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            )}

                            {getValues('termsCondition') && (
                                <Row className='d-flex'>
                                    <Col sm={{offset:3,span:6}}>
                                        <RSCheckbox
                                            name="termsCondition"
                                            control={control}
                                            required
                                            type="checkbox"
                                            disabled
                                            defaultValue={true}
                                            labelClass='d-flex'
                                        >
                                            <span dangerouslySetInnerHTML={{ __html: getValues('termsCondtionUrl') || '' }} />
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
                                            {UNSUBSCRIBE}
                                        </RSPrimaryButton>
                                    </Col>
                                </Row>
                            </div>
                        </div>
                    </Fragment>
                }
            />
        </FormProvider>
    );
};

export default UnsubscriptionPreviewModal;

