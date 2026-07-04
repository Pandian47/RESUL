import { onKeyChar } from 'Utils/modules/inputValidators';
import { HTTPS_REGEX } from 'Constants/GlobalConstant/Regex';
import { DUPLICATE_VALUE, ENTER_VALID_WEBSITE } from 'Constants/GlobalConstant/ValidationMessage';
import { TITLE } from 'Constants/GlobalConstant/Placeholders';
import { circle_minus_fill_medium } from 'Constants/GlobalConstant/Glyphicons';
import { memo, useEffect, useState } from 'react';
import { Col, Offcanvas, Row } from 'react-bootstrap';
import { find as _find } from 'Utils/modules/lodashReplacements';

import RSInput from 'Components/FormFields/RSInput';

import SOCIAL_ICONS from './constant';
import RSTooltip from 'Components/RSTooltip';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import WarningModal from '../../WarningModal/WarningModal';
import { useFormContext } from 'react-hook-form';


const SocialFollow = ({ data, isEdit }) => {
    const {
        socialContentAll,
        // control,
        removeSocialContent,
        setSocialContentAll,
        setSocialFlag,
        socialFlag,
        isValid,
        // trigger,
        // watch,
    } = data;
    const { control, watch, trigger, setValue, setError, clearErrors } = useFormContext();
    // console.log("isEdit",isEdit)
    const [socialIcons = []] = watch(['socialIcons']);
    const socialIconsWatch = watch('socialIcons');
    const [socialError, setSocialError] = useState(false);
    const [isRemoved, setIsRemoved] = useState(false);
    const [warningModal, setWarningModal] = useState({
        show: false,
        index: null,
    });
    const [tempSocial, setTempSocial] = useState([]);

    useEffect(() => {
        const initializeTempSocial = () => {
            const temp = socialContentAll.map((item) => ({
                title: item?.title,
                link: item?.link,
            }));
            //setTempSocial(temp);
            setValue('socialIcons', temp);
            setTempSocial([...socialContentAll]);
        };
        initializeTempSocial();
    }, [socialContentAll, socialFlag, setValue]);

    // sidebar for social content
    const addSocialContents = (ele) => {
        const social = [...tempSocial];
        if (!social.some((e) => e.title === ele.title) && social?.length < 6) {
            social.push(ele);
            setTempSocial(social);
            setSocialError(false);
        } else {
            setSocialError(true);
        }
    };

    const handleClose = () => {
        setSocialFlag(false);
    };

    const handleDelete = (index) => {
        const updatedTempSocial = tempSocial.filter((_, i) => i !== index);
        setTempSocial(updatedTempSocial);
        setValue('socialIcons', updatedTempSocial);
        clearErrors();
    };
    const handleSave = () => {
        const links = tempSocial.map((item) => item.link);
        const hasEmptyFields = links.some((link) => link === '');
        if (!hasEmptyFields && isValid) {
            setSocialContentAll([...tempSocial]);
            setSocialFlag(false);
        } else {
            trigger();
        }
    };
    // console.log('ASDAS :::: ', socialIconsWatch);
    // console.log("socialIcons",socialIcons)

    // console.log("tempSocial",tempSocial);
    return (
        <Offcanvas show={socialFlag} onHide={handleClose} placement="end" className="rs-builder-properties-wrapper">
            {/* <Offcanvas show onHide={handleClose} placement='end' className="rs-builder-properties-wrapper"> */}
            <Offcanvas.Header className="mt60" closeButton>
                <Offcanvas.Title className="d-flex">
                    Social media <small className="white ml10 position-relative top1">(Max. 6 allowed)</small>
                </Offcanvas.Title>
            </Offcanvas.Header>
            <div className="rsbpw-icons-wrapper bg-white p15">
                {/* <p className="mb10 d-flex">Select social media platforms &nbsp; (<small>Max. 6</small>)</p> */}
                <Row>
                    {SOCIAL_ICONS?.map((ele) => {
                        // console.log("_find(tempSocial,",_find(tempSocial, ['title', ele?.title]))
                        // console.log("ele",ele)
                        return (
                            <Col sm={2} className="mb10" key={ele?.key + 1}>
                                <div className={_find(tempSocial, ['title', ele?.title]) ? 'click-off' : ''}>
                                    <RSTooltip text={ele.title} position="top">
                                        <img
                                            className="cp"
                                            src={ele.icon}
                                            onClick={() => {
                                                addSocialContents(ele);
                                            }}
                                        />
                                    </RSTooltip>
                                </div>
                            </Col>
                        );
                    })}
                </Row>
            </div>
            <Offcanvas.Body className="css-scrollbar">
                <div className="rsbpw-icons-wrapper d-none">
                    {/* <p className="mb10 d-flex">Select social media platforms &nbsp; (<small>Max. 6</small>)</p> */}
                    <Row>
                        {[...SOCIAL_ICONS].map((ele) => {
                            return (
                                <Col sm={2} className="mb10" key={ele.key + 1}>
                                    <div className={_find(tempSocial, ['id', ele.id]) ? 'click-off' : ''}>
                                        <RSTooltip text={ele.title} position="top">
                                            <img
                                                src={ele.icon}
                                                onClick={() => {
                                                    addSocialContents(ele);
                                                }}
                                            />
                                        </RSTooltip>
                                    </div>
                                </Col>
                            );
                        })}
                    </Row>
                </div>
                {/* )} */}

                {socialError && <p className="alert alert-warning flex-center py3 small">Max. 6 platforms allowed</p>}

                {tempSocial.map((ele, ind) => {
                    // console.log('tempSocial map ', ele);
                    return (
                        <div className="builder-social-properties-block" key={ind}>
                            <div className="bspb-top">
                                <div className="bspbt-logo">
                                    <img src={ele.icon} title={ele.title} />
                                    <span>{ele.title}</span>
                                </div>
                                {tempSocial?.length > 1 ? (
                                    <div className="bspbt-delete">
                                        <RSTooltip text="Delete" position="top" innerContent={false}>
                                            <i
                                                id="rs_data_delete"
                                                className={`${circle_minus_fill_medium} icon-md color-primary-red`}
                                                onClick={() => {
                                                    if (socialError) setSocialError(false);
                                                    setWarningModal({
                                                        show: true,
                                                        index: ind,
                                                    });
                                                }}
                                            ></i>
                                        </RSTooltip>
                                    </div>
                                ) : (
                                    <div className="bspbt-delete disabled">
                                        <RSTooltip
                                            text="At least one should be present"
                                            position="top"
                                            innerContent={false}
                                        >
                                            <i
                                                className={`${circle_minus_fill_medium} icon-md color-disabled `}
                                                id="rs_data_delete"
                                            ></i>
                                        </RSTooltip>
                                    </div>
                                )}
                            </div>

                            <div className="bspb-content">
                                <RSInput
                                    control={control}
                                    placeholder={TITLE}
                                    name={`socialIcons.${ind}.title`}
                                    defaultValue={ele.title}
                                    onKeyDown={onKeyChar}
                                />
                                <RSInput
                                    control={control}
                                    placeholder={'URL'}
                                    name={`socialIcons.${ind}.link`}
                                    required
                                    defaultValue={ele.link}
                                    rules={{
                                        required: 'Enter an URL',
                                        pattern: {
                                            value: HTTPS_REGEX,
                                            message: ENTER_VALID_WEBSITE,
                                        },
                                        validate: (data) => {
                                            // console.log(
                                            //     'Duplicates ::: ',
                                            //     findDuplicates(socialIcons, 'link'),
                                            //     socialIcons,
                                            //     data,
                                            // );
                                            let links = socialIcons?.map((item, idx) => {
                                                return item?.link;
                                            });

                                            // const [status, _] = findDuplicates(socialIcons, 'link');
                                            return links?.includes(data) && ind !== links.indexOf(data)
                                                ? DUPLICATE_VALUE
                                                : true;
                                        },
                                    }}
                                    handleOnBlur={(e) => {
                                        // console.log('AA :::: ', e);
                                        let temp = [...tempSocial];
                                        let tempMap = temp.map((item, idx) => {
                                            if (idx === ind) {
                                                return {
                                                    ...item,
                                                    link: e?.target?.value,
                                                };
                                            } else {
                                                return {
                                                    ...item,
                                                };
                                            }
                                        });
                                                                                setTempSocial([...tempMap]);
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}

                {/* {warningModal && (
                    <RSModal
                        show={warningModal}
                        handleClose={() => setWarningModal(false)}
                        header={'Warning'}
                        body={<span>Are you sure want to delete?</span>}
                        footer={
                            <div className="buttons-holder">
                                <RSSecondaryButton onClick={() => setWarningModal(false)}>Cancel</RSSecondaryButton>
                                <RSPrimaryButton
                                    onClick={() => {
                                        removeSocialContent(warningModal?.index);
                                        setWarningModal(false);
                                    }}
                                >
                                    Ok
                                </RSPrimaryButton>
                            </div>
                        }
                    />
                )} */}
                <WarningModal
                    show={warningModal?.show}
                    handleClose={(status) => {
                        //debugger
                        if (status) {
                            // removeSocialContent(warningModal?.index);
                            handleDelete(warningModal.index);
                        }
                        setWarningModal((prev) => ({
                            ...prev,
                            show: false,
                        }));
                    }}
                />
            </Offcanvas.Body>
            <div className="buttons-holder bg-white py15 pr15 mb0 mt15">
                <RSSecondaryButton onClick={handleClose}>Cancel</RSSecondaryButton>
                <RSPrimaryButton onClick={handleSave}>Save</RSPrimaryButton>
            </div>
        </Offcanvas>
    );
};

export default memo(SocialFollow);
