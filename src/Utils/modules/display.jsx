import { circle_arrow_down_medium, circle_arrow_up_medium, circle_minus_fill_medium, circle_plus_fill_medium, tag_medium } from 'Constants/GlobalConstant/Glyphicons';
import RSTooltip from 'Components/RSTooltip';
import { truncateTitle } from './displayCore';
import { getYYMMDD } from 'Utils/modules/dateTime';
export function selectIcon(index, errors) {
    return !index
        ? circle_plus_fill_medium +
        ' ' +
        `color-primary-blue  ${errors !== undefined &&
            Object.keys(errors)?.length > 0 &&
            Object.keys(errors).includes('approvalList')
            ? 'click-off'
            : ''
        }`
        : circle_minus_fill_medium + ' ' + 'color-primary-red';
}
export function selectIconTooltip(index) {
    return !index ? 'Add' : 'Remove';
}
export function accordianIcon(index, activeIndex) {
    return activeIndex === index
        ? circle_arrow_down_medium + ' ' + ' icon-md rs-accordion-icon-expand'
        : circle_arrow_up_medium + ' ' + ' icon-md rs-accordion-icon-collapse';
}
export const COMMUNICATION_LISTING_TAGS_TRUNCATE = 70;

export function renderCommunicationListingTags({
    tags,
    campaignId,
    campaignName,
    truncateAt = COMMUNICATION_LISTING_TAGS_TRUNCATE,
    className = '',
    tooltipPosition = 'bottom',
}) {
    const tagStr = typeof tags === 'string' ? tags : '';
    if (!tagStr.length) return null;
    const showTooltip = tagStr.length > truncateAt;
    const rootClass = ['rsclc-tags', 'd-flex', 'align-items-end', 'pt5', className].filter(Boolean).join(' ');
    return (
        <span
            className={rootClass}
            data-analytics-tags={tagStr}
            {...(campaignId != null && campaignId !== '' ? { 'data-campaign-id': campaignId } : {})}
            {...(campaignName ? { 'data-campaign-name': campaignName } : {})}
        >
            <i className={`${tag_medium} icon-md`} />
            {showTooltip ? (
                <RSTooltip text={tagStr} position={tooltipPosition}>
                    {truncateTitle(tagStr, truncateAt)}
                </RSTooltip>
            ) : (
                tagStr
            )}
        </span>
    );
}

export function createIncrementArray(count) {
    let result = [];

    for (let i = 1; i <= count; i++) {
        result.push({ text: `${i}`, value: `${i}` });
    }

    return result;
}
export function replacePlusWithEncoded(str) {
    return str?.replace(/\%2B/g, '+');
}
export function updateErrorArray(errorsArray, field, message) {
    const updatedErrors = errorsArray?.map((error) => (error?.hasOwnProperty(field) ? { [field]: message } : error));

    if (!updatedErrors?.some((error) => error.hasOwnProperty(field))) {
        updatedErrors?.push({ [field]: message });
    }

    return updatedErrors;
}
export function checkScheduleDate(currentSchedule, startDate, endDate) {
    if (!currentSchedule) return false;
    const updateCurrentDate = getYYMMDD(currentSchedule);
    if (updateCurrentDate < startDate || updateCurrentDate > endDate) {
        return true;
    } else {
        return false;
    }
}
export function getFailureErrorMessage(errors) {
    const filteredData = errors.filter((item) => Object.values(item).some((value) => value !== ''));

    return (
        <div className={`${filteredData?.length > 4 ? 'css-scrollbar' : ''}`}>
            <div className="rs-table-wrapper shadow-none">
                <table className="m0 w-100">
                    <thead>
                        <tr>
                            <th>API name</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredData.map((error, index) =>
                            Object.entries(error).map(([key, value], idx) => (
                                <tr key={`${index}-${idx}`}>
                                    <td>{key}</td>
                                    <td className="pl10">
                                        {value?.length > 40 ? (
                                            <RSTooltip text={value}>
                                                <span className="ellispis overflow-hidden w-100">
                                                    {truncateTitle(value, 40)}
                                                </span>
                                            </RSTooltip>
                                        ) : (
                                            <span className="ellispis overflow-hidden w-100">{value}</span>
                                        )}
                                    </td>
                                </tr>
                            )),
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
