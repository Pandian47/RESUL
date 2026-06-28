import { getUserDetails, encodeUrl } from 'Utils/modules/crypto';
import { CLICK_RETURN_TO_THE_MASTER, IMPORT_IS_IN_PROGRESS, MASTER_LIST, RETUTN_TO_THE, SELECT_AN_OPTION, UPLOAD_LISTS } from 'Constants/GlobalConstant/Placeholders';
import { Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { timer_large } from 'Constants/GlobalConstant/Glyphicons';
import { getGlobalClientList, getSessionId } from 'Reducers/globalState/selector';
import RSModal from 'Components/RSModal';
import { useSelector } from 'react-redux';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';

import useQueryParams from 'Hooks/useQueryParams';
const AudienceImportModal = ({ show, handleClose, audienceMode }) => {
    const { licenseTypeId } = getUserDetails();
    const clientList = useSelector((state) => getGlobalClientList(state));
    
    const { departmentName, clientId } = useSelector((state) => getSessionId(state));
    const state = useQueryParams('/audience/add-import-audience');
    const navigate = useNavigate();
    let tempclientName = clientList?.filter((e) => e.clientId === clientId);
    return (
        <RSModal
            show={show}
            header={'Add audience'}
            // handleClose={handleClose}
            isCloseButton={false}
            size={'lg'}
            body={
                <>
                    <Row>
                        {parseInt(licenseTypeId, 10) === 3 ? (
                            <>
                            <i className={`${timer_large} font-xxl text-center`} />
                            <h3 className="text-center my10">
                                {tempclientName?.[0]?.clientName || ''} - {departmentName}
                            </h3>
                            </>
                        ) : (
                            ''
                        )}
                        {/* // TODO {Vennila}: Client name with Bu's */}
                        <p className="text-center">
                            {IMPORT_IS_IN_PROGRESS}{' '}
                            {`${CLICK_RETURN_TO_THE_MASTER
                                // getAudienceStatus(audienceMode)
                                //     ? SELECT_AN_OPTION
                                //     : CLICK_RETURN_TO_THE_MASTER
                            }`}
                        </p>
                    </Row>
                </>
            }
            footer={
                <>
                    <RSSecondaryButton
                        onClick={() => {
                            const connectionMode = state?.data?.audienceData?.data?.connectionMode?.typeId || 1

                            const stateRedirect = {  connectionMode: connectionMode };
                                navigate(`/audience/sync-history?q=${encodeUrl(stateRedirect)}`, {
                                    state: stateRedirect,
                                });
                            // navigate('/audience/add-audience', {
                            //     state: { from: 'master-data' },
                            // })
                            // if (state?.isAudience) {
                            //     const stateRedirect = { from: 'master-data' };
                            //     const stateredirectEncode = encodeUrl(stateRedirect);

                            //     navigate(`/audience/add-audience?q=${stateredirectEncode}`, {
                            //         state: stateRedirect,
                            //     });
                            // } else {
                            //     navigate('/preferences/data-exchange');
                            // }
                            // if (state?.fromPage === 'targetList') {
                            //     const stateRedirect = { index: 1 };
                            //     navigate(`/audience?q=${encodeUrl(stateRedirect)}`, {
                            //         state: { index: 1 },
                            //     });
                            // } else {
                               // navigate('/audience/sync-history');
                          //  }
                        }}
                    >
                        {UPLOAD_LISTS}
                    </RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={() => {
                            const url = '/audience';
                            const index = 0;
                            const state1 = { index, from: 'master-data' };
                            const encryptState = encodeUrl(state1);
                            navigate(`${url}?q=${encryptState}`, {
                                state: state1,
                            });
                        }}
                    >
                        {RETUTN_TO_THE}{' '}
                        {MASTER_LIST}
                    </RSPrimaryButton>
                </>
            }
        />
    );
};

export default AudienceImportModal;
