/**
 * Utils barrel — re-exports domain modules for backward compatibility.
 * Prefer direct imports (e.g. `Utils/modules/dateTime`, `Utils/modules/crypto`) for tree-shaking.
 */

export {
    iv,
    convertObjectToBase64,
    converBase64ToText,
    isBase64,
    deCodeId,
    encryptWithAES,
    encodeUrlLegacy,
    encodeUrl,
    decodeUrl,
    encodeLargeState,
    decodeLargeState,
    cleanupOldQueryStates,
    clearAllQueryStates,
    decryptWithAES,
    getUserDetails,
    hasGenieEnabledDepartment,
    isGenieEnabledForSelectedDepartment,
    getPermissions,
    clearCache,
    updateUserDetailsPartnerFlag,
    updatedPermissionList,
    handlePreviousVersionNavigation,
} from './modules/crypto';

export { getEnvironment } from './modules/environment';

export { GetpopoverContent, GetpopoverContentPlanner, PREVIEW_SOURCE  , LISTING_PREVIEW_INELIGIBLE_CHANNEL_IDS, isListingPreviewEligible, hasListingPreviewApiContent, hasPlannerItemPreviewContent, buildPlannerCarouselSlides, ListingPreviewNoDataPanel, getListingPreviewNoDataPopover,} from './modules/preview';

export { CompressionManager } from './modules/compression';

export {
    downloadZIPfilewithCSV,
    downloadCSV,
    csvlinkDownload,
    csvlinkDownloadWithoutBaseUrl,
    downloadCSVcommasFile,
    downloadCSVcommasFileLangSupport,
    array_to_Object,
} from './modules/download';

export {
  getStatusFailureApiModal,
  getWarningPopupMessage,
  getSseDisconnectPopup,
} from './modules/warningPopup';

export {
    normalizeDisplayText,
    sanitizeDisplayText,
    toSafeString,
    toSafeLowerCase,
    safeParseJSON,
    maskEmailBeforeAt,
    removeTags,
    textFormatter,
    formatFieldToTitle,
    toTitleCase,
    stripEmojis,
    getListTypeName,
} from './modules/stringUtils';

export {
    getDateFormat,
    momentIsValid,
    getDisplayDateMonth,
    extractOffsetFromLabel,
    convertToUTC,
    getUserCurrentFormat,
    getUserCurrentFormatWithSeconds,
    getUserCurrentFormatWithoutYear,
    getFileDownloadDateTime,
    getAPICurrentDateTimeFormat,
    addDays_dddmmmddyyyy,
    getDateWithDay,
    getfullFormat,
    getDateWithDayfullFormat,
    getDateWithDDMMM,
    getDateWithDaynoFormat,
    getDateWithAddMinutes,
    getDDMMYY,
    getMMMDDYYYY,
    getDDMMMYYYY,
    getDDMMMYYYYWITHOUTCOMMAS,
    getDDMMM,
    getMMMDD,
    getYYMMDD,
    getYYMM,
    getFirstDayOfMonth,
    standardizeDateFormat,
    getCurrentDateOfMonth,
    getYYMMDDAndTime,
    getMMDDYYYYWithSlash,
    getDateWithDaySubstract,
    getFormattedDate,
    getDateAndTimeDifference,
    getYYYYMMDDHHMMSS,
    isURLValid,
    dateTimeFormat,
    dateFormat,
    dateFormatWithHyphen,
    getDateBasedonDay,
    getDateBasedonMonth,
    formatBytes,
    findDuplicateValues,
    removeDuplicates,
    findDuplicates,
    findDuplicateArrayofObject,
    removeDuplicateArrayofObject,
    timeFormat,
    YEAR_LIST,
    YEAR_BELOW_LIST,
    YEAR_AFTER_LIST,
    MM_LIST,
    MM_LIST_CURRENT,
    MM_MONTHS,
    MM_MONTHS_NEW,
    convertTime12to24,
    addDaysToDate,
    addHoursToDate,
    isDateBeforeToday,
    getUserDateTimeFormat,
    getCreatedDate,
    getViewFormat,
    convertToUserTimezone,
    getCurrentTimeInUserTimezone,
    getCurrentTimeInUserTimezoneWithAbbreviation,
    getUserCurrentFormatWithAbbreviation,
    convertDateBetweenTimezones,
    convertUTCtoUserTimezone,
    convertUserTimezoneToTarget,
} from './modules/dateTime';

export {
  isEmpty,
  showPercentage,
  formatPercentageDisplay,
  numberWithCommas,
  parseFormattedNumber,
  mapAudienceWithChannelLabels,
  formatAudienceChannelLabel,
  formatMaxFileSizeBinaryMb,
  formatMaxFileSizeDisplay,
  numberWithCommasformatCurrency,
  numberToWords,
  paymentCommitmentEnum,
  formatName,
  formatPercentage,
  chartFormatPercentage,
  chartPercentageDataLabelHtml,
  chartPercentageAxisLabelHtml,
  chartPercentageTooltipPercentHtml,
  formatChartPercentageLabelValue,
  chartFormatNumber,
  getNumbersSubset,
} from './modules/formatters';

export { RANDOMCHAR, GeneratePasswordpseudorandom, GenerateUserPassword } from './modules/passwordUtils';

export {
    onlyNumbers,
    onlyNumbersWithComma,
    onlyNumbersDecimal,
    onKeyChar,
    charNumUnderScore,
    sanitizeAlphaNumUnderScoreHyphen,
    charNumatdotUnderScore,
    charNum,
    charNumDot,
    charNumDotWithoutSpace,
    charNumDotWithoutSpecialCharacters,
    onlyNumbersDecimalWithoutSpecialCharacters,
    onlyNumbersDecimalWithoutSpecialCharactersUpto3Digits,
    allowedKeyCodes,
} from './modules/inputValidators';

export { maskingString, maskStringRandomly, maskStringRandomlyNew, maskingString_New } from './modules/masking';

export {
    getDayDifference,
    getRenewalMessage,
    RENEWAL_CONTENT,
    specialCharacters,
    getDaysOrHours,
    getMinutes,
} from './modules/renewal';

export {
    getMobilePlatformId,
    getDeviceName,
    getLanguageId,
    getLanguageName,
    MOBILE_DEVICES,
    HYBRID_LANGUAGES,
    getmasterData,
} from './modules/masterData';

export { getBrowserName, getFirefoxVersion, getCsvListType } from './modules/browserUtils';

export {
    updateBrandId,
    updateDepartmentList,
    checkIsBrandExists,
    getBrandName,
    getBrandNameUIPrintable,
} from './modules/brandStorage';

export {
    BRAND_ID_CHECK,
    CHANNELS_LIST,
    PAID_CHANNEL_LIST,
    CHANNELSSOCIAL_LIST,
    STATUS_LIST,
    getChannelId,
    getChannelSocialId,
    getChannelPaidMediaId,
    getNameType,
    analyticsAvaliableIds,
    analyticsIds,
    channelIds,
    getWeekName,
    getFileFromUrl,
} from './modules/communicationChannels';

export {
    campaignProgressStatus,
    getIconByStatus,
    getIndexBasedOnCampaign,
    getStatus,
    getPausePlayTrigger,
    getCommunicationType,
} from './modules/communicationStatus';

export { getChartColor, chartBookMark, hasNonZeroEngagementData, hasNonZeroPieChartSeriesData, hasNonZeroSeriesChartData, hasValidPieChartData } from './modules/charts';

export { truncateTitle, prepareTextForTruncate } from './modules/displayCore';

export {
    selectIcon,
    selectIconTooltip,
    accordianIcon,
    COMMUNICATION_LISTING_TAGS_TRUNCATE,
    renderCommunicationListingTags,
    createIncrementArray,
    replacePlusWithEncoded,
    updateErrorArray,
    checkScheduleDate,
    getFailureErrorMessage,
} from './modules/display';

export { handleCSSLoad, handleCSSUnload } from './modules/cssDom';

export {
    queryString,
    validateHttpsUrl,
    decodeJwt,
    EligibleReimderUrl,
    removeQueryParams,
    updateQueryParams,
} from './modules/urlQuery';

export {
  handleAdvanceSearchDataFormat,
  validateIsCustomNavigate,
  handleCustomNavigationDetails,
  buildCommunicationSettingsNavState,
  createCommunicationSettingsNavState,
  COMMUNICATION_SETTINGS_TAB,
  COMMUNICATION_SETTINGS_VERTICAL_TAB,
  VERTICAL_TAB_ID,
  MAIL_TAB_ID,
  MESSAGING_TAB_ID,
  NOTIFICATION_TAB_ID,
} from './modules/navigation';

export {
    checkIsEmptyArryObj,
    diff_minutes,
    campaignSchedule,
    getCityTime,
    statusIdCheck,
    getEventTriggerCampaignStatusCheck,
    checkTrigger,
    checkRFAApproved,
    validateRFAMandatory,
    checkUnscheduled,
    getNumberToLetter,
    formatNumber,
    formatTime,
} from './modules/campaignUtils';

export {
    dispatchMultipleAction,
    UpdateState,
    _isObject,
    getKeyByValue,
    versiumConfigData,
    versiumConfigContactData,
} from './modules/misc';

export { getToastCloseButton, isValidDate } from './modules/uiToast';
