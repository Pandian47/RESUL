import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import { AVERAGE_INBOX_SCORE, INBOX_SCORE, INBOX_SCORE_BREAKDOWN, NO_DATA_AVAILABEL, PROJECTED_CTR, SPAM_SCORE, SUBJECT_LINE_LENGTH, TOP3_SUBJECT_LINES } from 'Constants/GlobalConstant/Placeholders';
import { useEffect } from 'react';
import { Container } from 'react-bootstrap';
import _get from 'lodash/get';
import { useDispatch, useSelector } from 'react-redux';
import RSHighchartsContainer from 'Components/Highcharts';
import RSModal from 'Components/RSModal';
import { ctrColor, percentageChartOptions, subjectColor } from './constant';
import useQueryParams from 'Hooks/useQueryParams';
import { getCheckSpam } from 'Reducers/communication/createCommunication/Create/request';
import { getSessionId } from 'Reducers/globalState/selector';
import { emailList } from 'Reducers/communication/createCommunication/Create/selectors';
import { useFormContext } from 'react-hook-form';
import { spamscoreImg } from 'Assets/Images';
const SpamScoreModal = ({
    show,
    content,
    edmContent,
    emailFooter,
    currentTab,
    handleClose,
    subjectLine,
    inboxLinePreview,
    isSplit,
    fieldName,
    isSpam = false
}) => {
    const dispatch = useDispatch();
    const spamScoreName = isSplit ? `${fieldName}.spamScore` : 'spamScore';
    const top3Name = isSplit ? `${fieldName}.top3` : 'top3';
    const location = useQueryParams('/communication');
    const { setValue } = useFormContext();
    const { clientId, userId, departmentId } = useSelector((state) => getSessionId(state));
    const { checkSpam, top3Spam } = useSelector((state) => emailList(state));
    // console.log('emailFooter: ', emailFooter);
    const campaign = {
        campaignId: _get(location, 'campaignId', 0),
        campaignProductType: _get(location, 'productType', ''),
        campaignCommunicationType: _get(location, 'communicationType', ''),
    };

    // console.log('check spam::: ', checkSpam);

    useEffect(() => {
        if (show) {
            dispatch(
                getCheckSpam({
                    loading: false,
                    payload: {
                        userId,
                        clientId,
                        departmentId,
                        campaignId: campaign?.campaignId,
                        body: edmContent,
                        body1: content, //Text editor content
                        emailFooterRawcode: emailFooter,
                        preHeaderMessage: inboxLinePreview,
                        subjectLine,
                        spamScore: spamScoreName,
                        top3: top3Name,
                        setValue,
                    },
                }),
            );
        }
    }, [show]);

    return (
        <RSModal
            show={show}
            handleClose={handleClose}
            size="lg"
            header={SPAM_SCORE}
            body={
                <Container>
                    {subjectLine && <h3 className="mb21 text-break">{subjectLine}</h3>}
                    <div className="sla-modal-content d-none">
                        <div className="slamc-block slamcb-left">
                            <span className="slamcb-heading">{PROJECTED_CTR}</span>
                            <div className="profileCompleteChart">
                                <RSHighchartsContainer
                                    options={percentageChartOptions(15, ctrColor)}
                                    // className="sla-chart"
                                />
                            </div>
                        </div>
                        <div className="slamc-block slamcb-right">
                            <span className="slamcb-heading">{SUBJECT_LINE_LENGTH}</span>
                            <div className="profileCompleteChart">
                                <RSHighchartsContainer
                                    options={percentageChartOptions(
                                        checkSpam?.[spamScoreName]?.spamScore * 10,
                                        subjectColor,
                                    )}
                                    // className="sla-chart"
                                />
                            </div>
                        </div>
                    </div>

                    {checkSpam?.[spamScoreName]?.spamScore ? (
                        <>
                            <div className="text-center">
                                <p>{AVERAGE_INBOX_SCORE}</p>
                                <h1 className="fs66 font-semi-bold">
                                    {checkSpam?.[spamScoreName]?.spamScore * 10}
                                    <span className="fs25 color-secondary-black position-relative bottom2">%</span>
                                </h1>
                            </div>
                            <div className="sla-modal-content-2 form-group pt50">
                                <div className="position-relative">
                                    <img src={spamscoreImg} />
                                    <div
                                        className="spam-scale-handle"
                                        style={{ left: checkSpam?.[spamScoreName]?.spamScore * 10 + 4 + '%' }}
                                    >
                                        <div className="slamc-label-holder">
                                            <span
                                                className="slamcb-heading"
                                                // style={{ left: checkSpam?.[spamScoreName]?.spamScore * 10 + '%' }}
                                            >
                                                {INBOX_SCORE}
                                            </span>
                                        </div>
                                        {/* {checkSpam?.[spamScoreName]?.spamScore * 10}
                                        <span className="font-xxs position-relative top1">%</span> */}
                                    </div>
                                    <div className="ssh-left-number top25">
                                        0<span className="font-xxs">%</span>
                                    </div>
                                    <div className="ssh-right-number top25">
                                        100<span className="font-xxs">%</span>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center">{NO_DATA_AVAILABEL}</div>
                    )}

                    <div className="sla-modal-content-items">
                        <div className="slamci-wrapper">
                            <div className="slamciw-block slamciw-left">
                                {true? (
                                    <h3 className="slamci-heading">{INBOX_SCORE_BREAKDOWN}</h3>
                                ) : (
                                    <h3 className="slamci-heading">{TOP3_SUBJECT_LINES}</h3>
                                )}
                            </div>
                            {checkSpam?.[top3Name]?.length !== 0 && (
                                <div className="slamciw-block slamciw-right">
                                    <h3 className="slamci-heading">
                                        CTR
                                        {/* <span className="font-xsm">%</span> */}
                                    </h3>
                                </div>
                            )}
                        </div>

                        {checkSpam?.[top3Name]?.length !== 0 ? (
                            checkSpam?.[top3Name]?.map((subject, idx) => {
                                const rawScore =
                                subject?.spamScore !== null &&
                                subject?.spamScore !== undefined &&
                                subject?.spamScore !== ''
                                    ? subject?.spamScore
                                    : subject?.pts;
                                const score = Number(rawScore);
                                const finalValue = !isNaN(score) ? score * 10 : 0;
                                return (
                                <div className="slamci-wrapper" key={idx}>
                                    <div className="slamciw-block slamciw-left">{subject?.description}</div>
                                    <div className="slamciw-block slamciw-right divider">
                                    {finalValue}
                                    {/* <span className="percentage">%</span> */}
                                    <small className='color-primary-black fs15 position-relative top1'>%</small>
                                    </div>
                                </div>
                                );
                            })
                            )  : (
                            <div className="mt20 slamci-wrapper-nodata">
                                <HorizontalSkeleton isError count={3} />
                            </div>
                        )}
                    </div>
                </Container>
            }
            footer={false}
        />
    );
};

export default SpamScoreModal;
