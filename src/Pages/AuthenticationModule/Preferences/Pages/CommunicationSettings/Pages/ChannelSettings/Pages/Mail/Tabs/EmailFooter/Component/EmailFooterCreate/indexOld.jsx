import { colorpicker_bg_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useContext, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSColorPicker from 'Components/ColorPicker';

import HowerIcon from './HowerIcons';
import ContentIcons from './ContentIcons';
import SocialFollow from './SocialFollows';
import SOCIAL_ICONS from './SocialFollows/constant';
import { CONTENTLEFT, CONTENTRIGHT, CONTENTTEXT, CONTENTNAVIGATION, BODYCONFIG, buildEditData } from './constants';
import usePermission from 'Hooks/usePersmission';
import SaveFooterModal from '../SaveFooterModal/SaveFooterModal';
import { useDispatch, useSelector } from 'react-redux';
import { getEmailFooterById, saveEmailFooterData } from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { EmailFooterProvider } from '../..';
import PreviewModal from '../PreviewModal/PreviewModal';
import { useNavigate } from 'react-router-dom';
import useQueryParams from 'Hooks/useQueryParams';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import RSTooltip from 'Components/RSTooltip';

const EmailFooterCreate = ({ type, handleCancel }) => {
    const context = useContext(EmailFooterProvider);
    const isEdit = context?.gridCreate?.emailFooterAction?.edit?.isEdit;
    const dispatch = useDispatch();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const location = useQueryParams();
    const navigate = useNavigate();
    const methods = useForm();
    const { control, handleSubmit, watch } = methods;
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const contentCard = watch('contentCard');
    // console.log('contentCard: ', contentCard);
    const [socialContentAll, setSocialContentAll] = useState(SOCIAL_ICONS);
    const [moveDragId, setMoveDragId] = useState(null);
    const [socialFlag, setSocialFlag] = useState(false);
    const [dropHereId, setDropHereId] = useState(null);
    const [saveModal, setSaveModal] = useState({
        show: false,
        data: {},
    });
    const [editName, setEditName] = useState('');
    const [preview, setPreview] = useState({
        show: false,
        data: {},
    });
    // const [editData, setEditData] = useState();

    const [contentSocial, setContentSocial] = useState(
        [...socialContentAll].map((e, ind) => {
            return { id: ind, title: e?.title, text: <img src={e.icon} id={e.title} alt={e.title} /> };
        }),
    );
    const [containers, setContainers] = useState([
        { id: 1, text: CONTENTNAVIGATION },
        { id: 2, text: CONTENTRIGHT },
        { id: 3, text: CONTENTLEFT },
        { id: 4, text: CONTENTTEXT },
        { id: 5, text: isEdit ? [] : contentSocial },
    ]);
    const [isDropped, setIsDropped] = useState(false);
    const [tableBG, setTableBG] = useState('#ffffff');

    useEffect(() => {
        // console.log('Changed content social');
        const social = [...socialContentAll];
        // let convertTDTag = social.map(
        //     (e) => `<img src=${e.icon} alt=${e.title} width="30" style="margin-right:10px" />`,
        // );
        // setContentSocial(
        //     `<table width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4;"><tr><td align="center" style="padding:10px;">${convertTDTag.join(
        //         '',
        //     )}</td></tr></table>`,
        // );
        let convertTDTag = social.map((e, ind) => {
            return {
                id: ind,
                title: e?.title,
                text: <img src={e.icon} id={e.title} alt={e.title} width="30" style={{ marginRight: '10px' }} />,
            };
        });
        setContentSocial(convertTDTag);
    }, [socialContentAll]);

    useEffect(() => {
        let social = [...socialContentAll].slice(0, 4);
        // console.log('Social ::: ', social);
        setSocialContentAll(social);
    }, []);

    const getFooterUpdate = async () => {
        let id = context?.gridCreate?.emailFooterAction?.edit?.editState?.emailFooterId;
        const payload = {
            clientId,
            userId,
            emailfooterId: id,
        };
        const res = await dispatch(getEmailFooterById(payload));
                if (res?.status) {
            const result = buildEditData(res?.data?.emailFooterhtml, setSocialContentAll);
            setEditName(res?.data?.footerName);
            setContainers(result);
            // setEditData(res?.data?.emailFooterhtml);
        }
    };

    useEffect(() => {
        if (isEdit) getFooterUpdate();
    }, []);

    function onNodeChange(e) {
                const node = e?.element;
        if (e?.type?.name === 'image' || node?.tagName === 'IMG') {
            // const src = node.getAttribute('src');
            // const alt = node.getAttribute('alt');
            setSocialFlag(true);
        }
    }

    const handleDragOver = (event, i) => {
        event.preventDefault();
        setIsDropped(true);
        setDropHereId(i);
    };

    const onDragEnd = () => {
        if (isDropped) setIsDropped(false);
    };

    const dragChange = (event, id) => {
        // event.preventDefault();
        setMoveDragId(id);
        event.dataTransfer.setData('move', 'icon');
    };

    const handleDoDrop = (event, ind) => {
        event.preventDefault();
        setIsDropped(false);
        const taskId = Number(event.dataTransfer.getData('task'));
        const move = event.dataTransfer.getData('move');
        const newContent = { id: taskId, text: CONTENTNAVIGATION };
        const newContentRight = { id: taskId, text: CONTENTRIGHT };
        const newContentleft = { id: taskId, text: CONTENTLEFT };
        const newContentText = { id: taskId, text: CONTENTTEXT };
        const newContentSocial = { id: taskId, text: contentSocial };
        let cloneContainer = [...containers];
        if (ind == moveDragId) return;
        if (move === 'icon') {
            let clone = [...cloneContainer];
            let removedEle = clone.splice(moveDragId, 1)[0];
            clone.splice(ind - 1, 0, removedEle);
            setContainers(clone);
            return;
        }
        if (taskId == 1) {
            cloneContainer.splice(ind, 0, newContent);
        } else if (taskId == 2) {
            cloneContainer.splice(ind, 0, newContentRight);
        } else if (taskId == 3) {
            cloneContainer.splice(ind, 0, newContentleft);
        } else if (taskId == 4) {
            cloneContainer.splice(ind, 0, newContentText);
        } else if (taskId == 5) {
            cloneContainer.splice(ind, 0, newContentSocial);
        }
        setContainers([...cloneContainer]);
        setDropHereId(null);
    };

    // sidebar for social content
    const addSocialContent = (ele) => {
        let social = [...socialContentAll];
        if (!social.some((e) => e.id == ele.id) && social?.length < 6) {
            social.push(ele);
            setSocialContentAll(social);
        }
    };

    const removeSocialContent = (index) => {
        let social = [...socialContentAll];
        social.splice(index, 1);
                setSocialContentAll(social);
    };
    const removeContent = (ind) => {
        let cloneContainer = [...containers];
        if (cloneContainer?.length == 1) return;
        cloneContainer.splice(ind, 1);
        setContainers(cloneContainer);
    };
    const handleSave = (data) => {
                const resultData = document.getElementById('cardId').outerHTML;
        setSaveModal({
            show: true,
            data: resultData,
        });
        // handleCancel(true);
    };
    const handleSubmitFooter = async (nameStatus, name) => {
        if (nameStatus) {
            let id = context?.gridCreate?.emailFooterAction?.edit?.editState?.emailFooterId;
            const payload = {
                clientId,
                userId,
                departmentId,
                emailfooterId: isEdit ? id : 0,
                footerName: name,
                emailFooterHTML: saveModal?.data,
                createdBy: userId,
            };
            const { status } = await dispatch(saveEmailFooterData(payload));
            if (status) {
                if (!!location?.campaignId) {
                    navigate(`/communication/create-communication${window.location.search}`);
                } else {
                    handleCancel(true);
                    setSaveModal((prev) => ({
                        ...prev,
                        show: false,
                    }));
                }
            }
        } else {
            setSaveModal((prev) => ({
                ...prev,
                show: false,
            }));
        }
    };

    const handlePreview = () => {
        var result = document.getElementById('cardId').outerHTML;
        setPreview({
            show: true,
            data: result,
        });
    };
    const clickCancel = () => {
        if (!!location?.campaignId) {
            navigate(`/communication/create-communication${window.location.search}`);
        } else {
            handleCancel(true);
        }
    };
    // console.log('Content social :::: ', containers);

    return (
        <FormProvider {...methods}>
            <div className="rsv-tabs-content">
                <form onSubmit={handleSubmit(handleSave)}>
                    <div className="box-design bd-top-border">
                        {/* Content starts */}
                        <div className="rs-sub-heading rss-left">
                            <h4>Email footer</h4>
                        </div>
                        <ContentIcons containers={containers} onDragEnd={onDragEnd} />
                        <SocialFollow
                            data={{
                                socialContentAll,
                                control,
                                removeSocialContent,
                                setSocialContentAll,
                                setSocialFlag,
                                socialFlag,
                            }}
                        />
                        <div className="rs-builder-elements-dropped-wrapper rsb edm-import-wrapper">
                            <div className="flex-right rs-builder-colorpicker-container">
                                <RSColorPicker
                                    icon={colorpicker_bg_medium}
                                    onSelect={(color) => setTableBG(color)}
                                />
                            </div>
                            <div className="rs-builder-elements-content-wrapper p0 ">
                                <table id={'cardId'} width="100%" style={{ backgroundColor: tableBG }}>
                                    <tbody>
                                        <tr>
                                            <td>
                                                {containers.map((ele, ind) => {
                                                    // console.log('Ele :::: ', ele);

                                                    return (
                                                        <div
                                                            key={ind}
                                                            onDragOver={(e) => {
                                                                handleDragOver(e, ind);
                                                            }}
                                                            onDrop={(e) => {
                                                                handleDoDrop(e, ind);
                                                            }}
                                                            className="rsbecw-row"
                                                        >
                                                            {isDropped && dropHereId === ind && (
                                                                <div className="rs-form-builder-drop-box">
                                                                    <p className="text-center">Drop here...</p>
                                                                </div>
                                                            )}

                                                            {ele?.id == 1 && (
                                                                <div
                                                                    id={`contentCard${ind}contentNavigation`}
                                                                    draggable={false}
                                                                    className={`rs-pop-view ${
                                                                        isDropped ? 'click-off' : ''
                                                                    }`}
                                                                >
                                                                    <HowerIcon
                                                                        data={{
                                                                            removeContent,
                                                                            dragChange,
                                                                            ind,
                                                                        }}
                                                                    />
                                                                    <RSEditorPopup
                                                                        name={`contentCard.${ind}.contentNavigation`}
                                                                        control={control}
                                                                        initialValue={
                                                                            isEdit ? ele?.text : CONTENTNAVIGATION
                                                                        }
                                                                        init={BODYCONFIG}
                                                                    />
                                                                </div>
                                                            )}

                                                            {ele?.id == 2 && (
                                                                <div
                                                                    id={`contentCard${ind}contentRight`}
                                                                    draggable={false}
                                                                    className={`rs-pop-view clearfix ${
                                                                        isDropped ? 'click-off' : ''
                                                                    }`}
                                                                >
                                                                    <HowerIcon
                                                                        data={{
                                                                            removeContent,
                                                                            dragChange,
                                                                            ind,
                                                                        }}
                                                                    />
                                                                    <RSEditorPopup
                                                                        name={`contentCard.${ind}.contentRight`}
                                                                        control={control}
                                                                        initialValue={isEdit ? ele?.text : CONTENTRIGHT}
                                                                        init={BODYCONFIG}
                                                                    />
                                                                </div>
                                                            )}
                                                            {ele?.id == 3 && (
                                                                <div
                                                                    id={`contentCard${ind}contentLeft`}
                                                                    draggable={false}
                                                                    className={`rs-pop-view clearfix ${
                                                                        isDropped ? 'click-off' : ''
                                                                    }`}
                                                                >
                                                                    <HowerIcon
                                                                        data={{
                                                                            removeContent,
                                                                            dragChange,
                                                                            ind,
                                                                        }}
                                                                    />
                                                                    <RSEditorPopup
                                                                        name={`contentCard.${ind}.contentLeft`}
                                                                        control={control}
                                                                        initialValue={isEdit ? ele?.text : CONTENTLEFT}
                                                                        init={BODYCONFIG}
                                                                    />
                                                                </div>
                                                            )}
                                                            {ele?.id == 4 && (
                                                                <div
                                                                    id={`contentCard${ind}contentText`}
                                                                    draggable={false}
                                                                    className={`rs-pop-view clearfix ${
                                                                        isDropped ? 'click-off' : ''
                                                                    }`}
                                                                >
                                                                    <HowerIcon
                                                                        data={{
                                                                            removeContent,
                                                                            dragChange,
                                                                            ind,
                                                                        }}
                                                                    />
                                                                    <RSEditorPopup
                                                                        name={`contentCard.${ind}.contentText`}
                                                                        control={control}
                                                                        initialValue={isEdit ? ele?.text : CONTENTTEXT}
                                                                        init={BODYCONFIG}
                                                                    />
                                                                </div>
                                                            )}
                                                            {ele?.id == 5 && (
                                                                <div
                                                                    id={`contentCard${ind}contentSocial`}
                                                                    onDragOver={(e) => {
                                                                        handleDragOver(e, ind);
                                                                    }}
                                                                    draggable={false}
                                                                    className={`rs-pop-view clearfix ${
                                                                        isDropped ? 'click-off' : ''
                                                                    }`}
                                                                >
                                                                    <HowerIcon
                                                                        data={{
                                                                            removeContent,
                                                                            dragChange,
                                                                            ind,
                                                                        }}
                                                                    />
                                                                    {/* <RSEditorPopup
                                                                        name={`contentCard.${ind}.contentSocial`}
                                                                        control={control}
                                                                        initialValue={
                                                                            isEdit ? ele?.text : contentSocial
                                                                        }
                                                                        init={BODYCONFIGIMAGE}
                                                                        // onNodeChange={onNodeChange}
                                                                        handleNodeChange={onNodeChange}
                                                                    /> */}
                                                                    {isEdit ? (
                                                                        <div className="d-flex">
                                                                            {ele?.text?.map((item, ind) => {
                                                                                return (
                                                                                    <div
                                                                                        key={ind}
                                                                                        onClick={() => {
                                                                                                                                                                                        setSocialFlag(true);
                                                                                        }}
                                                                                    >
                                                                                        <RSTooltip text={item?.title}>
                                                                                            <img
                                                                                                src={item?.text?.icon}
                                                                                                id={item?.title}
                                                                                                alt={item?.title}
                                                                                                width={'30px'}
                                                                                                style={{
                                                                                                    marginRight: '10px',
                                                                                                }}
                                                                                            />
                                                                                        </RSTooltip>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    ) : (
                                                                        // <div id="socialEdit">
                                                                        //     {ele.text?.childNodes}
                                                                        //     {/* {ele.text?.childNodes?.map(
                                                                        //         (item, id) => ele?.text?.[id],
                                                                        //     )} */}
                                                                        // </div>
                                                                        <div className="d-flex">
                                                                            {contentSocial?.map((item, ind) => {
                                                                                return (
                                                                                    <div
                                                                                        key={ind}
                                                                                        onClick={() => {
                                                                                                                                                                                        setSocialFlag(true);
                                                                                        }}
                                                                                    >
                                                                                        <RSTooltip text={item?.title}>
                                                                                            {item?.text}
                                                                                        </RSTooltip>
                                                                                    </div>
                                                                                );
                                                                            })}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {/* {ele?.id == 5 && (
                                                            <div
                                                                draggable={false}
                                                                className={isDropped ? `click-off` : ''}
                                                            >
                                                                <HowerIcon
                                                                    data={{
                                                                        removeContent,
                                                                        dragChange,
                                                                        ind,
                                                                    }}
                                                                />
                                                                <RSEditorPopup
                                                                    name={`contentCard.${ind}.contentCommon`}
                                                                    control={control}
                                                                    initialValue={CONTENTCOMMON}
                                                                    init={BODYCONFIG}
                                                                />
                                                            </div>
                                                        )} */}
                                                        </div>
                                                    );
                                                })}
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="buttons-holder">
                        <RSSecondaryButton onClick={clickCancel}>Cancel</RSSecondaryButton>
                        <RSSecondaryButton className={'color-primary-blue'} onClick={() => handlePreview()}>
                            Preview
                        </RSSecondaryButton>
                        {addAccess && <RSPrimaryButton type="submit">Save</RSPrimaryButton>}
                    </div>
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
                </form>
            </div>
        </FormProvider>
    );
};

export default EmailFooterCreate;
