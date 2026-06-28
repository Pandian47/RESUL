import { getChannelId } from 'Utils/modules/communicationChannels';

import { AUDIENCE_SCORE, BEHAVIOUR, CANCEL, CHANNEL, COMMUNICATION, FOLLOWERS, FRIENDS, LIFETIME_VALUE, NEXT_BEST_OFFER, NEXT_BEST_PRODUCT, SELECT, VIRALITY } from 'Constants/GlobalConstant/Placeholders';
import { arrow_right_mini, circle_dropdown_medium, social_facebook_large, social_twitter_large, thumbs_up_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';

import CampaignDetails from './CampaignDetails';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import RSModal from 'Components/RSModal';
import { KendoIconDropdown } from 'Components/RSDropDown';
import Carousel from 'react-bootstrap/Carousel';

import { mdcTemplate1, mdcTemplate3 } from 'Assets/Images';
import { userImg } from 'Assets/Images';
import RSTooltip from 'Components/RSTooltip';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell.jsx'

const Profile = ({ user }) => {
    // console.log('user: ', user);
    const [actionModal, setActionModal] = useState(false);

   useEffect(() => {
    const checkPopupPosition = () => {
        const popupContainer = document.querySelector('.k-animation-container.k-animation-container-shown');
        const dropdown = document.querySelector('.aa360LeftCommunicationDropdownListContainer');
        const expandedButton = document.querySelector(
            '.audienceDetailBlock .res-kendo-icon-dd-wrapper .k-button[aria-expanded="true"]',
        );

        if (!popupContainer || !dropdown || !expandedButton) return;

        const popupRect = popupContainer.getBoundingClientRect();
        const triggerRect = expandedButton.getBoundingClientRect();
        const opensAbove = popupRect.top < triggerRect.top;

        dropdown.classList.toggle('position-top', !opensAbove);
        dropdown.classList.toggle('position-bottom', opensAbove);
    };

    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style' || mutation.type === 'childList') {
                checkPopupPosition();
            }
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ['style', 'class']
    });

    checkPopupPosition();

    return () => observer.disconnect();
}, []);

    return (
        <>
            <div className="profile">
                <div className="audienceCard">
                    <img src={user?.pic || userImg} width="75px" alt="user" className="roundedCircle" />
                    <div>
                        <h4 className="mb0" style={{width: '190px'}}><TruncatedCell value = {user?.name} noTable= {true}/> </h4>
                        <h6 style={{width: '190px'}}><TruncatedCell value = {user?.place} noTable= {true}/></h6>
                    </div>
                </div>
                <ul className="profileChannelIconListCSS">
                    {user?.notifications?.map((notification, index) => (
                        <li
                            key={notification?.label || index}
                            className={`social-icon white`}
                            style={{ backgroundColor: `${notification?.color}` }}
                        >
                            <RSTooltip text={notification?.label} className="lh0">
                                <i className={`${notification?.icon} icon-md`} />
                            </RSTooltip>
                        </li>
                    ))}
                </ul>
                <div className="d-flex align-items-center p10">
                    <i className={`${thumbs_up_fill_medium} icon-md color-primary-blue mr10`} />
                    <p>{user?.role}</p>
                </div>
                {/* <div className="d-flex align-items-center p10">
                    <span>{user?.roleDescription}</span>
                </div> */}
            </div>
            <Carousel
                // variant="dark"
                className="gaugeslider-wrapper"
                indicators={true}
                indicatorLabels={true}
                controls={false}
                interval={null}
            >
                <Carousel.Item>
                    <p className="bg-secondary-green font-sm p10 white text-center lh-sm">
                        {LIFETIME_VALUE}: <span className="font-smd lh0">{user?.lifetimeValue}</span>
                    </p>
                </Carousel.Item>
                <Carousel.Item>
                    <p className="bg-secondary-orange font-sm p10 white text-center lh-sm">
                        {AUDIENCE_SCORE}: <span className="font-smd lh0">{user?.audienceScore}</span>
                    </p>
                </Carousel.Item>
            </Carousel>
            <Row>
                <Col sm={6} className="pr5">
                    <Card>
                        <Card.Header>{COMMUNICATION}</Card.Header>
                        {user?.campaign?.map((item, index) => (
                            <Card.Body key={index}>
                                <h2>{item?.total}</h2>
                                <h6>{item?.title}</h6>
                                <KendoIconDropdown
                                    icon={` ${circle_dropdown_medium} icon-xs cp color-primary-blue`}
                                    data={item?.moreData}
                                    textField="title"
                                    variant="aa360Communication"
                                    itemRender={(props) => <CampaignDetails campaign={props} />}
                                />
                            </Card.Body>
                        ))}
                    </Card>
                </Col>
                <Col sm={6} className="pl5">
                    <Card>
                        <Card.Header>{CHANNEL}</Card.Header>
                        {user?.activeChannel?.map((item, index) => {
                            const label = getChannelId(item.icon);
                            // console.log('label: ', label);
                            return (
                                <Card.Body key={index} className={`${!label?.color ? 'bg-grey-dark': 'white'}`} style={{ backgroundColor: `${label?.color}` }}>
                                    {label ? (
                                        <>
                                            <i className={`icon-md ${label.icon}`} />
                                            <h6 className="white">{item?.title}</h6>
                                        </>
                                    ) : (
                                        <h6 className="white p15">NA</h6>
                                    )}
                                </Card.Body>
                            );
                        })}
                    </Card>
                </Col>
            </Row>
            {/* <Row className="mt10">
                <Col>
                    <Card>
                        <Card.Header>Profile completeness</Card.Header>
                        <Card.Body className="p0">
                            <Carousel
                                variant="dark"
                                className="gaugeslider-wrapper"
                                indicators={true}
                                indicatorLabels={true}
                                controls={false}
                                interval={null}
                            >
                                <Carousel.Item style={{ height: '120px' }}>
                                    <div className="d-flex p6">
                                        <Col>
                                            <div className="portlet-mini">
                                                <RSHighchartsContainer
                                                    options={pieChartPercentage(Number(75) || 0, 140)}
                                                />
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className="portlet-mini">
                                                <RSHighchartsContainer
                                                    options={pieChartPercentage(Number(45) || 0, 140)}
                                                />
                                            </div>
                                        </Col>
                                    </div>
                                </Carousel.Item>
                                <Carousel.Item style={{ height: '120px' }}>
                                    <Row>
                                        <Col>
                                            <div className="portlet-mini">
                                                <RSHighchartsContainer
                                                    options={pieChartPercentage(Number(75) || 0, 140)}
                                                />
                                            </div>
                                        </Col>
                                        <Col>
                                            <div className="portlet-mini">
                                                <RSHighchartsContainer
                                                    options={pieChartPercentage(Number(45) || 0, 140)}
                                                />
                                            </div>
                                        </Col>
                                    </Row>
                                </Carousel.Item>
                            </Carousel>
                        </Card.Body>
                    </Card>
                </Col>
            </Row> */}
            <Row className="mt10">
                <Col>
                    <Card>
                        <Card.Header>{VIRALITY}</Card.Header>
                        <Card.Body className="p0">
                            <Row className="m0">
                                <Col className="bg-facebook white p10">
                                    <i className={`icon-lg ${social_facebook_large}`} />
                                    <div className="font-lg lh30">{user?.virality?.facebook}</div>
                                    <p>{FRIENDS}</p>
                                </Col>
                                <Col className="bg-twitter white p10">
                                    <i className={`icon-lg ${social_twitter_large}`} />
                                    <div className="font-lg lh30">{user?.virality?.twitter}</div>
                                    <p>{FOLLOWERS}</p>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
            <Row className="mt10">
                {user?.behavior?.length && (
                    <Col sm={12}>
                        <Card className="">
                            <Card.Header>{BEHAVIOUR}</Card.Header>
                            <Card.Body className="text-left">
                                {user?.behavior?.map((behavior, index) => {
                                    return (
                                        <div key={index}>
                                            {behavior && (
                                                <div className="d-flex align-items-baseline">
                                                    <i className={`${arrow_right_mini} font-xxs lh0 pr5`} />
                                                    <p className="fs15 lh-sm">{behavior}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </Card.Body>
                        </Card>
                    </Col>
                )}
                {user?.interests?.length && (
                    <Col sm={12}>
                        <Card className="border-bottom-0">
                            <Card.Header>Interests</Card.Header>
                            <Card.Body className="text-left">
                                {user?.interests.map((interest) => (
                                    <div key={interest}>
                                        {/* <i className={`${arrow_right_mini} icon-sm`} /> */}
                                        {interest}
                                    </div>
                                ))}
                            </Card.Body>
                        </Card>
                    </Col>
                )}
                {user?.bestProducts?.length && (
                    <Col sm={12}>
                        <Card className="border-bottom-0">
                            <Card.Header>{NEXT_BEST_PRODUCT}</Card.Header>
                            <Card.Body className="text-left pb0">
                                {/* // TODO {Stephen}: Change the list to slider */}

                                <Carousel
                                    // variant="dark"
                                    className="gaugeslider-wrapper"
                                    indicators={true}
                                    indicatorLabels={true}
                                    controls={false}
                                    interval={null}
                                >
                                    {user?.bestProducts.map((product, inde) => (
                                        <Carousel.Item>
                                            <div key={inde}>
                                                {/* <i className={`${arrow_right_mini} icon-sm`} /> */}
                                                {product}
                                            </div>
                                        </Carousel.Item>
                                    ))}
                                </Carousel>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
                {user?.bestOffers?.length && (
                    <Col sm={12}>
                        <Card>
                            <Card.Header>{NEXT_BEST_OFFER}</Card.Header>
                            <Card.Body className="text-left pb0">
                                <Carousel
                                    // variant="dark"
                                    className="gaugeslider-wrapper"
                                    indicators={true}
                                    indicatorLabels={true}
                                    controls={false}
                                    interval={null}
                                >
                                    {user?.bestOffers?.map((offer) => (
                                        <Carousel.Item>
                                            <div key={offer}>
                                                {/* <i className={`${arrow_right_mini} icon-sm`} /> */}
                                                {offer}
                                            </div>
                                        </Carousel.Item>
                                    ))}
                                </Carousel>
                            </Card.Body>
                        </Card>
                    </Col>
                )}
            </Row>
            {/* <Row className="m0 mt10">
                <RSPrimaryButton onClick={() => setActionModal(true)} className="font-sm p8 rs-button-tertiary">
                    Next-best action
                </RSPrimaryButton>
            </Row> */}
            <RSModal
                size="xl"
                show={actionModal}
                handleClose={setActionModal}
                isBorder
                header="Next-best action"
                body={
                    <Carousel
                        // variant="dark"
                        className="gaugeslider-wrapper"
                        indicators={true}
                        indicatorLabels={true}
                        interval={null}
                    >
                        <Carousel.Item>
                            <img src={mdcTemplate1} alt="actionView" />
                        </Carousel.Item>
                        <Carousel.Item>
                            <img src={mdcTemplate3} alt="actionView" />
                        </Carousel.Item>
                    </Carousel>
                }
                footer={
                    <span>
                        <RSSecondaryButton onClick={() => setActionModal(false)}>
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSPrimaryButton type="submit">{SELECT}</RSPrimaryButton>
                    </span>
                }
            />
        </>
    );
};

export default Profile;
