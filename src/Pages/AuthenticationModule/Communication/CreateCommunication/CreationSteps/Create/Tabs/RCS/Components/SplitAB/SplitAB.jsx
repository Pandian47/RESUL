import { getDateWithAddMinutes } from 'Utils/modules/dateTime';
import { SELECT_TEMPLATE_NAME } from 'Constants/GlobalConstant/ValidationMessage';
import { TEMPLATE_NAME } from 'Constants/GlobalConstant/Placeholders';
import { Fragment, useContext, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Row, Col } from 'react-bootstrap';
import { useFormContext } from 'react-hook-form';

import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';
import Scheduler from '../../../../Component/Scheduler';
import { RCSProvider } from '../../RCS';
import { getRcsList } from 'Reducers/communication/createCommunication/Create/selectors';
import useQueryParams from 'Hooks/useQueryParams';
import TextContent from '../TextContent/TextContent';
import Carousel from '../Carousel/Carousel';
import WarningPopup from 'Pages/AuthenticationModule/Components/WarningPopup/WarningPopup';


const SplitAB = ({ fieldName, isSplitTabs = false }) => {
    const {
        control,
        setValue,
        getValues,
        trigger,
        watch,
        handleSubmit,
        setError,
        setFocus,
        clearErrors,
        formState: { errors },
        reset,
    } = useFormContext();
    
    const context = useContext(RCSProvider);
        const location = useQueryParams('/communication');
    const dispatch = useDispatch();
    
    const {
        templateList,
        templateContentDetail,
    } = useSelector((state) => getRcsList(state));
    
    const [dataSource, setDataSource] = useState('TL');
    const [levelNumber, setLevelNumber] = useState('');
    const [campaignType, setCampaignType] = useState('');
    const [mdcSchedule, setMdcSchedule] = useState('');

    const audienceName = 'audience';
    const templateName = isSplitTabs ? `${fieldName}.templateName` : 'templateName';
    const approvalListName = 'approvalList';

    const [
        approvalList,
        senderName,
        template
    ] = watch([
        approvalListName,
        'senderName',
        templateName
    ]);
    
    const campaign = {
        campaignId: location?.campaignId ?? 0,
        campaignType: location?.campaignType ?? 'S',
    };

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

    const handleRCSContent = () => {
        if (getValues(templateName)?.templateType === 3) {
            return <Carousel fieldName={fieldName} isSplitAB={isSplitTabs}/>;
        } else {
            return <TextContent fieldName={fieldName} isSplitAB={isSplitTabs}/>;
        }
    };

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

    return (
        <Fragment>
            <div className="split-tab-content-holder mt40">
                {senderName && (
                    <div className={`form-group`}>
                        <Row>
                            <Col sm={{ offset: 1, span: 2 }}>
                                <label className="control-label-left">{TEMPLATE_NAME}</label>
                            </Col>
                            <Col sm={6} id="rs_RCS_templateName">
                                <RSKendoDropDownList
                                    control={control}
                                    name={templateName}
                                    label={TEMPLATE_NAME}
                                    dataItemKey={'rcsTemplateId'}
                                    textField={'templateName'}
                                    data={templateList ?? []}
                                    isLoading={
                                        context?.isTemplateListLoading ||
                                        context?.isTemplateContentLoading
                                    }
                                    required
                                    rules={{
                                        required: SELECT_TEMPLATE_NAME,
                                    }}
                                    handleChange={({ value }) => {
                                        context?.fetchRCSTemplateContent(value, isSplitTabs, fieldName);
                                        clearErrors();
                                    }}
                                />
                            </Col>
                        </Row>
                    </div>
                )}

                {handleRCSContent()}
                
                {(!levelNumber || levelNumber < 2) && (
                    <>
                        {campaignType === 'S' || (campaignType === 'M' && dataSource === 'TL') ? (
                            <div className='form-group'>
                            <Scheduler
                                isSplitTabs={isSplitTabs}
                                fieldName={fieldName}
                                isRequired={approvalList?.requestApproval ? true : false}
                                isSendTimeRecommendation={false}
                                clearErrors={clearErrors}
                                splitABminDate={getMinDateForScheduler}
                                isRfaEnabled={true}
                            />
                            </div>
                        ) : null}
                    </>
                )}
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

