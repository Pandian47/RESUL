import { charNumUnderScore, onlyNumbers } from 'Utils/modules/inputValidators';
import { DIGIPOP_CLICK_URL as DIGIPOP_CLICK_URL_MSG, DIGIPOP_TITLE as DIGIPOP_TITLE_MSG } from 'Constants/GlobalConstant/ValidationMessage';
import { DIGIPOP_CLICK_URL, DIGIPOP_DESCRIPTION, DIGIPOP_TARGET_CLICK, DIGIPOP_TARGET_DAILY_CLICK, DIGIPOP_TITLE, DIGIPOP_TRACKER_URL } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_edge_mini, circle_plus_fill_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSInput from 'Components/FormFields/RSInput';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';

import RSTooltip from 'Components/RSTooltip';
import RSTabbar from 'Components/RSTabber';
import RenderField from './Component/RenderField';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';

const PushNotifySetting = () => {
    const {
        control,
        setValue,
        watch,
        getValues,
        formState: { errors },
    } = useFormContext();
    const [dropresol, setTabResol] = useState([{ id: 1, size: '420x300' }]);

    const uniqueName = 'digipop.pushNotifySetting';
    const getUniqueName = (name = '') => {
        return `${uniqueName}.${name}`;
    };
    const watchPushNotifySetting = watch(uniqueName);

    const getUniqueFielArrayName = (name = '', index) => {
        const uniqueName = `${getUniqueName('pushNotifyResolution')}[${index}]`;
        return `${uniqueName}.${name}`;
    };
    const { fields, append, remove } = useFieldArray({
        name: getUniqueName('pushNotifyResolution'),
        control,
    });
    const watchPushNotifyResolution = useWatch({
        control,
        name: getUniqueName('pushNotifyResolution'),
    });

    const handleModifiedTabData = () => {
        if (fields?.length) {
            const modifiedTabData = fields.map((item, index) => {
                return {
                    id: index,
                    text: item?.imageResolution?.size,
                    component: () => (
                        <RenderField
                            index={index}
                            item={item}
                            key={item?.id ?? index}
                            fieldName={getUniqueName('pushNotifyResolution')}
                        />
                    ),
                    remove: item.isOptional ? circle_minus_fill_edge_mini : '',
                };
            });
            return modifiedTabData;
        }
    };

    const handleAddTabResolution = (value) => {
        append({
            imageResolution: { id: fields?.length + 1, size: value },
            imageContent: {
                imageType: '',
                image: '',
            },
            isOptional: true,
        });
    };
    const handleResolutionDropDown = () => {
        const selectedResolutions = fields?.map((item) => item.imageResolution?.size) || [];

        return dropresol
            .filter((resolution) => !selectedResolutions.includes(resolution.size))
            .map((item) => item.size);
    };

    return (
        <div className="form-group">
            <Row>
                <Col sm={{ offset: 1, span: 8 }} className="position-relative">
                    <div className="position-absolute right-25 top-5">
                        <RSBootstrapdown
                            data={handleResolutionDropDown()}
                            flatIcon
                            defaultItem={
                                <RSTooltip text="Add" className="lh0">
                                    <i
                                        className={`${circle_plus_fill_edge_medium} icon-md color-primary-blue icon-hover-shadow-primary`}
                                        id="rs_data_circle_plus_fill_edge"
                                    />
                                </RSTooltip>
                            }
                            showUpdate={false}
                            className="no_caret"
                            onSelect={(e) => {
                                handleAddTabResolution(e);
                            }}
                        />
                    </div>
                    <RSTabbar
                        defaultClass={`col-md-2 tabTransparent `}
                        dynamicTab={`mb0 mini`}
                        activeClass={`active`}
                        tabData={handleModifiedTabData()}
                        className="res-tabs-2 rs-tabs-auto-width digipop-tab d-flex flex-row-reverse css-scrollbar-y"
                        componentClassName={'mt20'}
                        defaultTab={watchPushNotifySetting?.pushNotifyDefaultTab}
                        callBack={(_, currentIndex) => {
                            setValue(getUniqueName('pushNotifyDefaultTab'), currentIndex);
                        }}
                        count={4}
                        remTabs={5}
                        onRemoveMenu={(removeIndex, item) => {
                            const fieldName = getUniqueName('pushNotifyResolution');
                            const pushNotifyResolution = getValues(getUniqueName('pushNotifyResolution'));
                            const filterResolution = pushNotifyResolution?.filter((_, index) => index !== removeIndex);
                            setValue(fieldName, filterResolution);
                            setValue(getUniqueName('pushNotifyDefaultTab'), removeIndex - 1);
                        }}
                        customIconsize="xs"
                    />
                </Col>
                <div className="form-group mt30">
                    <Row>
                        <Col sm={{ offset: 1, span: 2 }}>
                            <label className="control-label-left">{DIGIPOP_TITLE}</label>
                        </Col>
                        <Col md={6}>
                            <RSInput
                                control={control}
                                name={getUniqueName('title')}
                                placeholder={DIGIPOP_TITLE}
                                required
                                rules={{
                                    required: DIGIPOP_TITLE_MSG,
                                }}
                            />
                        </Col>
                    </Row>
                </div>
                {/* <div className="form-group">
                    <Row>
                        <Col sm={{ offset: 1, span: 2 }}>
                            <label className="control-label-left">{DIGIPOP_CLICK_URL}</label>
                        </Col>
                        <Col md={6}>
                            <RSInput
                                control={control}
                                name={getUniqueName('clickUrl')}
                                placeholder={DIGIPOP_CLICK_URL}
                                rules={{
                                    required: DIGIPOP_CLICK_URL_MSG,
                                    validate: (value) => {
                                        return value && IsValidURL(value);
                                    },
                                }}
                                required
                            />
                        </Col>
                    </Row>
                </div>
                <div className="form-group">
                    <Row>
                        <Col sm={{ offset: 1, span: 2 }}>
                            <label className="control-label-left">{DIGIPOP_TRACKER_URL}</label>
                        </Col>
                        <Col md={6}>
                            <RSInput
                                control={control}
                                name={getUniqueName('trackUrl')}
                                placeholder={DIGIPOP_TRACKER_URL}
                                rules={{
                                    validate: (value) => {
                                        return value ? IsValidURL(value) : true;
                                    },
                                }}
                            />
                        </Col>
                    </Row>
                </div> */}
                <div className="form-group">
                    <Row>
                        <Col sm={{ offset: 1, span: 2 }}>
                            <label className="control-label-left">{DIGIPOP_DESCRIPTION}</label>
                        </Col>
                        <Col md={6}>
                            <RSTextarea
                                control={control}
                                name={getUniqueName('description')}
                                placeholder={DIGIPOP_DESCRIPTION}
                                required
                                onKeyDown={charNumUnderScore}
                            />
                        </Col>
                    </Row>
                </div>
                <div className="form-group d-none">
                    <Row>
                        <Col>
                            <RSInput
                                control={control}
                                name={getUniqueName('targetClick')}
                                placeholder={DIGIPOP_TARGET_CLICK}
                                onKeyDown={onlyNumbers}
                                maxLength={8}
                            />
                        </Col>
                    </Row>
                </div>
                <div className="form-group d-none">
                    <Row>
                        <Col>
                            <RSInput
                                control={control}
                                name={getUniqueName('targetDailyClick')}
                                placeholder={DIGIPOP_TARGET_DAILY_CLICK}
                                onKeyDown={onlyNumbers}
                                maxLength={4}
                            />
                        </Col>
                    </Row>
                </div>
            </Row>
        </div>
    );
};

export default PushNotifySetting;
