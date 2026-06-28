import { Fragment } from 'react';
import _map from 'lodash/map';
import ContentLoader from 'react-content-loader';
import { getContentLoaderColors } from '../Constant';

const TagBar = ({ stopAnimation, animation, viewBox, barWidth }) => {
    const isAnimated = !stopAnimation && animation;

    return (
        <ContentLoader
            viewBox={viewBox}
            height={34}
            className="skeleton"
            animate={isAnimated}
            {...getContentLoaderColors(isAnimated)}
        >
            <rect x="0" y="0" rx="0" ry="0" width={barWidth} height="25" />
        </ContentLoader>
    );
};

export const AttributeTag = ({ stopAnimation = false, animation = true }) => (
    <>
        <TagBar stopAnimation={stopAnimation} animation={animation} viewBox="0 0 80 34" barWidth="70" />
        <TagBar stopAnimation={stopAnimation} animation={animation} viewBox="0 0 150 34" barWidth="140" />
        <TagBar stopAnimation={stopAnimation} animation={animation} viewBox="0 0 90 34" barWidth="80" />
        <TagBar stopAnimation={stopAnimation} animation={animation} viewBox="0 0 60 34" barWidth="50" />
        <TagBar stopAnimation={stopAnimation} animation={animation} viewBox="0 0 50 34" barWidth="40" />
    </>
);

const config = {
    attribute: [
        {
            content: {
                viewBox: '0 0 80 34',
                height: 34,
            },
            rect: {
                width: '70',
                height: '25',
            },
        },
        {
            content: {
                viewBox: '0 0 150 34',
                height: 34,
            },
            rect: {
                width: '140',
                height: '25',
            },
        },
    ],
    listing: [],
};
export const Skeleton = (config) => (
    <Fragment>
        {_map(config, ({ content, rect }) => (
            <ContentLoader {...content}>
                <rect x="0" y="0" rx="0" ry="0" {...rect} />
            </ContentLoader>
        ))}
    </Fragment>
);
