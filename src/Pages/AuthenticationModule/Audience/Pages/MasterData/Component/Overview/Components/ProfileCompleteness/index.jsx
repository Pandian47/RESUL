import { useEffect, useRef, useState } from 'react';
import { AUDIENCE_CHART_COLORS } from 'Pages/AuthenticationModule/Audience/audienceChartColors';
import { CREATE_PERSONA, MDM_OVERALL_PROFILE_COMPLETENESS_INFO, PRIMARY_ATTRIBUTES, RECOMMENDED } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_mini, custom_attributes_large, popup_close_circle_fill_medium, popup_close_circle_medium } from 'Constants/GlobalConstant/Glyphicons';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import RSHighchartsContainer from 'Components/Highcharts';
import RSIcon from 'Components/RSIcon';
import RSModal from 'Components/RSModal';
import { profileCompleteChart, Progressbar } from '../../../ChartOptions/profileCompleteChart';
import { selectProfileIcon } from './constant';
import { RSPrimaryButton } from 'Components/Buttons';
import { HorizontalSkeleton } from 'Components/Skeleton/Skeleton';
import RSTooltip from 'Components/RSTooltip';

import { ensureArray, ensureObject, sanitizeMdmMetric } from 'Pages/AuthenticationModule/Audience/audienceDefaults';

const ProfileCompleteness = ({ show=false, handleClose=()=>{}, chartData={}, recommendationJson = {} }) => {
    const data = ensureObject(chartData?.profileCompletenessAttributeswithValues);
    const sortableData = Object.fromEntries(
        Object.entries(data).sort((a, b) => sanitizeMdmMetric(b[1]) - sanitizeMdmMetric(a[1])),
    );
    const recommendations = ensureArray(chartData?.recommendationsSummaryJson);
    const navigate = useNavigate();
    const { t: translation } = useTranslation();

    return (
        <RSModal
            show={Boolean(show)}
            size="xxlg"
            handleClose={() => handleClose(false)}
            header={
                <div className="d-flex align-items-center gap-2">
                    <span>{translation('Overall profile completeness')}</span>
                    <RSTooltip text={MDM_OVERALL_PROFILE_COMPLETENESS_INFO} position="bottom">
                        <i className={`${circle_question_mark_mini} icon-xs color-primary-blue`} />
                    </RSTooltip>
                </div>
            }
            body={
                <div  className={`master-recip-data-popup master-total-card-info `}
>
                    <Row>
                        <Col md={3}>
                            <div className="mt15 profileCompleteChart">
                                <RSHighchartsContainer
                                    options={profileCompleteChart(
                                        sanitizeMdmMetric(chartData?.overAllprofilePercentage),
                                        AUDIENCE_CHART_COLORS.ch_dark_green,
                                    )}
                                />
                            </div>
                        </Col>
                        <Col md={4} className="borderleft">
                            <h4 className="mb0">{PRIMARY_ATTRIBUTES}</h4>
                            <ul className="progressChartContainerCSS css-scrollbar">
                                {Object.keys(sortableData).length !== 0 &&
                                    Object.entries(sortableData).map(([rawKey, value], index) => {
                                        const key = String(rawKey ?? '').split(':')[0];
                                        const icon = selectProfileIcon(key) ?? [custom_attributes_large, AUDIENCE_CHART_COLORS.ch_others];
                                        return (
                                            <li key={key + index}>
                                                <Progressbar
                                                    bgcolor={icon[1]}
                                                    progress={sanitizeMdmMetric(value)}
                                                    height={12}
                                                    icon={<i className={`${icon[0]} icon-lg color-primary-blue d-block`}></i>}
                                                    tooltip={key.split('_').join(' ')}
                                                    isToolTip
                                                />
                                            </li>
                                        );
                                    })}
                            </ul>
                            <div className="text-center">
                                <RSPrimaryButton
                                    onClick={() => {
                                        handleClose(false);
                                        navigate('/preferences/audience-score');
                                    }}
                                    id="rs_ProfileCompleteness_CreatePersona"
                                >
                                    {CREATE_PERSONA}?
                                </RSPrimaryButton>
                            </div>
                        </Col>
                        <Col md={5} className="borderleft">
                            <h4 className="mb0">{RECOMMENDED}</h4>
                            <ul className="source-list css-scrollbar">
                                {recommendationJson?.rationales?.length ? (
                                    recommendationJson?.rationales?.map((item, index) => (
                                        <li key={`${item?.Id}${index}`}>
                                            {item}
                                        </li>
                                    ))
                                ) : (
                                    <HorizontalSkeleton isError={true} />
                                )}
                            </ul>
                        </Col>
                    </Row>
                </div>
            }
        />
    );
};

export default ProfileCompleteness;
