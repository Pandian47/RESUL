import { CREDIT_CARD_PAYMENT } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ResulPay from 'Assets/Images/logos/resulpay.svg';
import RSModal from 'Components/RSModal';
import { useDispatch } from 'react-redux';
import { paymentSubmit } from 'Reducers/login/payment/request';
import useQueryParams from 'Hooks/useQueryParams';
const CreditCard = () => {
    const [isPay, setIsPay] = useState(false);
    const [tempNavigation, settempNavigation] = useState('');
    const [message, setMessage] = useState('No data received from IFrame, yet.');
    const [transactionId, settransactionId] = useState(0);
    
    const { control } = useForm();
    const ref = useRef(null);
    const navigate = useNavigate();
    const dispatch = useDispatch();
    // const { state } = useLocation();
    const state = useQueryParams('/payment');
    useEffect(() => {
        const fromCompanies = state?.from ?? '';
        const productName = 'R$';
        const tenantShortCode = state?.tenantShortCode + '$';
        const clientName = btoa(state?.clientName) + '$'; // name have to check
        const uniqueToken = 'hsb+CPOoBiWd2QcIBuXDsVvrWhX87hIETRDpYdd555c=';
        const tempURL = location.origin;
        const orderId = state?.orderId;
        const desc = 'licensePayment';
        let finalAmount =
            localStorage.getItem('final')?.length !== undefined && localStorage.getItem('final')?.length !== null
                ? localStorage.getItem('final')
                : state?.amount;
        let redirectionURL =
            tempURL +
            '/setup-complete?customparams=platform-marketing;name-vignesh&orderId=' +
            orderId +
            '&description=' +
            desc;
        if (finalAmount !== undefined)
            settempNavigation(
                'https://pay.resul.io/payment?amount=' +
                    finalAmount +
                    '&token=' +
                    productName +
                    tenantShortCode +
                    clientName +
                    uniqueToken +
                    '&redirecturl=' +
                    redirectionURL,
            );
    }, [state]);

    // console.log('state:asd:', state);

    // console.log('tempNavigation: ', tempNavigation);
    const handleClosePay = () => {
        setIsPay(false);
    };
    useEffect(() => {
        if (message.toLowerCase().startsWith('c')) {
            setIsPay(false);
        } else if (message.toLowerCase().startsWith('s')) {
            const payloads = {
                clientId: state?.clientId,
                orderId: state?.orderId,
                userId: state?.userId,
                clientName: state?.clientName,
                authorizationCode: transactionId,
                paymentMode: 1,
            };
                        dispatch(paymentSubmit({ payloads, navigate, from: state?.from }));
            // navigate('/setup-complete', { state: { status: 'success', isPayment: true } });
        } else if (message.toLowerCase().startsWith('f')) {
            navigate('/setup-complete', { state: { status: 'failure', isPayment: true } });
        } else {
            setIsPay(false);
        }
    }, [message]);
    useEffect(function () {
        var handler = function (ev) {
                        if (typeof ev?.data !== 'object' || ev?.data == null) return;
            if (!ev?.data?.type) return;
            if (ev?.data?.type !== 'button-click') return;
            if (!ev?.data?.message) return;
            setMessage(ev?.data?.message);
            if (ev?.data?.message?.toLowerCase()?.startsWith('c')) {
                setIsPay(false);
            } else if (ev?.data?.message?.toLowerCase()?.startsWith('s')) {
                settransactionId(ev?.data?.transactionId);
                let tempState = useQueryParams('/payment');
                                const payloads = {
                    clientId: state?.clientId,
                    orderId: state?.orderId,
                    userId: state?.userId,
                    clientName: state?.clientName,
                    authorizationCode: ev?.data?.transactionId,
                    paymentMode: 1,
                };

                //  dispatch(paymentSubmit({ payloads, navigate, from: state?.from }));
                // navigate('/setup-complete', { state: { status: 'success', isPayment: true } });
            } else if (ev?.data?.message?.toLowerCase()?.startsWith('f')) {
                navigate('/setup-complete', { state: { status: 'failure', isPayment: true } });
            } else {
                setIsPay(false);
            }
        };
        window.addEventListener('message', handler);
        // setIsPay(true);
        // Clean up
        return function () {
            return window.removeEventListener('message', handler);
        }; // The "message" param should match with the iframe.js file
    }, []);
        return (
        <div className="creditcard_container">
            <Row>
                <Col sm={12}>
                    <p>
                    {CREDIT_CARD_PAYMENT}
                    </p>
                </Col>
                <Col sm={12} className="mt20 text-right">
                    <img
                        onClick={() => {
                            setIsPay(true);
                            // window.location.href = tempNavigation;
                            //  'https://pay.resul.io/payment?amount=500&token=RKHAhsb+CPOoBiWd2QcIBuXDsVvrWhX87hIETRDpYdd555c=&redirecturl=http://127.0.0.1:4000/setup-complete?customparams=platform-marketing;name-vignesh&orderId=ORDR1011&description=campaignpayment';
                        }}
                        src={ResulPay}
                        alt={'Paypal checkout'}
                        className="rs-payment-logo cp"
                    />
                </Col>
            </Row>
            <RSModal
                show={isPay}
                //  show={false}
                className='p0 mo overflow-hidden'
                handleClose={handleClosePay}
                header={false}
                fullscreen={true}
                body={
                    <Fragment>
                        {tempNavigation !== '' && (
                            <iframe
                                id="my-iframe"
                                ref={ref}
                                name="myFrame"
                                src={tempNavigation}
                                width="100%"
                                // height="100%"
                                style={{height: '100vh'}}
                            ></iframe>
                        )}
                    </Fragment>
                }
            />
            {/* <div className="form-group mb35">
                <div className="rs-input-with-image-right">
                    <img src={picture.VisaLogo} alt={'Paypal checkout'} className="rs-paypal-logo" />
                    <RSInput
                        type={'text'}
                        name={'cardnumber'}
                        control={control}
                        required
                        // iconPlaceholder
                        // iconName={icons.circle_dropdown_large}
                        maxLength={19}
                        placeholder={'Card number (XXXX - XXXX - XXXX - 1234)'}
                        //  label={'Card number'}
                        handleOnchange={(e) => {
                            let cardValue = e.target.value;
                            if (cardValue?.length > 19) {
                                return;
                            }
                            if (cardValue?.length === 19) {
                                let some = cardValue;
                                let arry = [0, 1, 2, 3, 5, 6, 7, 8, 10, 11, 12, 13];
                                arry.map((item) => {
                                    some = some.replace(/./g, (c, i) => (i == item ? 'X' : c));
                                });

                                let _cardOriginalNumber = cardValue;
                                _cardOriginalNumber = _cardOriginalNumber.replaceAll('-', '');
                            }
                        }}
                    />
                </div>
            </div>
            <div className="form-group mb35">
                <RSInput
                    type={'text'}
                    name={'cardName'}
                    control={control}
                    required
                    iconPlaceholder
                    iconName={icons.lock_large}
                    placeholder={'Name on card'}
                />
            </div>
            <div className="form-group mb0">
                <Row>
                    <Col sm={7}>
                        <ul className="flex-list fl-space-15">
                            <li>
                                <div className="month ">
                                    <RSKendoDropDownList
                                        name={'month'}
                                        data={MM_LIST}
                                        control={control}
                                        label={'Month'}
                                        required
                                        rules={{
                                            required: '-- Select --',
                                        }}
                                    />
                                </div>
                            </li>
                            <li>
                                <div className="slash">/</div>
                            </li>
                            <li>
                                <div className="year">
                                    <RSKendoDropDownList
                                        name={'year'}
                                        data={YEAR_LIST(10)}
                                        control={control}
                                        label={'Year'}
                                        required
                                        rules={{
                                            required: '-- Select --',
                                        }}
                                    />
                                </div>
                            </li>
                        </ul>
                    </Col>
                    <Col sm={5} className="flex-right">
                        <div className="cvv">
                            <RSInput
                                type="password"
                                name={'cvv'}
                                control={control}
                                required
                                placeholder={'CVV'}
                                maxLength={3}
                                pattern="[0-1]{0,9}"
                                iconPlaceholder
                                iconName={icons.users_large}
                            />
                        </div>
                    </Col>
                </Row>
            </div> */}
        </div>
    );
};

export default CreditCard;
