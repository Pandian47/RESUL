import { REPORT_AS_EXCEL } from 'Constants/GlobalConstant/Placeholders';
import { arrow_right_large, download_large } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { FormProvider, useForm } from 'react-hook-form';

import RSTooltip from 'Components/RSTooltip';
import RSModal from 'Components/RSModal';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import RSInput from 'Components/FormFields/RSInput';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSDateRangePicker from 'Components/RSDateRangePicker';
import RSSwitch from 'Components/FormFields/RSSwitch';
import RSTabbar from 'Components/RSTabber';
import { FORM_INITIAL_STATE, FREQUENCY_TAB_CONFIG } from './constant';
import RSTextarea from 'Components/FormFields/RSTextarea';
const RequestDownload = (props) => {
    const [downloadModal, setDownloadModal] = useState(false);
    const [copied, setCopied] = useState(false);

    const methods = useForm(FORM_INITIAL_STATE);
    const { control, watch } = methods;
    const [share, scheduleDownload] = watch(['share', 'scheduleDownload']);

    const isLink = share === 'Link';

    const handleClose = () => setDownloadModal(false);

    const handleCopy = () => {
        setCopied(true);
        setTimeout(() => {
            setCopied(false);
        }, 3000);
    };

    return (
        <FormProvider {...methods}>
            <RSTooltip position="top" text="Downloads">
                <i
                    id='rs_data_download'
                    className={`${props.icon ? props.icon : download_large} icon-${
                        props?.size ? props?.size : 'lg'
                    } ${props?.color ? props?.color : 'color-whites'}`}
                    onClick={() => setDownloadModal(true)}
                />
            </RSTooltip>
            <RSModal
                show={downloadModal}
                handleClose={handleClose}
                header="Request to share/download"
                size="xl"
                body={
                    <>
                        <Row className="mb23">
                            <Col sm={4}>I would you like to share</Col>
                            <Col sm={2}>
                                <RSRadioButton name="share" control={control} defaultValue={share} labelName="Link" />
                            </Col>
                            <Col sm={2}>
                                <RSRadioButton
                                    name="share"
                                    control={control}
                                    defaultValue={share}
                                    labelName={REPORT_AS_EXCEL}
                                />
                            </Col>
                        </Row>
                        {isLink ? (
                            <Row className="mb23">
                                <Col sm={4} />
                                <Col sm={3}>
                                    <RSInput
                                        name="url"
                                        control={control}
                                        disabled
                                        defaultValue={'https://reports.resu.io/3Vh78gh'}
                                    />
                                </Col>
                                <Col sm={4}>
                                    <RSInput name="link" control={control} defaultValue={'FlipkartBestBuyingDays'} />
                                </Col>
                                <Col sm={1} className="p0">
                                    <RSTooltip position="top" text="Copy to clipboard">
                                        <div className="d-flex align-items-center">
                                            Copy{' '}
                                            <i
                                                className={`${arrow_right_large} color-primary-blue`}
                                                onClick={handleCopy}
                                            />
                                        </div>
                                    </RSTooltip>
                                </Col>
                                {copied && (
                                    <label className="float-end color-primary-green">Copied successfully!</label>
                                )}
                            </Row>
                        ) : (
                            <>
                                <Row className="mb23">
                                    <Col sm={4}>Date</Col>
                                    <Col sm={6}>
                                        <RSDateRangePicker mainClass="float-start" />
                                    </Col>
                                </Row>
                                <Row className="mb23">
                                    <Col sm={4}>Schedule download</Col>
                                    <Col sm={8}>
                                        <RSSwitch name="scheduleDownload" control={control} />{' '}
                                    </Col>
                                </Row>
                                {scheduleDownload && (
                                    <>
                                        <Row className="mb23">
                                            <Col sm={4}>
                                                <label>Frequency</label>
                                            </Col>
                                            <Col sm={8}>
                                                <RSTabbar
                                                    dynamicTab={`rs-content-tabs-2 rct-ra`}
                                                    activeClass={`active`}
                                                    tabData={FREQUENCY_TAB_CONFIG(control)}
                                                    defaultTab={0}
                                                    callBack={() => {
                                                        resetField('daily');
                                                        resetField('weekly');
                                                        resetField('monthly');
                                                    }}
                                                />
                                            </Col>
                                        </Row>
                                        <Row className="mb23">
                                            <Col sm={4}>Email</Col>
                                            <Col sm={8}>
                                                <RSTextarea name={'email'} control={control} />
                                                <i className="fs12">Upto 5 emails with comma separator</i>
                                            </Col>
                                        </Row>
                                    </>
                                )}
                            </>
                        )}
                        <div className="float-end mt10">
                            <RSSecondaryButton className={'mr23'} onClick={handleClose} id="rs_RequestDownload_Cancel">
                                Cancel
                            </RSSecondaryButton>
                            <RSPrimaryButton onClick={handleClose} id="rs_RequestDownload_save">
                                {isLink ? 'Save' : scheduleDownload ? 'Send' : 'Download'}
                            </RSPrimaryButton>
                        </div>
                    </>
                }
            />
        </FormProvider>
    );
};

export default RequestDownload;
