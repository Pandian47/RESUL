import RSHighchartsContainer from 'Components/Highcharts';
import { deliveryMethod } from '../../../../ChartOptions';

const DeliveryMethod = ({ type }) => {
    return (
        <div>
            <RSHighchartsContainer options={deliveryMethod()} />
        </div>
    );
};

export default DeliveryMethod;
