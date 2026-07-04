import { getDateWithAddMinutes } from 'Utils/modules/dateTime';
import { SELECT_TEMPLATE_LANGUAGE, SELECT_TEMPLATE_NAME, SELECT_TEMPLATE_TYPE } from 'Constants/GlobalConstant/ValidationMessage';
import { LANGUAGE, TEMPLATE_LANGUAGE, TEMPLATE_NAME, TEMPLATE_TYPE } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import Scheduler from '../../../../Component/Scheduler';
import MessagingContext from '../../context';
import useQueryParams from 'Hooks/useQueryParams';
import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';
import WATextEditor from '../WATextEditor/WATextEditor';
import Carousel from '../Carousel/Carousel';
import { smsList } from 'Reducers/communication/createCommunication/Create/selectors';
import { refreshContent } from '../../constant';


const SplitAB = ({ fieldName, isSplitTabs = false }) => {
    const { control, setValue, getValues, watch, setError, clearErrors } = useFormContext();
    const context = useContext(MessagingContext);
    const location = useQueryParams('/communication');

    const { hsmTemplateList, templateLanguage: templateLanguageList } = useSelector(smsList);

    const [dataSource, setDataSource] = useState('TL');
    const [levelNumber, setLevelNumber] = useState('');
    const [campaignType, setCampaignType] = useState('');
    const [mdcSchedule, setMdcSchedule] = useState('');

    const audienceName = 'audience';
    const templateName = isSplitTabs ? `${fieldName}.templateName` : 'templateName';
    const templateTypeName = isSplitTabs ? `${fieldName}.templateType` : 'templateType';
    const templateLanguageName = isSplitTabs ? `${fieldName}.templateLanguage` : 'templateLanguage';

    const [approvalList, templateLanguage, templateType, senderName] = watch([
        'approvalList',
        templateLanguageName,
        templateTypeName,
        'senderName',
    ]);

    const campaign = useMemo(
        () => ({
            campaignId: location?.campaignId ?? 0,
            campaignType: location?.campaignType ?? 'S',
        }),
        [location],
    );

    const categorizeTemplates = useMemo(() => {
        return context?.handleTemplateType(hsmTemplateList, isSplitTabs, fieldName);
    }, [hsmTemplateList, isSplitTabs, fieldName, templateType]);

    useEffect(() => {
        const campaignType = location?.campaignType ?? 'S';
        const mdcContentSetupDetails = location?.mdcContentSetupDetails ?? {};
        const levelNumber = mdcContentSetupDetails?.levelNumber ?? 1;
        const dataSource = mdcContentSetupDetails?.dataSource ?? 'TL';
        const mdcAudience = mdcContentSetupDetails?.audience ?? [];

        setCampaignType(campaignType);
        setLevelNumber(levelNumber);
        setDataSource(campaignType === 'T' ? 'DL' : dataSource);

        if (campaign.campaignType === 'M') {
            setValue(audienceName, mdcAudience);
            if (levelNumber > 1) {
                setMdcSchedule(mdcContentSetupDetails?.scheduleDate ?? '');
            }
        }
    }, [location]);

    const handleWATextEditor = useCallback(() => {
        const templateResponse = getValues(templateName);

        if (templateResponse?.isCarousel) {
            return <Carousel templateResponse={templateResponse} fieldName={fieldName} isSplitTabs={isSplitTabs} />;
        }

        return (
            <WATextEditor
                templateResponse={{ ...templateResponse, currData: templateResponse }}
                fieldName={fieldName}
                isSplitTabs={isSplitTabs}
            />
        );
    }, [templateName, fieldName, isSplitTabs]);

    // Calculate minimum date for scheduler based on previous split tab's schedule
    const splitTabLetters = ['A', 'B', 'C', 'D', 'E'];
    const currentTabLetter = fieldName?.replace('split', '').toUpperCase() || '';
    const currentTabIndex = splitTabLetters.indexOf(currentTabLetter);

    // Get the previous tab's schedule field name to watch
    const previousTabScheduleFieldName = useMemo(() => {
        if (!isSplitTabs || currentTabIndex <= 0) return null;
        const previousTabLetter = splitTabLetters[currentTabIndex - 1];
        return `split${previousTabLetter}.schedule`;
    }, [isSplitTabs, fieldName, currentTabIndex]);

    // Watch the previous tab's schedule
    const previousTabSchedule = previousTabScheduleFieldName ? watch([previousTabScheduleFieldName])[0] : null;

    // Calculate minimum date: previous schedule + 5 minutes
    const getMinDateForScheduler = useMemo(() => {
        if (!isSplitTabs || !fieldName || currentTabIndex <= 0) return null;

        // If previous tab has a schedule, add 5 minutes to it
        if (previousTabSchedule && previousTabSchedule instanceof Date && !isNaN(previousTabSchedule.getTime())) {
            return getDateWithAddMinutes(previousTabSchedule, 5);
        }

        return null;
    }, [isSplitTabs, fieldName, currentTabIndex, previousTabSchedule]);

    const applyRefreshPatchAndClearCarousels = (fieldsPatch) => {
        if (isSplitTabs) {
            setValue(fieldName, { ...getValues(fieldName), ...fieldsPatch });
            clearErrors(fieldName);
        } else {
            Object.entries(fieldsPatch).forEach(([n, v]) => {
                setValue(n, v, {
                    shouldDirty: true,
                    shouldTouch: false,
                    shouldValidate: false,
                });
            });
        }
        const keyName = isSplitTabs ? fieldName : 'carousel';
        context?.carouselTabs?.[keyName]?.forEach((key) => {
            setValue(`${key?.carouselName}`, {});
        });
        if (isSplitTabs) {
            context?.setCarouselTabs((prev) => {
                const { carousel, ...rest } = prev;
                return { ...rest, [fieldName]: [] };
            });
        } else {
            context?.setCarouselTabs((prev) => ({ carousel: [] }));
        }
    };

    return (
        <Fragment>
            <div className="split-tab-content-holder mt40">
                {senderName && (
                    <div className={`form-group `}>
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">{LANGUAGE}</label>
                            </Col>
                            <Col sm={6} id="rs_Messaging_templatelanguage">
                                <RSKendoDropDownList
                                    control={control}
                                    name={templateLanguageName}
                                    data={templateLanguageList}
                                    dataItemKey={'waTemplateId'}
                                    textField={'languageCode'}
                                    label={TEMPLATE_LANGUAGE}
                                    isLoading={context?.isTemplateLanguageLoading}
                                    required
                                    rules={{
                                        required: SELECT_TEMPLATE_LANGUAGE,
                                    }}
                                    handleChange={({ value }) => {
                                        context?.fetchTemplate(
                                            value?.languageCode ?? 'en',
                                            getValues('senderName')?.clientWASenderId ?? 0,
                                        );
                                        applyRefreshPatchAndClearCarousels(refreshContent);
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                )}
                {templateLanguage && (
                    <div className={`form-group`}>
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">{TEMPLATE_TYPE}</label>
                            </Col>
                            <Col sm={6} id="rs_Messaging_templateName">
                                <RSKendoDropDownList
                                    control={control}
                                    name={templateTypeName}
                                    label={TEMPLATE_TYPE}
                                    dataItemKey={'templateTypeId'}
                                    textField={'labelText'}
                                    data={categorizeTemplates?.availableTypes ?? []}
                                    isLoading={context?.isHsmTemplateLoading}
                                    required
                                    rules={{
                                        required: SELECT_TEMPLATE_TYPE,
                                    }}
                                    handleChange={() => {
                                        const { templateType, ...fieldsPatch } = refreshContent;
                                        applyRefreshPatchAndClearCarousels(fieldsPatch);
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                )}

                {templateLanguage && templateType && (
                    <div className={`form-group`}>
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">{TEMPLATE_NAME}</label>
                            </Col>
                            <Col sm={6} id="rs_Messaging_templateName">
                                <RSKendoDropDownList
                                    control={control}
                                    name={templateName}
                                    label={TEMPLATE_NAME}
                                    dataItemKey={'waTemplateId'}
                                    textField={'templateName'}
                                    data={categorizeTemplates?.availableTemplateData ?? []}
                                    isLoading={context?.isHsmTemplateLoading}
                                    required
                                    rules={{
                                        required: SELECT_TEMPLATE_NAME,
                                    }}
                                    handleChange={({ value }) => {
                                        // debugger;
                                        context?.handleTemplate(value, isSplitTabs, fieldName);
                                        clearErrors();
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                )}

                {handleWATextEditor()}
                {(!levelNumber || levelNumber < 2) && (
                    <>
                        {campaignType === 'S' || (campaignType === 'M' && dataSource === 'TL') ? (
                            <div className='form-group'>
                            <Scheduler
                                isSplitTabs={isSplitTabs}
                                fieldName={fieldName}
                                isRequired={approvalList?.requestApproval ? true : false}
                                // isRequired={isSplitTabs}
                                isSendTimeRecommendation={false}
                                clearErrors={clearErrors}
                                splitABminDate={getMinDateForScheduler}
                                isRfaEnabled={true}
                            />
                            </div>
                        ) : null}
                    </>
                )}
                {/* levelNumber added for MDC --- if levelNumber gerater than 1 disable schedule  */}
            </div>

            {context?.isFailure?.status && (
                <WarningPopup
                    show={context?.isFailure?.status}
                    handleClose={() => {
                        context?.setIsFailure({
                            status: false,
                            message: '',
                        });
                    }}
                    text={<div className="text-center">{context?.isFailure?.message}</div>}
                    showCancel={true}
                    isPrimary={false}
                />
            )}
        </Fragment>
    );
};

export default SplitAB;
