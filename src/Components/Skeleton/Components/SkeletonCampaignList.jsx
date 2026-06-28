import { scolor1, scolor2, sheightMd, themeRadius, themeRadiusmd, themeSizeSm } from './constants';
import { memo } from 'react';
import ContentLoader from 'react-content-loader';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

const GridView = memo((props) => (
    <ContentLoader
        className={`mb${themeSizeSm}`}
        style={{ width: '100%' }}
        viewBox={`0 0 100% ${sheightMd}`}
        backgroundColor={scolor1}
        foregroundColor={scolor2}
        height={sheightMd}
    >
        {/* <circle x="0" y="0" cx="30" cy="30" r="20" width="20" height="20" /> */}
        {/* Only SVG shapes */}
        {/* <rect x="0" y="0" rx="5" ry="5" width="70" height="70" /> */}

        <rect
            x="0"
            y="0"
            rx={themeRadiusmd}
            ry={themeRadiusmd}
            width="100%"
            height={sheightMd}
        />

        {/* <rect x="0" y="0" rx={themeRadius} ry={themeRadius} width="30%" height={sheightMd} />
    <rect x="30%" y="0" rx={themeRadius} ry={themeRadius} width="20%" height={sheightMd} />
    <rect x="50%" y="0" rx={themeRadius} ry={themeRadius} width="25%" height={sheightMd} />
    <rect x="75%" y="0" rx={themeRadius} ry={themeRadius} width="10%" height={sheightMd} /> */}
        {/* <rect x="85%" y="0" rx={themeRadius} ry={themeRadius} width="15%" height={sheightMd} /> */}
    </ContentLoader>
));
const GridViewPage = memo((props) => (
    <ContentLoader
        style={{ width: '100%' }}
        viewBox={`0 0 100% ${sheightMd}`}
        backgroundColor={scolor1}
        foregroundColor={scolor2}
        height={40}
    >
        <rect x="0" y="17" rx={themeRadius} ry={themeRadius} width="18%" height="25" />
        <rect x="90%" y="17" rx={themeRadius} ry={themeRadius} width="12%" height="25" />
    </ContentLoader>
));

export const SkeletonCampaignList = memo((props) => {
    return (
        <div className="no-data-container">
            {props.isError ? props.children ? props.children : <NoDataAvailableRender /> : null}
            <GridView /> <br />
            <GridView /> <br />
            <GridView /> <br />
            <GridView />
            {/* <br /> */}
            {/* <GridViewPage /> */}
        </div>
    );
});

{
    /* <rect x="0" y="17" rx={themeRadius} ry={themeRadius} width="29%" height="70" />
    <rect x="30%" y="17" rx={themeRadius} ry={themeRadius} width="19%" height="70" />
    <rect x="50%" y="17" rx={themeRadius} ry={themeRadius} width="24%" height="70" />
    <rect x="75%" y="17" rx={themeRadius} ry={themeRadius} width="9%" height="70" />
    <rect x="85%" y="17" rx={themeRadius} ry={themeRadius} width="15%" height="70" /> */
}
