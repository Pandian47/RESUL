import { AttributeTag } from "./Component/AttributeTag";
import { GridHead } from './Component/GridHead';

export const SKELETON_BG = '#e2e7ee';
export const SKELETON_SHIMMER = '#eef2f9';

export const getContentLoaderColors = (animation = true) => ({
    backgroundColor: SKELETON_BG,
    foregroundColor: animation ? SKELETON_SHIMMER : SKELETON_BG,
});

export const skeletonType = (type, stopAnimation = false, animation = true) => {
    switch (type) {
        case 'tag':
            return <AttributeTag stopAnimation={stopAnimation} animation={animation} />
        default:
            return <GridHead animation={animation} stopAnimation={stopAnimation} />;
    }
}