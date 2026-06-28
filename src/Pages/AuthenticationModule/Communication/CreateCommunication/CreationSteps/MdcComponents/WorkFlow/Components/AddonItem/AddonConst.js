import {eachDeep} from 'deepdash-es/standalone';

export const buildAllOrAnyPayload = ({ currentWindowId, canvasState, payload })=>{
    const MDCTemplate = canvasState;
    const currentSwitchId = currentWindowId;
    let channelDetails = [], levelId = '';
    if (MDCTemplate['Campaign']['CanvasChannel'].hasOwnProperty('IsChannelSwitched') && MDCTemplate['Campaign']['CanvasChannel']['IsChannelSwitched']) {
        const { Campaign: { CanvasChannel: { switchCond: { DomId } } } } = MDCTemplate;

        if (DomId == currentSwitchId) {
            MDCTemplate['Campaign']['CanvasChannel']['activeChannel'].forEach(item => {
                if (item['ContentThumbnailPath'] != '' && item['ContentThumbnailPath'] != null && item['ContentThumbnailPath'] != 'undefined') {
                    const { ChannelDetailType:channelDetailType, ChannelDetailID:channelDetailId } = item;
                    channelDetails = [...channelDetails, { channelDetailType, channelDetailId }];
                    levelId = 1;
                }
            })
        } else {
            eachDeep(MDCTemplate['Campaign']['CanvasChannel']['activeChannel'], (value, key, parent) => {
                if (value.hasOwnProperty('IsChannelSwitched') && value.hasOwnProperty('switchCond') && value['switchCond'].hasOwnProperty('DomId') && value['switchCond']['DomId'] == currentSwitchId) {
                    if (value['ContentThumbnailPath'] != '' && value['ContentThumbnailPath'] != null && value['ContentThumbnailPath'] != 'undefined') {
                        const { ChannelDetailType:channelDetailType, ChannelDetailID:channelDetailId } = value;
                        channelDetails = [...channelDetails, { channelDetailType, channelDetailId }];
                        levelId = value['LevelNumber'];
                    }
                }
            }, { childrenPath: 'activeChannel' });
        }
    } else {
        eachDeep(MDCTemplate['Campaign']['CanvasChannel']['activeChannel'], (value, key, parent) => {
            if (value.hasOwnProperty('IsChannelSwitched') && value.hasOwnProperty('switchCond') && value['switchCond'].hasOwnProperty('DomId') && value['switchCond']['DomId'] == currentSwitchId) {
                if (value['ContentThumbnailPath'] != '' && value['ContentThumbnailPath'] != null && value['ContentThumbnailPath'] != 'undefined') {
                    const {ChannelDetailType:channelDetailType, ChannelDetailID:channelDetailId } = value;
                    channelDetails = [...channelDetails, { channelDetailType, channelDetailId}];
                    levelId = value['LevelNumber'];
                }
            }
        }, { childrenPath: 'activeChannel' });
    } 
         
    return    {...payload,levelId,channels:channelDetails};
                              
}