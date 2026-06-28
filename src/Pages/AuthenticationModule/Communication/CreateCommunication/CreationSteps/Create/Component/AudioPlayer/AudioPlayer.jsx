import { ARE_YOU_SURE_DELETE, DELETE, DELETE_USER_ROLE, OK } from 'Constants/GlobalConstant/Placeholders';
import { delete_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useFormContext } from 'react-hook-form';

import RSTooltip from 'Components/RSTooltip';
import RSConfirmationModal from 'Components/ConfirmationModal';

const AudioPlayer = ({ src, audio, fieldName, isDelete = true, onDelete = () => {} }) => {
    const [source, setSource] = useState(src);
    const { resetField } = useFormContext();
    const [isDeleteModal, setIsDeleteModal] = useState(false)
    useEffect(() => {
        setSource(src);
    }, [src]);

    return (
        <div className="rs-audio-player-wrapper">
            <div className="rsapw-top-section d-flex justify-content-between mb10">
                <span className="rsapw-file-name">
                    {/* <small>{_get(audio, 'name', '')}</small> */}
                    <small>{!!audio && audio?.split('/').pop()}</small>
                </span>
                {isDelete && (
                    <RSTooltip text={DELETE} className="lh0">
                            <i
                                id="rs_data_delete"
                                className={`${delete_medium} icon-md color-primary-blue`}
                                onClick={() => {
                                    setIsDeleteModal(true);
                                }}
                            />
                    </RSTooltip>
                )}
            </div>
            {/* <small>{utils.formatBytes(_get(audio, 'size', ''))}</small> */}

            <audio controls src={source}></audio>
            <RSConfirmationModal
                show={isDeleteModal}
                text={ARE_YOU_SURE_DELETE}
                primaryButtonText={OK}
                isBorder
                header={DELETE_USER_ROLE}
                handleClose={() => {
                    setIsDeleteModal(false);
                }}
                handleConfirm={(status) => {
                    if (status) {
                        resetField(fieldName);
                        onDelete();
                    }
                }}
            />
        </div>
    );
};

AudioPlayer.propTypes = {
    src: PropTypes.string,
    audio: PropTypes.string,
    // audio: PropTypes.object,
    fieldName: PropTypes.string,
    isDelete: PropTypes.bool,
};

export default AudioPlayer;
