import { memo } from 'react';
import { Container, Row } from 'react-bootstrap';

import PropTypes from 'prop-types';



/**

 * Shared RSTabbarFluid tab strip — neutral grey blocks only, no text labels.

 */

const TabBarViewSkeleton = ({

    activeTabIndex = 0,

    tabCount = 3,

    colClass = 'col-md-4',

    scopeClass = 'tab-bar-view-skeleton',

    tabsListClass = '',

    tabsRowClass = 'rs-tabs row rst-left-space mb0 mini w-100 m-0',

    containerClass = '',

    wrapperClassName,

    omitColClass = false,

}) => {

    const wrapClass = wrapperClassName ?? `fullWhiteBackground ${scopeClass} mb0`.trim();

    const tabColClass = omitColClass ? '' : colClass;

    const resolvedContainerClass = containerClass ?? `${scopeClass}__container`;

    return (

        <div className={wrapClass}>

            <Container className={resolvedContainerClass}>

                <Row className="mx-0">

                    <ul className={`${tabsRowClass} ${scopeClass}__list ${tabsListClass}`.trim()}>

                        {Array.from({ length: tabCount }, (_, index) => (

                            <li

                                key={index}

                                className={`tabDefault ${tabColClass} ${scopeClass}__tab${
                                    index === activeTabIndex ? ' active' : ''
                                }`.trim()}

                                aria-hidden="true"

                            />

                        ))}

                    </ul>

                </Row>

            </Container>

        </div>

    );

};



TabBarViewSkeleton.propTypes = {

    activeTabIndex: PropTypes.number,

    tabCount: PropTypes.number,

    colClass: PropTypes.string,

    scopeClass: PropTypes.string,

    tabsListClass: PropTypes.string,

    tabsRowClass: PropTypes.string,

    containerClass: PropTypes.string,

    wrapperClassName: PropTypes.string,

    omitColClass: PropTypes.bool,

};



export default memo(TabBarViewSkeleton);

