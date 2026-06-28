import { circle_arrow_right_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';

import RSPageHeader from 'Components/RSPageHeader';

import { PREFRENCE_LISTS } from './constants';
import usePermission from 'Hooks/usePersmission';
import RSTooltip from 'Components/RSTooltip';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell.jsx'
import { motion, AnimatePresence } from 'framer-motion';
import { PreferencesSectionsSkeleton } from 'Components/Skeleton/Components/PreferencesPageContentSkeleton';
import { preferencesSkeletonCriticalCss } from 'Components/Skeleton/Components/preferencesSkeletonCriticalCss';

const PreferenceMain = () => {
    const { permissionList } = usePermission();
    const [preference, setPreference] = useState([]);
    const [hoveredPref, setHoveredPref] = useState(null);
    const [hasResolvedPermissions, setHasResolvedPermissions] = useState(false);

    useEffect(() => {
        const filterPreferecePermission = PREFRENCE_LISTS?.map((menu) => {
            const lists = menu?.lists?.filter((list) => {
                const getFeatureId = list?.featureId;
                const getCurrentPermission = permissionList?.[getFeatureId];
                return getCurrentPermission === undefined || getCurrentPermission?.viewAccess;
            }) ?? [];
            return { title: menu?.title, lists };
        }).filter(({ lists }) => lists?.length) ?? [];

        setPreference(filterPreferecePermission);
        setHasResolvedPermissions(true);
    }, [permissionList]);

    const isLoadingPreferences = !hasResolvedPermissions;

    return (
        // Contend holder starts
        <div className={`page-content-holder${isLoadingPreferences ? ' preferences-skeleton-scope' : ''}`}>
            {isLoadingPreferences && <style>{preferencesSkeletonCriticalCss}</style>}
            {/* Main page heading block starts */}
            <RSPageHeader title="Preferences" isHeaderLine />
            {/* Main page heading block ends */}
            {/* Main page content block starts */}
            <Container fluid>
                <div className="page-content">
                    <Container className="px0">
                        {isLoadingPreferences ? (
                            <PreferencesSectionsSkeleton />
                        ) : (
                        preference.map((item) => (
                                <div className="pref-card" key={item?.title}>
                                    <h3 className="mb10">{item?.title}</h3>
                                    <ul className="pp-row  clearfix">
                                        {item?.lists?.map((list) => {
                                            return (
                                                <li
                                                    id={list.id}
                                                    className={`position-relative ${list.disable ? 'cursor-not-allowed' : 'sd'}`}
                                                    key={list?.title}
                                                    onMouseEnter={() => !list.disable && setHoveredPref(list?.title)}
                                                    onMouseLeave={() => setHoveredPref(null)}
                                                    >                                                {/* 'pref-item pf-' + item.title.toLocaleLowerCase() + '-' + list?.link */}
                                                     {/* <RSTooltip position="top" text={list?.tooltip}> */}
                                                        <div className={list.disable ? ' click-off' : ''} key={list?.title} style={list.disable ? { cursor: 'not-allowed' } : {}}>
                                                            <Link
                                                                to={`/preferences/${list?.link}`}
                                                                state={{ tab: 0 }}
                                                                onClick={(e) => {
                                                                    if (list.disable) e.preventDefault();
                                                                }}
                                                                style={list.disable ? { cursor: 'not-allowed' } : {}}
                                                            >
                                                                <AnimatePresence>
                                                                    {!list.disable && hoveredPref === list?.title && (
                                                                        <motion.div
                                                                            layoutId="prefHoverBg"
                                                                            className="pref-hover-bg"
                                                                            initial={{ opacity: 0 }}
                                                                            animate={{ opacity: 1 }}
                                                                            exit={{ opacity: 0 }}
                                                                            transition={{ type: "spring", stiffness: 220, damping: 25 }}
                                                                        />
                                                                    )}
                                                                </AnimatePresence>
                                                                <div className="pref-item-content">
                                                                    <i className={`${list?.icon} font-lg`}></i>
                                                                    <span className="pref-item-text">
                                                                        <span className="pref-item-title">
                                                                            <TruncatedCell value ={list?.title} noTable={true}/></span>
                                                                        <span className="pref-item-desc">
                                                                            <TruncatedCell value ={list?.tooltip} noTable = {true}/>
                                                                        </span>
                                                                    </span>
                                                                </div>
                                                                {/* <span className="pref-item-arrow">
                                                                    <i className= {`${circle_arrow_right_mini} icon-xs color-primary-blue`} />
                                                                </span> */}
                                                            </Link>
                                                        </div>
                                                    {/* </RSTooltip> */}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                        ))
                        )}
                    </Container>
                </div>
            </Container>
            {/* Main page content block ends */}
        </div>
        // Content holder ends
    );
};

export default PreferenceMain;
