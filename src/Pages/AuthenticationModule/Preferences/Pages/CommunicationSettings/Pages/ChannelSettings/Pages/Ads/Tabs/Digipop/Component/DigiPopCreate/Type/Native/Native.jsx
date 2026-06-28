import { DIGIPOP_ACTION as DIGIPOP_ACTION_MSG, DIGIPOP_TEXT as DIGIPOP_TEXT_MSG, DIGIPOP_TITLE as DIGIPOP_TITLE_MSG } from 'Constants/GlobalConstant/ValidationMessage';
import { DIGIPOP_ACTION, DIGIPOP_RATING, DIGIPOP_TEXT, DIGIPOP_TITLE } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_edge_mini, circle_plus_fill_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import RSInput from 'Components/FormFields/RSInput';
import { useFieldArray, useFormContext, useWatch } from 'react-hook-form';
import { getNativeRating, NativeResolution } from '../../../../constant';
import { Col, Row } from 'react-bootstrap';
import { MAX_LENGTH150 } from 'Constants/GlobalConstant/Regex';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RenderField from '../PushNotify/Component/RenderField';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import RSTabber from 'Components/RSTabber';
import RSTooltip from 'Components/RSTooltip';

const NativeSetting = () => {
    const [tabData, setTabData] = useState();

    const { control, clearErrors, setError, watch, setValue, formState, getValues, trigger, reset } = useFormContext();

    const getUniqueName = (name = '') => {
        const uniqueName = 'digipop.nativeSetting';
        return `${uniqueName}.${name}`;
    };
    // const getUniqueFielArrayName = (name = '', index) => {
    //     const uniqueName = `digipop.nativeSetting.nativeResolution[${index}]`;
    //     return `${uniqueName}.${name}`;
    // };
    const { fields, append, remove } = useFieldArray({
        name: 'digipop.nativeSetting.nativeResolution',
        control,
    });

    const watchImageResolution = watch(getUniqueName('imageResolution'));
    const watchNativeSetting = watch('digipop.nativeSetting');

    const watchNativeResolution = useWatch({
        control,
        name: 'digipop.nativeSetting.nativeResolution',
    });

    // const handleAddMinus = (index) => {
    //     if (index === 0) {
    //         const isEmptyType = watchNativeResolution.some((list) => !list?.imageContent?.image);
    //         const isEmptyRes = watchNativeResolution.some((list) => !list?.imageResolution);
    //         if (!isEmptyType && !isEmptyRes) {
    //             append({
    //                 imageResolution: '',
    //                 imageContent: {
    //                     imageType: '',
    //                     image: '',
    //                 },
    //             });
    //         } else {
    //             trigger('digipop.nativeSetting.nativeResolution');
    //         }
    //     } else {
    //         remove(index);
    //     }
    // };

    // const handleDuplicateResolution = () => {
    //     const { digipop } = getValues();
    //     const nativeResolution = digipop?.nativeSetting?.nativeResolution;

    //     const tempResolution = new Set();
    //     const duplicates = nativeResolution?.filter((item) => {
    //         if (tempResolution.has(item.imageResolution?.size)) {
    //             return true;
    //         }
    //         tempResolution.add(item.imageResolution.size);
    //         return false;
    //     });
    //     return duplicates;
    // };

    const handleTabData = () => {
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
                            fieldName={'digipop.nativeSetting.nativeResolution'}
                            customField="true"
                        />
                    ),
                    remove: item.isOptional ? circle_minus_fill_edge_mini : '',
                };
            });
            return modifiedTabData;
        }
    };

    const handleResolutionDropDown = () => {
        const selectedResolutions = fields?.map((item) => item.imageResolution?.size) || [];

        return NativeResolution?.filter(
            (resolution) => resolution?.id !== 1 && !selectedResolutions.includes(resolution?.size),
        ).map((item) => item?.size);
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

    return (
        <>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 8 }} className="position-relative">
                        <div className="position-absolute right-25 top-5">
                            <RSBootstrapdown
                                data={handleResolutionDropDown()}
                                flatIcon
                                fieldKey="size"
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
                        <RSTabber
                            defaultClass={`col-md-2 tabTransparent `}
                            dynamicTab={`mb0 mini`}
                            activeClass={`active`}
                            tabData={handleTabData()}
                            className="res-tabs-2 rs-tabs-auto-width digipop-tab d-flex flex-row-reverse css-scrollbar-y"
                            componentClassName={'mt20'}
                            callBack={(_, currentIndex) => {
                                setValue(getUniqueName('nativeDefaultTab'), currentIndex);
                            }}
                            defaultTab={watchNativeSetting?.nativeDefaultTab}
                            onRemoveMenu={(index) => {
                                remove(index);
                                setValue(getUniqueName('nativeDefaultTab'), index - 1);
                            }}
                            customIconsize="xs"
                        />
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">Image title</label>
                    </Col>
                    <Col md={6}>
                        <RSInput
                            control={control}
                            required
                            name={getUniqueName('title')}
                            placeholder={DIGIPOP_TITLE}
                            rules={{
                                required: DIGIPOP_TITLE_MSG,
                            }}
                            maxLength={MAX_LENGTH150}
                        />
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">Alt text</label>
                    </Col>
                    <Col md={6}>
                        <RSInput
                            control={control}
                            required
                            name={getUniqueName('text')}
                            placeholder={DIGIPOP_TEXT}
                            rules={{
                                required: DIGIPOP_TEXT_MSG,
                            }}
                            maxLength={MAX_LENGTH150}
                        />
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">Call to action</label>
                    </Col>
                    <Col md={6}>
                        <RSInput
                            control={control}
                            required
                            name={getUniqueName('action')}
                            placeholder={DIGIPOP_ACTION}
                            rules={{
                                required: DIGIPOP_ACTION_MSG,
                            }}
                            maxLength={MAX_LENGTH150}
                        />
                    </Col>
                </Row>
            </div>
            <div className="form-group">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">Rating</label>
                    </Col>
                    <Col md={6}>
                        <RSKendoDropDownList
                            data={getNativeRating(5)}
                            control={control}
                            name={getUniqueName('rating')}
                            label={DIGIPOP_RATING}
                            dataItemKey={'id'}
                            textField={'value'}
                            handleChange={(e) => {}}
                        />
                    </Col>
                </Row>
            </div>
        </>
    );
};

export default NativeSetting;
