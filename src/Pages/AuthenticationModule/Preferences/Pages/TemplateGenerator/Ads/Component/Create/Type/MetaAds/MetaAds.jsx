import { charNumUnderScore } from 'Utils/modules/inputValidators';
import { DIGIPOP_CLICK_URL as DIGIPOP_CLICK_URL_MSG, DIGIPOP_TITLE } from 'Constants/GlobalConstant/ValidationMessage';
import { DIGIPOP_ADS_DESCRIPTION, DIGIPOP_ADS_TITLE, DIGIPOP_CAPTION, DIGIPOP_CLICK_URL, DIGIPOP_PIXELURL, DIGIPOP_TRACKER_URL } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_edge_mini, circle_plus_fill_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSInput from 'Components/FormFields/RSInput';
import RSTextarea from 'Components/FormFields/RSTextarea';
import { Col, Row } from 'react-bootstrap';
import { useFieldArray, useFormContext } from 'react-hook-form';

import { IsValidURL } from 'Utils/HookFormValidate';
import RSTooltip from 'Components/RSTooltip';
import RSTabbar from 'Components/RSTabber';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import RenderField from '../PushNotify/Component/RenderField';
import { metaResolutionList, MetaSettingResolution } from '../../../../constant';

const MetaAdsSettings = () => {
    const {
        control,
        setValue,
        watch,
        getValues,
        formState: { errors },
        reset,
    } = useFormContext();

    const uniqueName = 'digipop.metaSetting';
    const getUniqueName = (name = '') => {
        return `${uniqueName}.${name}`;
    };
    const watchPushMetaAdsSetting = watch(uniqueName);

    const { fields, append, remove } = useFieldArray({
        name: getUniqueName('metaResolution'),
        control,
    });
    const watchMetaSettingResolution = getValues(getUniqueName('metaResolution'));
    const handleModifiedTabData = () => {
        if (fields?.length) {
            const modifiedTabData = fields.map((item, index) => {
                if (item?.imageContent) {
                    return {
                        id: item.id ?? index,
                        text: item?.imageResolution?.name,
                        component: () => (
                            <RenderField
                                index={index}
                                item={item}
                                key={item?.id ?? index}
                                fieldName={getUniqueName('metaResolution')}
                            />
                        ),
                        remove: item.isOptional ? circle_minus_fill_edge_mini : '',
                        isMandatory: item?.required
                    };
                }
            });
            return modifiedTabData?.filter(Boolean);
        }
    };

    const handleAddTabResolution = (value) => {
        if (!value) return;
        const currResolution = MetaSettingResolution?.find((item) => item?.name === value);
        if (!currResolution) return;
        const newField = {
            imageResolution: {
                id: fields?.length + 1,
                size: currResolution.size,
                name: currResolution.name,
            },
            imageContent: {
                imageType: '',
                image: '',
            },
            isOptional: true,
        };
        append(newField);
    };

    const handleResolutionDropDown = () => {
        const finalResolution = watchMetaSettingResolution?.filter((resolution) => resolution?.imageContent);
        const selectedResolutions = new Set(finalResolution?.map((item) => item.imageResolution?.name) || []);

        return metaResolutionList
            .filter((resolution) => resolution?.id !== 1 && !selectedResolutions.has(resolution.name))
            .map((item) => item.name);
    };

    return (
        <div className="form-group">
            <Row>
                <Col sm={{ offset: 1, span: 8 }} className="position-relative">
                    <div className="position-absolute right-25 top-5">
                        <RSBootstrapdown
                            data={handleResolutionDropDown()}
                            flatIcon
                            containerClass={!handleResolutionDropDown()?.length ? 'click-off' : ''}
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
                        defaultTab={watchPushMetaAdsSetting?.metaDefaultTab}
                        callBack={(_, currentIndex) => {
                            setValue(getUniqueName('metaDefaultTab'), currentIndex);
                        }}
                        count={4}
                        remTabs={5}
                        onRemoveMenu={(removeIndex, item) => {
                            const filterResolution = watchMetaSettingResolution?.filter(
                                (_, index) => index !== removeIndex,
                            );
                            setValue(getUniqueName('metaResolution'), filterResolution);
                            setValue(getUniqueName('metaDefaultTab'), removeIndex - 1);
                        }}
                        customIconsize="xs"
                    />
                </Col>
                <div className="form-group mt30">
                    <Row>
                        <Col sm={{ offset: 1, span: 2 }}>
                            <label className="control-label-left">{DIGIPOP_ADS_TITLE}</label>
                        </Col>
                        <Col md={6}>
                            <RSInput
                                control={control}
                                name={getUniqueName('title')}
                                placeholder={DIGIPOP_ADS_TITLE}
                                required
                                rules={{
                                    required: DIGIPOP_TITLE,
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
                            <label className="control-label-left">{DIGIPOP_ADS_DESCRIPTION}</label>
                        </Col>
                        <Col md={6} className='addAudienceTextarea'>
                            <RSTextarea
                                control={control}
                                name={getUniqueName('description')}
                                placeholder={DIGIPOP_ADS_DESCRIPTION}
                                required
                                onKeyDown={charNumUnderScore}
                                rules={{required : DIGIPOP_ADS_DESCRIPTION}}
                            />
                        </Col>
                    </Row>
                </div>
                <div className="form-group">
                    <Row>
                        <Col sm={{ offset: 1, span: 2 }}>
                            <label className="control-label-left">{DIGIPOP_CLICK_URL}</label>
                        </Col>
                        <Col md={6}>
                            <RSInput
                                control={control}
                                name={getUniqueName('clickURL')}
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
                            <label className="control-label-left">{DIGIPOP_CAPTION}</label>
                        </Col>
                        <Col md={6} className='addAudienceTextarea'>
                            <RSTextarea
                                control={control}
                                name={getUniqueName('caption')}
                                placeholder={DIGIPOP_CAPTION}
                                required
                                rules={{required : DIGIPOP_CAPTION}}
                            />
                        </Col>
                    </Row>
                </div>
                <div className="form-group">
                    <Row>
                        <Col sm={{ offset: 1, span: 2 }}>
                            <label className="control-label-left">{DIGIPOP_PIXELURL}</label>
                        </Col>
                        <Col md={6}>
                            <RSInput
                                control={control}
                                name={getUniqueName('pixelURL')}
                                placeholder={DIGIPOP_PIXELURL}
                            />
                        </Col>
                    </Row>
                </div>
            </Row>
        </div>
    );
};

export default MetaAdsSettings;
