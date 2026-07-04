import { eachDeep } from 'deepdash-es/standalone';
import { getModule } from '../../constant';

const componentList = [
    { id: '1', channelId: 'ch001', name: 'Email', colorCode: '#fc6a00', component: <></> },
    { id: '41', channelId: 'ch0041', name: 'RCS', colorCode: '#1d9bf0', component: <></> },
    { id: '2', channelId: 'ch002', name: 'SMS', colorCode: '#e5bc38', component: <></> },
    { id: '8', channelId: 'ch008', name: 'Web push', colorCode: '#5ba529', component: <></> },
    { id: '14', channelId: 'ch0014', name: 'Mobile push', colorCode: '#99cc03', component: <></> },
    { id: '25', channelId: 'ch0025', name: 'VMS', colorCode: '#008489', component: <></> },
    { id: '26', channelId: 'ch0026', name: 'Call center', colorCode: '#33b5e6', component: <></> },
    { id: '3', channelId: 'ch003', name: 'QR code', colorCode: '#666666', component: <></> },
    { id: '21', channelId: 'ch0021', name: 'WhatsApp', colorCode: '#00d954', component: <></> },
    { id: '34', channelId: 'ch0034', name: 'Webhooks', colorCode: '#cccccc', component: <></> },
    { id: 'Recipient', channelId: 'Recipient', name: 'Recipient', colorCode: '#2a79c2', component: <></> },
    { id: 'DynamicList', channelId: 'DynamicList', name: 'Dynamic List', colorCode: '#b26aae', component: <>,</> },
    { id: 'LP1', channelId: 'goal001', name: 'Landing Page1', colorCode: '#804097', component: <></> },
    { id: 'LP2', channelId: 'goal002', name: 'Landing Page2', colorCode: '#804097', component: <></> },
    { id: 'AddonItem', channelId: 'AddonItem', name: 'AddonItem', colorCode: '#008288', component: <></> },
];
export const GetMiniMapConfig = (node) => {
    let channelId = node.data?.channelId;

    if (node.type === 'SourceItem') {
        channelId = 'Recipient';
    } else if (node.type === 'DynamicItem') {
        channelId = 'DynamicList';
    } else if (node.type === 'AddonItem') {
        channelId = 'AddonItem';
    }
    const rslt = componentList.filter((item) => item?.channelId === channelId);
    return rslt?.[0]?.['colorCode'] || '#cccccc';
};

export const UniformMiniMapNode = (props) => {
    const { x, y, color } = props;
    const safeX = Number.isFinite(x) ? x : 0;
    const safeY = Number.isFinite(y) ? y : 0;

    return (
        <rect
            x={safeX}
            y={safeY}
            width={70}
            height={70}
            rx={4}
            fill={color || '#cccccc'}
            stroke="transparent"
            strokeWidth={1}
        />
    );
};

export const GetMiniMapComponent = (props) => {
    return <UniformMiniMapNode {...props} />;
};

export const CanvasCollapseExpand = (nodeId, canvasState) => {
        let collapseOrExpandNodeIdList = [];
    const rslt = getModule(canvasState['Campaign']['CanvasChannel']['activeChannel'], nodeId);
    let channelList = [];
    if (rslt?.['value']?.['activeChannel']?.length) {
        channelList = rslt['value']['activeChannel'];
        collapseOrExpandNodeIdList = [...collapseOrExpandNodeIdList, rslt['value']['Action']['DomId']];
    } else if (canvasState['dataSource']['DomId'] === nodeId) {
        channelList = canvasState['Campaign']['CanvasChannel']['activeChannel'];

        if (canvasState['Campaign']['CanvasChannel']['IsChannelSwitched']) {
            let swithId = canvasState['Campaign']['CanvasChannel']['switchCond']['DomId'];
            collapseOrExpandNodeIdList = [...collapseOrExpandNodeIdList, swithId];
        }
    }
    if (canvasState['Campaign']['CanvasChannel']?.['Placeholder']?.length) {
        canvasState['Campaign']['CanvasChannel']['Placeholder'].forEach((item) => {
            if (item.data.parentWindowId === nodeId) {
                collapseOrExpandNodeIdList = [...collapseOrExpandNodeIdList, item.id];
            }
        });
    }

    if (canvasState?.dataSource?.isSubsegmentJoureny && canvasState?.dataSource?.DomId === nodeId) {
        // subsegment  addOnItem nodelist , placeholder nodelist flow
        const addOnItemNodeList = canvasState?.nodeState
            ?.filter((node) => node.type === 'AddonItem' && node.data.subSegmentLevel)
            ?.map((node) => node?.id);
        collapseOrExpandNodeIdList = [...collapseOrExpandNodeIdList, ...addOnItemNodeList];
        const placeholderNodeList = canvasState['Campaign']['CanvasChannel']['Placeholder'];
        if (placeholderNodeList?.length) {
            placeholderNodeList.forEach((item) => {
                const matchPlaceholderList = canvasState?.subSegment?.subSegmentList?.find(
                    (segment) => item.data.parentWindowId === segment.id,
                );
                if (matchPlaceholderList) {
                    collapseOrExpandNodeIdList = [...collapseOrExpandNodeIdList, item.id];
                }
            });
        }
    }

    if (channelList?.length) {
        eachDeep(
            channelList,
            (child, i, parent, ctx) => {
                                if (child.hasOwnProperty('DomId')) {
                    collapseOrExpandNodeIdList = [...collapseOrExpandNodeIdList, child['DomId']];
                }
                if (child['Action'].hasOwnProperty('DomId')) {
                    collapseOrExpandNodeIdList = [...collapseOrExpandNodeIdList, child['Action']['DomId']];
                }
                if (child.hasOwnProperty('addOnEnabled') && child['addOnEnabled']) {
                    collapseOrExpandNodeIdList = [...collapseOrExpandNodeIdList, child['switchCond']['DomId']];
                }
                if (canvasState['Campaign']['CanvasChannel']?.['Placeholder']?.length) {
                    canvasState['Campaign']['CanvasChannel']['Placeholder'].forEach((item) => {
                        if (item.data.parentWindowId === child['DomId']) {
                            collapseOrExpandNodeIdList = [...collapseOrExpandNodeIdList, item.id];
                        }
                    });
                }
            },
            { childrenPath: 'activeChannel' },
        );
    }
        return collapseOrExpandNodeIdList;
};

export const GenerateMiniMapPos = ({ left, top }) => {
    let x, y;

    //X axis position calculation
    if (left && left >= 22 && left % 22 === 0) {
        x = left;
    } else if (left && left >= 22 && left % 22 !== 0) {
        let remainder = left % 22;
                if (remainder >= 11) {
            let adjustVal = 22 - remainder;
            x = left + adjustVal;
        } else if (remainder <= 11) {
            x = left - remainder;
        }
    } else if (left && left < 22) {
        x = 22;
    }

    // //Y axis position calculation
    if (top && top >= 22 && top % 22 === 0) {
        y = top;
    } else if (top && top >= 22 && top % 22 !== 0) {
        let remainder = top % 22;
                if (remainder >= 11) {
            let adjustVal = 22 - remainder;
            y = top + adjustVal;
        } else if (remainder <= 11) {
            y = top - remainder;
        }
    } else if (top && top < 22) {
        y = 22;
    }

    return { x, y };
};

export const ClosestDivisibleBy5 = (number) => {
    // Round the number to the nearest integer
    let roundedNumber = Math.round(number);

    // Find the remainder when divided by 5
    let remainder = roundedNumber % 0.5;
        // Adjust the number to be divisible by 5
    let closestDivisible = roundedNumber - remainder;

    return closestDivisible;
};
