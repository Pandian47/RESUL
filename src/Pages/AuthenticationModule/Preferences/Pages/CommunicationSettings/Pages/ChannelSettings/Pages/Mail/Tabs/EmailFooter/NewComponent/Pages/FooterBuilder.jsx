import { createCommunicationSettingsNavState, MAIL_TAB_ID } from 'Utils/modules/navigation';
import { useContext, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { Container, Row, Col } from 'react-bootstrap';
// import '../Styles/FooterBuilder.css';
import Toolbar from './Toolbar';
import RightSidePanel from './RightSidePanel';
import DropArea from './DropArea';
import { useSelectedComponent } from './SelectedComponentContext';
import { convertJsonToHtml, updateLayout } from '../Utils/functions';
import { useForm, FormProvider } from 'react-hook-form';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { getSessionId } from 'Reducers/globalState/selector';
import {getEmailFooterById,saveEmailFooterData,} from 'Reducers/preferences/CommunicationSettings/request';
import { useNavigate } from 'react-router-dom';

import SaveFooterModal from '../../Component/SaveFooterModal/SaveFooterModal';
import { EmailFooterProvider } from '../..';
import PreviewModal from '../../Component/PreviewModal/PreviewModal';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';



const ItemTypes = {
    TEXT: 'text',
    IMAGE: 'image',
    BUTTON: 'button',
    COLUMN: 'column',
    DIVIDER: 'divider',
    SOCIAL: 'social',
};

const FooterEditor = ({ type, handleCancel, setFailedApi }) => {
    const methods = useForm();
    const dispatch = useDispatch();
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const location = useQueryParams();
        const navigate = useNavigate();
    const { components, setComponents, setSelectedComponent, droparea, setDroparea } = useSelectedComponent();
            const context = useContext(EmailFooterProvider);
    const isEdit = context?.gridCreate?.emailFooterAction?.edit?.isEdit;
    const [editName, setEditName] = useState('');
    const [saveModal, setSaveModal] = useState({
        show: false,
        data: {},
    });
    const [preview, setPreview] = useState({
        show: false,
        data: {},
    });

    const TOOLBAR_ITEMS = [
        {
            type: ItemTypes.COLUMN,
            item: {
                id: `col-${Date.now()}-${Math.random()}`,
                type: ItemTypes.COLUMN,
                alt: '',
                width: '100px',
                height: 'auto',
                alignment: 'left',
                column: [{ width: droparea.width || 560, column_id: `id-${Date.now()}`, locked: false }],
                padding: { top: 20, right: 20, bottom: 0, left: 20 },
                paddingsynced: false,
                gap: 20,
                bgColor: null,
                bgImage: null,
                bgRepeat: 'no-repeat',
                bgPositionX: 'center',
                bgPositionY: 'center',
                bgWidth: '100%',
                bgHeight: '100%',
                isborder: false,
                borderTop: true,
                borderRight: true,
                borderBottom: true,
                borderLeft: true,
                borderthickness: 1,
                borderColor: 'black',
                borderStyle: { value: 'solid', text: 'Solid' },
                borderRadius: 0,
            },
        },
        {
            type: ItemTypes.TEXT,
            item: {
                id: `txt-${Date.now()}-${Math.random()}`,
                type: ItemTypes.TEXT,
                text: '<p><span style="font-family: Arial, Helvetica, sans-serif;">Enter your text here</span></p>',
                style: 'h6',
                bold: false,
                italic: false,
                underline: false,
                alignment: 'left',
                color: '#000000',
                padding: { top: 0, right: 0, bottom: 0, left: 0 },
                isborder: false,
                borderTop: true,
                borderRight: true,
                borderBottom: true,
                borderLeft: true,
                borderthickness: 1,
                borderColor: 'black',
                borderStyle: { value: 'solid', text: 'Solid' },
                borderRadius: 0,
                bgColor: null,
                bgImage: null,
                bgRepeat: 'no-repeat',
                bgPositionX: 'center',
                bgPositionY: 'center',
                bgWidth: '100%',
                bgHeight: '100%',
            },
        },
        {
            type: ItemTypes.IMAGE,
            item: {
                id: `img-${Date.now()}-${Math.random()}`,
                type: ItemTypes.IMAGE,
                src: null,
                alt: 'Image Column',
                width: '100px',
                height: 'auto',
                imgwidth:'',
                imgheight:'',
                columnWidth:0,
                alignment: 'center',
                bgColor: null,
                bgImage: null,
                bgRepeat: 'no-repeat',
                bgPositionX: 'center',
                bgPositionY: 'center',
                bgWidth: '100%',
                bgHeight: '100%',
                padding: { top: 0, right: 0, bottom: 0, left: 0 },
                isborder: false,
                borderTop: true,
                borderRight: true,
                borderBottom: true,
                borderLeft: true,
                borderthickness: 1,
                borderColor: 'black',
                borderStyle: { value: 'solid', text: 'Solid' },
                borderRadius: 0,
            },
        },
        {
            type: ItemTypes.BUTTON,
            item: {
                id: `btn-${Date.now()}-${Math.random()}`,
                type: ItemTypes.BUTTON,
                label: 'Click here',
                link: '#',
                width: 'auto',
                height: 'auto',
                color: '#0000ff',
                fontsize: 12,
                fontFamily: { value: 'Arial, sans-serif', text: 'Arial' },
                fontStyle: { value: 'normal', text: 'Normal' },
                fontcolor: 'white',
                fontWeight: { value: 'normal', text: 'Normal' },
                textAlign: 'center',
                textDecoration: { value: 'none', text: 'None' },
                alignment: 'center',
                letterSpacing: 0,
                padding: { top: 0, right: 0, bottom: 0, left: 0 },
                btnpadding: 10,
                isborder: false,
                borderTop: true,
                borderRight: true,
                borderBottom: true,
                borderLeft: true,
                borderthickness: 1,
                borderColor: 'black',
                borderStyle: { value: 'solid', text: 'Solid' },
                borderRadius: 0,
                bgColor: null,
                bgImage: null,
                bgRepeat: 'no-repeat',
                bgPositionX: 'center',
                bgPositionY: 'center',
                bgWidth: '580px',
                bgHeight: 'auto',
                selectedLinkType:'',
                siteUrl:'',
                mailto:'',
                tel:'',
                fileUrl:'',
                viber:'',
            },
        },
        {
            type: ItemTypes.DIVIDER,
            item: {
                id: `div-${Date.now()}-${Math.random()}`,
                type: ItemTypes.DIVIDER,
                padding: { top: 10, right: 0, bottom: 10, left: 0 },
                alignment: 'center',
                borderWidth: 100,
                borderHeight: '20',
                isborder: false,
                borderTop: true,
                borderRight: true,
                borderBottom: true,
                borderLeft: true,
                borderthickness: 1,
                borderColor: 'black',
                borderStyle: { value: 'solid', text: 'Solid' },
                borderRadius: 0,
                bgColor: null,
                bgImage: null,
                bgRepeat: 'no-repeat',
                bgPositionX: 'center',
                bgPositionY: 'center',
                bgWidth: '100%',
                bgHeight: '100%',
                spacer:false
            },
        },
      
        {
            type: ItemTypes.SOCIAL,
            item: {
                id: `soc-${Date.now()}-${Math.random()}`,
                type: ItemTypes.SOCIAL,
                icon: '',
                width: '',
                alignment: 'center',
                isborder: false,
                borderTop: true,
                borderRight: true,
                borderBottom: true,
                borderLeft: true,
                borderthickness: 1,
                borderColor: 'black',
                borderStyle: { value: 'solid', text: 'Solid' },
                borderRadius: 0,
                padding: { top: 0, right: 0, bottom: 0, left: 0 },
                bgColor: null,
                bgImage: null,
                bgRepeat: 'no-repeat',
                bgPositionX: 'center',
                bgPositionY: 'center',
                bgWidth: '100%',
                bgHeight: '100%',
                SpaceBetweenIcons: 5,
                size: 25,
                socialIcon:'RoundedColorLogos',
                iconLinks : ['facebook', 'twitter', 'instagram'],
            },
        },
    ];
    const handleUpdateComponent = async (updatedComponent) => {
        await setSelectedComponent((prevData) => {
            return { ...updatedComponent };
        });
        await setComponents((prevData) => updateLayout(prevData, updatedComponent));
    };

    const handleDuplicate = (item) => {
        const generateId = () => `id-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
        const newItem = JSON.parse(JSON.stringify(item));
        newItem.id = `col-${Date.now()}-${Math.random()}`;
        if (Array.isArray(newItem.column)) {
            newItem.column = newItem.column.map((col) => {
                const updatedColumn = { ...col, column_id: generateId() };
                if (Array.isArray(updatedColumn.children)) {
                    updatedColumn.children = updatedColumn.children.map((child) => ({
                        ...child,
                        id: generateId(),
                        grid_data_id: generateId(),
                    }));
                }

                return updatedColumn;
            });
        }

        setComponents((prevComponents) => {
            const index = prevComponents?.findIndex((comp) => comp?.id === item?.id);
            if (index === -1) return prevComponents;

            const newComponents = [...prevComponents];
            newComponents.splice(index + 1, 0, newItem);
            return newComponents;
        });
    };
    function openHtmlInNewTab(jsonLayout) {
        const htmlContent = convertJsonToHtml(jsonLayout, droparea);
        const blob = new Blob([htmlContent], { type: 'text/html' });
        const url = window.URL.createObjectURL(blob);
        window.open(url, '_blank');
        const link = document.createElement('a');
        link.href = url;
        link.download = 'layout.html'; 
        link.click();
        setTimeout(() => window.URL.revokeObjectURL(url), 1000);
    }

    const generateHtml = () => {
        openHtmlInNewTab(components);
    };

    const handleSave = (data) => {
        const htmlContent = convertJsonToHtml(components, droparea);
                setSaveModal({
            show: true,
            data: htmlContent,
        });
    }

    const handleSubmitFooter = async (nameStatus, name) => {
        if (nameStatus) {


        let id = context?.gridCreate?.emailFooterAction?.edit?.editState?.emailFooterId;
        const emailJson = JSON.stringify({components,droparea })
        const payload = {
            clientId,
            userId,
            departmentId,
            emailfooterId: isEdit ? id : 0,
            footerName: name,
            emailFooterHTML: saveModal?.data || '{}',
            emailFooterJSON:emailJson,
            createdBy: userId,
        };
        // localStorage.setItem('emailfooter',JSON.stringify(emailJson))

        const { status, message } = await saveApi.refetch({
            fetcher: () => dispatch(saveEmailFooterData(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'create',
        });
        if (status) {
            navigate('/preferences/communication-settings', {
                state: createCommunicationSettingsNavState('mail', {
                    subfrom: 'footer-builder',
                    mailTabId: MAIL_TAB_ID.EMAIL_FOOTER,
                }),
            });
            handleCancel(true);
        }
        else{
            handleCancel(true);
            setSaveModal((prev) => ({
                ...prev,
                show: false,
            }));
        }
    }else {
        setSaveModal((prev) => ({
            ...prev,
            show: false,
        }));
    }
    }

    const getFooterUpdate = async () => {
        let id = context?.gridCreate?.emailFooterAction?.edit?.editState?.emailFooterId;
        const payload = {
            clientId,
            userId,
            emailfooterId: id,
            departmentId
        };
        const res = await dispatch(getEmailFooterById(payload));
                if (res?.status) {
            setEditName(res?.data?.footerName)
            try {         
                // const savedEmailFooter = localStorage.getItem('emailfooter');
                const savedEmailFooter = res?.data?.emailFooterjson;
                if (savedEmailFooter) {
                    const parsed = JSON.parse(savedEmailFooter);
                    if (parsed.components) setComponents(parsed.components);
                    if (parsed.droparea) setDroparea(parsed.droparea);
                }

            } catch (error) {
                setFailedApi('ParseEmailFooterHtml');
            }

        } else {
            setFailedApi('GetEmailFooterById');
        }
    };

    const handlePreview = () => {
        const htmlContent = convertJsonToHtml(components, droparea);
        setPreview({
            show: true,
            data: htmlContent,
        });
    };

    useEffect(() => {
        if (isEdit) getFooterUpdate();
    }, []);

    const hasChildrenInColumn = (dataArray) => {
        return dataArray?.some((item) =>
            item?.column?.some((columnItem) => Array.isArray(columnItem?.children) && columnItem?.children?.length > 0),
        );
    };

    const handleClick = (e) => {
        setSelectedComponent('Layout');
    };

    return (
        <>
            <FormProvider {...methods}>
                <Container fluid className='rs-platform-emailfooter-wrapper box-design bd-top-border '>
                    <DndProvider backend={HTML5Backend}>
                        <div className="align-items-center d-flex justify-content-between mb19">
                            <>
                                <div className='d-flex'>
                                    {TOOLBAR_ITEMS.map(({ type, item }) => (
                                        <Toolbar key={type} type={type} item={item} />
                                    ))}
                                </div>
                                <div>
                                    {hasChildrenInColumn(components) && (
                                        <>
                                        <RSSecondaryButton  onClick={() => handlePreview()}>
                                                Preview
                                            </RSSecondaryButton>
                                            <RSSecondaryButton type="submit" onClick={handleSave} className="ml19 color-primary-blue" blockInteraction={isSaveLoading}>
                                                Save
                                            </RSSecondaryButton>
                                            <RSPrimaryButton type="submit" onClick={generateHtml} className="ml19" blockInteraction={isSaveLoading}>
                                                Export
                                            </RSPrimaryButton>
                                           
                                            
                                        </>
                                    )} 
                                </div>
                            </>
                        </div>

                        <>
                            <Row>
                                <Col md={8} className="drop-area-column pt6" onClick={handleClick}>
                                    <DropArea ItemTypes={ItemTypes} droparea={droparea} onDuplicate={handleDuplicate} />
                                </Col>

                                <Col md={4}>
                                    <RightSidePanel onUpdateComponent={handleUpdateComponent} ItemTypes={ItemTypes} />
                                </Col>
                            </Row>
                        </>
                    </DndProvider>
                </Container>
                <SaveFooterModal
                    show={saveModal?.show}
                    handleClose={(status, name) => {
                        handleSubmitFooter(status, name);
                    }}
                    isEdit={isEdit}
                    editName={editName}
                />
                <PreviewModal
                    show={preview?.show}
                    handleClose={() =>
                        setPreview((prev) => ({
                            ...prev,
                            show: false,
                        }))
                    }
                    data={preview?.data}
                />
            </FormProvider>
        </>
    );
};

export default FooterEditor;
