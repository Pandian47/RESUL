import { memo } from 'react';
import PropTypes from 'prop-types';
import { Col, Row } from 'react-bootstrap';

import { communicationAuthoringSkeletonCriticalCss } from './communicationAuthoringSkeletonCriticalCss';
import {
    AUTHORING_CHANNEL_INNER_VARIANT,
    getAuthoringChannelInnerVariant,
} from './authoringChannelEditSkeletonProfiles';
import { getAuthoringVerticalIndexFromChannelId } from './authoringChannelSkeletonConfig';
import { getAuthoringHorizontalSubTabCount } from './authoringSkeletonUtils';

const Shimmer = ({ style = {}, className = '' }) => (
    <span className={`skeleton-shimmer d-block ${className}`.trim()} style={style} aria-hidden="true" />
);

const AuthoringFormRowSkeleton = ({
    labelWidth = '40%',
    twoFields = false,
    stackedField = false,
    align = 'email',
    className = '',
}) => (
    <div className={`form-group authoring-form-row-skeleton ${className}`.trim()}>
        <Row className={stackedField ? 'align-items-start' : 'align-items-center'}>
            {align === 'messaging' ? (
                <Col sm={{ offset: 1, span: 2 }}>
                    <Shimmer className="authoring-form-row-skeleton__label" style={{ width: labelWidth }} />
                </Col>
            ) : align === 'qr' ? (
                <Col sm={4}>
                    <Shimmer className="authoring-form-row-skeleton__label" style={{ width: labelWidth }} />
                </Col>
            ) : align === 'email-create' ? (
                <Col sm={{ offset: 1, span: 2 }}>
                    <Shimmer className="authoring-form-row-skeleton__label" style={{ width: labelWidth }} />
                </Col>
            ) : (
                <Col sm={4} className="text-right">
                    <Shimmer className="authoring-form-row-skeleton__label" style={{ width: labelWidth, marginLeft: 'auto' }} />
                </Col>
            )}
            <Col sm={align === 'messaging' || align === 'email-create' ? 6 : 7}>
                {twoFields ? (
                    <Row className="g-0">
                        <Col md={6} className="pe-2">
                            <Shimmer className="authoring-form-row-skeleton__field" style={{ width: '100%' }} />
                        </Col>
                        <Col md={6} className="ps-2">
                            <Shimmer className="authoring-form-row-skeleton__field" style={{ width: '100%' }} />
                        </Col>
                    </Row>
                ) : stackedField ? (
                    <>
                        <Shimmer className="authoring-form-row-skeleton__field" style={{ width: '100%', marginBottom: 6 }} />
                        <Shimmer className="authoring-form-row-skeleton__field-hint" style={{ width: '50%' }} />
                    </>
                ) : (
                    <Shimmer className="authoring-form-row-skeleton__field" style={{ width: '100%' }} />
                )}
            </Col>
        </Row>
    </div>
);

const MessagingSubFieldSkeleton = () => (
    <Row className="authoring-form-skeleton__messaging-subfield">
        <Col sm={{ offset: 3, span: 6 }}>
            <Shimmer style={{ height: 14, width: 120 }} />
        </Col>
    </Row>
);

const AuthoringFooterSkeleton = () => (
    <div className="authoring-footer-skeleton buttons-holder">
        <Shimmer className="authoring-footer-skeleton__btn" aria-hidden="true" />
        <Shimmer className="authoring-footer-skeleton__btn" aria-hidden="true" />
        <Shimmer className="authoring-footer-skeleton__btn" aria-hidden="true" />
    </div>
);

const LabelRows = ({ rows, align: alignProp = 'email' }) =>
    rows.map(
        (
            {
                labelWidth = '38%',
                twoFields = false,
                stackedField = false,
                className = '',
                align: rowAlign,
            },
            index,
        ) => (
            <AuthoringFormRowSkeleton
                key={`${labelWidth}-${index}`}
                labelWidth={labelWidth}
                twoFields={twoFields}
                stackedField={stackedField}
                align={rowAlign ?? alignProp}
                className={className}
            />
        ),
    );

/** SMS / RCS top fields — Sender, Audience, Split A/B (RCS omits template row via layout). */
const MessagingTopFieldsSkeleton = ({ includeTemplateId = true } = {}) => (
    <>
        <AuthoringFormRowSkeleton align="messaging" labelWidth="72%" className="mt20" />
        <MessagingSubFieldSkeleton />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="72%" stackedField />
        <MessagingSubFieldSkeleton />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="72%" />
        {includeTemplateId && (
            <AuthoringFormRowSkeleton align="messaging" labelWidth="72" className="mt20" />
        )}
    </>
);

/** SMS — Sender ID, Flash, Audience, Split A/B, Template ID. */
const SmsTopFieldsSkeleton = () => <MessagingTopFieldsSkeleton includeTemplateId />;

const SmsPreviewLabelSkeleton = () => (
    <Row className="authoring-form-skeleton__sms-preview-label">
        <Col sm={{ offset: 1, span: 10 }}>
            <Shimmer style={{ width: 72, height: 14 }} />
        </Col>
    </Row>
);

const SmsEditorPreviewBlockSkeleton = () => (
    <div className="form-group authoring-form-skeleton__sms-editor-group mt40 mb0">
        <SmsPreviewLabelSkeleton />
        <Row className="align-items-start authoring-form-skeleton__sms-editor-row">
            <Col sm={{ offset: 1, span: 6 }} className="mb30">
                {/* <div className="authoring-form-skeleton__sms-editor-toolbar">
                    {Array.from({ length: 4 }, (_, index) => (
                        <Shimmer key={`sms-toolbar-${index}`} className="authoring-form-skeleton__sms-toolbar-icon" />
                    ))}
                </div> */}
                <Shimmer className="authoring-form-skeleton__editor authoring-form-skeleton__editor--sms" />
                <Shimmer
                    style={{ width: 140, height: 12, marginTop: 8, marginLeft: 'auto' }}
                    className="authoring-form-skeleton__sms-char-count"
                />
            </Col>
            <Col sm={4} className="pr0">
                <Shimmer className="authoring-form-skeleton__preview authoring-form-skeleton__preview--phone" />
            </Col>
        </Row>
    </div>
);

const SmsScheduleApprovalSkeleton = () => (
    <div className="authoring-form-skeleton__schedule-strip authoring-form-skeleton__sms-bottom-strip">
        <AuthoringFormRowSkeleton align="messaging" labelWidth="52%" />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="70%" stackedField />
    </div>
);

/** RCS — Sender, Audience, Split A/B (page shell). */
const RcsTopFieldsSkeleton = () => (
    <>
        <AuthoringFormRowSkeleton align="messaging" labelWidth="72%" className="mt20" />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="68%" stackedField />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="64%" />
    </>
);

const RcsInteractivitySkeleton = () => (
    <div className="form-group authoring-form-skeleton__rcs-interactivity">
        <Row>
            <Col sm={{ offset: 1, span: 2 }}>
                <Shimmer style={{ height: 13, width: '70%' }} />
            </Col>
            <Col sm={6}>
                <Row className="align-items-start">
                    <Col sm={2} className="pe-none">
                        <Shimmer
                            className="authoring-form-skeleton__rcs-toggle"
                            style={{ width: 44, height: 24, borderRadius: 12 }}
                        />
                    </Col>
                    <Col sm={10}>
                        {[0, 1].map((rowIndex) => (
                            <Row key={`rcs-action-row-${rowIndex}`} className="g-2 mb-2">
                                <Col sm={6}>
                                    <Shimmer style={{ height: 22, width: '100%' }} />
                                </Col>
                                <Col sm={6}>
                                    <Shimmer style={{ height: 22, width: '100%' }} />
                                </Col>
                            </Row>
                        ))}
                    </Col>
                </Row>
            </Col>
        </Row>
    </div>
);

const RcsContentBlockSkeleton = () => (
    <div className="authoring-form-skeleton__rcs-split-content mt40">
        <AuthoringFormRowSkeleton align="messaging" labelWidth="70%" />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="62%" className="mt41 mb10" />
        <Row className="authoring-form-skeleton__rcs-preview-label">
            <Col sm={{ offset: 1, span: 10 }}>
                <Shimmer style={{ width: 72, height: 14, marginBottom: 12 }} />
            </Col>
        </Row>
        <Row className="align-items-start authoring-form-skeleton__rcs-editor-row">
            <Col sm={{ offset: 1, span: 6 }} className="mb30">
                {/* <div className="authoring-form-skeleton__rcs-editor-toolbar">
                    {Array.from({ length: 3 }, (_, index) => (
                        <Shimmer key={`rcs-toolbar-${index}`} className="authoring-form-skeleton__rcs-toolbar-icon" />
                    ))}
                </div> */}
                <Shimmer className="authoring-form-skeleton__editor authoring-form-skeleton__editor--rcs" />
                <Shimmer
                    style={{ width: 120, height: 12, marginTop: 8, marginLeft: 'auto' }}
                    className="authoring-form-skeleton__rcs-char-count"
                />
            </Col>
            <Col sm={4} className="pr0">
                <Shimmer className="authoring-form-skeleton__preview authoring-form-skeleton__preview--phone" />
            </Col>
        </Row>
        <RcsInteractivitySkeleton />
    </div>
);

const RcsScheduleApprovalSkeleton = () => (
    <div className="authoring-form-skeleton__schedule-strip authoring-form-skeleton__rcs-bottom-strip">
        <AuthoringFormRowSkeleton align="messaging" labelWidth="52%" />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="70%" stackedField />
    </div>
);

/** Web push — Send push to, Audience, Delivery type (×2), Split A/B. */
const WebPushTopFieldsSkeleton = () => (
    <>
        <AuthoringFormRowSkeleton align="messaging" labelWidth="72%" className="mt20" />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="68%" stackedField />
        <MessagingSubFieldSkeleton />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="64%" twoFields />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="64%" />
    </>
);

const WebPushContentTabsSkeleton = () => (
    <div className="form-group authoring-form-skeleton__web-push-content-tabs mb0">
        <Row>
            <Col sm={{ offset: 1, span: 10 }}>
                <TabStripSkeleton count={3} size="lg" />
            </Col>
        </Row>
    </div>
);

const WebPushTitleRowSkeleton = () => (
    <AuthoringFormRowSkeleton
        align="messaging"
        labelWidth="62%"
        className="mt41 mb10 authoring-form-skeleton__web-push-title"
    />
);

const WebPushEditorPreviewBlockSkeleton = () => (
    <div className="form-group authoring-form-skeleton__web-push-editor-group mt20 mb0">
        <Row className="authoring-form-skeleton__web-push-preview-label">
            <Col sm={{ offset: 1, span: 10 }}>
                <Shimmer style={{ width: 72, height: 14 }} />
            </Col>
        </Row>
        <Row className="align-items-start authoring-form-skeleton__web-push-editor-row">
            <Col sm={{ offset: 1, span: 6 }} className="mb30">
                <Shimmer className="authoring-form-skeleton__editor authoring-form-skeleton__editor--web-push" />
                <Shimmer
                    style={{ width: 88, height: 12, marginTop: 8, marginLeft: 'auto' }}
                    className="authoring-form-skeleton__web-push-char-count"
                />
            </Col>
            <Col sm={4} className="pr0">
                <Shimmer className="authoring-form-skeleton__preview authoring-form-skeleton__preview--browser" />
            </Col>
        </Row>
    </div>
);

const WebPushInteractivityBlockSkeleton = () => (
    <>
        <RcsInteractivitySkeleton />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="58%" />
    </>
);

const WebPushExpirySkeleton = () => (
    <div className="form-group authoring-form-skeleton__web-push-expiry">
        <Row>
            <Col sm={{ offset: 1, span: 2 }}>
                <Shimmer style={{ height: 13, width: '55%' }} />
            </Col>
            <Col sm={6}>
                <Row className="align-items-center">
                    <Col sm={2}>
                        <Shimmer
                            className="authoring-form-skeleton__web-push-toggle"
                            style={{ width: 44, height: 24, borderRadius: 12 }}
                        />
                    </Col>
                </Row>
            </Col>
        </Row>
    </div>
);

const WebPushHashtagSkeleton = () => (
    <div className="form-group authoring-form-skeleton__web-push-hashtag">
        <Row>
            <Col sm={{ offset: 1, span: 2 }}>
                <Shimmer style={{ height: 13, width: '40%' }} />
            </Col>
            <Col sm={6}>
                <Shimmer className="authoring-form-skeleton__web-push-tags-input" />
                <Shimmer style={{ width: '78%', height: 12, marginTop: 8 }} />
            </Col>
        </Row>
    </div>
);

const WebPushContentBlockSkeleton = () => (
    <div className="authoring-form-skeleton__web-push-split-content mt40">
        <WebPushContentTabsSkeleton />
        <WebPushTitleRowSkeleton />
        <WebPushEditorPreviewBlockSkeleton />
        <WebPushInteractivityBlockSkeleton />
        <WebPushExpirySkeleton />
        <WebPushHashtagSkeleton />
    </div>
);

const WebPushScheduleApprovalSkeleton = () => (
    <div className="authoring-form-skeleton__schedule-strip authoring-form-skeleton__web-push-bottom-strip">
        <AuthoringFormRowSkeleton align="messaging" labelWidth="52%" />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="70%" stackedField />
    </div>
);

/** Mobile push — Mobile app, Audience, Push type (×2), Layout/Position, Split A/B. */
const MobilePushTopFieldsSkeleton = () => (
    <>
        <AuthoringFormRowSkeleton align="messaging" labelWidth="72%" className="mt20" />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="72%" stackedField />
        <MessagingSubFieldSkeleton />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="72%" twoFields />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="72%" />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="72" />
    </>
);

const MobilePushContentTabsSkeleton = () => (
    <div className="form-group authoring-form-skeleton__mobile-push-content-tabs mb0">
        <Row>
            <Col sm={{ offset: 1, span: 10 }}>
                <TabStripSkeleton count={3} size="lg" />
            </Col>
        </Row>
    </div>
);

const MobilePushTitleSubtitleSkeleton = () => (
    <>
        <AuthoringFormRowSkeleton
            align="messaging"
            labelWidth="62%"
            className="mt41 mb10 authoring-form-skeleton__mobile-push-title"
        />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="62%" className="mb10" />
    </>
);

const MobilePushEditorPreviewBlockSkeleton = () => (
    <div className="form-group authoring-form-skeleton__mobile-push-editor-group mt20 mb0">
        <Row className="authoring-form-skeleton__mobile-push-preview-label">
            <Col sm={{ offset: 1, span: 10 }}>
                <Shimmer style={{ width: 72, height: 14 }} />
            </Col>
        </Row>
        <Row className="align-items-start authoring-form-skeleton__mobile-push-editor-row">
            <Col sm={{ offset: 1, span: 6 }} className="mb30">
                <Shimmer className="authoring-form-skeleton__editor authoring-form-skeleton__editor--mobile-push" />
                <Shimmer
                    style={{ width: 100, height: 12, marginTop: 8, marginLeft: 'auto' }}
                    className="authoring-form-skeleton__mobile-push-char-count"
                />
            </Col>
            <Col sm={4} className="pr0">
                <Shimmer className="authoring-form-skeleton__preview authoring-form-skeleton__preview--phone" />
            </Col>
        </Row>
    </div>
);

const MobilePushInteractivityBlockSkeleton = () => (
    <>
        <RcsInteractivitySkeleton />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="58%" />
    </>
);

const MobilePushAlertSoundSkeleton = () => (
    <div className="form-group authoring-form-skeleton__mobile-push-alert-sound">
        <Row>
            <Col sm={{ offset: 1, span: 2 }}>
                <Shimmer style={{ height: 13, width: '60%' }} />
            </Col>
            <Col sm={6}>
                <Row className="align-items-center">
                    <Col sm={2}>
                        <Shimmer
                            className="authoring-form-skeleton__mobile-push-toggle"
                            style={{ width: 44, height: 24, borderRadius: 12 }}
                        />
                    </Col>
                </Row>
            </Col>
        </Row>
    </div>
);

const MobilePushExpirySkeleton = () => (
    <div className="form-group authoring-form-skeleton__mobile-push-expiry">
        <Row>
            <Col sm={{ offset: 1, span: 2 }}>
                <Shimmer style={{ height: 13, width: '55%' }} />
            </Col>
            <Col sm={6}>
                <Row className="align-items-center">
                    <Col sm={2}>
                        <Shimmer
                            className="authoring-form-skeleton__mobile-push-toggle"
                            style={{ width: 44, height: 24, borderRadius: 12 }}
                        />
                    </Col>
                </Row>
            </Col>
        </Row>
    </div>
);

const MobilePushHashtagSkeleton = () => (
    <div className="form-group authoring-form-skeleton__mobile-push-hashtag">
        <Row>
            <Col sm={{ offset: 1, span: 2 }}>
                <Shimmer style={{ height: 13, width: '40%' }} />
            </Col>
            <Col sm={6}>
                <Shimmer className="authoring-form-skeleton__mobile-push-tags-input" />
                <Shimmer style={{ width: '78%', height: 12, marginTop: 8 }} />
            </Col>
        </Row>
    </div>
);

const MobilePushContentBlockSkeleton = () => (
    <div className="authoring-form-skeleton__mobile-push-split-content mt40">
        <MobilePushContentTabsSkeleton />
        <MobilePushTitleSubtitleSkeleton />
        <MobilePushEditorPreviewBlockSkeleton />
        <MobilePushInteractivityBlockSkeleton />
        <MobilePushAlertSoundSkeleton />
        <MobilePushExpirySkeleton />
        <MobilePushHashtagSkeleton />
    </div>
);

const MobilePushScheduleApprovalSkeleton = () => (
    <div className="authoring-form-skeleton__schedule-strip authoring-form-skeleton__mobile-push-bottom-strip">
        <AuthoringFormRowSkeleton align="messaging" labelWidth="52%" />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="70%" stackedField />
    </div>
);

/** Social post — Post name, Post on, post-type cards, editor + feed preview, Schedule. */
const SocialPostTopFieldsSkeleton = () => (
    <>
        <AuthoringFormRowSkeleton align="messaging" labelWidth="72%" className="pt20" />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="68%" />
    </>
);

const SocialPostTypeCardsSkeleton = () => (
    <div className="form-group authoring-form-skeleton__social-post-type-group">
        <Row>
            <Col sm={{ offset: 1, span: 10 }}>
                <div className="authoring-form-skeleton__social-post-type-row">
                    <CardChoiceSkeleton count={3} />
                    <Shimmer
                        className="authoring-form-skeleton__social-post-type-reset"
                        style={{ width: 28, height: 28, borderRadius: '50%', flexShrink: 0 }}
                    />
                </div>
            </Col>
        </Row>
    </div>
);

const SocialPostEditorPreviewBlockSkeleton = () => (
    <div className="form-group authoring-form-skeleton__social-post-editor-group pt15 pb41 mb0">
        <Row className="align-items-start authoring-form-skeleton__social-post-editor-row">
            <Col sm={{ offset: 1, span: 5 }} className="mb30">
                <div className="authoring-form-skeleton__social-post-editor-toolbar">
                    {Array.from({ length: 4 }, (_, index) => (
                        <Shimmer
                            key={`social-toolbar-${index}`}
                            className="authoring-form-skeleton__social-post-toolbar-icon"
                        />
                    ))}
                </div>
                <Shimmer className="authoring-form-skeleton__editor authoring-form-skeleton__editor--social-post" />
                <Shimmer
                    style={{ width: 120, height: 12, marginTop: 8, marginLeft: 'auto' }}
                    className="authoring-form-skeleton__social-post-char-count"
                />
            </Col>
            <Col sm={5} className="pr0">
                <Shimmer className="authoring-form-skeleton__preview authoring-form-skeleton__preview--social" />
            </Col>
        </Row>
    </div>
);

const SocialPostScheduleSkeleton = () => (
    <div className="authoring-form-skeleton__schedule-strip authoring-form-skeleton__social-post-schedule">
        <AuthoringFormRowSkeleton align="messaging" labelWidth="52%" />
    </div>
);

/** Horizontal channel sub-tabs (Email/Direct mail or SMS/WhatsApp/VMS/RCS). */
export const AuthoringChannelSubTabsSkeleton = ({ tabCount = 2, activeIndex = 0 }) => (
    <ul
        className="authoring-form-skeleton__mail-sub-tabs rs-sub-tabs rs-cc-sub-tabs list-unstyled mb0"
        aria-hidden="true"
    >
        {Array.from({ length: tabCount }, (_, index) => (
            <li
                key={`channel-sub-tab-skel-${index}`}
                className={`tabDefault authoring-form-skeleton__mail-sub-tab-item`}
            >
                <Shimmer className="authoring-form-skeleton__mail-sub-tab-icon" />
                <Shimmer isText className="authoring-form-skeleton__mail-sub-tab-label" />
            </li>
        ))}
    </ul>
);

/** WhatsApp — Sender, Audience, Split A/B, Language, Template type, Template name. */
const WhatsappTopFieldsSkeleton = () => (
    <>
        <AuthoringFormRowSkeleton align="messaging" labelWidth="72%" className="mt20" />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="68%" stackedField />
        <MessagingSubFieldSkeleton />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="64%" />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="58%" className="mt20" />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="64%" />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="72%" />
    </>
);

const WhatsappPreviewLabelSkeleton = () => (
    <Row className="authoring-form-skeleton__whatsapp-preview-label">
        <Col sm={{ offset: 1, span: 10 }}>
            <Shimmer style={{ width: 72, height: 14 }} />
        </Col>
    </Row>
);

const WhatsappEditorPreviewBlockSkeleton = () => (
    <div className="form-group authoring-form-skeleton__whatsapp-editor-group mt30">
        <WhatsappPreviewLabelSkeleton />
        <Row>
            <Col sm={{ offset: 1, span: 6 }} className="mb30">
                {/* <div className="authoring-form-skeleton__whatsapp-editor-toolbar">
                    {Array.from({ length: 5 }, (_, index) => (
                        <Shimmer key={`wa-toolbar-${index}`} className="authoring-form-skeleton__whatsapp-toolbar-icon" />
                    ))}
                </div> */}
                <Shimmer className="authoring-form-skeleton__editor authoring-form-skeleton__editor--whatsapp" />
                <Shimmer
                    style={{ width: 88, height: 12, marginTop: 8, marginLeft: 'auto' }}
                    className="authoring-form-skeleton__whatsapp-char-count"
                />
            </Col>
            <Col sm={4} className="pr0">
                <Shimmer className="authoring-form-skeleton__preview authoring-form-skeleton__preview--phone" />
            </Col>
        </Row>
    </div>
);

const WhatsappBottomFieldsSkeleton = () => (
    <>
        <AuthoringFormRowSkeleton align="messaging" labelWidth="52%" />
        <AuthoringFormRowSkeleton align="messaging" labelWidth="70%" stackedField />
    </>
);

const FormShell = ({ variant, children, footerStart = false }) => (
    <div
        className={`authoring-form-skeleton-shell authoring-form-skeleton-shell--${variant}${footerStart ? ' authoring-form-skeleton-shell--footer-start' : ''
            }`}
    >
        <div
            className={`authoring-form-skeleton box-design bd-top-border communication_lable_left authoring-form-skeleton--${variant}`}
        >
            {children}
        </div>
        <AuthoringFooterSkeleton />
    </div>
);

const EditorPreviewRow = ({ preview = 'phone', layout = 'flex' }) => {
    if (layout === 'email') {
        return (
            <div className="form-group authoring-form-skeleton__email-editor-group">
                <Row>
                    <Col sm={7}>
                        <Shimmer className="authoring-form-skeleton__editor authoring-form-skeleton__editor--email" />
                    </Col>
                    <Col sm={5}>
                        <Shimmer className="authoring-form-skeleton__preview authoring-form-skeleton__preview--email-panel" />
                    </Col>
                </Row>
            </div>
        );
    }

    if (layout === 'messaging') {
        return (
            <div className="form-group authoring-form-skeleton__messaging-editor-group">
                <Row>
                    <Col sm={{ offset: 1, span: 6 }} className="mb30">
                        <Shimmer className="authoring-form-skeleton__editor" />
                    </Col>
                    <Col sm={4} className="pr0">
                        <Shimmer
                            className={`authoring-form-skeleton__preview authoring-form-skeleton__preview--${preview}`}
                        />
                    </Col>
                </Row>
            </div>
        );
    }

    return (
        <div className="authoring-form-skeleton__preview-row">
            <Shimmer className="authoring-form-skeleton__editor" />
            <Shimmer className={`authoring-form-skeleton__preview authoring-form-skeleton__preview--${preview}`} />
        </div>
    );
};

const TabStripSkeleton = ({ count = 4, size = 'md' }) => (
    <div className={`authoring-form-skeleton__tab-strip authoring-form-skeleton__tab-strip--${size}`}>
        {Array.from({ length: count }, (_, i) => (
            <Shimmer key={i} className="authoring-form-skeleton__tab-strip-item" />
        ))}
    </div>
);

const CardChoiceSkeleton = ({ count = 3 }) => (
    <div className="authoring-form-skeleton__card-row">
        {Array.from({ length: count }, (_, i) => (
            <Shimmer key={i} className="authoring-form-skeleton__choice-card" />
        ))}
    </div>
);

/** Goal — Engagement + Conversion checkboxes (offset 1 label column). */
const AnalyticsGoalCheckboxesSkeleton = () => (
    <div className="form-group authoring-form-skeleton__analytics-goal">
        <Row className="align-items-center">
            <Col sm={{ offset: 1, span: 2 }}>
                <Shimmer style={{ height: 13, width: '45%' }} />
            </Col>
            <Col sm={2}>
                <div className="authoring-form-skeleton__analytics-goal-option d-flex align-items-center">
                    <Shimmer
                        style={{ width: 16, height: 16, borderRadius: 2, flexShrink: 0 }}
                        className="authoring-form-skeleton__analytics-goal-checkbox"
                    />
                    <Shimmer style={{ width: 72, height: 12, marginLeft: 8 }} />
                </div>
            </Col>
            <Col sm={2}>
                <div className="authoring-form-skeleton__analytics-goal-option d-flex align-items-center">
                    <Shimmer
                        style={{ width: 16, height: 16, borderRadius: 2, flexShrink: 0 }}
                        className="authoring-form-skeleton__analytics-goal-checkbox"
                    />
                    <Shimmer style={{ width: 68, height: 12, marginLeft: 8 }} />
                </div>
            </Col>
        </Row>
    </div>
);

/** Web analytics — domain field indented under platform (offset 3, span 6). */
const WebAnalyticsDomainRowSkeleton = () => (
    <div className="form-group mb0 authoring-form-skeleton__web-analytics-domain">
        <Row>
            <Col sm={{ offset: 3, span: 6 }} className="position-relative pe-4">
                <Shimmer style={{ height: 22, width: '100%' }} />
                <Shimmer
                    className="authoring-form-skeleton__web-analytics-domain-info"
                    style={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        position: 'absolute',
                        right: 0,
                        top: 4,
                    }}
                />
            </Col>
        </Row>
    </div>
);

const QrPreviewPanelSkeleton = () => (
    <div className="authoring-form-skeleton__qr-preview-panel">
        <Shimmer className="authoring-form-skeleton__qr-code" />
        <Shimmer style={{ width: '70%', height: 14, marginTop: 16 }} />
        <Shimmer style={{ width: '100%', height: 28, marginTop: 12 }} />
        <Shimmer style={{ width: '55%', height: 14, marginTop: 20 }} />
    </div>
);

/** Paid ads — Ad type, Ad name (+ action icons), Smart Link box (offset 9 cols). */
const AdsAdNameRowSkeleton = () => (
    <div className="form-group mt20 authoring-form-skeleton__ads-name-row">
        <Row className="align-items-center">
            <Col sm={{ offset: 1, span: 2 }}>
                <Shimmer style={{ height: 13, width: '65%' }} />
            </Col>
            <Col sm={6}>
                <Shimmer style={{ height: 22, width: '100%' }} />
            </Col>
            <Col sm={1} className="pl0">
                <div className="authoring-form-skeleton__ads-name-icons d-flex">
                    <Shimmer style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0 }} />
                    <Shimmer style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, marginLeft: 8 }} />
                </div>
            </Col>
        </Row>
    </div>
);

const AdsTopFieldsSkeleton = () => (
    <>
        <AuthoringFormRowSkeleton align="messaging" labelWidth="72%" className="mt20" />
        <AdsAdNameRowSkeleton />
    </>
);

const AdsSmartLinkBoxSkeleton = () => (
    <Row className="authoring-form-skeleton__ads-smartlink-wrap">
        <Col sm={{ span: 9, offset: 1 }}>
            <div className="authoring-form-skeleton__smartlink-box authoring-form-skeleton__ads-smartlink-box">
                <div className="authoring-form-skeleton__ads-smartlink-heading">
                    <Shimmer style={{ width: 200, height: 16, margin: '0 auto 8px' }} />
                    <Shimmer style={{ width: 300, height: 12, margin: '0 auto 16px' }} />
                </div>
                <Row className="align-items-center authoring-form-skeleton__ads-smartlink-link-row g-0">
                    <Col sm={3}>
                        <Shimmer style={{ height: 14, width: '85%' }} />
                    </Col>
                    <Col sm={7}>
                        <Shimmer style={{ height: 14, width: '100%' }} />
                    </Col>
                    <Col sm={2} className="d-flex justify-content-end">
                        <Shimmer style={{ width: 24, height: 24, borderRadius: 4, flexShrink: 0 }} />
                    </Col>
                </Row>
            </div>
        </Col>
    </Row>
);

const SCHEDULE_ROW_WIDTHS = ['34%', '32%', '36%'];

const ScheduleStripSkeleton = ({ rows = 2, align = 'email' }) => (
    <div className="authoring-form-skeleton__schedule-strip">
        <LabelRows
            align={align}
            rows={Array.from({ length: rows }, (_, i) => ({
                labelWidth: SCHEDULE_ROW_WIDTHS[i % SCHEDULE_ROW_WIDTHS.length],
            }))}
        />
    </div>
);

/** Matches Create → Email.jsx + SplitABTab field order (sender through approval). */
const ROWS_EMAIL_CHANNEL_TOP = [
    { labelWidth: '72%', align: 'email-create' },
    { labelWidth: '65%', twoFields: true, align: 'email-create' },
    { labelWidth: '68%', stackedField: true, align: 'email-create' },
    { labelWidth: '58%', align: 'email-create' },
    { labelWidth: '62%', stackedField: true, align: 'email-create' },
];

const ROWS_EMAIL_CHANNEL_BOTTOM = [
    { labelWidth: '78%', align: 'email-create' },
    { labelWidth: '52%', align: 'email-create' },
    { labelWidth: '70%', align: 'email-create' },
];

const EmailMailSubTabsSkeleton = () => <AuthoringChannelSubTabsSkeleton tabCount={2} activeIndex={0} />;

const EmailContentBlockSkeleton = () => (
    <div className="form-group authoring-form-skeleton__email-content-group mt41">
        <Row>
            <Col sm={{ offset: 1, span: 10 }}>
                <Shimmer style={{ width: 120, height: 14, marginBottom: 12 }} />
                <div className="authoring-form-skeleton__email-content-strip">
                    <CardChoiceSkeleton count={3} />
                    <div className="authoring-form-skeleton__email-inbox-preview form-group mt30 mb0">
                        <Row className="align-items-center">
                            <Col sm={3} className="ml15" style={{ width: '20%' }}>
                                <Shimmer style={{ height: 13, width: '90%' }} />
                            </Col>
                            <Col sm={6} style={{ width: '540px', maxWidth: '100%' }}>
                                <Shimmer style={{ height: 22, width: '100%' }} />
                                <Shimmer style={{ height: 12, width: '45%', marginTop: 6, marginLeft: 'auto' }} />
                            </Col>
                        </Row>
                    </div>
                    <Shimmer className="authoring-form-skeleton__editor authoring-form-skeleton__editor--email-channel" />
                </div>
            </Col>
        </Row>
    </div>
);

const ROWS_NOTIFICATION = [
    { labelWidth: '34%' },
    { labelWidth: '32%' },
    { labelWidth: '38%', twoFields: true },
    { labelWidth: '30%' },
    { labelWidth: '28%' },
    { labelWidth: '32%' },
];

const ROWS_VMS_TOP = [{ labelWidth: '36%' }, { labelWidth: '38%' }];
const ROWS_VMS_CONTENT = [
    { labelWidth: '34%' },
    { labelWidth: '30%' },
    { labelWidth: '32%' },
    { labelWidth: '28%' },
];

const ROWS_VOICE = [
    { labelWidth: '36%' },
    { labelWidth: '38%' },
    { labelWidth: '32%' },
    { labelWidth: '30%' },
    { labelWidth: '34%' },
];

const ROWS_QR_LEFT = [
    { labelWidth: '48%', align: 'qr' },
    { labelWidth: '44%', align: 'qr' },
    { labelWidth: '46%', align: 'qr' },
    { labelWidth: '40%', align: 'qr', twoFields: true },
    { labelWidth: '42%', align: 'qr', stackedField: true },
    { labelWidth: '50%', align: 'qr', className: 'authoring-form-skeleton__qr-textarea-row' },
];

const ROWS_FORM_BASIC = [
    { labelWidth: '38%' },
    { labelWidth: '34%' },
    { labelWidth: '42%' },
    { labelWidth: '36%' },
];

const ROWS_COMPACT = [
    { labelWidth: '42%' },
    { labelWidth: '38%' },
    { labelWidth: '48%', twoFields: true },
    { labelWidth: '36%' },
    { labelWidth: '40%' },
];

const ROWS_EMAIL_FULL = [
    { labelWidth: '36%', stackedField: true },
    { labelWidth: '32%', stackedField: true },
    { labelWidth: '38%', stackedField: true },
    { labelWidth: '34%', stackedField: true },
];

const INNER_LAYOUTS = {
    [AUTHORING_CHANNEL_INNER_VARIANT.EMAIL_COMPACT]: () => (
        <>
            <FormShell variant="email-compact">
                <LabelRows rows={ROWS_EMAIL_CHANNEL_TOP} />
                {/* <EmailContentBlockSkeleton /> */}
                <LabelRows rows={ROWS_EMAIL_CHANNEL_BOTTOM} />
            </FormShell>
        </>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.WHATSAPP_PREVIEW]: () => (
        <>
            <FormShell variant="whatsapp-preview">
                <WhatsappTopFieldsSkeleton />
                <WhatsappEditorPreviewBlockSkeleton />
                <WhatsappBottomFieldsSkeleton />
            </FormShell>
        </>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.SMS_PREVIEW]: () => (
        <>
            <FormShell variant="sms-preview">
                <SmsTopFieldsSkeleton />
                <SmsEditorPreviewBlockSkeleton />
                <SmsScheduleApprovalSkeleton />
            </FormShell>
        </>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.MESSAGING_PREVIEW]: () => (
        <FormShell variant="messaging-preview">
            <MessagingTopFieldsSkeleton includeTemplateId={false} />
            <EditorPreviewRow preview="phone" layout="messaging" />
            <ScheduleStripSkeleton rows={2} align="messaging" />
        </FormShell>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.RCS_PREVIEW]: () => (
        <>
            <FormShell variant="rcs-preview">
                <RcsTopFieldsSkeleton />
                <RcsContentBlockSkeleton />
                <RcsScheduleApprovalSkeleton />
            </FormShell>
        </>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.WEB_PUSH_PREVIEW]: () => (
        <FormShell variant="web-push-preview">
            <WebPushTopFieldsSkeleton />
            <WebPushContentBlockSkeleton />
            <WebPushScheduleApprovalSkeleton />
        </FormShell>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.MOBILE_PUSH_PREVIEW]: () => (
        <FormShell variant="mobile-push-preview">
            <MobilePushTopFieldsSkeleton />
            <MobilePushContentBlockSkeleton />
            <MobilePushScheduleApprovalSkeleton />
        </FormShell>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.NOTIFICATION_PREVIEW]: () => (
        <FormShell variant="notification-preview">
            <LabelRows rows={ROWS_NOTIFICATION} />
            <EditorPreviewRow preview="browser" />
            <ScheduleStripSkeleton rows={2} />
        </FormShell>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.VMS_TABS]: () => (
        <FormShell variant="vms-tabs">
            <LabelRows rows={ROWS_VMS_TOP} />
            <TabStripSkeleton count={3} size="lg" />
            <LabelRows rows={ROWS_VMS_CONTENT} />
        </FormShell>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.VOICE_BASIC]: () => (
        <FormShell variant="voice-basic">
            <LabelRows rows={ROWS_VOICE} />
            <ScheduleStripSkeleton rows={1} />
        </FormShell>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.SOCIAL_PREVIEW]: () => (
        <FormShell variant="social-preview">
            <SocialPostTopFieldsSkeleton />
            <SocialPostTypeCardsSkeleton />
            <SocialPostEditorPreviewBlockSkeleton />
            <SocialPostScheduleSkeleton />
        </FormShell>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.ADS_COMPACT]: () => (
        <FormShell variant="ads-compact">
            <AdsTopFieldsSkeleton />
            <AdsSmartLinkBoxSkeleton />
        </FormShell>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.WEB_ANALYTICS_PREVIEW]: () => (
        <FormShell variant="web-analytics-preview">
            <AuthoringFormRowSkeleton align="messaging" labelWidth="72%" className="mt20" />
            <WebAnalyticsDomainRowSkeleton />
            <AnalyticsGoalCheckboxesSkeleton />
        </FormShell>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.APP_ANALYTICS_PREVIEW]: () => (
        <FormShell variant="app-analytics-preview">
            <AuthoringFormRowSkeleton align="messaging" labelWidth="72%" className="mt20" />
            <AnalyticsGoalCheckboxesSkeleton />
        </FormShell>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.ANALYTICS_TABS]: () => (
        <FormShell variant="web-analytics-preview">
            <AuthoringFormRowSkeleton align="messaging" labelWidth="72%" className="mt20" />
            <WebAnalyticsDomainRowSkeleton />
            <AnalyticsGoalCheckboxesSkeleton />
        </FormShell>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.QR_PREVIEW]: () => (
        <FormShell variant="qr-preview">
            <Row>
                <Col sm={8}>
                    <LabelRows rows={ROWS_QR_LEFT} />
                    <div className="authoring-form-skeleton__qr-generate-row">
                        <Shimmer style={{ width: 120, height: 36, borderRadius: 4, marginLeft: 'auto' }} />
                    </div>
                </Col>
                <Col sm={4}>
                    <QrPreviewPanelSkeleton />
                </Col>
            </Row>
        </FormShell>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.FORM_BASIC]: () => (
        <FormShell variant="form-basic" footerStart>
            <LabelRows rows={ROWS_FORM_BASIC} />
        </FormShell>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.COMPACT]: () => (
        <FormShell variant="compact">
            <LabelRows rows={ROWS_COMPACT} />
        </FormShell>
    ),

    [AUTHORING_CHANNEL_INNER_VARIANT.EMAIL_FULL]: () => (
        <FormShell variant="email-full">
            <LabelRows rows={ROWS_EMAIL_FULL} />
            <EditorPreviewRow layout="email" />
            <ScheduleStripSkeleton rows={2} align="email" />
        </FormShell>
    ),
};

/** Render inner form skeleton for a channel variant key. */
export const AuthoringChannelInnerSkeletonLayout = ({ innerVariant, channelId, channelIndex , isSubTab = false }) => {
    const render = INNER_LAYOUTS[innerVariant] ?? INNER_LAYOUTS[AUTHORING_CHANNEL_INNER_VARIANT.COMPACT];
    const resolvedChannelIndex =
        channelIndex ?? getAuthoringVerticalIndexFromChannelId(channelId);
    const subTabCount = getAuthoringHorizontalSubTabCount(resolvedChannelIndex);

    return (
        <>
            {subTabCount > 0   && isSubTab ? (
                <AuthoringChannelSubTabsSkeleton tabCount={subTabCount} activeIndex={0} />
            ) : null}
            {render({ channelId })}
        </>
    );
};

const normalizeInnerVariant = (innerVariant) => {
    if (!innerVariant || innerVariant === 'compact') {
        return 'compact';
    }
    if (innerVariant === 'full') {
        return AUTHORING_CHANNEL_INNER_VARIANT.EMAIL_COMPACT;
    }
    return innerVariant;
};

/** Inner form block (styles + channel layout). */
export const AuthoringChannelFormSkeletonBlock = ({ innerVariant = 'compact', channelId }) => {
    const variant = normalizeInnerVariant(innerVariant);
    return (
        <>
            <style>{communicationAuthoringSkeletonCriticalCss}</style>
            <div
                className="communication-authoring-skeleton-scope communication-authoring-channel-edit-skeleton"
                aria-busy="true"
                aria-label="Loading channel content"
            >
                <AuthoringChannelInnerSkeletonLayout innerVariant={'email-compact'} channelId={1} />
            </div>
        </>
    );
};

/**
 * Single inner edit skeleton entry Ã¢â‚¬â€ SDC gate + MDC bootstrap (change layouts in this file / profiles).
 */
const AuthoringChannelEditSkeletonHost = ({ channelId, innerVariant: innerVariantProp, className = '' }) => {
    const innerVariant = innerVariantProp ?? getAuthoringChannelInnerVariant(channelId);
    return (
        <div
            className={`rsv-tabs-content tab-content position-relative allow-copy communication_lable_left authoring-channel-edit-skeleton-host ${className}`.trim()}
        >

            <AuthoringChannelFormSkeletonBlock innerVariant={innerVariant} channelId={1} />
        </div>
    );
};

AuthoringChannelFormSkeletonBlock.propTypes = {
    innerVariant: PropTypes.string,
};


AuthoringChannelEditSkeletonHost.propTypes = {
    channelId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    innerVariant: PropTypes.string,
    className: PropTypes.string,
};

export default memo(AuthoringChannelEditSkeletonHost);

