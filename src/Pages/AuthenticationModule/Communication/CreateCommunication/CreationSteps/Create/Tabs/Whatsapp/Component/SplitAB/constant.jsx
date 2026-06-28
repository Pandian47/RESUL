import { pdf_download_large } from 'Constants/GlobalConstant/Glyphicons';
const validImageExtensions = ['jpeg', 'jpg', 'png', 'svg', 'gif'];
const validVideoExtensions = ['mp4', 'avi', 'mov', 'mkv', 'wmv', 'flv', 'webm', 'mpeg', 'mpg'];
const validdocExtensions = ['pdf'];

export const getMediaSource = (waMediaURL, waMediaURLType) => {
    if (validImageExtensions.includes(waMediaURLType?.toLowerCase())) {
        return `<img src=${waMediaURL} alt="image" />`;
    } else if (validVideoExtensions.includes(waMediaURLType?.toLowerCase())) {
        return `<video width="200" height="140" controls>
                <source src=${waMediaURL} type="video/mp4" />
            </video>`;
    } else if (validdocExtensions.includes(waMediaURLType?.toLowerCase())) {
        return `<i class="${pdf_download_large} icon-lg color-primary-blue pe-none"></i>`;
    } else return '';
};
