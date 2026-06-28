import { circle_plus_fill_edge_medium, circle_plus_large } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import TemplateModal from './Components/Modals/Templates';
import { Col, Row } from 'react-bootstrap';
import CommunicationTemplateModal from 'Pages/AuthenticationModule/Communication/CreateCommunication/CreationSteps/Create/Tabs/Email/Component/Template/Component/Modal';
import ManageCategoriesModal from 'Pages/AuthenticationModule/Preferences/Pages/TemplateGenerator/EmailBuilder/Pages/Components/Modal';
import BlankTemplate1 from './BlankTemplateJson/blankTemplate1.json';
import BlankTemplate2 from './BlankTemplateJson/blankTemplate2.json';
import BlankTemplate3 from './BlankTemplateJson/blankTemplate3.json';
import BlankTemplate4 from './BlankTemplateJson/blankTemplate4.json';
import usePermission from 'Hooks/usePersmission';

const CreateNewTemplate = ({ data, communication = false, setPayload, handleCategories, onInnerModalStateChange, isAuthoring = false, channelId = 1 }) => {
    // debugger
    const navigate = useNavigate();
    const { permissions } = usePermission();
    const { addAccess, updateAccess, deleteAccess } = permissions || {};
    const state = { selectEmail: true, edmTemplateId: 'templateID' };
    const [templateFlag, setTemplateFlag] = useState({
        mode: null,
        show: false,
        templateIndex: null
    });
    const [templateData, setTemplateData] = useState(null);
    const [manageCategoriesFlag, setManageCategoriesFlag] = useState(false);

    useEffect(() => {
        if (onInnerModalStateChange) {
            onInnerModalStateChange(templateFlag?.show || false);
        }
    }, [templateFlag?.show, onInnerModalStateChange]);

    const handleTemplateClose = (status) => {
        // setTemplateFlag(false);
        setTemplateFlag({
            show: false,
            mode: 'close',
            templateIndex: null
        });
    };

    const handleManageCategoriesClose = () => {
        setManageCategoriesFlag(false);
        setTemplateFlag({
            show: true,
            mode: 'create',
        });
    };

    const templateJson = {
        templateBlank1: BlankTemplate1,
        templateBlank2: BlankTemplate2,
        templateBlank3: BlankTemplate3,
        templateBlank4: BlankTemplate4,
    };
    return (
        <>
            <div className={`rs-box text-center ${isAuthoring ? 'authoring-template-grid' : 'mt30'}`}>
                {/* <h1 className="color-secondary-grey">No templates to display.</h1>
                <p className="mt20">
                    <RSPrimaryButton
                        type="submit"
                        className=""
                        onClick={() => {
                            setTemplateFlag({
                                show: true,
                                mode: 'create',
                            });
                        }}
                        // onClick={() => {
                        //     navigate('/preferences/template-gallery/template-builder');
                        // }}
                    >
                        Create new template
                    </RSPrimaryButton>
                </p> */}
                <Row>
                    {data?.map((item, index) => {
                        const templateJsonData = JSON.stringify(templateJson[item.name]);
                        const isBlankTemplate = index === 3;
                        return (
                            <Col sm={3} key={item?.name || index}>
                                <div className={`gallery-list p10 email-template-grid no-box-shadow full-overlay ${isAuthoring ? 'mb0' : ''}`}>
                                    <div className={`px0 border-0 ${isBlankTemplate ? 'align-items-center d-flex h-100 justify-content-center' : ''}`}>
                                        <div className="gl-img">
                                            {' '}
                                            {!isBlankTemplate ? (
                                                <img
                                                    src={item?.src}
                                                    onClick={() => {
                                                        setTemplateData(templateJsonData);
                                                        setTemplateFlag({
                                                            show: true,
                                                            mode: 'create',
                                                            templateIndex: index + 1
                                                        });
                                                    }}
                                                />
                                            ) : (
                                                <div>
                                                    <i className={`${circle_plus_large} icon-xl color-primary-blue cp`} onClick={() => {
                                                        setTemplateData(templateJsonData);
                                                        setTemplateFlag({
                                                            show: true,
                                                            mode: 'create',
                                                            templateIndex: 0
                                                        });
                                                    }} />
                                                    <p className='lh-sm'>
                                                        Blank template
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                        {!isBlankTemplate && (
                                            <>
                                                <div className="overlay"></div>
                                                <div className="template-buttons-section">
                                                    <a
                                                        className={`button ${addAccess ? '' : 'click-off'}`}
                                                        onClick={() => {
                                                            // navigate(`/preferences/template-gallery/email-builder?preDefinedTemplate=${item?.path}`, {
                                                            //     state,
                                                            // });
                                                            setTemplateData(templateJsonData);
                                                            setTemplateFlag({
                                                                show: true,
                                                                mode: 'create',
                                                                templateIndex: index + 1
                                                            });
                                                        }}
                                                    >
                                                        Select
                                                    </a>
                                                </div></>
                                        )}

                                    </div>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </div>
            {/* <div className="rs-no-data-found-wrapper mt50">
                <div className="rsndfw-content">
                    <h5>
                        No templates to display. Click the{' '}
                        <RSTooltip text={'Create new template'}>
                            <i
                                className={`${circle_plus_fill_edge_medium} icon-md color-primary-blue icon-hover-shadow-primary`}
                                onClick={() => {
                                    navigate('/preferences/template-gallery/template-builder');
                                }}
                            />
                        </RSTooltip>{' '}
                        icon to create a template.
                    </h5>
                </div>
            </div> */}
            {communication ? (
                <>
                    <CommunicationTemplateModal
                        show={templateFlag}
                        handleClose={(status) => handleTemplateClose(status)}
                        type={''}
                        templateName={{ name: '', list: {} }}
                        templateData={templateData}
                        channelId={channelId}
                        onManageCategoriesClick={() => setManageCategoriesFlag(true)}
                    />
                </>
            ) : (
                <TemplateModal
                    show={templateFlag}
                    handleClose={(status) => handleTemplateClose(status)}
                    templateData={templateData}
                    channelId={channelId}
                    onManageCategoriesClick={() => setManageCategoriesFlag(true)}
                />
            )}
            <ManageCategoriesModal
                show={manageCategoriesFlag}
                handleClose={handleManageCategoriesClose}
                setCategoriesData={(data) => {
                    if (handleCategories) {
                        handleCategories('All template');
                    }
                }}
            />
        </>
    );
};

export default CreateNewTemplate;
