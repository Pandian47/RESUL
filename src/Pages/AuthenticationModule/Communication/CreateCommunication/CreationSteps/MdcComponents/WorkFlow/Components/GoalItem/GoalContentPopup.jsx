import { pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import { getMdcGlyph } from '../../constant';
import { CANCEL, OK } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useState } from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import { RSSecondaryButton, RSPrimaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import Icon from 'Components/Icon/Icon';

import { popupTemplateList } from '../ChannelItem/ChannelConst';
const ChannelContentPopup = ({
    show,
    popupMode,
    contentSettingJson,
    onClose,
    handleSaveChannelContent,
    handleCreateChannelContent,
    handleChannelEditRedirect,
}) => {
    const [name, setName] = useState('');
    const [updateTitle, setUpdateTitle] = useState('mobile_sms_large');
    const [phIcon, setPhIcon] = useState('');
    const { ChannelId, ContentThumbnailPath, DomId, ScheduleDate, ChannelDetailID } = contentSettingJson;
    
    useEffect(() => {
        if (contentSettingJson.ChannelId) {
            let updateChannelId = ChannelId?.includes('goal') ? 'goal002' : ChannelId;
            const { name, updateTitle, placeholderIcon } = popupTemplateList.filter(
                (item) => item?.channelId === updateChannelId,
            )?.[0];
            setName(name);
            setUpdateTitle(updateTitle);
            setPhIcon(placeholderIcon);
        }
    }, [contentSettingJson.ChannelId]);

    return (
        <RSModal
            size={'md'}
            show={show}
            handleClose={() => {
                onClose(false);
            }}
            header={
                popupMode === 'edit' && ChannelDetailID ? (
                    <div className="d-flex align-items-baseline">
                        <div>{updateTitle}</div>
                        <Icon
                            icon={pencil_edit_medium}
                            tooltip={'Edit'}
                            callBack={handleChannelEditRedirect}
                        />
                    </div>
                ) : (
                    <div className="d-flex align-items-baseline">
                        <div>{name} </div>
                    </div>
                )
            }
            body={
                <Container>
                    <Row>
                        {popupMode === 'edit' && ChannelDetailID ? (
                            <DisplayContent
                                ChannelId={ChannelId}
                                ContentThumbnailPath={ContentThumbnailPath}
                                ScheduleDate={ScheduleDate}
                                Content={contentSettingJson}
                            />
                        ) : (
                            <Col sm="12">
                                <Icon
                                    icon={getMdcGlyph(phIcon)}
                                    //callBack={handleCreateChannelContent}
                                    size={'lg'}
                                    mainClass={'mdcDragContentBlockCSS'}
                                />
                                <RSPrimaryButton onClick={handleCreateChannelContent} className={'float-end mt20'}>
                                    Create content
                                </RSPrimaryButton>
                            </Col>
                        )}
                    </Row>
                </Container>
            }
            footer={
                <Fragment>
                    <RSSecondaryButton
                        onClick={() => {
                            onClose(false);
                        }}
                    >
                        {CANCEL}
                    </RSSecondaryButton>

                    <RSPrimaryButton
                        onClick={handleSaveChannelContent}
                        className={`${!ChannelDetailID ? 'click-off' : ''}`}
                    >
                        {OK}
                    </RSPrimaryButton>
                </Fragment>
            }
        ></RSModal>
    );
};

export default ChannelContentPopup;

const DisplayContent = ({ ChannelId, ContentThumbnailPath, ScheduleDate, Content }) => {
    let updateChannelId = ChannelId?.includes('goal') ? 'goal002' : ChannelId;
    switch (updateChannelId) {
        case 'goal001':
            return (
                <Col sm="12">
                    <div className="">
                        <div className="text-center">
                            <img src={`data:image/png;base64, ${ContentThumbnailPath}`} />
                        </div>
                        {/* <div className="sci-center">
                            <small className="text-center mt10">{ScheduleDate}</small>
                        </div> */}
                    </div>
                </Col>
            );
        case 'goal002':
            return (
                <Col sm="12">
                    <div className="">
                        <div className="text-center">
                            <img src={`data:image/png;base64, ${ContentThumbnailPath}`} />
                        </div>
                        {/* <div className="sci-center">
                            <small className="text-center mt10">{ScheduleDate}</small>
                        </div> */}
                    </div>
                </Col>
            );
    }
};
