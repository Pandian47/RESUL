import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';

/**
 * Single source for MDM tab loading — drives AudienceMdmPanelSkeleton via Audience index.
 */
const useMdmPageLoading = () => {
    const {
        audienceOverviewLoading,
        bindAudienceLoading,
        audienceGridLoading,
    } = useSelector(({ masterDataReducer }) => masterDataReducer);

    const [mdmHydrating, setMdmHydrating] = useState(true);
    const mdmLoadStartedRef = useRef(true);

    useEffect(() => {
        const isAnyLoading =
            audienceOverviewLoading || bindAudienceLoading || audienceGridLoading;

        if (isAnyLoading) {
            mdmLoadStartedRef.current = true;
            return;
        }

        if (mdmLoadStartedRef.current) {
            setMdmHydrating(false);
        }
    }, [audienceOverviewLoading, bindAudienceLoading, audienceGridLoading]);

    const beginMdmLoad = useCallback(() => {
        setMdmHydrating(true);
        mdmLoadStartedRef.current = true;
    }, []);

    const skipMdmLoad = useCallback(() => {
        setMdmHydrating(false);
    }, []);

    const isMdmPageLoading =
        mdmHydrating ||
        audienceOverviewLoading ||
        bindAudienceLoading ||
        audienceGridLoading;

    return {
        isMdmPageLoading,
        beginMdmLoad,
        skipMdmLoad,
        audienceOverviewLoading,
        bindAudienceLoading,
        audienceGridLoading,
    };
};

export default useMdmPageLoading;
