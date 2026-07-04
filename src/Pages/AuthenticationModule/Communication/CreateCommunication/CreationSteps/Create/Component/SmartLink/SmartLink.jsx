import { getChannelId } from 'Utils/modules/communicationChannels';
import { circle_plus_fill_medium, editor_smart_link_medium } from 'Constants/GlobalConstant/Glyphicons';
import { get as _get } from 'Utils/modules/lodashReplacements';
import { useDispatch, useSelector } from 'react-redux';
import { MAX_SMART_LINKS, SMARTLINK_BOOTSTRAP_DROPDOWN_DEFAULT_ID } from 'Constants/GlobalConstant/InputLimit';

import RSBootstrapdown from 'Components/FormFields/RSBootstrapdown';

import { getSmartLinksListWithLabels } from 'Reducers/communication/createCommunication/smartlink/selectors';
import useQueryParams from 'Hooks/useQueryParams';
import { getSessionId } from 'Reducers/globalState/selector';
import { getSmartUrlDetailByChannel } from 'Reducers/communication/createCommunication/smartlink/request';

import { useFormContext } from 'react-hook-form';
import RSTooltip from 'Components/RSTooltip';
import { updateSmartLinkModalState, updateSmartLinkAutoAdd } from 'Reducers/communication/createCommunication/Create/reducer';
import useApiLoader from 'Hooks/useApiLoader';
import { AUTHORING_FIELD_LOADER_CONFIG } from 'Components/Skeleton/pages/communication/authoring';

const SmartLink = (props) => {
    const { view, alignRight: alignRightProp = false } = props;
    // console.log('props: ', props);
    const { watch } = useFormContext();
    const dispatch = useDispatch();
    const {
        verticalTab: { type: channelType },
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const location = useQueryParams('/communication');
    const { parentClientId, ...payload } = useSelector((state) => getSessionId(state));
    const smartLinks = useSelector((state) => getSmartLinksListWithLabels(state));
    const smartLinkInsertLoader = useApiLoader();

    const campaign = {
        campaignId: _get(location, 'campaignId', 0),
        campaignType: _get(location, 'campaignType', 'S'),
    };

    const splitObj = {
        0: 'A',
        1: 'B',
        2: 'C',
        3: 'D',
        4: 'E',
    };
    const [splitTest, currentSplitTab] = watch(['splitTest', 'currentSplitTab']);

    const handleOpenWithAdd = (e) => {
        e.preventDefault();
        e.stopPropagation();
        if (smartLinks.length > 0) {
            dispatch(updateSmartLinkAutoAdd(true));
        }
        dispatch(updateSmartLinkModalState(true));
    };

    return (
        <RSBootstrapdown
            alignRight={alignRightProp}
            data={smartLinks}
            flatIcon
            defaultItem={{
                id: SMARTLINK_BOOTSTRAP_DROPDOWN_DEFAULT_ID,
                menuLabel: (
                    <RSTooltip text="Smart link" className="lh0" trigger={['hover', 'focus']}>
                        <i className={`${editor_smart_link_medium} icon-md `} />{' '}
                    </RSTooltip>
                ),
            }}
            showUpdate={false}
            name="smartlink"
            isObject
            idKey="id"
            fieldKey="menuLabel"
            className={`no_caret ${props?.customClass ?? props?.customClass}`}
            isLoading={smartLinkInsertLoader.isLoading}
            popupSettings={{
                popupClass: `addImportSmartLinkDropdownListContainer`,
            }}
            footer={
                smartLinks.length < MAX_SMART_LINKS ? (
                    <div
                        className="dropdown-footer-item"
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                        onClick={handleOpenWithAdd}
                    >
                        <span>Add Smart Link</span>
                        <i className={`${circle_plus_fill_medium} icon-md color-primary-blue`} />
                    </div>
                ) : null
            }
            onSelect={async (e) => {
                const mdcContentSetupDetails = _get(location, 'mdcContentSetupDetails', {});
                const { value } = e;
                let goalValue = 0,
                    blastValue = 1,
                    parentClientValue = 0,
                    actionValue = 0,
                    channelName = '';

                goalValue = e?.goalNo ?? 0;

                if (campaign?.campaignType === 'S') {
                    blastValue = 1;
                    parentClientValue = 0;
                    actionValue = 1;
                } else if (campaign?.campaignType === 'T') {
                    blastValue = 1;
                    parentClientValue = 0;
                    actionValue = 1;
                } else {
                    // console.log(location);
                    blastValue = _get(mdcContentSetupDetails, 'levelNumber', 0);
                    parentClientValue = _get(mdcContentSetupDetails, 'parentChannelDetailId', 0);
                    actionValue = _get(mdcContentSetupDetails, 'actionId', 0);
                    channelName = _get(mdcContentSetupDetails, 'name', '');
                    channelName = channelName.toLowerCase();
                }
                const channelId =
                    campaign?.campaignType === 'M' ? getChannelId(channelName)?.id : getChannelId(channelType)?.id;
                const channelPayload = {
                    ...payload,
                    campaignId: campaign?.campaignId,
                    blastType: splitTest ? splitObj[currentSplitTab] : '',
                    channelId,
                    goalNo: goalValue,
                    blastNo: blastValue,
                    parentChannelDetailId: parentClientValue,
                    actionId: actionValue,
                    senderId: '',
                    subSegmentId: _get(mdcContentSetupDetails, 'subSegmentId', 0),
                };
                props?.onLoadingChange?.(true);
                const { status, data } =
                    (await smartLinkInsertLoader.refetch({
                        fetcher: ({ payload: smartPayload } = {}) =>
                            dispatch(getSmartUrlDetailByChannel({ payload: smartPayload, loading: false })),
                        mode: 'create',
                        loaderConfig: AUTHORING_FIELD_LOADER_CONFIG,
                        params: { payload: channelPayload },
                    })) || {};
                props?.onLoadingChange?.(false);
                var smartLinkText = '';
                if (status) {
                    smartLinkText = `${data?.urlName || ''}${data?.smartCode || ''}${data?.blastSC || ''}`;
                }
                if (!!smartLinkText) {
                    const state = view.state;
                    const tr = state.tr;
                    const markType = state.schema.marks.style;
                    const mark = markType.create({ class: 'personalize' });
                    const markTypelink = state.schema.marks.link;
                    const content = state.schema.text(smartLinkText);
                    const marklink = markTypelink.create({ class: 'smartlinkAhref', href: smartLinkText });
                    tr.addStoredMark(marklink);
                    // tr.addStoredMark(mark);
                    tr.replaceSelectionWith(content, true);
                    view.dispatch(tr);
                    view.focus();
                }
            }}
        />
    );
};

export default SmartLink;
