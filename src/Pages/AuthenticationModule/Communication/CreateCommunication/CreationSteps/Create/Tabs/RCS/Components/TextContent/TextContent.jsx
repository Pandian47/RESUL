import { MAX_LENGTH150 } from 'Constants/GlobalConstant/Regex';
import { ENTER_TITLE_TEXT } from 'Constants/GlobalConstant/ValidationMessage';
import { INTERACTIVITY, TITLE_TEXT } from 'Constants/GlobalConstant/Placeholders';
import { Col, Row } from 'react-bootstrap';
import RCSTextEditor from '../RCSTextEditor/RCSTextEditor';
import { useFormContext } from 'react-hook-form';
import RSEmojiPickerInput from 'Components/EmojiPickerInput';
import { useDispatch, useSelector } from 'react-redux';
import { getRcsList } from 'Reducers/communication/createCommunication/Create/selectors';
import { useContext } from 'react';
import Interactivity from '../Interactivity/Interactivity';
import RSSwitch from 'Components/FormFields/RSSwitch';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { RCSProvider } from '../../RCS';
import { validateCurlyBraces, handlePersonalization } from '../../../../constant';
import useQueryParams from 'Hooks/useQueryParams';

const TextContent = ({ value, isSplitAB, fieldName, index = null, isCarousel = false, splitName = '' }) => {
    const { control, watch, reset, setValue, unregister, getValues, handleSubmit, formState: {errors} } = useFormContext();
    const location = useQueryParams('/communication');
    const { personalization, listTypeWisePersonlization } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const { templateContentDetail, editorContent } = useSelector((state) => getRcsList(state));
    const dispatch = useDispatch();
    const { mask, country, setCountry, formSubmitHandler, mdcContentSetupDetails, campaignTypeAndId } =
        useContext(RCSProvider);

    const textContentDetail = templateContentDetail[0]?.RCSTemplateJsonDetailModels;
    // Derive carousel key consistently across split/non-split
    const getCarouselKey = () => {
        if (!isCarousel) return '';
        if (isSplitAB && fieldName?.includes('.')) return fieldName?.split('.')?.pop();
        return fieldName;
    };
    const carouselKey = getCarouselKey();
    const isEnableImgUpload = isCarousel
        ? !(editorContent?.[carouselKey]?.bannerTags)
        : !(editorContent?.bannerTags);
    const interactivityName =isCarousel || isSplitAB ? `${fieldName}.'interactivity'` : 'interactivity';
    const titleName = isCarousel || isSplitAB ? `${fieldName}.titleText` : 'titleText';
    const editorText = isCarousel || isSplitAB ? `${fieldName}.editorText` : 'editorText';
    const [
        interactivity,
        titleWatch,
    ] = watch([
        interactivityName,
        titleName,
    ]);
    const defaultTitleText = isSplitAB || isCarousel
    ? _get(editorContent, `${fieldName}.titleText`)
    : editorContent?.titleText;


    const handleClickOff = (description) => {
        // check string include in custom params
        const checkRegex = /\{\{.*?\}\}/g;
        const match = description?.match(checkRegex);
                if (match) {
            return false;
        } else {
            return true;
        }
    };
    return (
        <div>
            <div className="form-group mt41 mb10">
                <Row>
                    <Col sm={{ offset: 1, span: 2 }}>
                        <label className="control-label-left">{TITLE_TEXT}</label>
                    </Col>
                    <Col sm={6} className={`split-subjectline position-relative`} id="rs_SplitABTab_subjectLine">
                        <RSEmojiPickerInput
                            inputName={titleName}
                            isHighlight={true}
                            rules={{
                                required: !!titleWatch ? ENTER_TITLE_TEXT : false,
                                validate: (inputValue) => {
                                    return !!inputValue && !!defaultTitleText
                                        ? validateCurlyBraces(inputValue, defaultTitleText)
                                        : true;
                                },
                               
                            }}
                            placeholder={TITLE_TEXT}
                            personalizationSettings={{
                                data: handlePersonalization(personalization, location?.audience?.length ? location?.audience : (watch('audience')?.length ? watch('audience') : getValues()?.audience), listTypeWisePersonlization),
                                dataItemKey: 'dataAttributeId',
                                textField: 'key',
                            }}
                            maxLength={MAX_LENGTH150}
                            required={!!titleWatch ? true : false}
                            isClickOff={handleClickOff(defaultTitleText)}
                            isClickOffInput={handleClickOff(defaultTitleText)}
                        />
                    </Col>
                </Row>
            </div>
            <div className="form-group mb0">
                <Row>
                    {' '}
                    <Col sm={{ offset: 1, span: 10 }}>
                        <div className="rs-live-preview-wrapper mt30">
                            <div className="rsamp-text">Preview</div>
                        </div>
                    </Col>
                </Row>

                {/* <div className="rsamp-text">Live preview</div> */}
            </div>
            <div className="form-group">
                <RCSTextEditor isSplitTab={isSplitAB} isEnableImgUpload={isEnableImgUpload} fieldName={fieldName} isCarousel={isCarousel} index={index} splitName={splitName}/>
            </div>

            <div className="form-group">
                    <Row>
                        <Col sm={{ offset: 1, span: 2 }}>
                            <label className="control-label-left">{INTERACTIVITY}</label>
                        </Col>
                        <Col sm={6}>
                            <Row>
                                <Col sm={2} className="click-off pe-none">
                                    <RSSwitch
                                        control={control}
                                        name={interactivityName}
                                    />
                                </Col>
                                <Col sm={10}>
                                    {interactivity && <Interactivity isSplitAB={isSplitAB || isCarousel} fieldName={fieldName} splitName={splitName}/>}
                                </Col>
                            </Row>
                        </Col>
                    </Row>
                </div> 
        </div>
    );
};

export default TextContent;
