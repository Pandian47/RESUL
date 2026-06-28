import { ACTION_TYPE, COMPLIANCE_KEYWORDS, COMPLIANCE_KEYWORDS_TOOLTIP, KEYWORD, NO_COMPLIANCE_KEYWORDS, RESPONSE_MESSAGE } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import RSTooltip from 'Components/RSTooltip';
import KendoGrid from 'Components/RSKendoGrid';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell';
import { getSessionId } from 'Reducers/globalState/selector';
import { getDefaultSMSKeyword } from 'Reducers/preferences/CommunicationSettings/request';
const ComplianceKeywords = ({ clientSmsSenderID = null, isCreate = false }) => {
    const dispatch = useDispatch();
    const { clientId, departmentId, userId } = useSelector((state) => getSessionId(state));
    const gridData = useSelector((state) => state.communicationSettingsReducer.complianceKeywordsList);
    const isLoading = useSelector((state) => state.communicationSettingsReducer.complianceKeywordsLoading);

    useEffect(() => {
        if (isCreate) return;
        const fetchKeywords = async () => {
            await dispatch(
                getDefaultSMSKeyword({ clientId, departmentId, userId, ClientSmsSenderID: clientSmsSenderID })
            );
        };
        fetchKeywords();
    }, [clientSmsSenderID]);

    return (
        <>
            <div className="rs-sub-heading mt15">
                <div className="align-items-center d-flex">
                    <h4 className="mb0">{COMPLIANCE_KEYWORDS}</h4>
                    <RSTooltip text={COMPLIANCE_KEYWORDS_TOOLTIP} position="top">
                        <i
                            className={`${circle_question_mark_mini} icon-xs color-primary-blue ml5 position-relative`}
                            id="rs_compliance_keywords_info"
                        />
                    </RSTooltip>
                </div>
            </div>

            <KendoGrid
                data={gridData}
                isLoading={isLoading}
                noBoxShadow
                isFailure={!gridData?.length}
                settings={{ total: gridData?.length }}
                isCustomBox
                noDataText={NO_COMPLIANCE_KEYWORDS}
                column={[
                    {
                        field: 'keyName',
                        title: KEYWORD,
                        width: 120,
                        cell: ({ dataItem }) => (
                            <td>
                                <span>{dataItem?.keyName}</span>
                            </td>
                        ),
                    },
                    {
                        field: 'keyValue',
                        title: ACTION_TYPE,
                        width: 120,
                        cell: ({ dataItem }) => (
                            <td>
                                <span>{dataItem?.keyValue}</span>
                            </td>
                        ),
                    },
                    {
                        field: 'message',
                        title: RESPONSE_MESSAGE,
                        cell: ({ dataItem }) => (
                            <TruncatedCell value={dataItem?.message} />
                        ),
                    },
                ]}
            />
        </>
    );
};

export default ComplianceKeywords;
