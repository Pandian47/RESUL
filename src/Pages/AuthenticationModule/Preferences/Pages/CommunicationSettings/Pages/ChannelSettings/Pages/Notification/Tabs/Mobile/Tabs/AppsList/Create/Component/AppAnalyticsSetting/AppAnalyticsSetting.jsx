import { findDuplicates } from 'Utils/modules/dateTime';
import { selectIcon } from 'Utils/modules/display';
import { MAX_LENGTH250 } from 'Constants/GlobalConstant/Regex';
import { ACCOUNT_MAIL, ANALYTIC_PLATFORM as ANALYTIC_PLATFORM_MSG, APP_KEY as APP_KEY_MSG, SECTRECT_ID } from 'Constants/GlobalConstant/ValidationMessage';
import { ANALYTIC_PLATFORM, APP_KEY, SECRECT_ID, SERVICE_ACCOUNT } from 'Constants/GlobalConstant/Placeholders';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import RSTooltip from 'Components/RSTooltip';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSInput from 'Components/FormFields/RSInput';



const AppAnalyticsSetting = ({ currentIndex, fieldName, ddlData, dropdownFieldLoading = false }) => {
    const { control, trigger, getFieldState } = useFormContext();

    const name = `${fieldName}[${currentIndex}]`;

    const { fields, append, remove } = useFieldArray({
        control,
        name: `${name}.appanalyticsetting`,
    });
    const appanalyticsWatch = useWatch({
        control,
        name: `${name}.appanalyticsetting`,
    });

    const addappanalytics = (index) => {
        const appAnalyticsSettingsState = getFieldState(`${name}.appanalyticsetting`);
        if (index === 0) {
            let validationState = appanalyticsWatch.findIndex((list) => {
                let values = Object.values(list);
                return values.includes('');
            });

            if (validationState === -1 && !appAnalyticsSettingsState.invalid) {
                append({ analyticsID: '', accountMail: '', appKey: '', appSecretID: '', isActive: true });
            } else {
                trigger(`${name}.appanalyticsetting`);
            }
        } else {
            remove(index);
        }
    };
    return (
        <div className="form-group mb0">
            {fields.map((field, index) => (
                <div className="appanalyticsContainer mt30" key={field.id}>
                    <Row>
                        <Col sm={10}>
                            <div className="rs-box-repeat rsbr-block">
                                <div className='form-group'>
                                <Row>
                                    <Col sm={6} id="rs_AppAnalyticsSetting_analyticsDomainName">
                                        <RSKendoDropDownList
                                            control={control}
                                            name={`${name}.appanalyticsetting[${index}].analyticsID`}
                                            label={ANALYTIC_PLATFORM}
                                            data={ddlData}
                                            textField={'analyticsDomainName'}
                                            dataItemKey={'analyticsDomainId'}
                                            required
                                            isLoading={dropdownFieldLoading}
                                            rules={{
                                                required: ANALYTIC_PLATFORM_MSG,
                                                validate: () => {
                                                    const [status, _] = findDuplicates(
                                                        appanalyticsWatch,
                                                        'analyticsID.analyticsDomainName',
                                                    );
                                                    return status ? 'Duplicate value present for analtics Id' : true;
                                                },
                                            }}
                                        />
                                    </Col>
                                    <Col sm={6}>
                                        <RSInput
                                            control={control}
                                            id="rs_AppAnalyticsSetting_accountMail"
                                            name={`${name}.appanalyticsetting[${index}].accountMail`}
                                            placeholder={SERVICE_ACCOUNT}
                                            required
                                            maxLength={MAX_LENGTH250}
                                            rules={{ required: ACCOUNT_MAIL }}
                                        />
                                    </Col>
                                </Row>
                                </div>
                                <div className="form-group mb0">
                                    <Row>
                                        <Col sm={6}>
                                            <RSInput
                                                control={control}
                                                name={`${name}.appanalyticsetting[${index}].appKey`}
                                                id="rs_AppAnalyticsSetting_appKey"
                                                placeholder={APP_KEY}
                                                required
                                                maxLength={MAX_LENGTH250}
                                                rules={{ required: APP_KEY_MSG }}
                                            />
                                        </Col>
                                        <Col sm={6}>
                                            <RSInput
                                                control={control}
                                                name={`${name}.appanalyticsetting[${index}].appSecretID`}
                                                placeholder={SECRECT_ID}
                                                required
                                                maxLength={MAX_LENGTH250}
                                                rules={{ required: SECTRECT_ID }}
                                                id="rs_AppAnalyticsSetting_SecretID"
                                            />
                                        </Col>
                                    </Row>
                                </div>
                            </div>
                        </Col>
                        <Col sm={1} className="d-flex pl0 position-relative bottom-9">
                            <div className="rs-was-icon">
                                <RSTooltip text={index === 0 ? 'Add' : 'Delete'} position="top">
                                    <i
                                        onClick={() => addappanalytics(index)}
                                        className={`${selectIcon(index)} icon-md cp ${
                                            fields?.length > 2 && index == 0 ? 'click-off' : ''
                                        }`}
                                    ></i>
                                </RSTooltip>
                            </div>
                        </Col>
                    </Row>
                </div>
            ))}
        </div>
    );
};

export default AppAnalyticsSetting;
