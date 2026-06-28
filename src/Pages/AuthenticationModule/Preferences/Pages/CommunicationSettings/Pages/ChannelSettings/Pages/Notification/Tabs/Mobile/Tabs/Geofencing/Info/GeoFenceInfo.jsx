import { OK } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, memo, useEffect, useState } from 'react';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton } from 'Components/Buttons';
const geofencingInfo = {
    sections: [
        {
            heading: 'What is a region?',
            content:
                'A region is a geofenced area with a center and radius, used to track entry or exit, and must be at least 100 meters from other regions.',
        },
        {
            heading: 'What is a cluster?',
            content:
                'A cluster is a group of regions treated as one, triggering actions when any are crossed.',
        },
        {
            heading: 'RESUL limitations',
            content: 'The platform supports up to 50 clusters and 50 regions per cluster.',
        },
        {
            heading: 'Platform limitations',
            subSections: [
                {
                    platform: 'iOS',
                    details: {
                        minRadius: '100 meters',
                        maxRadius: 'Around 1000 meters (recommended for accuracy)',
                        note: 'Supports up to 20 monitored regions per app. Background execution required.',
                        failureCases: [
                            'If the app is killed and not configured for background location, notification may not be delivered.',
                            'Limited to 50 regions per app. Exceeding this can drop older regions without notification.',
                            'Accuracy may reduce indoors or in areas with poor GPS/Wi-Fi signal.',
                            'Geofence triggers may be delayed if the system prioritizes battery saving or location updates are infrequent.',
                        ],
                    },
                },
                {
                    platform: 'Android',
                    details: {
                        minRadius: 'Typically 100 meters (depends on location accuracy)',
                        maxRadius: 'No strict limit, but larger radii reduce event precision',
                        note: 'Can support hundreds of regions, but requires location permissions and battery optimization.',
                        failureCases: [
                            'Doze Mode or background restrictions may prevent timely geofence triggers.',
                            'App must request background location permission from Android 10+. Without it, geofencing won’t work properly.',
                            'Battery saver or aggressive OEM customizations (e.g., Xiaomi, Oppo) may kill geofence services.',
                            'Device restarts or network changes can cause inconsistencies in region monitoring.',
                        ],
                    },
                },
            ],
        },
    ],
};

const introSections = geofencingInfo.sections.filter((s) => !s.subSections);
const platformSection = geofencingInfo.sections.find((s) => s.subSections);

/** Grid `grid-area` names must match SCSS (`ios-*` / `android-*`). */
const getPlatformSlug = (platform) => (platform === 'iOS' ? 'ios' : 'android');

const GeoFenceInfo = ({ show, handleClose }) => {
    const [isMobileFullscreen, setIsMobileFullscreen] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined' || !window.matchMedia) {
            return undefined;
        }
        const mq = window.matchMedia('(max-width: 575.98px)');
        const onChange = () => setIsMobileFullscreen(mq.matches);
        onChange();
        mq.addEventListener('change', onChange);
        return () => mq.removeEventListener('change', onChange);
    }, []);

    return (
        <RSModal
            show={show}
            size="lg"
            className="geo-fence-info-modal"
            bodyClassName="geo-fence-info-body css-scrollbar"
            footerClassName="geo-fence-info-footer"
            fullscreen={isMobileFullscreen}
            header="Geofencing information"
            handleClose={handleClose}
            isCloseButton={true}
            body={
                <div className="geo-fence-info">
                    <div className="geo-fence-info__intro" aria-label="Geofencing information sections">
                        {introSections.map((section) => (
                            <div className="info-section" key={section.heading}>
                                <h3 className="geo-fence-info__heading">{section.heading}</h3>
                                {section.content && (
                                    <p className="geo-fence-info__content section-content lh-sm">
                                        {section.content}
                                    </p>
                                )}
                                {section.listItems && (
                                    <ul className="geo-fence-info__list section-list">
                                        {section.listItems.map((item, idx) => (
                                            <li key={`${section.heading}-${idx}`}>{item}</li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        ))}
                    </div>

                    {platformSection && (
                        <section
                            className="geo-fence-info__platform"
                            aria-labelledby="geo-fence-platform-heading"
                        >
                            <h3
                                id="geo-fence-platform-heading"
                                className="geo-fence-info__heading geo-fence-info__heading--platform"
                            >
                                {platformSection.heading}
                            </h3>
                            <div className="platform-grid-wrap">
                                <div className="platform-grid">
                                    {platformSection.subSections.map((sub) => {
                                        const slug = getPlatformSlug(sub.platform);
                                        return (
                                            <Fragment key={sub.platform}>
                                                <h4
                                                    id={`platform-heading-${slug}`}
                                                    className={`platform-grid__title platform-grid__title--${slug}`}
                                                >
                                                    {sub.platform}
                                                </h4>
                                                <div
                                                    className={`platform-grid__specs platform-grid__specs--${slug}`}
                                                    aria-labelledby={`platform-heading-${slug}`}
                                                >
                                                    <dl className="platform-card__specs">
                                                        <div className="platform-card__spec-row">
                                                            <dt>Min radius</dt>
                                                            <dd>{sub.details.minRadius}</dd>
                                                        </div>
                                                        <div className="platform-card__spec-row">
                                                            <dt>Max radius</dt>
                                                            <dd>{sub.details.maxRadius}</dd>
                                                        </div>
                                                        <div className="platform-card__spec-row platform-card__spec-row--note">
                                                            <dt>Note</dt>
                                                            <dd>{sub.details.note}</dd>
                                                        </div>
                                                    </dl>
                                                </div>
                                                {sub.details.failureCases && (
                                                    <div
                                                        className={`platform-grid__mind platform-grid__mind--${slug}`}
                                                    >
                                                        <h5
                                                            id={`failures-${sub.platform}`}
                                                            className="platform-grid__mind-heading"
                                                        >
                                                            Failure cases:
                                                        </h5>
                                                        <ul
                                                            className="failure-list"
                                                            aria-labelledby={`failures-${sub.platform}`}
                                                        >
                                                            {sub.details.failureCases.map((item, idx) => (
                                                                <li
                                                                    className="geo-fence-info__failure-line"
                                                                    key={`${sub.platform}-fc-${idx}`}
                                                                >
                                                                    {item}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                )}
                                            </Fragment>
                                        );
                                    })}
                                </div>
                            </div>
                        </section>
                    )}
                </div>
            }
            footer={
                <RSPrimaryButton className="geo-fence-info__ok" onClick={handleClose} type="button">
                    {OK}
                </RSPrimaryButton>
            }
        />
    );
};

export default memo(GeoFenceInfo);
