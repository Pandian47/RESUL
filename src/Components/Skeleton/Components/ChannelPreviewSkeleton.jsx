import { scolor1, scolor2 } from './constants';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
const ChannelPreviewSkeleton = () => {
    return (
        <div
            className="listing-preview-scroll listing-preview-skeleton h-262 px0 border-r10"
            style={{
                background: scolor1,
                border: `1px solid ${scolor1}`,
                height: '330px',
                position: 'relative',
                overflow: 'hidden',
            }}
        >
            <Skeleton
                height="100%"
                width="100%"
                borderRadius={8}
                baseColor={scolor1}
                highlightColor={scolor2}
                enableAnimation
                style={{ display: 'block', lineHeight: 'unset' }}
            />
        </div>
    );
};

export default ChannelPreviewSkeleton;
