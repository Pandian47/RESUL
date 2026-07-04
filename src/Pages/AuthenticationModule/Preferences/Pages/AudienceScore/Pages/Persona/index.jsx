import { CANCEL, NEXT, PERSONAS, SAVE } from 'Constants/GlobalConstant/Placeholders';
import { circle_plus_fill_edge_medium } from 'Constants/GlobalConstant/Glyphicons';
import { useCallback, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import RSTooltip from 'Components/RSTooltip';
import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
import { AudienceScoreTabContentSkeletonGate } from 'Components/Skeleton/Components/PreferencesSubPageRouteSkeleton';
import useApiLoader from 'Hooks/useApiLoader';
import { FIELD_BOTH_LOADER_CONFIG as fieldLoaderConfig } from 'Hooks/loaderTypes';

import PersonaCard from '../../Component/PersonaCard';
import PersonaModal from './Components/PersonaModal/PersonaModal';
import { setAudienceScoreTab } from 'Reducers/preferences/audienceScore/reducer';
import { getSessionId } from 'Reducers/globalState/selector';
import { GetPersona, getPersonaGrade, savePersonaGrade } from 'Reducers/preferences/audienceScore/request';
import usePermission from 'Hooks/usePersmission';
import { update_target_list } from 'Reducers/audience/targetListCreation/reducer';
import { useForm, FormProvider } from 'react-hook-form';
import {
    asAudienceScoreObject,
    getAudienceScoreListFromResponse,
} from '../Components/constants';
const Persona = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const methods = useForm({
        defaultValues: {},
        mode: 'onTouched',
    });
    const { handleSubmit } = methods;
    const { departmentId, clientId, userId } = useSelector((state) => getSessionId(state));
    const { permissions } = usePermission();
    const { activeTab } = useSelector((state) => state.audienceScoreReducer);
    const { addAccess } = permissions || {};
    const [isShowPersona, setIsShowPersona] = useState(false);
    const [personaLists, setPersonaLists] = useState([]);
    const [personaGrade, setPersonaGrade] = useState([]);
    const [submitAction, setSubmitAction] = useState(null);
    const pageLoadApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'create' });
    const saveGradeApi = useApiLoader({ autoFetch: false, loaderConfig: fieldLoaderConfig, mode: 'edit' });
    const isSaveButtonLoading = submitAction === 'save' && saveGradeApi.isFetching;
    const isNextButtonLoading = submitAction === 'next' && saveGradeApi.isFetching;
    const isSubmitting = saveGradeApi.isFetching;

    const bootstrapPersona = useCallback(() => {
        if (!clientId || !departmentId || !userId) {
            return undefined;
        }
        const payload = { clientId, departmentId, userId };
        return pageLoadApi.refetch({
            fetcher: async () => {
                const [personaRes, gradeRes] = await Promise.all([
                    dispatch(GetPersona(payload)),
                    dispatch(getPersonaGrade(payload)),
                ]);
                return { personaRes, gradeRes };
            },
            onSuccess: ({ personaRes, gradeRes }) => {
                const gradeData = gradeRes?.status ? gradeRes?.data?.[0] : null;
                setPersonaGrade(asAudienceScoreObject(gradeData));
                setPersonaLists(getAudienceScoreListFromResponse(personaRes));
            },
            onError: () => {
                setPersonaLists([]);
                setPersonaGrade({});
            },
        });
    }, [clientId, departmentId, userId, dispatch, pageLoadApi.refetch]);

    useEffect(() => {
        bootstrapPersona();
        return () => {
            dispatch(update_target_list({ field: 'leftPanelAtt', data: [] }));
            dispatch(update_target_list({ field: 'editList', data: {} }));
        };
    }, [bootstrapPersona, dispatch]);

    const handlePersonaSave = async (result, from) => {
        if (isSubmitting || !result) return;

        const tempPayload = Object.entries(result).map((e) => ({
            personaId: e[0]?.split('_')?.[1],
            personaGradeId: personaGrade?.[e[1]],
        }));

        const payload = {
            updateGrade: tempPayload,
            clientId,
            departmentId,
            userId,
        };

        setSubmitAction(from === 'save' ? 'save' : 'next');
        const res = await saveGradeApi.refetch({
            fetcher: () => dispatch(savePersonaGrade(payload, false)),
            loaderConfig: fieldLoaderConfig,
            mode: 'edit',
        });

        if (res?.status) {
            if (from === 'save') {
                navigate(`/preferences`);
            } else {
                dispatch(setAudienceScoreTab(activeTab + 1));
            }
        }
        setSubmitAction(null);
    };

    const showEmptyState = !pageLoadApi.isFetching && personaLists.length === 0;

    const handleCreatePersona = () => {
        if (!addAccess) return;
        setIsShowPersona(true);
        navigate(`.`, {
            state: { mode: 'add' },
        });
    };

    return (
        <FormProvider {...methods}>
            <AudienceScoreTabContentSkeletonGate
                isLoading={pageLoadApi.isFetching}
                variant="persona"
                emptyState={
                    showEmptyState
                        ? {
                              message: (
                                  <>
                                      Click
                                      <i
                                          id="rs_data_circle_plus_fill_edge_empty"
                                          className={`${circle_plus_fill_edge_medium} ${
                                              !addAccess ? 'click-off' : ''
                                          } icon-md color-primary-blue icon-hover-shadow-primary mx5`}
                                          onClick={handleCreatePersona}
                                      />
                                      to create your first persona.
                                  </>
                              ),
                          }
                        : null
                }
            >
                {(emptyStateTable) => (
                <div className="rsv-tabs-content">
                    <div className="box-design bd-top-border">
                        <Row className="mb10">
                            <Col sm={8}>
                                <h4 className="m0">{PERSONAS}</h4>
                            </Col>
                            <Col sm={4}>
                                <RSTooltip text="Create persona" position="top" className="d-flex float-end">
                                    <i
                                        id="rs_data_circle_plus_fill_edge"
                                        className={`${circle_plus_fill_edge_medium} ${
                                            !addAccess ? 'click-off' : ''
                                        } icon-md color-primary-blue icon-hover-shadow-primary`}
                                        onClick={() => {
                                            if (addAccess) {
                                                handleCreatePersona();
                                            }
                                        }}
                                    ></i>
                                </RSTooltip>
                            </Col>
                        </Row>
                        <Row>
                            {personaLists.length > 0
                                ? personaLists.map((persona, personaIndex) => (
                                      <PersonaCard
                                          list={persona}
                                          grade={personaGrade}
                                          key={persona.personaId ?? personaIndex}
                                          setIsShowPersona={setIsShowPersona}
                                      />
                                  ))
                                : (
                                      <Col sm={12} className='mt21'>{emptyStateTable}</Col>
                                  )}
                        </Row>
                    </div>
                    <div className="buttons-holder">
                        <RSSecondaryButton
                            blockInteraction={isSubmitting}
                            onClick={() => {
                                if (isSubmitting) return;
                                navigate(`/preferences`);
                            }}
                        >
                            {CANCEL}
                        </RSSecondaryButton>
                        <RSSecondaryButton
                            className={`color-primary-blue ${isNextButtonLoading ? 'pe-none click-off' : ''}`}
                            isLoading={isSaveButtonLoading}
                            blockBodyPointerEvents={isSaveButtonLoading}
                            onClick={handleSubmit((res) => {
                                if (isSubmitting) return;
                                handlePersonaSave(res, 'save');
                            })}
                        >
                            {SAVE}
                        </RSSecondaryButton>
                        <RSPrimaryButton
                            type="submit"
                            isLoading={isNextButtonLoading}
                            blockBodyPointerEvents={isNextButtonLoading}
                            disabledClass={isSaveButtonLoading ? 'pe-none click-off' : ''}
                            onClick={handleSubmit((res) => {
                                if (isSubmitting) return;
                                handlePersonaSave(res, 'next');
                            })}
                        >
                            {NEXT}
                        </RSPrimaryButton>
                    </div>
                    {isShowPersona && (
                        <PersonaModal
                            show={isShowPersona}
                            setIsShowPersona={(status) => {
                                if (status) setIsShowPersona(false);
                                bootstrapPersona();
                            }}
                            handleClose={() => {
                                setIsShowPersona(false);
                            }}
                        />
                    )}
                </div>
                )}
            </AudienceScoreTabContentSkeletonGate>
        </FormProvider>
    );
};

export default Persona;
