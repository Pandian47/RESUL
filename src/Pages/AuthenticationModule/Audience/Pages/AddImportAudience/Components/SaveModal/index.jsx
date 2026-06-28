import { encodeUrl } from 'Utils/modules/crypto';
import RSModal from 'Components/RSModal';
import { timer_large } from 'Constants/GlobalConstant/Glyphicons';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useNavigate } from 'react-router-dom';
import { updateIntegartedSytem } from 'Reducers/preferences/DataExchange/reducer';
import { useDispatch, useSelector } from 'react-redux';

const SaveModal = ({ saveModal, dispatchState }) => {
    const navigate = useNavigate();
    const { integratedSystem, addCard } = useSelector(({ dataExchangeReducer }) => dataExchangeReducer);
    const dispatch = useDispatch();
    const returToList = () => {
        let _integratedSystem = [...integratedSystem];
        _integratedSystem.push(addCard);
        dispatch(updateIntegartedSytem({ field: 'integratedSystem', data: _integratedSystem }));
        dispatch(updateIntegartedSytem({ field: 'connectFields', data: {} }));
        navigate(-1);
    };
    const importAgain = () => {
        dispatch(updateIntegartedSytem({ field: 'integratedSystem', data: [] }));
        dispatch(updateIntegartedSytem({ field: 'connectFields', data: {} }));
        // navigate('/audience/add-audience');
        const stateRedirect = { from: 'master-data' };
        const stateredirectEncode = encodeUrl(stateRedirect);

        navigate(`/audience/add-audience?q=${stateredirectEncode}`, {
            state: stateRedirect,
        });
    };
    return (
        <RSModal
            show={saveModal}
            handleClose={() => dispatchState({ type: 'UPDATE', field: 'saveModal', payload: false })}
            size="md"
            header="Add audience"
            body={
                <div className="text-center">
                    <i className={`${timer_large} font-xxl`} />
                    <h3 className="my10"></h3>
                    <p>Import is in progress. Click "Return to data exchange" to safely navigate to other pages.</p>
                    <div className="float-end mt20">
                        <RSSecondaryButton onClick={importAgain} className="mr10">
                            Import again
                        </RSSecondaryButton>
                        <RSPrimaryButton onClick={returToList}>Return to the master data</RSPrimaryButton>
                    </div>
                </div>
            }
        />
    );
};

export default SaveModal;
