import { scolor1, scolor2 } from './constants';
import ContentLoader from 'react-content-loader';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

const GridHead = () => (
    <ContentLoader
        style={{ width: '100%' }}
        viewBox="0 0 100% 70"
        backgroundColor={scolor1}
        foregroundColor={scolor2}
        height={50}
    >
        <rect x="0" y="17" rx="2" ry="2" width="100%" height="33" />
    </ContentLoader>
);
const GridView = () => (
    <ContentLoader
        style={{ width: '100%' }}
        viewBox="0 0 100% 70"
        backgroundColor={scolor1}
        foregroundColor={scolor2}
        height={40}
    >
        <rect x="0" y="17" rx="2" ry="2" width="100%" height="25" />
    </ContentLoader>
);

export const SkeletonPieChart = (props) => {
    return (
        <div className="no-data-container">
            {props.isError ? <NoDataAvailableRender /> : null}

            {/* <GridHead /> <br />
        <GridView /> <br />
        <GridView /> */}
        </div>
    );
};
