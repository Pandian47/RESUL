import { MAX_LENGTH10, MAX_LENGTH150, MAX_LENGTH255, MAX_LENGTH50, MIN_LENGTH } from 'Constants/GlobalConstant/Regex';
import { ENTER_ADDRESS, ENTER_CITY, ENTER_COMPANY as ENTER_COMPANY_MSG, SELECT_COMPANY_BRAND, SELECT_COUNTRY, SELECT_CURRENCY, SELECT_DATE_FORMAT, SELECT_INDUSTRY, SELECT_LANGUAGE, SELECT_TIME_FORMAT, SELECT_TIMEZONE, UPLOAD_PROFILE_IMAGE } from 'Constants/GlobalConstant/ValidationMessage';
import { WEBSITE_RULES_SECURE, ZIP_RULES } from 'Constants/GlobalConstant/Rules';
import { ADDRESS, CITY, COUNTRY, CURRENCY, DATE_FORMAT, DAY_LIGHT, DEFAULT_REGION, ENTER_COMPANY, HEAD_QUATERS, INDUSTRY, LANGUAGE, PARENT_COMPANY, PREFERED_REGION, REGION, TIME_FORMAT, TIME_ZONE, WEBSITE, ZIP } from 'Constants/GlobalConstant/Placeholders';
import { ipsettings_medium } from 'Constants/GlobalConstant/Glyphicons';
// import React, { useEffect, useRef, useState } from 'react';
// import _get from 'lodash/get';
// import _find from 'lodash/find';
// import _filter from 'lodash/filter';
// import { useForm } from 'react-hook-form';
// import { useNavigate } from 'react-router-dom';
// import { Container, Col, Row } from 'react-bootstrap';
// import { useDispatch, useSelector } from 'react-redux';

// // // // // // import RSTooltip from 'Components/RSTooltip';
// import RSPageHeader from 'Components/RSPageHeader';
// import RSInput from 'Components/FormFields/RSInput';
// import RSCheckbox from 'Components/FormFields/RSCheckbox';
// import RSMultiSelect from 'Components/FormFields/RSMultiSelect';
// import RSImageUpload from 'Components/FormFields/RSImageUpload';
// import IPWhitelistModal from './Components/IPWhitelist/IPWhitelist';
// import useComponentWillUnmount from 'Hooks/useComponentWillUnMount';
// import RSKendoDropDownList from 'Components/FormFields/RSKendoDropdown';

// import { buildPayload } from './constant';
// import { getUserDetails } from 'Utils/modules/crypto';
import { getmasterData } from 'Utils/modules/masterData';

// import { getSessionId } from 'Reducers/globalState/selector';
// import { brandCompanystatus } from 'Constants/GlobalConstant';
// import { validateWebsite } from 'Reducers/login/newUser/request';
// import { RSPrimaryButton, RSSecondaryButton } from 'Components/Buttons';
// import { resetAccountSettings } from 'Reducers/preferences/accountSettings/reducer';
// import { getAccountSettings, saveAccountSettings } from 'Reducers/preferences/accountSettings/request';

// const AccountSettings = ({ permissions }) => {
//     const { licenseTypeId, clientId, isAgency, ...rest } = getUserDetails();
//     const isEnterprise = licenseTypeId === '3';
//     // console.log('REst ::::::::::::::: ', rest, isEnterprise);

//     const { clientId: sessionClientId, userId } = useSelector((state) => getSessionId(state));
//     const navigate = useNavigate();
//     const dispatch = useDispatch();
//     const {
//         countryMasterList,
//         currencyMasterList,
//         dateFormatList,
//         timeFormatList,
//         timeZoneList,
//         languageMasterList,
//         industryList,
//         regionList,
//     } = getmasterData();
//     const { data } = useSelector(({ accountSettingsReducer }) => accountSettingsReducer);
//     const existingWebsite = useRef();
//     const { updateAccess } = permissions || {};
//     const [websiteState, setWebsiteState] = useState({
//         loading: false,
//         isValid: false,
//     });
//     const [isShowIpWhitelist, setIsShowIpWhitelist] = useState(false);

//     const {
//         control,
//         setError,
//         setValue,
//         clearErrors,
//         reset,
//         handleSubmit,
//         formState: { errors, isDirty },
//     } = useForm({
//         mode: 'onTouched',
//     });

//     const websiteError = Object.hasOwn(errors, 'website');

//     useEffect(() => {
//         const payload = {
//             // clientId: isEnterprise || isAgency ? sessionClientId : clientId,
//             clientId: isAgency ? clientId : sessionClientId,
//             userId,
//         };

//         dispatch(getAccountSettings({ payload, navigate }));
//     }, []);

//     useComponentWillUnmount(() => {
//         if (Object.keys(data)?.length) {
//             dispatch(resetAccountSettings());
//         }
//     });

//     useEffect(() => {
//         if (Object.keys(data)?.length) {
//             const {
//                 countryId,
//                 currencyId,
//                 dateFormatId,
//                 industryId,
//                 languageId,
//                 timeFormatId,
//                 timeZoneId,
//                 regionalStructure,
//                 childClientName,
//                 parentClientName,
//                 businessTypeId,
//                 clientBranchTypeId,
//                 clientName,
//             } = data;

//             const country = _find(countryMasterList, (country) => country.countryID === countryId);
//             const currency = _find(currencyMasterList, (currency) => currency.currencyID === currencyId);
//             const dateFormat = _find(dateFormatList, (date) => date.dateFormatID === dateFormatId);
//             const langauge = _find(languageMasterList, (language) => language.languageID === languageId);
//             const timeFormat = _find(timeFormatList, (timeFormat) => timeFormat.timeFormatID === timeFormatId);
//             const timezone = _find(timeZoneList, (timezone) => timezone.timeZoneID === timeZoneId);
//             const industry = _find(industryList, (industry) => industry.industryID === industryId);
//             const splitRegions = new Set(regionalStructure?.split(',').filter(Boolean));
//             const preferredRegions = _filter(regionList, (regions) => splitRegions.has(regions.regionName));
//             const branchType = _find(brandCompanystatus, (branch) => branch.titleId === clientBranchTypeId) || [];

//             reset({
//                 ...data,
//                 country,
//                 currency,
//                 dateFormat,
//                 langauge,
//                 timeFormat,
//                 timezone,
//                 industry,
//                 preferredRegions,
//                 companyName: isAgency ? clientName : childClientName,
//                 parentCompanyName: parentClientName,
//                 businessType: branchType,
//             });
//         }
//     }, [data]);

//     const handleFormSubmit = (formprops) => {
//         const initialPayload = {
//             clientId: isEnterprise || isAgency ? sessionClientId : clientId,
//             userId,
//             licenseTypeId,
//         };
//         const payload = buildPayload({
//             ...formprops,
//             ...initialPayload,
//         });
//         dispatch(saveAccountSettings({ payload, navigate }));
//     };

//     const handleWebsiteBlur = async ({ target: { value } }) => {
//         if (value?.length > 0 && !websiteError && value !== existingWebsite.current) {
//             const payload = {
//                 Website: value,
//             };
//             setWebsiteState({
//                 loading: true,
//                 isValid: false,
//             });
//             existingWebsite.current = value;
//             const { status } = await dispatch(
//                 validateWebsite({
//                     payload,
//                     setError,
//                     name: 'website',
//                 }),
//             );
//             if (status) {
//                 setWebsiteState({
//                     loading: false,
//                     isValid: true,
//                 });
//             } else {
//                 setWebsiteState({
//                     loading: false,
//                     isValid: false,
//                 });
//             }
//         } else if (websiteError) {
//             existingWebsite.current = null;
//         }
//     };

//     return (
//         // Contend holder starts
//         <div className="page-content-holder">
//             {/* Main page heading block starts */}
//             <RSPageHeader title="Account settings" isBack backPath="/preferences" />
//             {/* Main page heading block ends */}

//             {/* Main page content block starts */}
//             <Container className="page-content px0 pc-my-profile">
//                 <form onSubmit={handleSubmit(handleFormSubmit)}>
//                     <div className="box-design rs-box rs-box-min-height py40">
//                         <Row className="res-gx-2">
//                             <Col md={3} sm={4} xs={12}>
//                                 <RSImageUpload
//                                     control={control}
//                                     name={'logoPath'}
//                                     className="rs-picture mt20"
//                                     setError={setError}
//                                     clearErrors={clearErrors}
//                                     setValue={setValue}
//                                     required
//                                     tooltipText={'company logo'}
//                                     rules={{ required: UPLOAD_PROFILE_IMAGE }}
//                                 />
//                             </Col>
//                             {/* second column */}
//                             <Col md={9} sm={8} xs={12} className="box-left-border">
//                                 <Row className="res-gx-2">
//                                     <Col sm={12}>
//                                         <div className="d-flex justify-content-between">
//                                             <h4>About your company</h4>
//                                             <RSTooltip text="IP whitelisting" position="top">
//                                                 <i
//                                                     className={`${ipsettings_medium} icon-lg primary-color mr-5`}
//                                                     onClick={() => setIsShowIpWhitelist(true)}
//                                                 ></i>
//                                             </RSTooltip>
//                                         </div>
//                                         <Row>
//                                             {isEnterprise && (
//                                                 <Col sm={6} xs={12}>
//                                                     <div className="form-group">
//                                                         <RSInput
//                                                             type={'text'}
//                                                             name={'parentCompanyName'}
//                                                             placeholder={PARENT_COMPANY}
//                                                             control={control}
//                                                             required
//                                                             // rules={{ required: ENTER_COMPANY_MSG }}
//                                                             disabled
//                                                         />
//                                                     </div>
//                                                 </Col>
//                                             )}
//                                             <Col sm={6} xs={12}>
//                                                 <div className="form-group">
//                                                     <RSInput
//                                                         type={'text'}
//                                                         name={'companyName'}
//                                                         placeholder={ENTER_COMPANY}
//                                                         control={control}
//                                                         required
//                                                         // rules={{ required: ENTER_COMPANY_MSG }}
//                                                         disabled
//                                                     />
//                                                 </div>
//                                             </Col>
//                                             <Col sm={isEnterprise ? 3 : 6} xs={isEnterprise ? 6 : 12}>
//                                                 <RSInput
//                                                     control={control}
//                                                     name={'address'}
//                                                     placeholder={ADDRESS}
//                                                     minLength={MIN_LENGTH}
//                                                     maxLength={MAX_LENGTH255}
//                                                     required
//                                                     rules={{
//                                                         minLength: {
//                                                             value: 3,
//                                                             message: MIN_3_CHARS,
//                                                         },
//                                                         required: ENTER_ADDRESS,
//                                                     }}
//                                                 />
//                                             </Col>
//                                             {isEnterprise && (
//                                                 <Col sm={3} xs={12}>
//                                                     <RSKendoDropDownList
//                                                         control={control}
//                                                         name={'businessType'}
//                                                         required
//                                                         disabled
//                                                         data={brandCompanystatus}
//                                                         textField={'title'}
//                                                         dataItemKey={'titleId'}
//                                                         rules={{ required: SELECT_COMPANY_BRAND }}
//                                                         label={HEAD_QUATERS}
//                                                     />
//                                                 </Col>
//                                             )}
//                                             <Col sm={6} xs={12}>
//                                                 <div className="form-group">
//                                                     <RSKendoDropDownList
//                                                         name={'industry'}
//                                                         data={industryList}
//                                                         control={control}
//                                                         required
//                                                         disabled
//                                                         textField={'industryName'}
//                                                         dataItemKey={'industryID'}
//                                                         label={INDUSTRY}
//                                                         rules={{
//                                                             required: SELECT_INDUSTRY,
//                                                         }}
//                                                     />
//                                                 </div>
//                                             </Col>

//                                             <Col sm={6} xs={12}>
//                                                 <div className="form-group">
//                                                     <Row>
//                                                         <Col>
//                                                             <RSInput
//                                                                 control={control}
//                                                                 name={'city'}
//                                                                 required
//                                                                 maxLength={MAX_LENGTH50}
//                                                                 rules={{ required: ENTER_CITY }}
//                                                                 placeholder={CITY}
//                                                             />
//                                                         </Col>
//                                                         <Col>
//                                                             <RSInput
//                                                                 control={control}
//                                                                 type="text"
//                                                                 name={'zipCode'}
//                                                                 required
//                                                                 onKeyDown={charNum}
//                                                                 maxLength={MAX_LENGTH10}
//                                                                 rules={ZIP_RULES}
//                                                                 placeholder={ZIP}
//                                                             />
//                                                         </Col>
//                                                     </Row>
//                                                 </div>
//                                             </Col>

//                                             <Col sm={6} xs={12}>
//                                                 <div className="form-group">
//                                                     <RSInput
//                                                         control={control}
//                                                         name={'website'}
//                                                         required
//                                                         maxLength={MAX_LENGTH150}
//                                                         isLoading={websiteState.loading}
//                                                         rules={{
//                                                             ...WEBSITE_RULES_SECURE,
//                                                             validate: () =>
//                                                                 websiteError ? _get(errors, 'website.message') : true,
//                                                         }}
//                                                         placeholder={WEBSITE}
//                                                         handleOnchange={() => {
//                                                             if (websiteError) clearErrors('website');
//                                                             if (websiteState.isValid)
//                                                                 setWebsiteState({
//                                                                     loading: false,
//                                                                     isValid: false,
//                                                                 });
//                                                         }}
//                                                         handleOnBlur={(e) => {
//                                                             console.log('websiteState: ', websiteError);

//                                                             handleWebsiteBlur(e);
//                                                         }}
//                                                     />
//                                                 </div>
//                                             </Col>

//                                             <Col sm={6} xs={12}>
//                                                 <div className="form-group">
//                                                     <Row>
//                                                         <Col>
//                                                             <RSInput
//                                                                 control={control}
//                                                                 name={'regionName'}
//                                                                 required
//                                                                 placeholder={REGION}
//                                                                 disabled
//                                                             />
//                                                         </Col>
//                                                         <Col>
//                                                             <RSKendoDropDownList
//                                                                 control={control}
//                                                                 name={'country'}
//                                                                 data={countryMasterList}
//                                                                 textField="country"
//                                                                 required
//                                                                 disabled
//                                                                 dataItemKey={'countryID'}
//                                                                 label={COUNTRY}
//                                                                 rules={{
//                                                                     required: SELECT_COUNTRY,
//                                                                 }}
//                                                             />
//                                                         </Col>
//                                                     </Row>
//                                                 </div>
//                                             </Col>
//                                         </Row>
//                                         <h4>Localization details</h4>
//                                         <Row>
//                                             {isEnterprise && (
//                                                 <Col sm={12} xs={12}>
//                                                     <div className="form-group mb20">
//                                                         <RSMultiSelect
//                                                             control={control}
//                                                             placeholder={PREFERED_REGION}
//                                                             allowCustom
//                                                             textField="regionName"
//                                                             dataItemKey="regionID"
//                                                             name={'preferredRegions'}
//                                                             className="rs-multi-placeholder-big"
//                                                             data={regionList}
//                                                         />
//                                                         <span>
//                                                             <RSCheckbox
//                                                                 className="smaller"
//                                                                 name={'defaultRegions'}
//                                                                 control={control}
//                                                                 // defaultValue={defaultRegions}
//                                                                 labelName={DEFAULT_REGION}
//                                                                 handleChange={({ target: { checked } }) => {
//                                                                     if (checked) {
//                                                                         setValue('preferredRegions', regionList);
//                                                                     } else {
//                                                                         setValue('preferredRegions', []);
//                                                                     }
//                                                                 }}
//                                                             />
//                                                         </span>
//                                                     </div>
//                                                 </Col>
//                                             )}
//                                             <Col sm={4} xs={6}>
//                                                 <div className="form-group">
//                                                     <RSKendoDropDownList
//                                                         data={currencyMasterList}
//                                                         control={control}
//                                                         name={'currency'}
//                                                         disabled
//                                                         label={CURRENCY}
//                                                         dataItemKey={'currencyID'}
//                                                         textField={'currencyName'}
//                                                         required
//                                                         rules={{
//                                                             required: SELECT_CURRENCY,
//                                                         }}
//                                                     />
//                                                 </div>
//                                             </Col>
//                                             <Col sm={4} xs={6}>
//                                                 <div className="form-group">
//                                                     <RSKendoDropDownList
//                                                         data={dateFormatList}
//                                                         control={control}
//                                                         name={'dateFormat'}
//                                                         label={DATE_FORMAT}
//                                                         dataItemKey={'dateFormatID'}
//                                                         textField={'dateformat'}
//                                                         required
//                                                         rules={{
//                                                             required: SELECT_DATE_FORMAT,
//                                                         }}
//                                                     />
//                                                 </div>
//                                             </Col>
//                                             <Col sm={4} xs={6}>
//                                                 <div className="form-group">
//                                                     <RSKendoDropDownList
//                                                         data={languageMasterList}
//                                                         control={control}
//                                                         name={'langauge'}
//                                                         disabled
//                                                         label={LANGUAGE}
//                                                         dataItemKey={'languageID'}
//                                                         textField={'languageName'}
//                                                         required
//                                                         rules={{
//                                                             required: SELECT_LANGUAGE,
//                                                         }}
//                                                     />
//                                                 </div>
//                                             </Col>
//                                             <Col sm={4} xs={6}>
//                                                 <div className="form-group">
//                                                     <RSKendoDropDownList
//                                                         data={timeFormatList}
//                                                         control={control}
//                                                         name={'timeFormat'}
//                                                         label={TIME_FORMAT}
//                                                         dataItemKey={'timeFormatID'}
//                                                         textField={'timeformat'}
//                                                         required
//                                                         rules={{
//                                                             required: SELECT_TIME_FORMAT,
//                                                         }}
//                                                     />
//                                                 </div>
//                                             </Col>
//                                             <Col sm={4} xs={6}>
//                                                 <div className="form-group mb0">
//                                                     <RSKendoDropDownList
//                                                         data={timeZoneList}
//                                                         control={control}
//                                                         name={'timezone'}
//                                                         label={TIME_ZONE}
//                                                         dataItemKey={'timeZoneID'}
//                                                         textField={'timeZoneName'}
//                                                         required
//                                                         rules={{
//                                                             required: SELECT_TIMEZONE,
//                                                         }}
//                                                     />
//                                                 </div>
//                                             </Col>
//                                             <Col sm={4} xs={6}>
//                                                 <div className="form-group mb0 position-relative top6">
//                                                     <RSCheckbox
//                                                         control={control}
//                                                         name="isdayLight"
//                                                         type="checkbox"
//                                                         disabled
//                                                         labelName={DAY_LIGHT}
//                                                         className="smaller"
//                                                     />
//                                                 </div>
//                                             </Col>
//                                         </Row>
//                                     </Col>
//                                 </Row>
//                             </Col>
//                         </Row>
//                     </div>
//                     <div className="buttons-holder">
//                         <Row>
//                             <Col>
//                                 <RSSecondaryButton onClick={() => navigate('/preferences')}>Cancel</RSSecondaryButton>
//                                 {updateAccess && (
//                                     <RSPrimaryButton type="submit" className={!isDirty ? 'click-off' : ''}>
//                                         Update
//                                     </RSPrimaryButton>
//                                 )}
//                             </Col>
//                         </Row>
//                     </div>
//                 </form>
//                 {/* Modals */}
//                 {isShowIpWhitelist && (
//                     <IPWhitelistModal show={isShowIpWhitelist} handleClose={() => setIsShowIpWhitelist(false)} />
//                 )}
//             </Container>
//             {/* Main page content block ends */}
//         </div>
//         // Content holder ends
//     );
// };

// export default AccountSettings;
