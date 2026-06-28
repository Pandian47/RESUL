import { AMOUNT, AMOUNT_PAYABLE, CANCEL, CONFIRM, DISCOUNT, PAYMENT_FREQUENCY as PAYMENT_FREQUENCY_PH, PAYMENT_METHOD, PRICE_MONTH, SUB_TYPE, USD } from 'Constants/GlobalConstant/Placeholders';
import { credit_card_large, invoices_large, restart_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useEffect, useState } from 'react';
import _get from 'lodash/get';
import { Container, Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useForm } from 'react-hook-form';

import RSPageHeader from 'Components/RSPageHeader';
import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';
import RSRadioButton from 'Components/FormFields/RSRadioButton';
import { numberWithCommasformatCurrency, paymentCommitmentEnum } from 'Utils/modules/formatters';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { confirmAuthorizationCode, get_amountEncrypted, paymentSubmit } from 'Reducers/login/payment/request';
import { resetLoginFormState } from 'Reducers/login/existingUser/reducer';

import { PAYMENT_FREQUENCY, getFrequecy } from './constant';
import CreditCard from './Tabs/CreditCard';
import InvoicePay from './Tabs/InvoicePayLater';
import Paypal from './Tabs/Paypal';
import useQueryParams from 'Hooks/useQueryParams';
import useApiLoader, { LOADER_TYPE } from 'Hooks/useApiLoader';
import RSTooltip from 'Components/RSTooltip';
import { upgradeAccount } from 'Reducers/preferences/Licence/request';

let frequencyId = '';
const Payment = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const confirmLoader = useApiLoader({ autoFetch: false });
    // const { state } = useLocation();
    const state = useQueryParams('/payment') || {};
    const { ispaymentEnable, authKey } = useSelector(({ loginReducer }) => loginReducer);

    const { control, watch, setValue, reset } = useForm({ defaultValues: { paymentControl: '' } });
    const paymentControl = watch('paymentControl');
    const isInvoice = paymentControl === 'Pay later' || false;

    const [amount, setAmount] = useState(0);
    const [damount, setDAmount] = useState(0);
    const [total, setTotal] = useState(0);
    let fromCompanies = '';

    const licenceType = _get(state, 'licenseTypeID', '1');
    const frequencyValue = _get(state, 'frequencyId', 1);
    let frequencyValueNumber = 0;
    useEffect(() => {
        fromCompanies = state?.from; //_get(state, 'from', '');
        // if (!state) navigate('/');
    }, [state]);
    // state?.licenseTypeID = 3;
        let subscriptionPriceValue = state?.monthlyCharge,
        subscriptionName =
            parseInt(licenceType, 10) === 1 ? 'Startup' : parseInt(licenceType, 10) === 2 ? 'Pro' : 'Enterprise',
        subscriptionDiscountValue = 0; //state?.discountCode;

    if (parseInt(frequencyValue, 10) === 1) {
        frequencyId = 'Monthly(1x)';
        frequencyValueNumber = 1;
    } else if (parseInt(frequencyValue, 10) === 2) {
        frequencyId = 'Quarterly(3x)';
        frequencyValueNumber = 3;
    } else if (parseInt(frequencyValue, 10) === 3) {
        frequencyId = 'Half-yearly(6x)';
        frequencyValueNumber = 6;
    } else {
        frequencyId = 'Annually(12x)';
        frequencyValueNumber = 12;
    }
    useEffect(() => {
        if (frequencyId !== 0) {
            setAmount(parseFloat(state?.monthlyCharge) * parseInt(frequencyValueNumber, 10));
            setTotal(parseFloat(state?.monthlyCharge) * parseInt(frequencyValueNumber, 10));
            reset((formState) => ({ ...formState, paymentFrequency: frequencyId }));
        }
    }, [frequencyId, state]);
    // console.log('frequencyId: ', frequencyId);
    // const HANDLE_DISCOUNT = (value, amount) => {
    //     let a = value / 100;
    //     let final = a * amount;
    //     setDAmount(final);
    //     let b = amount - final;
    //     setTotal(b);
    // };

    const handledropdown = ({ target: { value } }) => {
        let payFreValue = getFrequecy(value, subscriptionPriceValue);
        if (subscriptionDiscountValue > 0) {
            subscriptionDiscountValue = parseFloat(subscriptionDiscountValue) / 100;
            subscriptionDiscountValue = subscriptionDiscountValue * payFreValue;
            let final = payFreValue - subscriptionDiscountValue;
            const payload = {
                encrypvalue: final.toString(),
            };
            dispatch(get_amountEncrypted({ payload, loading: false }));
            setDAmount(subscriptionDiscountValue);
            setTotal(final);
        } else {
            let final = payFreValue - subscriptionDiscountValue;
            const payload = {
                encrypvalue: final.toString(),
            };
            dispatch(get_amountEncrypted({ payload, loading: false }));
            setDAmount(subscriptionDiscountValue);
            setTotal(final);
        }
        setAmount(payFreValue);
    };

    let discountCode = state?.discountCode ? state?.discountCode : 0;

    const confirmAuthorization = () => {
        if (confirmLoader.isLoading) return;

        confirmLoader.refetch({
            fetcher: async () => {
                const payload = {
                    clientId: state?.clientId,
                    authKey: authKey,
                    userId: state?.userId,
                    clientName: state?.clientName,
                    licenseTypeID: licenceType,
                    orderId: state?.orderId,
                    paymentMode: 3,
                };
                const res = await dispatch(
                    confirmAuthorizationCode({
                        payload,
                        navigate,
                        from: state?.from,
                        isInvoice,
                        loading: false,
                    }),
                );
                if (!res?.status) return res;

                const payloads = {
                    clientId: payload?.clientId,
                    orderId: payload?.orderId,
                    userId: payload?.userId,
                    authorizationCode: payload?.authKey,
                    paymentMode: payload?.paymentMode,
                };
                const paymentRes = await dispatch(
                    paymentSubmit({
                        payloads,
                        navigate,
                        from: state?.from,
                        isInvoice,
                        fromClientUpgrade: state?.fromClientUpgrade,
                        loading: false,
                    }),
                );
                if (paymentRes?.status && state?.fromClientUpgrade) {
                    const upgradeRes = await dispatch(
                        upgradeAccount({ payload: state?.upgradePayload, loading: false }),
                    );
                    if (upgradeRes?.status) {
                        navigate('/setup-complete', {
                            state: {
                                status: 'success',
                                isLicense: false,
                                from: state?.from,
                                isInvoice: false,
                                fromClientUpgrade: state?.fromClientUpgrade,
                            },
                        });
                    }
                    return upgradeRes;
                }
                return paymentRes;
            },
            mode: 'create',
            loaderConfig: { create: LOADER_TYPE.FIELD, edit: LOADER_TYPE.FIELD },
        });
    };
    return (
        // Contend holder starts
        <div className="page-content-holder">
            {/* Main page heading block starts */}
            <RSPageHeader title="Payment & activation" />
            {/* Main page heading block ends */}
            {/* Main page content block starts */}
            <Container fluid>
                <div className="page-content">
                    <Container className="px0">
                        <Row>
                            <Col sm={6}>
                                <div className="box-design rs-payment-left-box">
                                    <div className="px10">
                                        <Row>
                                            <Col sm={7}>
                                                <h4 className="mb17">{SUB_TYPE}</h4>
                                                <h5>
                                                    {/* {subscriptionName} ({frequencyId.split('(')[0]} commitment) */}
                                                    {subscriptionName} ({paymentCommitmentEnum(state?.commitment || 1)}
                                                    {state?.commitment > 1 && <> year(s) </>}
                                                    commitment)
                                                </h5>
                                            </Col>
                                            <Col sm={5} className="text-right">
                                                <h4 className="mb17">
                                                    {PRICE_MONTH} {USD}
                                                </h4>
                                                <h5>{numberWithCommasformatCurrency(state?.monthlyCharge)}</h5>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="seperator"></div>
                                    <div className="px10">
                                        <Row>
                                            <Col sm={6}>
                                                <h4 className="mb10">{PAYMENT_FREQUENCY_PH}</h4>
                                                <RSKendoDropdown
                                                    control={control}
                                                    name={'paymentFrequency'}
                                                    data={PAYMENT_FREQUENCY}
                                                    disabled
                                                    //  defaultValue={'Select'}
                                                    defaultValue={frequencyId}
                                                    handleChange={(e) => handledropdown(e)}
                                                />
                                            </Col>
                                            <Col sm={6} className="text-right">
                                                <h4 className="mb15">
                                                    {AMOUNT} {USD}
                                                </h4>
                                                <h5 className="mb20">{numberWithCommasformatCurrency(amount)}</h5>
                                                {/* <h5 className="mb20">{numberWithCommasformatCurrency(state?.monthlyCharge)}</h5> */}
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="px10">
                                        <Row>
                                            <Col sm="9" className="text-right">
                                                <h4 className="mb0">
                                                    {DISCOUNT} ({discountCode})
                                                    {/* <div>
                                            <span>Discount</span> <span>(</span>
                                            <RSInput
                                                className="text-center w-25"
                                                name="discountValue"
                                                control={control}
                                                type="text"
                                                maxLength={5}
                                                placeholder="Discount %"
                                                onKeyDown={(e) => onlyNumbers(e)}
                                                handleOnchange={(e) => {
                                                    if (parseInt(e.target.value, 10) < 75) {
                                                        setDiscount(
                                                            e.target.value.replace(
                                                                /(\.\d\d)\d+|([\d.]*)[^\d.]/,
                                                                '$1$2',
                                                            ),
                                                        );
                                                        HANDLE_DISCOUNT(e.target.value, amount);
                                                    }
                                                }}
                                            />
                                            <span>)</span>
                                        </div> */}
                                                </h4>
                                            </Col>
                                            <Col sm="3" className="text-right">
                                                <h5 className="discount-num">
                                                    -{numberWithCommasformatCurrency(damount)}
                                                </h5>
                                            </Col>
                                        </Row>
                                    </div>
                                    <div className="amount-payable-block">
                                        <Row>
                                            <Col sm="9" className="text-right pr0">
                                                <h4 className="mb0">{AMOUNT_PAYABLE}</h4>
                                            </Col>
                                            <Col sm="3" className="text-right pl0">
                                                <h4 className="mb0">{numberWithCommasformatCurrency(total)}</h4>
                                                {/* <h4 className="mb0">{numberWithCommasformatCurrency(state?.monthlyCharge)}</h4> */}
                                            </Col>
                                        </Row>
                                    </div>
                                </div>
                            </Col>
                            <Col sm={6}>
                                <div className="box-design rs-payment-right-box">
                                    <div className="px10 mb24">
                                        <h4 className="mb5">{PAYMENT_METHOD}</h4>
                                        <ul className="flex-list gap-4">
                                            <li>
                                                <RSRadioButton
                                                    control={control}
                                                    name={`paymentControl`}
                                                    defaultValue={paymentControl}
                                                    labelName={'Credit card'}
                                                    labelIconContainer
                                                    disabled={paymentControl === 'Pay later'}
                                                    labelIcon={`${credit_card_large} icon-lg position-relative top7 right5 ml5`}
                                                />
                                            </li>
                                            {/* <li>
                                        {' '}
                                        <RSRadioButton
                                            control={control}
                                            defaultValue={paymentControl}
                                            name={`paymentControl`}
                                            labelName={'Paypal'}
                                            labelIconContainer
                                            // disabled
                                            labelIcon={`${icons.paypal_large} icon-lg`}
                                        />
                                    </li> */}

                                            <li>
                                                <RSRadioButton
                                                    control={control}
                                                    defaultValue={paymentControl}
                                                    name={`paymentControl`}
                                                    labelName={'Pay later'}
                                                    disabled={paymentControl === 'Credit card'}
                                                    labelIconContainer
                                                    labelIcon={`${invoices_large} icon-lg position-relative top7`}
                                                />
                                            </li>
                                            {paymentControl && (
                                                <li className="mb-5">
                                                    <RSTooltip text={'Reset'} className="lh0" position="top">
                                                        <i
                                                            id="rs_data_refresh"
                                                            //${!paymentControl ? 'click-off' : ''}
                                                            className={`${restart_medium} icon-md color-primary-blue`}
                                                            onClick={() => {
                                                                setValue('paymentControl', '');
                                                            }}
                                                        />
                                                    </RSTooltip>
                                                </li>
                                            )}
                                        </ul>
                                    </div>
                                    {paymentControl && <div className="seperator"></div>}
                                    <div className="px10">
                                        {paymentControl === 'Credit card' && <CreditCard />}
                                        {paymentControl === 'Paypal' && <Paypal />}
                                        {paymentControl === 'Pay later' && (
                                            <InvoicePay
                                                clientId={state?.clientId}
                                                userId={state?.userId}
                                                clientName={state?.clientName}
                                                licenseTypeID={licenceType}
                                                invoiceID={state?.invoiceID}
                                                handleCancel={() => {
                                                    setValue('paymentControl', '');
                                                }}
                                                isInvoicePayLater={isInvoice}
                                            />
                                        )}
                                    </div>
                                </div>
                            </Col>

                            {/* {(paymentControl === 'Credit card' || paymentControl === 'Invoice') && ( */}
                            <div className={`buttons-holder ${ispaymentEnable ? ' ' : 'ml7'}`}>
                                <RSSecondaryButton
                                    onClick={() => {
                                        if (state?.from === 'companies') navigate('/preferences/company-list');
                                        else if (state?.fromClientUpgrade) navigate('/preferences/license-info')
                                        else {
                                            dispatch(resetLoginFormState());
                                            navigate('/');
                                        }
                                    }}
                                >
                                    {CANCEL}
                                </RSSecondaryButton>
                                {ispaymentEnable && (
                                    <RSPrimaryButton
                                        type="submit"
                                        onClick={() => confirmAuthorization()}
                                        className={`${ispaymentEnable ? '' : 'click-off'}`}
                                        isLoading={confirmLoader.isLoading}
                                        blockBodyPointerEvents={confirmLoader.isLoading}
                                    >
                                        {CONFIRM}
                                    </RSPrimaryButton>
                                )}
                            </div>
                            {/* )} */}
                        </Row>
                    </Container>
                </div>
            </Container>
            {/* Main page content block ends */}
        </div>
        // Content holder ends
    );
};

export default Payment;
