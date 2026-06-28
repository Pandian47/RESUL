import { formatNumber } from 'Utils/modules/campaignUtils';
import TruncatedCell from 'Components/RSKendoGrid/TruncateCell.jsx'

function formatDuration(value) {
    if (value === 'NA' || value === null || value === undefined) return 'NA';
    const raw = String(value).trim();
    if (!raw) return 'NA';

    const formatDynamicDuration = (totalSeconds) => {
        if (!Number.isFinite(totalSeconds) || totalSeconds < 0) return 'NA';

        const wholeSeconds = Math.floor(totalSeconds);
        const hours = Math.floor(wholeSeconds / 3600);
        const minutes = Math.floor((wholeSeconds % 3600) / 60);
        const seconds = wholeSeconds % 60;
        const parts = [];

        if (hours > 0) parts.push(`${hours}h`);
        if (minutes > 0) parts.push(`${minutes}m`);

        if (seconds > 0 || parts.length === 0) {
            parts.push(`${seconds}s`);
        }

        return parts.join(' ');
    };

    // Handle values like "00:00:15"
    if (raw.includes(':')) {
        const parts = raw.split(':').map(Number);
        if (parts.some(Number.isNaN)) return 'NA';
        const [hh = 0, mm = 0, ss = 0] = parts;
        const totalSeconds = (hh * 3600) + (mm * 60) + ss;
        return formatDynamicDuration(totalSeconds);
    }

    // Handle values like "1.15s" / "1.15 sec"
    const numeric = Number(raw.replace(/[^0-9.]/g, ''));
    if (Number.isNaN(numeric)) return 'NA';
    return formatDynamicDuration(numeric);
}

function formatAudience(value) {
    if (value === 'NA' || value === null || value === undefined || value === '') return 'NA';
    const formatted = formatNumber(value);
    if (formatted === null || formatted === undefined) return 'NA';
    return String(formatted).toLowerCase() === 'nan' ? 'NA' : formatted;
}

function isNumericAudience(value) {
    if (value === 'NA' || value === null || value === undefined || value === '') return false;
    const numeric = Number(String(value).replace(/,/g, '').trim());
    return Number.isFinite(numeric);
}

function formatStatus(value) {
    if (value === 'NA' || value === null || value === undefined || value === '') return 'NA';
    const text = String(value).trim().toLowerCase();
    return text.charAt(0).toUpperCase() + text.slice(1);
}

const HeadBand = ({ details }) => (
    <div id="headBandJS" className="mt40">
        <ul className="headBandCSS">
            <li>
                <small>{details.ListType === '10' || details.ListType === '5' ? 'List name' : 'Import descripiton'}:</small>
                <h4><TruncatedCell value={details.ImportDescription} noTable={true} tooltipPosition="bottom" /></h4>
            </li>
            <li>
                <small>List type:</small>
                <h4><TruncatedCell value={details.ListType || 'NA'} noTable={true} tooltipPosition="bottom" /></h4>
            </li>
            <li>
                <small>Total audience:</small>
                <h4 className={isNumericAudience(details?.ImportAudiences) ? 'text-right' : ''}>
                    <TruncatedCell value={formatAudience(details?.ImportAudiences)} noTable={true} tooltipPosition="bottom" />
                </h4>
            </li>

            <li>
                <small>Start date and time:</small>
                <h4><TruncatedCell value={details.startDate || 'NA'} noTable={true} tooltipPosition="bottom" /></h4>
            </li>
            <li>
                <small>End date and time:</small>
                <h4><TruncatedCell value={details.endDate || 'NA'} noTable={true} tooltipPosition="bottom" /></h4>
            </li>
            <li>
                <small>Duration:</small>
                <h4><TruncatedCell value={formatDuration(details.duration)} noTable={true} tooltipPosition="bottom" /></h4>
            </li>
            <li style={{ width: '10%' }}>
                <small>Status:</small>
                <h4><TruncatedCell value={formatStatus(details.status)} noTable={true} tooltipPosition="bottom" /></h4>
            </li>

        </ul>
    </div>
);

export default HeadBand;
