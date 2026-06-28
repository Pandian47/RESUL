import { findDuplicates } from 'Utils/modules/dateTime';
import { selectIcon } from 'Utils/modules/display';
import { MAX_LENGTH250, MAX_LENGTH50 } from 'Constants/GlobalConstant/Regex';
import { ACCOUNT_MAIL, ANALYTIC_PLATFORM as ANALYTIC_PLATFORM_MSG, APP_KEY as APP_KEY_MSG, DUPLICATE_VALUE, SECTRECT_ID } from 'Constants/GlobalConstant/ValidationMessage';
import { ANALYTIC_PLATFORM, APP_KEY, SECRECT_ID, SERVICE_ACCOUNT } from 'Constants/GlobalConstant/Placeholders';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import RSTooltip from 'Components/RSTooltip';

import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';

import { useSelector } from 'react-redux';
import { FORM_INITIAL_STATE } from 'Pages/AuthenticationModule/Preferences/Pages/CommunicationSettings/Pages/ChannelSettings/Pages/Notification/Tabs/Web/constant';
const WebanalyticsSettings = () => {
    const { control, trigger, getFieldState } = useFormContext(FORM_INITIAL_STATE);

    const { getWebPushAnalyticsListData } = useSelector(
        ({ communicationSettingsReducer }) => communicationSettingsReducer,
    );
    const { fields, append, remove } = useFieldArray({
        control,
        name: 'webanalyticsetting',
    });
    const webanalyticsWatch = useWatch({
        control,
        name: 'webanalyticsetting',
    });
    
    const addwebanalytics = (index) => {
        const webAnalyticsSettingsState = getFieldState('webanalyticsetting');
        if (index === 0) {
            let validationState = webanalyticsWatch.findIndex((list) => {
                let values = Object.values(list);
                return values.includes('');
            });

            if (validationState === -1 && !webAnalyticsSettingsState.invalid) {
                append({ analyticsplatformId: '', serviceAccountEmail: '', appKey: '', appSecretId: '' });
            } else {
                trigger(`webanalyticsetting`);
            }
        } else {
            remove(index);
        }
    };
    return (
        <div className="form-group mb0">
            {fields.map((field, index) => (
                <div className="webanalyticsContainer mt30" key={field.id}>
                    <Row>
                        <Col sm={11}>
                            <div className="rs-box-repeat rsbr-block width106p">
                                <Row>
                                    <Col sm={6} id="rs_WebanalyticsSettings_analyticsdomainName">
                                        <RSKendoDropDownList
                                            control={control}
                                            name={`webanalyticsetting[${index}].analyticsplatformId`}
                                            label={ANALYTIC_PLATFORM}
                                            data={getWebPushAnalyticsListData}
                                            textField={'analyticsDomainName'}
                                            dataItemKey={'analyticsDomainId'}
                                            required
                                            rules={{
                                                required: ANALYTIC_PLATFORM_MSG,
                                                validate: () => {
                                                    const [status, _] = findDuplicates(
                                                        webanalyticsWatch,
                                                        'analyticsplatformId.analyticsDomainName',
                                                    );
                                                    return status ? DUPLICATE_VALUE : true;
                                                },
                                            }}
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <RSInput
                                            control={control}
                                            name={`webanalyticsetting[${index}].serviceAccountEmail`}
                                            placeholder={SERVICE_ACCOUNT}
                                            id="rs_WebanalyticsSettings_Serviceaccountmail"
                                            required
                                            maxLength={MAX_LENGTH50}
                                            rules={{ required: ACCOUNT_MAIL }}
                                        />
                                    </Col>
                                </Row>
                                <div className="mt30">
                                    <Row>
                                        <Col sm={6}>
                                            <RSInput
                                                control={control}
                                                id="rs_WebanalyticsSettings_appkey"
                                                name={`webanalyticsetting[${index}].appKey`}
                                                placeholder={APP_KEY}
                                                required
                                                maxLength={MAX_LENGTH250}
                                                rules={{ required: APP_KEY_MSG }}
                                            />
                                        </Col>
                                        <Col sm={6}>
                                            <RSInput
                                                control={control}
                                                name={`webanalyticsetting[${index}].appSecretId`}
                                                id="rs_WebanalyticsSettings_appSecretId"
                                                placeholder={SECRECT_ID}
                                                required
                                                maxLength={MAX_LENGTH250}
                                                rules={{ required: SECTRECT_ID }}
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </Col>
                        <Col sm={1} className="d-flex">
                            <div className="rs-was-icon ml35 mb-8">
                                <RSTooltip text={index === 0 ? 'Add' : 'Delete'} position="top">
                                    <i
                                        onClick={() => addwebanalytics(index)}
                                        className={`${selectIcon(index)} mt10 icon-md cp ${
                                            fields?.length > 2 && index == 0 ? 'click-off' : ''
                                        }`}
                                    ></i>
                                </RSTooltip>{' '}
                            </div>
                        </Col>
                    </Row>
                </div>
            ))}
        </div>
    );
};

export default WebanalyticsSettings;
