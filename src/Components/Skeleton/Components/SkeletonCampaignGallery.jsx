import { scolor1, scolor2, sheightLg, themeRadiusmd, themeSizeSm } from './constants';
import { alert_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Component } from 'react';
import ContentLoader from 'react-content-loader';
const GridView = (props) => (
    <ContentLoader
        // className={`mb${themeSizeSm}`}
        style={{ width: '100%' }}
        viewBox={`0 0 100% ${sheightLg}`}
        backgroundColor={scolor1}
        foregroundColor={scolor2}
        height={sheightLg}
    >
        <rect
            x="0"
            y="0"
            rx={themeRadiusmd}
            ry={themeRadiusmd}
            width={`calc(25% - 15px)`}
            height={sheightLg}
        />
        <rect
            x={`calc(25% + 5px)`}
            y="0"
            rx={themeRadiusmd}
            ry={themeRadiusmd}
            width={`calc(25% - 15px)`}
            height={sheightLg}
        />
        <rect
            x={`calc(50% + 10px)`}
            y="0"
            rx={themeRadiusmd}
            ry={themeRadiusmd}
            width={`calc(25% - 15px)`}
            height={sheightLg}
        />
        <rect
            x={`calc(75% + 15px)`}
            y="0"
            rx={themeRadiusmd}
            ry={themeRadiusmd}
            width={`calc(25% - 15px)`}
            height={sheightLg}
        />
    </ContentLoader>
);

class SkeletonCampaignGallery extends Component {
    state = {
        rowCount: 8,
        message: 'No data available',
    };
    componentDidMount = () => {
        this.setState({ rowCount: this.props?.count || 1 });
        this.setState({ message: this.props?.message || this.state.message });
    };

    render() {
        return (
            <div className="no-data-container">
                {this.props?.isError ? (
                    <div className="nodata-bar">
                        {this.props.children ? (
                            this.props.children
                        ) : (
                            <>
                                <i className={`${alert_medium} icon-md color-primary-orange mr5`}></i>
                                <p>{this.state.message}</p>
                            </>
                        )}
                    </div>
                ) : null}
                {Array(this.state.rowCount)
                    .fill(0)
                    .map((item) => {
                        return (
                            <>
                                <GridView /> <br />
                            </>
                        );
                    })}
            </div>
        );
    }
}

export default SkeletonCampaignGallery;
