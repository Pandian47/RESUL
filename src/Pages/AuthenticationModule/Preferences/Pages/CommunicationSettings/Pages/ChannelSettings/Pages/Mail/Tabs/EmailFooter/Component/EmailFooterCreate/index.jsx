import { CANCEL, PREVIEW, SAVE, UPDATE } from 'Constants/GlobalConstant/Placeholders';
import { colorpicker_bg_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useContext, useEffect, useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';

import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSColorPicker from 'Components/ColorPicker';
import HowerIcon from './HowerIcons';
import ContentIcons from './ContentIcons';
import SocialFollow from './SocialFollows';
import SOCIAL_ICONS from './SocialFollows/constant';
import { CONTENTLEFT, CONTENTIMAGE, CONTENTRIGHT, CONTENTTEXT, CONTENTNAVIGATION, BODYCONFIG, buildEditData } from './constants';
import usePermission from 'Hooks/usePersmission';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';
import SaveFooterModal from '../SaveFooterModal/SaveFooterModal';
import { useDispatch, useSelector } from 'react-redux';
import {
    getEmailFooterById,
    saveEmailFooterData,
    uploadPreferenceImage,
} from 'Reducers/preferences/CommunicationSettings/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { EmailFooterProvider } from '../..';
import PreviewModal from '../PreviewModal/PreviewModal';
import { useNavigate } from 'react-router-dom';
import useQueryParams from 'Hooks/useQueryParams';
import RSEditorPopup from 'Components/FormFields/RSEditorPopup/RSEditorPopup';
import RSTooltip from 'Components/RSTooltip';



const EmailFooterCreate = ({ type, handleCancel, setFailedApi }) => {
    const context = useContext(EmailFooterProvider);
    const isEdit = context?.gridCreate?.emailFooterAction?.edit?.isEdit;
    const dispatch = useDispatch();
    const saveApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const isSaveLoading = saveApi.isFetching;
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const location = useQueryParams();
    const navigate = useNavigate();
    const methods = useForm({ defaultValues: {}, mode: 'onTouched' });
    const {
        control,
        handleSubmit,
        watch,
        formState: { isValid },
        trigger,
        setError,
    } = methods;
    const { permissions } = usePermission();
    const { addAccess } = permissions || {};
    const contentCard = watch('contentCard');
    const data = watch();
    // console.log('contentCard: ', contentCard);

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
            return { id: ind, title: e?.title, text: <img src={e?.icon} id={e?.title} alt={e?.title} /> };
        }),
    );
    const [containers, setContainers] = useState([
        //{ id: 1, text: CONTENTNAVIGATION },
        { id: 6, text: CONTENTIMAGE },
        { id: 2, text: CONTENTRIGHT },
        { id: 3, text: CONTENTLEFT },
        { id: 1, text: CONTENTNAVIGATION },
        { id: 4, text: CONTENTTEXT },
        { id: 5, text: isEdit ? [] : contentSocial },
    ]);
    // useEffect(() => {
    //     if (data.contentCard) {
    //         setContainers(prevContainers => {
    //             return prevContainers.map(container => {
    //                 let updatedText = container.text;
    //                 if (container.id === 1) {
    //                     updatedText = data.contentCard.contentNavigation || updatedText;
    //                 } else if (container.id === 2) {
    //                     updatedText = data.contentCard.contentRight || updatedText;
    //                 } else if (container.id === 3) {
    //                     updatedText = data.contentCard.contentLeft || updatedText;
    //                 } else if (container.id === 4) {
    //                     updatedText = data.contentCard.contentText || updatedText;
    //                 }
    //                 return {
    //                     ...container,
    //                     text: updatedText,
    //                 };
    //             });
    //         });
    //     }
    // }, [data]);

    //console.log("containers",containers);
    // useEffect(() => {
    //     if (data.contentCard) {
    //         const updatedContainers = [];

    //         for (let i = 0; i < containers?.length; i++) {
    //             const container = containers[i];
    //             let updatedText = container.text;

    //             if (container.id === 1) {
    //                 updatedText = data.contentCard.contentNavigation || updatedText;
    //             } else if (container.id === 2) {
    //                 updatedText = data.contentCard.contentRight || updatedText;
    //             } else if (container.id === 3) {
    //                 updatedText = data.contentCard.contentLeft || updatedText;
    //             } else if (container.id === 4) {
    //                 updatedText = data.contentCard.contentText || updatedText;
    //             }

    //             updatedContainers.push({
    //                 id: container.id,
    //                 text: updatedText,
    //             });
    //         }

    //         setContainers(updatedContainers);
    //     }
    // }, [data]);

    const [isDropped, setIsDropped] = useState(false);
    //console.log('isDropped: ', isDropped);
    const [tableBG, setTableBG] = useState('#ffffff');
    const Emailtableborder = {
        backgroundColor: tableBG,
        border: '1px solid #c2cfe3',
        padding: '10px',
        width: '600px',
        margin: '0 auto',
    };

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
                text: <img src={e?.icon} id={e?.title} alt={e?.title} width="30" />,
                link: e?.link,
            };
        });
        setContentSocial(convertTDTag);
    }, [socialContentAll]);

    useEffect(() => {
        if (!isEdit) {
            let social = [...socialContentAll].slice(0, 4);
            // console.log('Social ::: ', social);
            setSocialContentAll(social);
        }
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
            setEditName(res?.data?.footerName);
            const result = buildEditData(res?.data?.emailFooterhtml, setSocialContentAll, setTableBG);
            setContainers(result);
            // setEditData(res?.data?.emailFooterhtml);
        } else {
            setFailedApi('GetEmailFooterById');
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

    // const handleDragOver = (event, i) => {
    //     event.preventDefault();
    //     setIsDropped(true);
    //     setDropHereId(i);
    // };
    const handleDragOver = useCallback((event, i) => {
        const editor = document.querySelector('.ProseMirror-focused');
        if (editor) {
            editor.classList.remove('ProseMirror-focused');
        }
        event.preventDefault();
        setIsDropped(true);
        if (dropHereId !== i) {
            setDropHereId(i);
        }
    }, []);

    // const onDragEnd = () => {
    //     if (isDropped) setIsDropped(false);
    //         setMoveDragId(null);
    // };

    const onDragEnd = () => {
        //debugger
        if (isDropped) setIsDropped(false);
        setMoveDragId(null);
    };
    // const dragChange = (event, id) => {
    //     // event.preventDefault();
    //     setMoveDragId(id);
    //     event.dataTransfer.setData('move', 'icon');
    // };
    const dragChange = useCallback((event, id) => {
        setIsDropped(false);
        setMoveDragId(id);
        event.dataTransfer.setData('move', 'icon');
    }, []);

    const handleDoDrop = useCallback(
        (event, ind) => {
            //debugger
            event.preventDefault();
            setIsDropped(false);
            const taskId = Number(event.dataTransfer.getData('task'));
            const move = event.dataTransfer.getData('move');
            const newContent = { id: taskId, text: CONTENTNAVIGATION };
            const newContentRight = { id: taskId, text: CONTENTRIGHT };
            const newContentleft = { id: taskId, text: CONTENTLEFT };
            const newContentImage = { id: taskId, text: CONTENTIMAGE };
            const newContentText = { id: taskId, text: CONTENTTEXT };
            const newContentSocial = { id: taskId, text: contentSocial };

            const data = buildEditData(document.getElementById('cardId').outerHTML, setSocialContentAll, setTableBG);
            //console.log('data: ', data);
            //setContainers(data)
            // const updatedContainer = []
            // const updatedContainers = [];

            // [
            //     { id: 1, text: CONTENTNAVIGATION },
            //     { id: 2, text: CONTENTRIGHT },
            //     { id: 3, text: CONTENTLEFT },
            //     { id: 4, text: CONTENTTEXT },
            //     { id: 5, text: isEdit ? [] : contentSocial },
            // ]
            // for (let i = 1; i <= containers?.length; i++) {
            //     // let updatedText = containers[i].text;

            //     // if (containers[i].id === 2) {
            //     //     updatedText = data.contentCard[i].contentRight;
            //     // } else if (containers[i].id === 3) {
            //     //     updatedText = data.contentCard[i].contentLeft;
            //     // }

            //     updatedContainers.push({
            //         id : i,
            //         text :containers[i].id === 1 ? data.contentCard[i].contentNavigation : containers[i].id === 2 ? data.contentCard[i].contentRight :  containers[i].id === 3 ?data.contentCard[i].contentLeft : data.contentCard[i]?.contentText,
            //     });
            // }

            // setContainers(updatedContainers);
            // if (data.contentCard) {
            //     const updatedContainers = containers.map(container => {
            //         if (container.id === 2) {
            //             return { ...container, text: data.contentCard.contentRight };
            //         }
            //         if (container.id === 3) {
            //             return { ...container, text: data.contentCard.contentLeft };
            //         }
            //         return container;
            //     });
            //     setContainers(updatedContainers);
            // }

            let cloneContainer = [...data];
            if (ind == moveDragId) {
                setIsDropped(false);
                return;
            }
            if (move === 'icon') {
                let clone = [...cloneContainer];

                if (moveDragId >= 0 && moveDragId < clone?.length && ind >= 0 && ind < clone?.length) {
                    const [removedEle] = clone.splice(moveDragId, 1);
                    const targetIndex = ind > moveDragId ? ind - 1 : ind;
                    clone.splice(targetIndex, 0, removedEle);
                    setContainers(clone);
                }
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
            } else if (taskId == 6) {
                cloneContainer.splice(ind, 0, newContentImage);
            } else if (taskId == 5) {
                cloneContainer.splice(ind, 0, newContentSocial);
                                if (isEdit) {
                    // let temp = [...SOCIAL_ICONS];
                    setSocialContentAll(SOCIAL_ICONS);
                }
            }
            setContainers([...cloneContainer]);
            setDropHereId(null);
        },
        [containers, moveDragId, isDropped, dropHereId],
    );
    // const handleDoDrop = useCallback((event, ind) => {
    //     event.preventDefault();
    //     // const move = event.dataTransfer.getData('move');
    //     // if (move !== 'icon') return;

    //     let cloneContainer = [...containers];
    //     if (ind === moveDragId) return;

    //     let removedEle = cloneContainer.splice(moveDragId, 1)[0];
    //     cloneContainer.splice(ind, 0, removedEle);

    //     setContainers(cloneContainer);
    //     setDropHereId(null);
    //     setIsDropped(false);
    // }, [containers, moveDragId]);

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
        // console.log('Social value ::::::: ', social);
        setSocialContentAll(social);
    };
    const removeContent = (ind) => {
        let cloneContainer = [...containers];
        if (cloneContainer?.length == 1) return;
        cloneContainer.splice(ind, 1);
        setContainers(cloneContainer);
    };
    const inlineStyleADD = (htmlString) => {
        const doc = new DOMParser().parseFromString(htmlString, 'text/html');
        doc.querySelectorAll('p').forEach((p) => {
            const style = p.getAttribute('style') || '';
            const hasMargin = /margin\s*:/i.test(style);
            const hasPadding = /padding\s*:/i.test(style);

            let newStyle = style.trim();
            if (!hasMargin) newStyle += (newStyle ? '; ' : '') + 'margin: 0;';
            if (!hasPadding) newStyle += (newStyle ? '; ' : '') + 'padding: 0;';

            p.setAttribute('style', newStyle);
        });

        return doc.body.innerHTML;
    };
    const handleSave = (data) => {
        // console.log('Check save', document.getElementById('cardId').outerHTML);
        let resultData = document
            .getElementById('cardId')
            .querySelectorAll('.dragDelete_block')
            .forEach((el) => el.remove());
        resultData = document.getElementById('cardId').outerHTML;

        let tempData = resultData?.replace('ProseMirror-selectednode', '');
        let tempData1 = tempData?.replaceAll('<br class="ProseMirror-trailingBreak">', '');
        let tempData2 = tempData1?.replaceAll('ProseMirror-focused', '');
        let finalData = tempData2?.replace('pe-none', '');

        // let tempData = resultData?.replace('ProseMirror-selectednode', '').replaceAll('<br class="ProseMirror-trailingBreak">', '')
        // .replaceAll('ProseMirror-focused', '').tempData2?.replaceAll('ProseMirror-selectednode', '').tempData3?.replace('pe-none', '')
        // // let tempData1 = tempData?.replaceAll('<br class="ProseMirror-trailingBreak">', '');
        // // let tempData2 = tempData1?.replaceAll('ProseMirror-focused', '');
        // // let tempData3 = tempData2?.replaceAll('ProseMirror-focused', '');
        // let finalData = tempData?.replace('pe-none', '');

        const regex = /rgb\(([^,]+,[^,]+,[^,]+),\s?1\)/g;
        const replacedString = finalData?.replace(regex, 'rgb($1)');
        const finalContent = inlineStyleADD(replacedString);
        setSaveModal({
            show: true,
            data: finalContent,
        });
        // handleCancel(true);
    };
    const handleImageUpload = async (format, base64, contentLength) => {
        //debugger
        const payload = {
            imageFormat: format,
            contentLength,
            departmentId,
            clientId,
            base64String: base64,
            userId,
            imageType: 'Ef',
        };
        const res = await dispatch(uploadPreferenceImage({ payload }));
                if (res?.status) {
            return res?.data;
        }
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
                emailFooterHTML: saveModal?.data || '{}',
                createdBy: userId,
            };
            const { status, message } = await saveApi.refetch({
                fetcher: () => dispatch(saveEmailFooterData(payload, false)),
                loaderConfig: fieldLoaderConfig,
                mode: 'create',
            });
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
            setSaveModal((prev) => ({
                ...prev,
                show: false,
            }));
        } else {
            setSaveModal((prev) => ({
                ...prev,
                show: false,
            }));
        }
    };

    useEffect(() => {
        const handleDragEnd = () => {
            setIsDropped(false);
        };
        document.addEventListener('dragend', handleDragEnd);
        return () => {
            document.removeEventListener('dragend', handleDragEnd);
        };
    }, []);
    const handlePreview = () => {
        var result = document.getElementById('cardId').outerHTML;
        let tempData = result.replace('ProseMirror-selectednode', '');
        let finalContent = inlineStyleADD(tempData);
        setPreview({
            show: true,
            data: finalContent,
        });
    };
    const clickCancel = () => {
        if (!!location?.campaignId) {
            navigate(`/communication/create-communication${window.location.search}`);
        } else {
            handleCancel(true);
        }
    };
    // useEffect(() => {
    //     document.querySelectorAll('img + br.ProseMirror-trailingBreak').forEach((item) => {
    //         item.remove();
    //     });
    //     document.querySelectorAll('.ProseMirror-trailingBreak').forEach((item) => {
    //         item.remove();
    //     });
    // }, [containers, moveDragId, isDropped, dropHereId]);
    // console.log('Content social :::: ', containers);
    // console.log('Content social ::::2 ', contentSocial);

    return (
        <FormProvider {...methods}>
            <div>
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
                                isValid,
                                trigger,
                                watch,
                            }}
                            isEdit={isEdit}
                        />
                        <div className="rs-builder-elements-dropped-wrapper rsb edm-import-wrapper mb30">
                            <div className="flex-right rs-builder-colorpicker-container custome_colorpicker my10">
                                <RSColorPicker
                                    icon={colorpicker_bg_medium}
                                    tooltipText={'Background color'}
                                    onSelect={(color) => setTableBG(color)}
                                />
                            </div>
                            <div className="rs-builder-elements-content-wrapper p0">
                                <table
                                    id={'cardId'}
                                    width="100%"
                                    cellspacing="0"
                                    cellpadding="0"
                                    style={{ textAlign: 'center', width: '100%', padding: '0' }}
                                >
                                    <tbody>
                                        <tr>
                                            <td>
                                                <table
                                                    width="600"
                                                    class="Comm_emailFooter"
                                                    style={Emailtableborder}
                                                    cellspacing="0"
                                                    cellpadding="0"
                                                >
                                                    <tbody>
                                                        <tr>
                                                            <td>
                                                                {containers.map((ele, ind) => {
                                                                    // debugger
                                                                    return (
                                                                        <div
                                                                            key={ind}
                                                                            onDragOver={(e) => {
                                                                                e.preventDefault();
                                                                                handleDragOver(e, ind);
                                                                            }}
                                                                            onDrop={(e) => {
                                                                                handleDoDrop(e, ind);
                                                                                setIsDropped(false);
                                                                            }}
                                                                            className="rsbecw-row"
                                                                            // onDragLeave={(e) => {
                                                                            //     setIsDropped(false)
                                                                            // }}
                                                                        >
                                                                            {isDropped && dropHereId === ind && (
                                                                                <div className="rs-form-builder-drop-box">
                                                                                    <p className="text-center">
                                                                                        Drop here...
                                                                                    </p>
                                                                                </div>
                                                                            )}

                                                                            {ele?.id == 1 && (
                                                                                <>
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
                                                                                            isContentNavigation={true}
                                                                                        />
                                                                                        <RSEditorPopup
                                                                                            // <RSTinyMceInlineEditor
                                                                                            isFooter
                                                                                            name={`contentCard.${ind}.contentNavigation`}
                                                                                            control={control}
                                                                                            initialValue={
                                                                                                ele?.text
                                                                                                // isEdit
                                                                                                //     ? ele?.text
                                                                                                //     : CONTENTNAVIGATION
                                                                                            }
                                                                                            init={BODYCONFIG(
                                                                                                handleImageUpload,
                                                                                            )}
                                                                                        />
                                                                                    </div>

                                                                                    {/* <div
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
                                                                        <RSTinyMceInlineEditor
                                                                            name={`contentCard.${ind}.contentNavigation`}
                                                                            control={control}
                                                                            initialValue={
                                                                                isEdit ? ele?.text : CONTENTNAVIGATION
                                                                            }
                                                                            init={BODYCONFIG(handleImageUpload)}
                                                                        />
                                                                    </div> */}
                                                                                </>
                                                                            )}

                                                                            {ele?.id == 2 && (
                                                                                <div
                                                                                    id={`contentCard${ind}contentRight`}
                                                                                    draggable={true}
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
                                                                                        // <RSTinyMceInlineEditor
                                                                                        isFooter
                                                                                        name={`contentCard.${ind}.contentRight`}
                                                                                        control={control}
                                                                                        initialValue={
                                                                                            // isEdit
                                                                                            //     ? ele?.text
                                                                                            //     : CONTENTRIGHT
                                                                                            ele?.text
                                                                                        }
                                                                                        init={BODYCONFIG(
                                                                                            handleImageUpload,
                                                                                        )}
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
                                                                                        isFooter
                                                                                        // <RSTinyMceInlineEditor
                                                                                        name={`contentCard.${ind}.contentLeft`}
                                                                                        control={control}
                                                                                        initialValue={
                                                                                            // isEdit
                                                                                            //     ? ele?.text
                                                                                            //     : CONTENTLEFT
                                                                                            ele?.text
                                                                                        }
                                                                                        init={BODYCONFIG(
                                                                                            handleImageUpload,
                                                                                        )}
                                                                                    />
                                                                                </div>
                                                                            )}
                                                                            {ele?.id == 4 && (
                                                                                <div
                                                                                    id={`contentCard${ind}contentText`}
                                                                                    draggable={false}
                                                                                    className={`CONTENTTEXT rs-pop-view clearfix ${
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
                                                                                        isFooter
                                                                                        // <RSTinyMceInlineEditor
                                                                                        name={`contentCard.${ind}.contentText`}
                                                                                        control={control}
                                                                                        initialValue={
                                                                                            // isEdit
                                                                                            //     ? ele?.text
                                                                                            //     : CONTENTTEXT
                                                                                            ele?.text
                                                                                        }
                                                                                        init={BODYCONFIG(
                                                                                            handleImageUpload,
                                                                                        )}
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
                                                                                    {/* {isEdit ? (
                                                                        <div className="d-flex justify-content-center">
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
                                                                    ) : ( */}
                                                                                    <div
                                                                                        className="d-flex justify-content-center"
                                                                                        onClick={() => {
                                                                                            setSocialFlag(true);
                                                                                        }}
                                                                                    >
                                                                                        <table
                                                                                            align="center"
                                                                                            valign="middle"
                                                                                            style={{ margin: '0 auto' }}
                                                                                        >
                                                                                            <tr>
                                                                                                {contentSocial?.map(
                                                                                                    (item, ind) => {
                                                                                                        return (
                                                                                                            <td
                                                                                                                align="center"
                                                                                                                style={{
                                                                                                                    textAlign:
                                                                                                                        'center',
                                                                                                                    paddingRight:
                                                                                                                        '10px',
                                                                                                                }}
                                                                                                            >
                                                                                                                <div
                                                                                                                    key={
                                                                                                                        ind
                                                                                                                    }
                                                                                                                >
                                                                                                                    <RSTooltip
                                                                                                                        text={
                                                                                                                            item?.title
                                                                                                                        }
                                                                                                                    >
                                                                                                                        <a
                                                                                                                            className="pe-none"
                                                                                                                            href={
                                                                                                                                item?.link
                                                                                                                            }
                                                                                                                            id={
                                                                                                                                item?.link
                                                                                                                            }
                                                                                                                        >
                                                                                                                            {
                                                                                                                                item?.text
                                                                                                                            }
                                                                                                                        </a>

                                                                                                                        {/* <a  {!!item?.link && {href : item?.link}}>
                                                                                            {item?.text}
                                                                                        </a> */}
                                                                                                                    </RSTooltip>
                                                                                                                </div>
                                                                                                            </td>
                                                                                                        );
                                                                                                    },
                                                                                                )}
                                                                                            </tr>
                                                                                        </table>
                                                                                    </div>
                                                                                    {/* )} */}
                                                                                </div>
                                                                            )}
                                                                            {ele?.id == 6 && (
                                                                                <div
                                                                                    id={`contentCard${ind}contentImage`}
                                                                                    draggable={true}
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
                                                                                        // <RSTinyMceInlineEditor
                                                                                        isFooter
                                                                                        name={`contentCard.${ind}.contentImage`}
                                                                                        control={control}
                                                                                        initialValue={
                                                                                            // isEdit
                                                                                            //     ? ele?.text
                                                                                            //     : CONTENTRIGHT
                                                                                            ele?.text
                                                                                        }
                                                                                        init={BODYCONFIG(
                                                                                            handleImageUpload,
                                                                                        )}
                                                                                    />
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
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div className="buttons-holder">
                        <RSSecondaryButton onClick={clickCancel} blockInteraction={isSaveLoading}>
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSSecondaryButton className={'color-primary-blue'} onClick={() => handlePreview()}>
                        {PREVIEW}
                        </RSSecondaryButton>
                        {addAccess && (
                            <RSPrimaryButton
                                type="submit"
                                isLoading={isSaveLoading}
                                blockBodyPointerEvents={isSaveLoading}
                            >
                                {isEdit ? UPDATE : SAVE}
                            </RSPrimaryButton>
                        )}
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
