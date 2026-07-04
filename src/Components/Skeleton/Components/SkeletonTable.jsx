import { scolor1, scolor2, sheight, sheightSpace, themeRadius, themeSizeSm } from './constants';
import { alert_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Component, Fragment } from 'react';
import ContentLoader from 'react-content-loader';
const GridHead = ({ height, width }) => (
    <ContentLoader
        style={{ width: '100%' }}
        viewBox="0 0 1000 70"
        backgroundColor={scolor1}
        foregroundColor={scolor2}
        height={height + themeSizeSm || sheight + sheightSpace}
    >
        <rect
            x="0"
            y="0"
            rx={themeRadius}
            ry={themeRadius}
            width={width || '100%'}
            height={height || sheight}
        />
    </ContentLoader>
);
// const GridView = () => (
//   <ContentLoader
//     style={{ width: '100%' }}
//     viewBox="0 0 100% 70"
//     height={40}
//   >
//     <rect x="0" y="0" rx="2" ry="2" width="100%" height="25" />
//   </ContentLoader>
// )
// const GridViewPage = () => (
//   <ContentLoader
//     style={{ width: '100%' }}
//     viewBox="0 0 100% 70"
//     height={40}
//   >
//     <rect x="0" y="0" rx="2" ry="2" width="18%" height="25" />
//     <rect x="90%" y="0" rx="2" ry="2" width="12%" height="25" />
//   </ContentLoader>
// )

class SkeletonTable extends Component {
    state = {
        rowCount: 8,
        message: 'No data available',
    };

    componentDidMount = () => {
        this.setState({ rowCount: this.props?.count || 8 });
        this.setState({ message: this.props?.message || this.state.message });
    };

    render() {
        return (
            <div className="no-data-container">
                {this.props?.isError ? (
                    this.props.children ? (
                        this.props.children
                    ) : (
                        <div className="nodata-bar">
                            <i className={`${alert_medium} icon-md color-primary-orange mr5`}></i>
                            <p>{this.state.message}</p>
                        </div>
                    )
                ) : null}

                {Array(this.state.rowCount)
                    .fill(0)
                    .map((_, index) => {
                        // console.log("green");
                        return (
                            <Fragment key={index}>
                                <GridHead width={this.props.width} height={this.props.height} /> <br />
                            </Fragment>
                        );
                    })}

                {/* <GridHead /> <br />
        <GridView /> <br />
        <GridView /> <br />
        <GridView /> <br />
        <GridView /> <br />
        <GridView /> <br />
        <GridView /> <br />
        <GridView /> */}
                {/* <br /> */}
                {/* <GridViewPage /> */}
            </div>
        );
    }
}

export default SkeletonTable;
