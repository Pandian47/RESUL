import { LINKED_COMMUNICATION } from 'Constants/GlobalConstant/Placeholders';
import { useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import RSModal from 'Components/RSModal';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';

const LinkedCommunicationsModal = ({ props, show, handleClose, confirm, data }) => {
    const [isShow, setIsShow] = useState(false);

    const { handleSubmit } = useForm();

    useEffect(() => {
        setIsShow(show);
    }, [show]);

    return (
        <RSModal
            size={'md'}
            show={isShow}
            //show
            handleClose={handleClose}
            header={LINKED_COMMUNICATION}
            body={
                <Container>
                    <ul className="rs-list-alt-bg forms-linkedcomm-popup css-scrollbar">
                        {data?.formCampaignUsed?.map((item, index) => {
                            return (
                                <li key={index}>
                                    {/* {item?.campaignName?.length > 50 ? (
                                        <RSTooltip text={item.campaignName} position="top" innerContent={false}>
                                            <span>{truncateTitle(item.campaignName, 50)}</span>
                                        </RSTooltip>
                                    ) : (
                                        <span>{item.campaignName}</span>
                                    )} */}
                                    <TruncatedCell value = {item?.campaignName} noTable = {true}/>
                                </li>
                            );
                        })}
                    </ul>
                </Container>
            }
            // footer={
            //     <>
            //         <RSSecondaryButton onClick={() => handleClose(false)}>Cancel</RSSecondaryButton>
            //         <RSPrimaryButton onClick={handleSubmit(confirm)}>Save</RSPrimaryButton>
            //     </>
            // }
        />
    );
};

export default LinkedCommunicationsModal;
