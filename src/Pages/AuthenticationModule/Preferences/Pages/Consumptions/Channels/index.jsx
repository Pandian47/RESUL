import { useEffect } from 'react';
import RSPageHeader from 'Components/RSPageHeader';
import { Container } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import RenderComponent from './Components/RenderComponent';
import useQueryParams from 'Hooks/useQueryParams';
import { globalStateSelector } from 'Utils/Selectors/app';
import { update_consumptionMonth, update_consumptionYear, update_filteredChannels } from 'Reducers/globalState/reducer';
const ConsumptionChannelDetail = () => {
    // const { state } = useLocation();
    // console.log('state: ', state);
    const dispatch = useDispatch();
    const { consumptionChannel, filteredChannels } = useSelector((state) => globalStateSelector(state));
    // console.log('consumptionChannel: ', consumptionChannel);
    const currentDate = new Date().toDateString();
    const location = useQueryParams('/preferences/consumptions/consumption-channel');
    // console.log('location: ', location);

    useEffect(() => {
        if (location?.filteredChannels) {
            dispatch(update_filteredChannels(location.filteredChannels));
        }
    }, [dispatch, location?.filteredChannels]);

    useEffect(() => {
        return () => {
            dispatch(update_consumptionYear(new Date().getFullYear()));
            dispatch(update_consumptionMonth(new Date().getMonth()));
        };
    }, [location]);

    return (
        // Contend holder starts
        <div className="page-content-holder d-grid">
            {/* Main page heading block starts */}
            <RSPageHeader
                title="Consumptions"
                isConsumption
                isChannel
                filteredChannels={filteredChannels}
                isBack
                backPath="/preferences/consumptions"
                rightCommonMenus
            />
            {/* Main page heading block ends */}
            {/* Main page content block starts */}
            <Container fluid>
                <div className='page-content'>
             <Container className="rs-consumptions-wrapper px0">
                <RenderComponent currentPage={consumptionChannel?.id} />
            </Container>
            </div>
            </Container>
          
            {/* Main page content block ends */}
        </div>

        // Content holder ends
    );
};

export default ConsumptionChannelDetail;
