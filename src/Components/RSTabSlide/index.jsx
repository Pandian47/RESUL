/**
 * RSTabSlide — legacy wrapper
 *
 * Delegates all rendering to ResTabber with variant="smartSlide".
 * Maintains the original prop surface so existing call-sites require zero changes.
 */
import { memo } from 'react';
import ResTabber from 'Pages/KendoDocs/CommonComponents/ResTabber';

const RSTabSlide = ({ componentClassname, componentClassName, flatTabs: _flatTabs, ...rest }) => (
    <ResTabber
        variant="smartSlide"
        componentClassName={componentClassName ?? componentClassname}
        {...rest}
    />
);

export default memo(RSTabSlide);
