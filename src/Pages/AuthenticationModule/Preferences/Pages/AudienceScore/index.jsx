import { getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';
import { OK, SELECT_BU, YOUR_AUDIENCE_SCORE } from 'Constants/GlobalConstant/Placeholders';
import { circle_question_mark_large } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { find as _find } from 'Utils/modules/lodashReplacements';
import { getSessionId } from 'Reducers/globalState/selector';
import audienceScoreHelp from 'Assets/Images/audienceScoreHelp.svg';
import RSTabbar from 'Components/RSTabber';
import { PERSONA_CARD_CONFIG, VERTICAL_TAB_CONFIG } from './constant';
import RSPageHeader from 'Components/RSPageHeader';
import RSInput from 'Components/FormFields/RSInput';
import { setAudienceScoreClientType, setAudienceScoreTab } from 'Reducers/preferences/audienceScore/reducer';
import RSTooltip from 'Components/RSTooltip';
import RSModal from 'Components/RSModal';
import { RSPrimaryButton } from 'Components/Buttons';
import RSConfirmationModal from 'Components/ConfirmationModal';

import RSSkeletonTable from 'Components/RSSkeleton/RSSkeletonTable';

const AudienceScore = () => {
    const [isShow, setIsShow] = useState({
        confirmationModal: false,
    });
        
    const { industryList, countryMasterList, businessTypeList } = getmasterData();
    const { licenseTypeId, countryId, businessTypeId } = getUserDetails();
    const { control, getValues, reset } = useForm();
    const { activeTab } = useSelector((state) => state.audienceScoreReducer);
    const dispatch = useDispatch();
    const { departmentName } = useSelector((state) => getSessionId(state));
    const { industryId } = useSelector(({ globalstate }) => globalstate);

    let clientType = getValues('clientType');
    const [help, setHelp] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Preload the image
    useEffect(() => {
        const img = new Image();
        img.onload = () => {
                        setImageLoaded(true);
        };
        img.src = audienceScoreHelp;
    }, []);

    useEffect(() => {
        if (departmentName?.toLowerCase() === 'all' && licenseTypeId === '3') {
            setIsShow((pre) => ({ ...pre, confirmationModal: true }));
        } else {
            setIsShow((pre) => ({ ...pre, confirmationModal: false }));
            if (imageLoaded) {
                setHelp(true);
            }
        }
    }, [departmentName, imageLoaded]);
    useEffect(() => {
        dispatch(setAudienceScoreClientType(getValues('clientType')));
        dispatch(setAudienceScoreTab(0));
        return () => {
            dispatch(setAudienceScoreTab(0));
        };
    }, []);
    useEffect(() => {
        const businessType = _find(businessTypeList, ['businessTypeID', businessTypeId || 2]);
        const companyIndustry = _find(industryList, ['industryID', industryId || 1]);
        const companyCountry = _find(countryMasterList, (country) => country.countryID === countryId);
        reset((pre) => ({
            country: companyCountry?.country,
            industry: companyIndustry?.industryName,
            clientType: businessType?.businessType,
        }));
    }, [countryId, industryId]);
    return (
        // Contend holder starts
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader
                title="Audience score"
                isBack
                backPath={`/preferences`}
                isTabber
                rightCommonMenus
                isHeaderLine
            />
            {/* Main page heading block ends */}

            {/* Main page content block starts */}
            <Container fluid>
                <div className="page-content audienceScorePageCSS mt21">
                    <Container className="px0">
                        <div className="box-design p21">
                            <div className="form-group m0 pt10">
                                <Row>
                                    <Col sm={4}>
                                        <RSInput
                                            control={control}
                                            name="country"
                                            id="rs_AudienceScore_country"
                                            placeholder="Country"
                                            defaultValue="India"
                                            disabled
                                        />
                                    </Col>
                                    <Col sm={4}>
                                        <RSInput
                                            control={control}
                                            name="industry"
                                            id="rs_AudienceScore_Industry"
                                            placeholder="Industry"
                                            defaultValue="Banking"
                                            disabled
                                        />
                                    </Col>
                                    <Col sm={4}>
                                        <RSInput
                                            control={control}
                                            name="clientType"
                                            id="rs_AudienceScore_ClientType"
                                            placeholder="Client type"
                                            defaultValue="B2C"
                                            disabled
                                        />
                                    </Col>
                                </Row>
                            </div>
                        </div>
                        <div className="pref-as-score-band-live my10 w-100 clearfix">
                            <div className="d-flex align-items-center justify-content-end w-100">
                                <ul className="d-flex align-items-center justify-content-end audienceScoreListCSS pe-none">
                                    {['A', 'A', 'A', '70', 'A']?.map((res, ind) => (
                                        <li key={ind} className={`${ind === activeTab ? 'active' : ''}`}>
                                            {res}
                                        </li>
                                    ))}
                                </ul>
                                <RSTooltip text="Understand the score" position="top" className="lh0">
                                    <i
                                        className={`${circle_question_mark_large} icon-lg color-primary-blue `}
                                        onClick={() => setHelp(true)}
                                        id="circle_question_mark"
                                    ></i>
                                </RSTooltip>
                            </div>
                        </div>
                        {departmentName?.toLowerCase() === 'all' && licenseTypeId === '3' ? (
                            <>
                                <div className="mt15">
                                    <RSSkeletonTable text={true} />
                                </div>
                            </>
                        ) : (
                            <>
                                <div className="rs-vertical-tabs-wrapper pref-as-live-tabs mt20">
                                    <RSTabbar
                                        dynamicTab="vertical-tabs rsv-tabs-list"
                                        activeClass="active"
                                        tabData={clientType === 'B2C' ? VERTICAL_TAB_CONFIG : PERSONA_CARD_CONFIG}
                                        defaultTab={activeTab}
                                        callBack={(_, tab) => dispatch(setAudienceScoreTab(tab))}
                                        // isTabChangeConfirmation={true}
                                    />
                                </div>
                            </>
                        )}
                    </Container>
                </div>
                <RSModal
                    show={help}
                    handleClose={() => setHelp(false)}
                    // isBorder={false}
                    // className="audienceScorePopupCSS"
                    header={YOUR_AUDIENCE_SCORE}
                    body={
                        <div className="text-center">
                            {/* <h2 className="white">Your audience score looks like this</h2> */}
                            <img src={audienceScoreHelp} />
                        </div>
                    }
                    footer={
                        <>
                            {' '}
                            <RSPrimaryButton onClick={() => setHelp(false)}>{OK}</RSPrimaryButton>
                        </>
                    }
                />
                {isShow.confirmationModal && (
                    <RSConfirmationModal
                        show={isShow?.confirmationModal}
                        text={SELECT_BU}
                        handleClose={() => {
                            setIsShow((pre) => ({ ...pre, confirmationModal: false }));
                        }}
                        handleConfirm={() => {
                            setIsShow((pre) => ({ ...pre, confirmationModal: false }));
                        }}
                        secondaryButton={false}
                    />
                )}
            </Container>
            {/* Main page content block ends */}
        </div>
        // Content holder ends
    );
};

export default AudienceScore;
