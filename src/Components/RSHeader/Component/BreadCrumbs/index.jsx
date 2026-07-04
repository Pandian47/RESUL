import { Fragment } from 'react';
import { get as _get,capitalize as _capitalize  } from 'Utils/modules/lodashReplacements';
import { Container } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

import { pages_tab_config } from '../../constant';
import useQueryParams from 'Hooks/useQueryParams';
import { useSelector } from 'react-redux';

const BreadCrumbs = ({ isAuth }) => {
    const navigate = useNavigate();
    let { pathname, state } = useLocation();
    const { renewalData } = useSelector(({ globalstate }) => globalstate);
    
    const pathArrayLength = pathname.split('/')?.length > 2 ? pathname.split('/') : [];
    const getInitialPath = pathname.split('/').join('');
    const locationState = useQueryParams('/audience');
    const disableNavIcons = locationState?.needBUs && locationState?.fromLogin || renewalData?.isRenewal || false;
    const enableBreadCrumb = locationState?.from?.type === 'versium'  ? false : true;
    return (
        <Fragment>
            {isAuth && enableBreadCrumb && (
                <div className="breadcrumbs">
                    <div className="section-padding-x">
                        <Container className="p0">
                            <ul className={`${disableNavIcons ? 'click-off' : ''} breadcrumb`}>
                                {pathArrayLength.map((path, index) => {
                                    let customPaths = path.replace(/-/g, ' ');
                                    const finalCustomPaths =
                                        customPaths === 'create target list' && locationState?.isAdhocList
                                            ? 'Create Adhoc list'
                                            : customPaths;
                                            const displayText =
                                                finalCustomPaths?.toLowerCase() === 'landingpage gallery'
                                                    ? 'Landing page gallery'
                                                    : (finalCustomPaths?.toLowerCase() === 'add companies'  && state?.page === "ASSIGN_ROLE") 
                                                        ? 'Assign role'
                                                        : finalCustomPaths?.toLowerCase() === 'whatsapp template gallery'? 
                                                        'WhatsApp template gallery':
                                                        _capitalize(finalCustomPaths);
                                                        
                                            
                                    return (
                                        <li
                                            key={customPaths}
                                            className={index === pathArrayLength?.length - 1 ? 'active' : ''}
                                            onClick={() => {
                                                if (index < pathArrayLength?.length - 1) {
                                                    if (pathArrayLength?.length > 3) {
                                                        navigate(`${pathname.slice(0, pathname.lastIndexOf('/'))}`);
                                                    } else {
                                                        navigate('/' + customPaths);
                                                    }
                                                }
                                            }}
                                        >
                                            {displayText}
                                        </li>
                                    );
                                })}
                                {(getInitialPath === 'communication' || getInitialPath === 'audience' || getInitialPath === 'analytics' || getInitialPath === 'dashboard') && (
                                    <Fragment>
                                        <li></li>
                                        <li
                                            onClick={() =>
                                                navigate(getInitialPath, {
                                                    state: {
                                                        index: 0,
                                                    },
                                                })
                                            }
                                        >
                                            {_capitalize(getInitialPath)}
                                        </li>
                                        <li className="active">
                                            {pages_tab_config?.[getInitialPath]?.[_get(state, 'index', 0)]}
                                        </li>
                                    </Fragment>
                                )}
                            </ul>
                        </Container>
                    </div>
                </div>
            )}
        </Fragment>
    );
};

export default BreadCrumbs;
