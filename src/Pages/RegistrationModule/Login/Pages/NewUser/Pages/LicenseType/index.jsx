import { arrow_left_mini, circle_arrow_right_mini } from 'Constants/GlobalConstant/Glyphicons';
import { useContext } from 'react';
import { useDispatch } from 'react-redux';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { LICENSE_TYPES } from './constant';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { updateUserFormState } from 'Reducers/login/newUser/reducer';
import AccountContext from '../AccountSetUp/context';
import { getUserDetails } from 'Utils/modules/crypto';

const Licensetype = ({ nextScreen, back, companies }) => {
    const navigate = useNavigate();
    const { setPages } = useContext(AccountContext);

    const dispatch = useDispatch();
    const { isAgency } = getUserDetails() || {};
    // const { isAgency } = useSelector(({ loginReducer }) => loginReducer);
    // console.log('companies: ', companies);
    return (
        <div className="position-relative">
            <div className="rs-license-selection-page mt18">
                {/*<h3 className="text-center mb25"></h3>
                 <h3 className="text-center mb25">Select license type</h3> */}
                <Row>
                    {LICENSE_TYPES?.map(({ mainHeading, type, tag, details, licenseId, buttonText, price, descritpionText }) => (
                        <Col sm={4} key={type}>
                            <div className={`box-design p20 pt60 rs-account-setup-license-plans ${type}`}>
                                <img src={tag} className="licenseTag" />
                                <div className="plan-header">
                                    <h1>{mainHeading}</h1>
                                    <h5>Starts from</h5>
                                    <h3>USD</h3>
                                    <h1 className="price-tag">
                                        {price}/mo.<sup>*</sup>
                                    </h1>
                                    <h6>* Annual commitment</h6>
                                </div>
                                <div className={`descripiton-text text-center ${licenseId === 1 ?'mb55' : ''}`}> 
                                   <h4>{descritpionText}</h4>
                                </div>
                                <ul>
                                    {details.map(({ text }) => (
                                        <li key={text}>
                                            <i
                                                className={`${circle_arrow_right_mini} icon-xs color-primary-grey`}
                                            ></i>
                                            {text}
                                        </li>
                                    ))}
                                </ul>
                                <div className="text-center mb20">
                                    <RSPrimaryButton
                                        id="rs_Licensetype_Selectplan"
                                        type="submit"
                                        onClick={() => {
                                            dispatch(
                                                updateUserFormState({
                                                    licenseTypeId: licenseId,
                                                    isCancel: !isAgency,
                                                }),
                                            );
                                                                                        nextScreen(isAgency && companies !== 'companies'? 'BRAND_DETAILS' : 'KEY_INFO', 'brand');
                                            if (isAgency) setPages((prev) => [...prev, 'ACCOUNT_TYPE', 'KEY_INFO']);
                                        }}
                                    >
                                        {buttonText}
                                    </RSPrimaryButton>
                                </div>
                            </div>
                        </Col>
                    ))}
                </Row>
            </div>
            <div className={`buttons-holder mt0 backBtnTopPosition`}>
                {companies !== 'companies' && !isAgency && (
                    <RSSecondaryButton
                        onClick={() => {
                            if (companies) navigate(`/preferences/company-list`);
                            else back('ACCOUNT_TYPE');
                        }}
                        className={'color-primary-blue d-flex align-items-center'}
                    >
                        <i className={`${arrow_left_mini} icon-xs lh0`}></i>Back
                    </RSSecondaryButton>
                )}
            </div>
        </div>
    );
};

export default Licensetype;
