import { editor_image_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Fragment, useState } from 'react';
import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';
import UploadModal from './Component/UploadModal/UploadModal';
import { EditorUtils } from '@progress/kendo-react-editor';
import { uploadImageCommunicationFile } from 'Reducers/communication/createCommunication/Create/request';
import { useDispatch, useSelector } from 'react-redux';
import { getSessionId } from 'Reducers/globalState/selector';
import RSTooltip from 'Components/RSTooltip';
const ImageUpload = (props) => {
    const dispatch = useDispatch();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const [isUpload, setUpload] = useState({
        show: false,
        type: null,
    });
    const { show, type } = isUpload;

    const handleClose = () => {
        setUpload({
            show: false,
            type: null,
        });
    };
    const fileUploadCommunication = async (altText, height, src, width, title) => {
        if (type === 'media') {
            const { view } = props;
            const nodes = view.state.schema.nodes;
            const nodeType = nodes['image'];
            const tempdata = {
                src: src,
                title: title ? title : '',
                alt: altText,
                width: width ? width : 100,
                height: height ? height : 100,
            };
            const newImage = nodeType.createAndFill(tempdata);
            EditorUtils.insertNode(view, newImage, true);
            view.focus();
            handleClose();
        } else {
            const payload = {
                clientId,
                userId,
                departmentId,
                base64Image: src.split(',')[1],
                imageFormat: src.split(';')[0].split('/')[1],
            };
            const { data, status } = await dispatch(uploadImageCommunicationFile({ payload }));
            if (status) {
                const { view } = props;
                const nodes = view.state.schema.nodes;
                const nodeType = nodes['image'];
                const tempdata = {
                    src: data,
                    title: title ? title : '',
                    alt: altText,
                    width: width ? width : 100,
                    height: height ? height : 100,
                };
                const newImage = nodeType.createAndFill(tempdata);
                EditorUtils.insertNode(view, newImage, true);
                view.focus();
                handleClose();
            }else{
                handleClose();
            }
        }
    };
    return (
        <Fragment>
           
            <RSBootstrapdown
                data={['Image URL', 'Browse image']}
                defaultItem={ <RSTooltip text="Image" className="lh0" trigger={['hover', 'focus']}><i className={`${editor_image_medium} icon-md`}  /> </RSTooltip>}
                className="no_caret"
                showUpdate={false}
                onSelect={(text) => {
                    if (text === 'Browse image')
                        setUpload({
                            show: true,
                            type: 'browse',
                        });
                    else if (text === 'Image URL')
                        setUpload({
                            show: true,
                            type: 'media',
                        });
                }}
            />
           
            {/* Upload and Browse Modals */}
            {show && (
                <UploadModal
                    show={show}
                    type={type}
                    handleClose={handleClose}
                    onSave={({ altText, height, src, width, title }) => {
                        fileUploadCommunication(altText, height, src, width, title);
                    }}
                />
            )}
        </Fragment>
    );
};

export default ImageUpload;
