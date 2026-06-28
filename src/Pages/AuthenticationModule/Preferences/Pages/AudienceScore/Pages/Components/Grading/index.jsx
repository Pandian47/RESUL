import { onlyNumbersDecimalWithoutSpecialCharacters } from 'Utils/modules/inputValidators';
import { ENTER_VALID_DATA } from 'Constants/GlobalConstant/ValidationMessage';
import { Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';
import RSInput from 'Components/FormFields/RSInput';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import { GRADE } from '../constants';

import { audienceScorevalidateScoreGrade, audienceScorevalidateScoreGradeRange } from 'Utils/HookFormValidate';

const Grading = () => {
    const {
        control,
        getValues,
        formState: { errors },
    } = useFormContext();

    return (
        <Col sm={6}>
            <div className="pref-as-card-wrapper flex-row justify-content-between">
                <div className="pacr-row pacrw-heading">
                    <div className="pacr-column">Grading</div>
                    <div className="pacr-column flex-right">
                        <RSInput control={control} name={`Grading`} defaultValue={'140'} />
                    </div>
                </div>
            </div>
            <div className="box-design p10 mb30 no-box-shadow">
                <div className="pref-as-card-wrapper">
                    <div className="pacr-row pacrw-heading">
                        <div className="pacr-column">Total score</div>
                        <div className="pacr-column flex-right">
                            <div>Grade</div>
                            <div className="ml15 top5 position-relative"></div>
                        </div>
                    </div>
                    {errors?.gradingScores?.Above?.message && (
                        <p className="text-danger text-right">Grades are not in ascending order</p>
                    )}
                    <div className="pacr-row pacrw-content">
                        <div className="pacr-column d-flex align-items-center">
                            <div className="pacr-column pr15 width30p">Above</div>
                            <div className="pacr-column pl15">
                                {' '}
                                <RSInput
                                    rules={{
                                        required: ENTER_VALID_DATA,
                                    }}
                                    control={control}
                                    name={'gradingValue.Above'}
                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                />
                            </div>
                        </div>
                        <div className="pacr-column">
                            <RSKendoDropDownList
                                isError={!errors?.gradingScores?.Above?.message}
                                control={control}
                                name="gradingScores.Above"
                                data={GRADE}
                                onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                defaultValue={GRADE[0]}
                                rules={{
                                    required: ENTER_VALID_DATA,
                                    validate: (value) => audienceScorevalidateScoreGrade(value, getValues),
                                }}
                            />
                        </div>
                    </div>

                    <div className="pacr-row pacrw-content">
                        <div className="pacr-column d-flex align-items-center">
                            <div className="pacr-column pr15 width30p">
                                <RSInput
                                    rules={{
                                        required: ENTER_VALID_DATA,
                                        validate: (value) =>
                                            audienceScorevalidateScoreGradeRange(value, getValues, 'FromOne'),
                                    }}
                                    control={control}
                                    name={`gradingValue.FromOne`}
                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                />
                            </div>
                            <div className="pacr-column pl15">
                                <RSInput
                                    rules={{
                                        required: ENTER_VALID_DATA,
                                        validate: (value) =>
                                            audienceScorevalidateScoreGradeRange(value, getValues, 'ToOne'),
                                    }}
                                    control={control}
                                    name={`gradingValue.ToOne`}
                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                />
                            </div>
                        </div>
                        <div className="pacr-column">
                            <RSKendoDropDownList
                                isError={!errors?.gradingScores?.Above?.message}
                                control={control}
                                name="gradingScores.ScoreOne"
                                data={GRADE}
                                // label="Priority"
                                defaultValue={GRADE[0]}
                                rules={{
                                    required: ENTER_VALID_DATA,
                                    validate: (value) => audienceScorevalidateScoreGrade(value, getValues),
                                }}
                            />
                        </div>
                    </div>
                    <div className="pacr-row pacrw-content">
                        <div className="pacr-column d-flex align-items-center">
                            <div className="pacr-column pr15 width30p">
                                <RSInput
                                    control={control}
                                    rules={{
                                        required: ENTER_VALID_DATA,
                                        validate: (value) =>
                                            audienceScorevalidateScoreGradeRange(value, getValues, 'FromTwo'),
                                    }}
                                    name={`gradingValue.FromTwo`}
                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                />
                            </div>
                            <div className="pacr-column pl15">
                                <RSInput
                                    rules={{
                                        required: ENTER_VALID_DATA,
                                        validate: (value) =>
                                            audienceScorevalidateScoreGradeRange(value, getValues, 'ToTwo'),
                                    }}
                                    control={control}
                                    name={`gradingValue.ToTwo`}
                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                />
                            </div>
                        </div>
                        <div className="pacr-column">
                            <RSKendoDropDownList
                                isError={!errors?.gradingScores?.Above?.message}
                                control={control}
                                rules={{
                                    required: ENTER_VALID_DATA,
                                    validate: (value) => audienceScorevalidateScoreGrade(value, getValues),
                                }}
                                name="gradingScores.ScoreTwo"
                                data={GRADE}
                                // label="Priority"
                                defaultValue={GRADE[0]}
                            />
                        </div>
                    </div>
                    <div className="pacr-row pacrw-content">
                        <div className="pacr-column d-flex align-items-center">
                            <div className="pacr-column pr15 width30p"> Below</div>
                            <div className="pacr-column pl15">
                                {' '}
                                <RSInput
                                    control={control}
                                    rules={{
                                        required: ENTER_VALID_DATA,
                                    }}
                                    name={'gradingValue.Below'}
                                    onKeyDown={onlyNumbersDecimalWithoutSpecialCharacters}
                                />
                            </div>
                        </div>
                        <div className="pacr-column">
                            <RSKendoDropDownList
                                isError={!errors?.gradingScores?.Above?.message}
                                control={control}
                                rules={{
                                    required: ENTER_VALID_DATA,
                                    validate: (value) => audienceScorevalidateScoreGrade(value, getValues),
                                }}
                                name="gradingScores.Below"
                                data={GRADE}
                                defaultValue={GRADE[0]}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </Col>
    );
};

export default Grading;
