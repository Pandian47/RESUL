import { ENTER_HEADER, ENTER__FOOTER } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useContext, useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';


import { useDispatch } from 'react-redux';
import MessagingContext from '../../context';
import Editor from '../WATextEditor/Editor';
import RSTabSlide from 'Components/RSTabSlide';

const Carousel = ({ editorProps, templateResponse, fieldName = '', isSplitTabs = false }) => {
    const dispatch = useDispatch();
    const { carouselTabs, setCarouselTabs } = useContext(MessagingContext);
    const templateName = isSplitTabs ? `${fieldName}.templateName` : 'templateName';

    const {
        control,
        formState: { errors },
        setValue,
        reset,
        getValues,
        watch,
        trigger,
    } = useFormContext();

 
    const [currTab, setCurrTab] = useState(0);

    useEffect(() => {
        setCurrTab(0);
    },[carouselTabs])
    return (
        <Fragment>
            <Row>
                {/* <div className="form-group">
                    <div className="form-group">
                        <RSInput
                            className={`${isHeaderEditable ? 'click-off' : ''}`}
                            name={'header'}
                            control={control}
                            placeholder={ENTER_HEADER}
                        />
                    </div>
                </div> */}
                {getValues(templateName)?.isCarousel && (
                    <Col sm={8} className='offset-sm-1 wa-header-texbox'>
                        <Editor
                            editorProps={editorProps}
                            templateResponse={{ ...watch(templateName), currData: watch(templateName) }}
                            isCarouselBody
                            fieldName={fieldName}
                            isCarousel={false}
                            isSplitTabs={isSplitTabs}
                        />
                    </Col>
                )}
                <RSTabSlide
                    dynamicTab={`res-content-tabs-split model_smartlink mb30 pl92`}
                    componentClassName ={'w-100'}
                    activeClass={`active`}
                    flatTabs
                    tabData={isSplitTabs ? carouselTabs?.[fieldName] || [] : carouselTabs?.['carousel'] || []}
                    defaultTab={currTab}
                    callBack={(_, i) => {
                        setCurrTab(i);
                    }}
                    //customColumn ={{offset : 1, span : 10}}
                />

                {/* <div className="form-group">
                    <RSInput
                        name={'footer'}
                        className={`${isFooterEditable ? 'click-off' : ''}`}
                        control={control}
                        placeholder={ENTER__FOOTER}
                    />
                </div> */}
            </Row>
        </Fragment>
    );
};

export default Carousel;
