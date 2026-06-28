import { support_chat_medium, support_ticket_medium, support_web_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { GetJWTDeskpro } from 'Reducers/login/existingUser/request';
import { getSessionId } from 'Reducers/globalState/selector';
import CaTicketModal from './CaTicketModal';
import RSTooltip from 'Components/RSTooltip';
import {  updateCAPortalModal } from 'Reducers/globalState/reducer';
import { globalStateSelector } from 'Utils/Selectors/app';

export default function Index() {
    const [showModal, setShowModal] = useState(false);
    const [panelOpen, setPanelOpen] = useState(false);

    const dispatch = useDispatch();

    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { isShowCAPortal } = useSelector((state) => globalStateSelector(state));
    const handleDeskpro = async () => {
        const accessToken = localStorage.getItem('accessToken')
        const payload = {
            // result: false,
            // message: jwtToken,
            // statusId: "",
            // Exception: "",
            // IsAgency: ""
          departmentId, clientId, userId
        };

        const res = await dispatch(GetJWTDeskpro({ payload }));

        if (res?.status) {
            if(res?.message ){
                window.open(res?.message, '_blank');
            }
            setShowModal(false);
        }
    };

    const togglePanel = () => {
        setPanelOpen((prev) => !prev);
    };

    return (
        <div>
            <div className={"floatingContainer"}>
                <div className={`iconWrapper ${panelOpen ? '' : 'icon-open'}`}>
                    <RSTooltip text={panelOpen ? 'Support' : 'Support'} position="top" innerContent={false} className="lh0 py10 ml10">
                        <i
                            className={`${support_chat_medium} icon-md white cp`}
                            onClick={togglePanel}
                           
                        />
                    </RSTooltip>

                    <div className={`slidingIcons ${panelOpen ? '': 'sliding-close'}`}>
                        <RSTooltip text="Ticket" position="top" innerContent={false} className="lh0 ml15 py10">
                            <i
                                id="rs_RSAdvanceSearch_zoom"
                                className={`${support_ticket_medium} icon-md white cp`}
                                onClick={() => setShowModal(true)}
                            />
                        </RSTooltip>

                        <RSTooltip text="CA portal" position="top" innerContent={false} className="lh0 ml15 py10">
                            <i
                                id="rs_RSAdvanceSearch_modal"
                                className={`${support_web_medium} icon-md white cp`}
                                onClick={handleDeskpro}
                            />
                        </RSTooltip>
                    </div>
                </div>
            </div>

            <CaTicketModal
                show={showModal || isShowCAPortal?.show}
                handleClose={() => {
                    dispatch(
                        updateCAPortalModal({
                            show: false,
                            callbackFunc: () => {},
                        }),
                    );
                    setShowModal(false);
                }}
            />
        </div>
    );
}

