import { memo } from 'react';
import PropTypes from 'prop-types';

import { Col, Row } from 'react-bootstrap';



import NoDataAvailableRender from 'Components/FormFields/Component/NoDataAvailableRender';

import { dynamicListCreationSkeletonCriticalCss } from 'Components/Skeleton/pages/audience/dynamicList/dynamicListCreationSkeletonCriticalCss';



const SkelBar = ({ width, className = '', circle = false }) => (
    <span
        className={`skeleton-shimmer ${className}`.trim()}
        style={{
            ...(width != null ? { width } : {}),
            ...(circle ? { borderRadius: '50%' } : {})
        }}
        aria-hidden="true"
    />
);

const RadioSkelBar = () => (
    <SkelBar
        width={24}
        className="dl-skeleton-radio-pill"
        circle
    />
);



const LabelCol = ({ width }) => (

    <Col sm={2} className="dl-skeleton-col-label d-flex align-items-center">

        <SkelBar width={width} className="dl-skeleton-bar--label" />

    </Col>

);



const RuleGroupBlock = () => (

    <>

        <div className="dl-skeleton-rule-group__title mb25">

            <SkelBar width={100} />

        </div>

        <Row className="dl-skeleton-row--rules">

            <LabelCol width={72} />

            <Col sm={6}>

                <div className="dl-skeleton-radio-row">

                    <div className="dl-skeleton-radio-option">

                        <RadioSkelBar />

                        <SkelBar width={70} />

                    </div>

                    <div className="dl-skeleton-radio-option">

                        <RadioSkelBar />

                        <SkelBar width={70} />

                    </div>

                </div>

            </Col>

        </Row>

        <Row className="dl-skeleton-row--match-field">

            <LabelCol width={95} />

            <Col sm={4}>

                <SkelBar width="100%" className="dl-skeleton-form__field dl-skeleton-form__field--input" />

            </Col>

        </Row>

    </>

);



const ApprovalBlock = () => (

    <div className="dl-skeleton-approval form-group audienceRFA rfa mb0">

        <Row className="form-group mb41">

            <Col>

                <div className="dl-skeleton-approval__checkbox-row">

                    <SkelBar width={24} className="dl-skeleton-bar--checkbox" />

                    <SkelBar width={168} />

                    <RadioSkelBar />

                </div>

            </Col>

        </Row>

        <Row className="form-group mb30 dl-skeleton-approval__send-row requestApprovalBlock">

            <LabelCol width={168} />

            <Col sm={4}>

                <SkelBar width="100%" className="dl-skeleton-form__field dl-skeleton-form__field--input" />

            </Col>

            <Col sm={1} className="d-flex align-items-center dl-skeleton-approval__send-action">

                <RadioSkelBar />

            </Col>

        </Row>

    </div>

);



const FooterButtons = () => (
    <div className="dl-skeleton-footer buttons-holder">
        <SkelBar className="dl-skeleton-footer__cancel" />
        <SkelBar className="dl-skeleton-footer__primary" />
    </div>
);



/**

 * @param {'full' | 'ruleGroup'} variant - full page layout or rule group box only

 * @param {boolean} showApproval - approval section (hidden for RFA view)

 */

const DynamicListCreationSkeleton = ({

    variant = 'full',

    showApproval = true,

    isError = false,

    className = '',

    injectCriticalCss = true,

}) => {

    const ruleGroupContent = (

        <div className={`position-relative${isError ? ' is-error' : ''}`}>

            {isError ? <NoDataAvailableRender className="nodata-skeleton-con" /> : null}

            <RuleGroupBlock />

            <div className="rightOutSidePlusIcon position-absolute dl-skeleton-plus-wrap">

                <RadioSkelBar />

            </div>

        </div>

    );



    const rootClassName = [

        'skeleton-span-con',

        'dynamic-list-creation-skeleton',

        'p0',

        'dl-skeleton-form',

        isError ? 'is-error' : '',

        className,

    ]

        .filter(Boolean)

        .join(' ');



    if (variant === 'ruleGroup') {

        return (

            <div className={rootClassName} aria-hidden={!isError}>

                {injectCriticalCss ? <style>{dynamicListCreationSkeletonCriticalCss}</style> : null}

                {ruleGroupContent}

            </div>

        );

    }



    return (

        <div className={rootClassName} aria-hidden={!isError}>

            {injectCriticalCss ? <style>{dynamicListCreationSkeletonCriticalCss}</style> : null}

            <Row className="dl-skeleton-row--list-name">

                <LabelCol width={100} />

                <Col sm={7} className="pl30 pr0">

                    <SkelBar width="100%" className="dl-skeleton-form__field dl-skeleton-form__field--input" />

                </Col>

            </Row>



            <div className="createDynamicListBox">{ruleGroupContent}</div>



            {showApproval && !isError ? <ApprovalBlock /> : null}

            {!isError ? <FooterButtons /> : null}

        </div>

    );

};



DynamicListCreationSkeleton.propTypes = {

    variant: PropTypes.oneOf(['full', 'ruleGroup']),

    showApproval: PropTypes.bool,

    isError: PropTypes.bool,

    className: PropTypes.string,

    injectCriticalCss: PropTypes.bool,

};



export default memo(DynamicListCreationSkeleton);

