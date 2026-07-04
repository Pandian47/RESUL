import { truncateTitle } from 'Utils/modules/displayCore';
import { numberWithCommas } from 'Utils/modules/formatters';
import { pencil_edit_medium } from 'Constants/GlobalConstant/Glyphicons';
import {getKeyByValue} from 'Utils/index'
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { Col } from 'react-bootstrap';
import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import RSTooltip from 'Components/RSTooltip';
import { useNavigate } from 'react-router-dom';
import { getSessionId } from 'Reducers/globalState/selector';
import { useDispatch, useSelector } from 'react-redux';
import { getPersonabyId } from 'Reducers/preferences/audienceScore/request';
import { asAudienceScoreObject } from '../../Pages/Components/constants';

const PersonaCard = ({ list, setIsShowPersona, grade }) => {
    const safeGrade = asAudienceScoreObject(grade);
    const gradeOptions = Object.keys(safeGrade);
    const personaRules = Array.isArray(list?.personaRule) ? list.personaRule : [];
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const navigate = useNavigate();
    const {
        control,
        formState: { errors },
    } = useFormContext();
    const dispatch = useDispatch();
    const [isEditLoading, setIsEditLoading] = useState(false);

    const EditPersonaRule = async (id) => {
        if (isEditLoading || !id) {
            return;
        }
        setIsEditLoading(true);
        try {
            const payload = {
                clientId,
                departmentId,
                userId,
                personaId: id,
            };
            const res = await dispatch(getPersonabyId(payload));
            if (res?.status) {
                setIsShowPersona(true);
                navigate(`.`, {
                    state: {
                        mode: 'edit',
                        personaListID: list.personaId,
                    },
                });
            }
        } finally {
            setIsEditLoading(false);
        }
    };
    return (
        <>
            <Col sm={6}>
                <div className="box-design p10 mb30 no-box-shadow">
                    <div className="pref-as-card-wrapper">
                        <div className="pacr-row pacrw-heading">
                            <div className="pacr-column">{list?.personaName ?? ''}</div>
                            <div className="pacr-column flex-right">
                                <div className="width100p">
                                    <RSKendoDropDownList
                                        control={control}
                                        name={`priority_` + list?.personaId}
                                        data={gradeOptions}
                                        defaultValue={
                                            getKeyByValue(safeGrade, list?.personaGradeId) || gradeOptions[0]
                                        }
                                    />
                                </div>
                                <div className="ml15 top5 position-relative">
                                    {isEditLoading ? (
                                        <div className="segment_loader" />
                                    ) : (
                                        <RSTooltip text="Edit" position="top">
                                            <i
                                                id="rs_data_pencil_edit"
                                                className={`${pencil_edit_medium} icon-md color-primary-blue cp`}
                                                onClick={() => {
                                                    EditPersonaRule(list?.personaId);
                                                }}
                                            />
                                        </RSTooltip>
                                    )}
                                </div>
                            </div>
                        </div>
                        {personaRules.map((persona, personaIndex) => {
                            return (
                                <div key={personaIndex} className="pacr-row pacrw-content">
                                    <div className="pacr-column">{persona?.FieldName}</div>
                                    {/* <div className="pacr-column">{persona?.Value.join(', ')}</div> */}
                                    <div className="pacr-column">
                                        {(() => {
                                            let displayValue = '';
                                            if (persona?.ConditionOperator === 'between') {
                                                const [start, end] = persona?.Value.split(':');
                                                displayValue = `${numberWithCommas(start)} to ${numberWithCommas(end)}`;
                                            } else if (persona?.FieldTypeID === '4') {
                                                displayValue = numberWithCommas(persona?.Value);
                                            } else {
                                                displayValue = persona?.Value;
                                            }

                                            return displayValue?.length > 15 ? (
                                                <RSTooltip
                                                    text={displayValue}
                                                    position="top"
                                                    className="d-inline-block"
                                                >
                                                    <span className="m0">{truncateTitle(displayValue, 15)}</span>
                                                </RSTooltip>
                                            ) : (
                                                displayValue
                                            );
                                        })()}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </Col>
        </>
    );
};

export default PersonaCard;
