import { caret_mini, collapse_large, expand_large } from 'Constants/GlobalConstant/Glyphicons';
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
    COLUMN_DATA_VALUES,
    ENTIRE_ELEMENETS_DATA,
    HEADER_ICONS,
    LANDING_PAGE_ELEMENTS,
    LANDING_PAGE_INITIAL_DATA,
    LANDING_PAGE_OPEN_TABS,
} from '../../constants';
import { rCloud } from 'Assets/Images';
import RSTooltip from 'Components/RSTooltip';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSTabbar from 'Components/RSTabber';
import { FormProvider, useFieldArray, useForm } from 'react-hook-form';
import PageEditor from '../../Components/PageEditor/PageEditor';
import { safeParseJSON } from 'Utils/modules/stringUtils';

import BlocksElement from '../../Components/Blocks/BlocksElement';
import { v4 as uuid } from 'uuid';
import FullScreenModal from './Components/FullScreenModal';
import { useNavigate } from 'react-router-dom';
import useQueryParams from 'Hooks/useQueryParams';

export const LandingTemplateContext = createContext();

const LandingPageBuilder = () => {
    const methods = useForm(LANDING_PAGE_INITIAL_DATA);
    const location = useQueryParams();
        const navigate = useNavigate();
    const { control, handleSubmit, setValue, getValues } = methods;
    const { fields, append, remove, insert, move } = useFieldArray({
        name: `entireItems`,
        control: control,
    });
    // const { setAddTemplate, viewComponents, setViewComponents} =
    //     useContext(LandingTemplateContext);
    const [element, setElement] = useState('');
    const [tagName, setTagName] = useState('');
    const [viewComponents, setViewComponents] = useState(false);
    const [blockContent, setBlockContent] = useState(false);
    const [fullScreen, setFullScreen] = useState(true);
    const [codeEditor, setCodeEditor] = useState(false);
    const [fullScreenIcon, setFullScreenIcon] = useState('expand_large');

    useEffect(() => {
        document.body.className = 'rs-builder-body rsbb-landingpage';
        return () => {
            document.body.className = '';
        };
    }, []);

    const handleDoDrop = (e, ind) => {
        e.stopPropagation();
        const getData = e.dataTransfer.getData('name');
        const getElementData = e.dataTransfer.getData('textData');
        const filterItem = ENTIRE_ELEMENETS_DATA.filter((item) => item.label === getData);
                const getID = e.dataTransfer.getData('dragId');
        const getDropElement = e.dataTransfer.getData('dropElement');
        if (getElementData !== '') {
            const parsedElementData = safeParseJSON(getElementData);
            if (parsedElementData?.draggedFromBlock) {
                let temp = [...filterItem];
                temp[0].unique = uuid();
                temp[0].styles = parsedElementData;
                                insert(ind, temp);
            } else {
                                move(+getID, ind);
            }
            setValue(getDropElement, true);
        } else {
            if (filterItem[0].type === 'Blocks') {
                let colName = filterItem[0].colName;
                let length = COLUMN_DATA_VALUES[colName]?.length;
                const parsedStyles = safeParseJSON(getElementData);
                for (var i = 0; i < length; i++) {
                    COLUMN_DATA_VALUES[colName][i].unique = uuid();
                    COLUMN_DATA_VALUES[colName][i].colName = colName;
                    if (parsedStyles) COLUMN_DATA_VALUES[colName][i].styles = parsedStyles;
                    insert(ind, COLUMN_DATA_VALUES[colName][i]);
                }
                            } else {
                                let temp = [...filterItem];
                temp[0].unique = uuid();
                // temp[0].styles = {};
                insert(ind, temp);
            }
        }
    };
    const getCodeData = () => {
        var ele = document.getElementById('codeData');
        // var div = document.createElement('div');
        // var temp = ReactDomServer.renderToString(ele);
        // const root = createRoot(div);
        // flushSync(() => {
        //     root.render(ele);
        // });

                // setValue('codeData', ele);
        // setCodeEditor(true);
    };
    const onDragOver = (e) => {
        e.preventDefault();
    };
    const value = useMemo(() => ({
        element,
        setElement,
        tagName,
        setTagName,
        viewComponents,
        setViewComponents,
        fields,
        append,
        remove,
        insert,
        move,
    }), [element, tagName, viewComponents, fields, append, remove, insert, move]);

    // Add resize event listener with proper cleanup to prevent re-renders
    useEffect(() => {
        const handleResize = (event) => {
            if (window.innerHeight === screen.height) {
                                setValue('fullscreenIcon', collapse_large);
                setFullScreenIcon('collapse_large');
            } else {
                                setValue('fullscreenIcon', expand_large);
                setFullScreenIcon('expand_large');
            }
        };

        window.addEventListener('resize', handleResize);
        
        // Cleanup: remove event listener on unmount
        return () => {
            window.removeEventListener('resize', handleResize);
        };
    }, [setValue]);
    return (
        <FormProvider {...methods}>
            <LandingTemplateContext.Provider value={value}>
                <div className="rs-builder-wrapper">
                    <FullScreenModal show={fullScreen} handleClose={() => setFullScreen(false)} />
                    <div className="rsbw-top-section">
                        <div className="rsbwt-header">
                            <ul>
                                <li className="rsbwt-logo">
                                    <RSTooltip text={'RESUL'} position="bottom">
                                        <img src={rCloud} alt="RESUL" className="brand-logo" />
                                    </RSTooltip>
                                </li>
                                <li className="rsbwt-info-1">
                                    <div className="rsbwti-label">Landing page name:</div>
                                    <div className="rsbwti-name">{location?.name}</div>
                                </li>
                                <li className="rsbwt-icons">
                                    <div className="rsbwti-wrapper">
                                        {HEADER_ICONS.map((item) => {
                                            return (
                                                <RSTooltip text={item.tooltip} position="bottom" key={item.id}>
                                                    <i
                                                        className={`${
                                                            item?.tooltip === 'Fullscreen'
                                                                ? icons?.[fullScreenIcon]
                                                                : item.icon
                                                        } icon-lg`}
                                                        onClick={() => {
                                                            if (item.tooltip === 'View Components') {
                                                                setViewComponents(!viewComponents);
                                                            } else if (item.tooltip === 'Code editor') {
                                                                getCodeData();
                                                            } else if (item.tooltip === 'Fullscreen') {
                                                                if (getValues('fullscreen')) {
                                                                    document.exitFullscreen();
                                                                    setValue('fullscreen', false);
                                                                } else {
                                                                    document.body.requestFullscreen();
                                                                    setValue('fullscreen', true);
                                                                }
                                                            }
                                                        }}
                                                    />
                                                </RSTooltip>
                                            );
                                        })}
                                    </div>
                                </li>
                            </ul>
                        </div>
                        <div className="rsbwt-elements">
                            <form onSubmit={handleSubmit((data) => {})}>
                                {/* <div style={{ display: 'flex' }}> */}
                                <ul className="rsbwte-list">
                                    {LANDING_PAGE_ELEMENTS.map((item) => {
                                        return (
                                            <li
                                                {...(!item.dropdown && {
                                                    draggable: item.label !== 'Blocks',
                                                    onDragStart: (e) => e.dataTransfer.setData('name', item.label),
                                                })}
                                                onClick={() => {
                                                    if (item.label === 'Blocks') {
                                                        setBlockContent(!blockContent);
                                                    }
                                                }}
                                                key={item.id}
                                                className={`${
                                                    item.dropdown ? 'rsbi-dropdown' : ''
                                                } rs-builder-icon rsbi-${item.name}`}
                                            >
                                                <RSTooltip text={item.label} position="bottom">
                                                    <div className="rsbwtel-wrapper">
                                                        <img src={item.elementImage} alt={item.label} />
                                                        <span className="rsbwtelw-label">
                                                            {item.label}
                                                            {item.dropdown && (
                                                                <span className="rsbwtelw-dd">
                                                                    <i className={`${caret_mini} icon-mini`} />
                                                                </span>
                                                            )}
                                                        </span>
                                                    </div>
                                                </RSTooltip>
                                            </li>
                                        );
                                        // }
                                    })}
                                </ul>

                                {blockContent && <BlocksElement setBlockContent={setBlockContent} />}

                                <div className="rsbwte-buttons-wrapper">
                                    <RSSecondaryButton
                                        onClick={() => {
                                            navigate('/preferences/template-gallery/landingpage-gallery');
                                        }}
                                    >
                                        Cancel
                                    </RSSecondaryButton>
                                    <RSSecondaryButton className="color-primary-blue mr10">Save</RSSecondaryButton>
                                    <RSPrimaryButton type="submit">Publish</RSPrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                    <div className="rsbw-content-section">
                        <div className="rsbwcs-holder">
                            <div className="rs-builder-left-section">
                                <PageEditor
                                    onDrop={(e, ind) => handleDoDrop(e, ind)}
                                    onDragOver={(e) => onDragOver(e)}
                                />
                            </div>
                            <div className="rs-builder-right-section">
                                <div className="rsbwcs-settings-tabs-wrapper">
                                    <RSTabbar
                                        // dynamicTab={'rs-sub-tabs rs-cc-sub-tabs'}
                                        defaultTab={0}
                                        //defaultClass={` col-md-2 `}
                                        activeClass={`active`}
                                        dynamicTab={`mb0 mini rs-builder-settings-tabs`}
                                        tabData={LANDING_PAGE_OPEN_TABS}
                                        className="rs-tabs"
                                        componentClassName={'rs-builder-settings-tabs-content'}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </LandingTemplateContext.Provider>
        </FormProvider>
    );
};

export default LandingPageBuilder;
