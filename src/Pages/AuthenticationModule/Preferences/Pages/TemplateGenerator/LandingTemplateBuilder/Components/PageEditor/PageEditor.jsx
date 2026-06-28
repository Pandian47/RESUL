import RSTabber from 'Components/RSTabber';
import { useContext, useState } from 'react';
import { LANDING_PAGE_RESPONSIVE_TABS } from '../../constants';
import '../../LandingPageBuilder.scss';
import { useFormContext } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import { LandingTemplateContext } from '../../Pages/LandingPageBuilder/LandingPageBuilder';

const PageEditor = ({ onDrop, onDragOver, items }) => {
    const { control, getValues, watch } = useFormContext();
    const [pageType, setPageType] = useState('desktop');
    const [isClicked, setIsClicked] = useState('element-builder-hover');
    const [
        pageBackgroundColor,
        pageBackgroundImage,
        pageBackgroundAttachment,
        pageBackgroundPosition,
        pageBackgroundRepeat,
        pageBackgroundSize,
    ] = watch([
        'pageBackgroundColor',
        `pageBackgroundImage`,
        `pageBackgroundAttachment`,
        `pageBackgroundPosition`,
        `pageBackgroundRepeat`,
        `pageBackgroundSize`,
    ]);

    const { setElement, fields, insert, remove, element, viewComponents } = useContext(LandingTemplateContext);
    // console.log('Items ----- - - ->>> ', fields);

    return (
        <>
            <div className="rsbwcs-preview-tabs">
                <RSTabber
                    defaultTab={0}
                    //defaultClass={` col-md-3 `}
                    activeClass={`active`}
                    dynamicTab={`mb0 mini`}
                    //className="rs-tabs row"
                    className="rs-tabs"
                    componentClassName={'mt20'}
                    tabData={LANDING_PAGE_RESPONSIVE_TABS}
                    callBack={(item) => {
                                                //setPageType(item.width);
                        setPageType(item.deviceType);
                    }}
                />
            </div>
            <div
                className={`${pageType} rsbwcs-droppable-area`}
                id={'codeData'}
                style={{
                    //height: '500px',
                    //width: pageType,
                    //overflowWrap: 'anywhere',
                    backgroundColor: pageBackgroundColor,
                    backgroundImage: pageBackgroundImage,
                    backgroundAttachment: pageBackgroundAttachment,
                    backgroundPosition: pageBackgroundPosition,
                    backgroundRepeat: pageBackgroundRepeat,
                    backgroundSize: pageBackgroundSize,
                }}
                onDrop={(e) => onDrop(e, 0)}
                onDragOver={onDragOver}
            >
                <div
                    className={` element === 'default'
                        ? 'selected'
                        : viewComponents
                        ? 'viewComponents aaa'
                        : 'desktop-view'`}
                    //className={pageType}
                >
                    {/* <p onClick={() => setElement('default')}>Editor</p> */}
                    <Row>
                        {
                            // fields?.length ? (
                            fields.map((ele, idx) => {
                                // console.log('ele', fields);
                                if (ele.label === 'Buttons' || ele.label === 'Link Block' || ele.label === 'Image') {
                                    return (
                                        <Col
                                            lg={2}
                                            key={ele.id}
                                            id="Col-2 data"
                                            style={{ display: 'contents' }}
                                            className="mb30 mr30"
                                            onDrop={(e) => onDrop(e, idx)}
                                            onDragOver={onDragOver}
                                        >
                                            {/* {element === `${ele.name}${ele.unique}.properties` && (
                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    {ACTIONS_ICONS.map((item) => {
                                                        return (
                                                            <RSTooltip
                                                                text={item.tooltip}
                                                                position="bottom"
                                                                key={item.id}
                                                            >
                                                                <div
                                                                    style={{
                                                                        backgroundColor: '#0540d3',
                                                                        marginRight: '2px',
                                                                        padding: '2px',
                                                                    }}
                                                                >
                                                                    <i
                                                                        className={`${item.icon} icon-md`}
                                                                        onClick={(e) => {
                                                                            if (item.tooltip === 'Remove') {
                                                                                setElement(`default`);

                                                                                remove(idx);
                                                                            }
                                                                            else if(item.tooltip === 'Duplicate'){
                                                                                e.dataTransfer.setData('name','Text')
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </RSTooltip>
                                                        );
                                                    })}
                                                </div>
                                            )} */}
                                            {/* <small className="pop">{ele.popoverLabel}</small> */}
                                            {}
                                            {/* <div className='rs-form-builder-drop-box' >
                                        <span className="text-center">Drop here</span>
                                    </div> */}
                                            {ele.component(idx, insert, remove, ele.unique, ele.styles, ele)}
                                        </Col>
                                    );
                                } else if (ele.label === 'Icon') {
                                    return (
                                        <Col
                                            lg={2}
                                            key={ele.id}
                                            id="Col-2 data"
                                            style={{ display: 'contents' }}
                                            className="mb30 mr30"
                                            onDrop={(e) => onDrop(e, idx)}
                                            onDragOver={onDragOver}
                                        >
                                            {ele.component(idx, insert, remove, ele.unique, ele.styles)}
                                        </Col>
                                    );
                                } else if (ele.type === 'Blocks') {
                                    // console.log('display :::: ', ele);
                                    return (
                                        <Col
                                            key={ele.id}
                                            // id="Col-2 data"
                                            lg={12}
                                            style={
                                                ele.colName === 'columnCenter'
                                                    ? { display: 'flex', justifyContent: 'center' }
                                                    : { display: 'contents' }
                                            }
                                            className="mb30 "
                                            onDrop={(e) => onDrop(e, idx)}
                                            onDragOver={onDragOver}
                                        >
                                            {/* <small className="pop">{ele.popoverLabel}</small> */}
                                            {}
                                            {/* <div className='rs-form-builder-drop-box' >
                                        <span className="text-center">Drop here</span>
                                    </div> */}
                                            {ele.component(idx, insert, remove, ele.unique, ele.styles)}
                                        </Col>
                                    );
                                } else {
                                    // console.log('display :::: ', ele.styles?.value);

                                    return (
                                        <Row
                                            key={ele.id}
                                            className="mb30 d-flex"
                                            onDrop={(e) => onDrop(e, idx)}
                                            onDragOver={onDragOver}
                                        >
                                            {/* {element === `${ele.name}${ele.unique}.properties` && (
                                                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    {ACTIONS_ICONS.map((item) => {
                                                        return (
                                                            <RSTooltip
                                                                text={item.tooltip}
                                                                position="bottom"
                                                                key={item.id}
                                                            >
                                                                <div
                                                                    style={{
                                                                        backgroundColor: '#0540d3',
                                                                        marginRight: '2px',
                                                                        padding: '2px',
                                                                    }}
                                                                >
                                                                    <i
                                                                        className={`${item.icon} icon-md`}
                                                                        onClick={(e) => {
                                                                            if (item.tooltip === 'Remove') {
                                                                                setElement(`default`);

                                                                                remove(idx);
                                                                            } else if (item.tooltip === 'Duplicate') {
                                                                                append(ele);
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            </RSTooltip>
                                                        );
                                                    })}
                                                </div>
                                            )} */}
                                            {ele.component(idx, insert, remove, ele.unique, ele.styles, ele)}
                                        </Row>
                                    );
                                }
                            })
                            // ) : (
                            //     <div className="mb30" onDrop={(e) => onDrop(e, 0)} onDragOver={onDragOver}>
                            //         <p>Hello</p>
                            //     </div>
                            // )
                        }
                    </Row>
                </div>
            </div>
        </>
    );
};
export default PageEditor;
