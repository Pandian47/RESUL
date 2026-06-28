import { AGE_TO_EQUALS, ENTER_CITY, SELECT_AGE_FROM, SELECT_AGE_TO, SELECT_COUNTRY } from 'Constants/GlobalConstant/ValidationMessage';
import { useEffect } from 'react';
import { Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Button, ButtonGroup } from '@progress/kendo-react-buttons';
import _isEmpty from 'lodash/isEmpty';

import RSKendoDropdown from 'Components/FormFields/RSKendoDropdown';

import { AGE_GROUP } from '../../constant';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { useDispatch, useSelector } from 'react-redux';
import { getFacebookCountries } from 'Reducers/communication/createCommunication/Create/request';

const BoostPost = ({ handleClose = () => {}, handleBoostPostSaved, isBoostPostSaved, boostPostAry }) => {
    const {
        socialMediaPost: { fbCountries, cityCountries },
    } = useSelector(({ createCommunicationReducer }) => createCommunicationReducer);
    const dispatch = useDispatch();

    const {
        control,
        setValue,
        getFieldState,
        trigger,
        getValues,
        watch,
        setError,
        clearErrors,
        handleSubmit,
        formState: { errors, isValid, isDirty },
    } = useForm();

    const gender = watch('boostPost.gender', 'All');

    const selectColor = (type) => (gender === type ? 'active' : '');

    const genderChangeHandler = (type) => setValue('boostPost.gender', type);

    const getCountriesList = () => {
        let payload = {
            departmentId: 1,
        };
        dispatch(getFacebookCountries(payload));
    };
    // useEffect(() => {
    //     getCountriesList();
    // }, []);
    useEffect(() => {
        if (isBoostPostSaved) {
            if (isBoostPostSaved && boostPostAry?.length) {
                let [country, ageFrom, ageTo, gender] = boostPostAry;

                setValue('boostPost.country', country);
                setValue('boostPost.ageFrom', ageFrom);
                setValue('boostPost.ageTo', ageTo);
                setValue('boostPost.gender', gender);
            }
        }

        if (boostPostAry?.length === 4) {
            clearErrors('boostPost', '');
        }
    }, [isBoostPostSaved, boostPostAry]);

    const handleCityChange = (eve) => {
        let {
            target: { value },
        } = eve;
        let payload = {
            countryId: value.fBCountryId + '',
        };
        // dispatch(getFacebookBasedCities(payload));
    };

    // const handlePopupClose = () => {
    //     const findErrorIndex = getErrorIndex();

    //     const isSaved = getValues('boostPost.isSaved');
    //
    //     if (findErrorIndex === -1 && isSaved) handleClose();
    //     else handleClose(false);
    // };

    // const getErrorIndex = () => {
    //     const passwordFieldState = [
    //         getFieldState('boostPost.country', formState),
    //         getFieldState('boostPost.city', formState),
    //         getFieldState('boostPost.ageFrom', formState),
    //         getFieldState('boostPost.ageTo', formState),
    //     ];
    //     const findErrorIndex = _findIndex(
    //         passwordFieldState,
    //         ({ invalid, isDirty, error }) => !(!invalid && isDirty && !error),
    //     );
    //     return findErrorIndex;
    // };

    const handleSaveData = (data) => {
        let checkError = _isEmpty(errors);
        const passwordFieldState = [
            getValues('boostPost.country'),
            getValues('boostPost.ageFrom'),
            getValues('boostPost.ageTo'),
            getValues('boostPost.gender') ?? 'All',
        ];
        if (checkError) {
            handleBoostPostSaved(passwordFieldState);
            handleClose();
        }
        if (boostPostAry?.length === 4) {
            clearErrors('boostPost', '');
        }
    };
    const ageFromValue = watch('boostPost.ageFrom');
    const ageToValue = watch('boostPost.ageTo');

    const filteredAgeFrom = AGE_GROUP?.filter((age) => {
        return !ageToValue || Number(age) < Number(ageToValue);
    });

    const filteredAgeTo = AGE_GROUP?.filter((age) => {
        return !ageFromValue || Number(age) > Number(ageFromValue);
    });
    return (
        <>
            <div className="rs-boost-post-dd-wrapper">
                {/* <div className="rs-overlay-wrapper"></div> */}

                <div className="form-group mt5">
                    <Row>
                        <Col sm={12}>
                            <RSKendoDropdown
                                control={control}
                                name={'boostPost.country'}
                                data={fbCountries}
                                dataItemKey={'fBCountryId'}
                                textField="fBCountryName"
                                label="Country"
                                required
                                rules={{
                                    required: SELECT_COUNTRY,
                                    validate: (value) => {
                                        return !value ? SELECT_COUNTRY : true;
                                    },
                                }}
                                // handleChange={handleCityChange}
                            />
                        </Col>
                    </Row>
                </div>
                {/* <div className="form-group">
                    <Row>
                        <Col sm={12}>
                            <RSKendoDropdown
                                control={control}
                                name={'boostPost.city'}
                                data={cityCountries}
                                dataItemKey={'fBCityKey'}
                                textField="fBCityName"
                                label="City"
                                disabled={cityCountries?.length === 0}
                                required
                                rules={{
                                    required: ENTER_CITY,
                                }}
                            />
                        </Col>
                    </Row>
                </div> */}
                <div className="form-group">
                    <Row>
                        <Col sm={6}>
                            <RSKendoDropdown
                                control={control}
                                name={'boostPost.ageFrom'}
                                data={filteredAgeFrom}
                                label="Age from"
                                required
                                rules={{
                                    required: SELECT_AGE_FROM,
                                    validate: (value) => {
                                        return !value ? SELECT_AGE_FROM : true;
                                    },
                                }}
                            />
                        </Col>
                        <Col sm={6}>
                            <RSKendoDropdown
                                control={control}
                                name={'boostPost.ageTo'}
                                data={filteredAgeTo}
                                label="Age to"
                                required
                                rules={{
                                    required: SELECT_AGE_TO,
                                    validate: (value) => {
                                        const ageFrom = getValues('boostPost.ageFrom');
                                        return !value
                                            ? SELECT_AGE_FROM
                                            : Number(value) <= ageFrom
                                            ? AGE_TO_EQUALS
                                            : true;
                                    },
                                }}
                            />
                        </Col>
                    </Row>
                </div>
                <div className="form-group mb0">
                    <Row>
                        <Col sm={12}>
                            <label className="mr10">Gender</label>
                            <div className="button-radio-group">
                                <ButtonGroup>
                                    <Button
                                        className={`${selectColor('All')}`}
                                        onClick={(e) => genderChangeHandler('All')}
                                    >
                                        All
                                    </Button>
                                    <Button
                                        className={`${selectColor('Male')}`}
                                        onClick={() => genderChangeHandler('Male')}
                                    >
                                        Male
                                    </Button>
                                    <Button
                                        className={`${selectColor('Female')}`}
                                        onClick={() => genderChangeHandler('Female')}
                                    >
                                        Female
                                    </Button>
                                </ButtonGroup>
                            </div>
                        </Col>
                    </Row>
                </div>
                <div className="rsmdc-footer modal-footer">
                    <RSSecondaryButton onClick={() => handleClose()}>Cancel</RSSecondaryButton>
                    <RSPrimaryButton
                        onClick={(data) => {
                            handleSubmit((data) => handleSaveData(data))();
                        }}
                    >
                        Save
                    </RSPrimaryButton>
                </div>
            </div>
        </>
    );
};

export default BoostPost;
