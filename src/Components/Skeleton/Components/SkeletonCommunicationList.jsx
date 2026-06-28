import { scolor1, scolor2 } from './constants';
import ContentLoader from 'react-content-loader';
import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

const CommunicationCardSkeleton = ({isLoading = false}) => (
    <ContentLoader
        className="mb22 ml0 bg-white box-design p0"
        style={{ width: '100%' }}
        viewBox="0 0 1620 130"
        backgroundColor={scolor1}
        foregroundColor={scolor2}
        height={104}
        animate={isLoading}
        speed={isLoading ? 2 : 0}
        title={isLoading ? "Loading..." : ""}
    >
        {/* Left accent bar - positioned at very left edge */}
        <rect x="2" y="0" width="7" height="130" rx="3.5" ry="3.5" />
        
        {/* First content block - ID tag and 2 text lines */}
            <rect x="27" y="38" width="86" height="21" rx="8" ry="8" />
            <rect x="27" y="72" width="500" height="21" rx="2" ry="2" />
            <rect x="125" y="38" width="254" height="21" rx="2" ry="2" />
        
        <rect x="805" y="30" width="2" height="75" rx="0" ry="0" />
        {/* Second content block - 2 text lines - centered */}
        <rect x="833" y="38" width="150" height="21" rx="2" ry="2" />
        <rect x="833" y="72" width="100" height="21" rx="2" ry="2" />
        
        {/* Third content block - 2 text lines - centered */}
        <rect x="1093" y="38" width="160" height="21" rx="2" ry="2" />
        <rect x="1093" y="72" width="120" height="21" rx="2" ry="2" />
        
        {/* Far right content block - status badge, 4 icons, and button */}
        <rect x="1405" y="2" width="212" height="37" rx="10" ry="10" />
        <rect x="1405" y="70" width="2" height="30" rx="0" ry="0" />
        
        {/* Circle placeholders for action icons */}
        <circle cx="1434.5" cy="85.5" r="13" />
        <circle cx="1484.5" cy="85.5" r="13" />
        <circle cx="1536.5" cy="85.5" r="13" />
        <circle cx="1586.5" cy="85.5" r="13" />
        
        {/* Bottom plus button skeleton */}
        {/* <rect x="1590" y="95" width="30" height="30" rx="15" ry="15" fill={scolor1} />
        <rect x="1602" y="105" width="6" height="10" rx="3" ry="3" fill={scolor2} />
        <rect x="1595" y="108" width="10" height="6" rx="3" ry="3" fill={scolor2} /> */}
    </ContentLoader>
);

export const SkeletonCommunicationList = ({ isError, children, count = 5, isLoading= false }) => {
    const skeletonCards = Array.from({ length: count }, (_, index) => (
        <CommunicationCardSkeleton key={index} isLoading = {isLoading} />
    ));

    if (isError) {
        return (
            <div className="skeleton-communication-list" style={{ position: 'relative' }}>
                {skeletonCards}
                
                <div>
                    {children || <NoDataAvailableRender />}
                </div>
            </div>
        );
    }

    return (
        <div className="skeleton-communication-list">
            {skeletonCards}
        </div>
    );
}; 