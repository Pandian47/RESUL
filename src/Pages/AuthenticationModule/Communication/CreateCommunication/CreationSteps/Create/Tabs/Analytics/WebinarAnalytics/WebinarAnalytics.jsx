import { encodeUrl } from 'Utils/modules/crypto';
import { CANCEL, IGNORE_CHANNEL, NEXT, OK, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { Col, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useNavigate } from 'react-router-dom';
import { resetCreateCommunication } from 'Reducers/communication/createCommunication/create/reducer';
import RSConfirmationModal from 'Components/ConfirmationModal';
import { useDispatch, useSelector } from 'react-redux';
import { useState } from 'react';
import useQueryParams from 'Hooks/useQueryParams';


const WebinarAnalytics = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const {
        tabsState: { analytics: tabAnalyticsState },
        isDirty,
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const state = useQueryParams('/communication');

    const methods = useForm({
        defaultValues: {
            platform: '',
            channel: '',
            url: '',
        },
    });
    const {
        control,
        watch,
        handleSubmit,
        formState: { errors, dirtyFields, isValid },
    } = methods;
    const [navigate_confirm, setNavigate_confirm] = useState(false);

    const handleNavigation = () => {
                if (state?.channels?.length === 1 && state?.channels?.includes(3)) {
            navigate('/communication', {
                replace: true,
                state: {
                    index: 0,
                },
            });
        } else {
            let url = '/communication/execute';
            const encryptState = encodeUrl(state);
            navigate(`${url}?q=${encryptState}`, {
                state,
            });
        }
    };
    const formSubmitHandler = (data, type) => {
        if (type === 'save') {
            dispatch(resetCreateCommunication());
            navigate('/communication', {
                index: 0,
            });
        } else {
            handleNavigation();
        }
    };
    return (
        <form onSubmit={handleSubmit((data) => formSubmitHandler(data, 'form'))}>
            <Row>
                <Col md={4}>
                    <label>WebinarAnalytics</label>
                </Col>
            </Row>

            <Row>
                <Col md={4}></Col>
                <Col>
                    <RSInput control={control} name={'url'} />
                </Col>
            </Row>
            <div className="button-wrapper">
                <RSSecondaryButton
                    onClick={() => {
                        dispatch(resetCreateCommunication());
                        navigate('/communication', {
                            replace: true,
                            state: {
                                index: 0,
                            },
                        });
                    }}
                >
                    {CANCEL}
                </RSSecondaryButton>
                <RSSecondaryButton
                    onClick={() => {
                        handleSubmit((data) => formSubmitHandler(data, 'save'))();
                    }}
                    className="color-primary-blue"
                >
                    {SAVE}
                </RSSecondaryButton>
                <RSPrimaryButton
                    onClick={() => {
                        if (!isDirty && !isValid) {
                            setNavigate_confirm(true);
                        } else {
                            handleSubmit((data) => formSubmitHandler(data, 'form', false))();
                        }
                    }}
                >
                    {NEXT}
                </RSPrimaryButton>
            </div>
            <RSConfirmationModal
                show={navigate_confirm}
                text={IGNORE_CHANNEL}
                primaryButtonText={OK}
                handleClose={() => {
                    setNavigate_confirm(false);
                }}
                handleConfirm={() => {
                    handleNavigation();
                    setNavigate_confirm(false);
                }}
            />
        </form>
    );
};

export default WebinarAnalytics;
