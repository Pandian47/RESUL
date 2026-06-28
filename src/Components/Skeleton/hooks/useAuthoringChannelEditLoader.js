import { useCallback, useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import useApiLoader from 'Hooks/useApiLoader';
import { isAuthoringChannelSaved, AUTHORING_SAVE_LOADER_CONFIG } from '../pages/communication/authoring/authoringChannelSkeletonConfig';

/**
 * Tracks edit-content API loading and drives authoring channel form skeleton (all channels).
 *
 * For multi-step edit flows (templates, languages, audience filter, then reset),
 * use beginEditSkeleton() at the start and finishEditSkeleton() after reset() — not runEditFetch alone.
 *
 * @param {object} options
 * @param {number} options.channelId - Primary channel id (e.g. 1 email, 2 sms, 8 web push)
 * @param {number} [options.subChannelId] - Sub-channel id for ads/social (defaults to channelId)
 * @param {boolean} [options.shouldLoadEdit=false] - Extra edit triggers (MDC edit, template flow). Do not pass campaignId > 0 alone — that is still create authoring.
 */
const useAuthoringChannelEditLoader = ({
    channelId,
    subChannelId,
    shouldLoadEdit = false,
} = {}) => {
    const savedChannelsId = useSelector(
        ({ communicationPlanReducer }) => communicationPlanReducer?.savedChannelsId ?? {},
    );
    const isSavedChannel = isAuthoringChannelSaved(savedChannelsId, channelId, subChannelId ?? channelId);
    const shouldShowEditSkeleton = isSavedChannel || shouldLoadEdit;

    const [isEditContentLoading, setIsEditContentLoading] = useState(false);
    const inFlightRef = useRef(0);

    const resetEditLoading = useCallback(() => {
        inFlightRef.current = 0;
        setIsEditContentLoading(false);
    }, []);

    const setEditLoading = useCallback((loading) => {
        if (loading) {
            inFlightRef.current += 1;
            setIsEditContentLoading(true);
            return;
        }
        inFlightRef.current = Math.max(0, inFlightRef.current - 1);
        if (inFlightRef.current === 0) {
            setIsEditContentLoading(false);
        }
    }, []);

    const beginEditSkeleton = useCallback(() => {
        // First-time create (campaign exists from plan, channel not saved) must not show form skeleton.
        if (!isSavedChannel && !shouldLoadEdit) return;
        setEditLoading(true);
    }, [isSavedChannel, setEditLoading, shouldLoadEdit]);

    const finishEditSkeleton = useCallback(() => {
        resetEditLoading();
    }, [resetEditLoading]);

    const runEditFetch = useCallback(
        async (fetchFn, options = {}) => {
            const { releaseAfterFetch = true } = options;
            if (typeof fetchFn !== 'function') {
                return undefined;
            }
            if (!shouldShowEditSkeleton) {
                return fetchFn();
            }
            beginEditSkeleton();
            try {
                return await fetchFn();
            } catch (error) {
                if (!releaseAfterFetch) {
                    finishEditSkeleton();
                }
                throw error;
            } finally {
                if (releaseAfterFetch) {
                    finishEditSkeleton();
                }
            }
        },
        [beginEditSkeleton, finishEditSkeleton, shouldShowEditSkeleton],
    );

    useEffect(() => () => resetEditLoading(), [resetEditLoading]);

    const showEditSkeleton = shouldShowEditSkeleton && isEditContentLoading;

    return {
        isSavedChannel,
        shouldShowEditSkeleton,
        isEditContentLoading,
        showEditSkeleton,
        beginEditSkeleton,
        finishEditSkeleton,
        runEditFetch,
        setEditLoading,
        resetEditLoading,
    };
};

export default useAuthoringChannelEditLoader;

/** Save / Next / RFA send — mirrors DeliveryMethod savePlanLoader (button + body lock, no global loader). */
export const useAuthoringChannelSaveLoader = () => {
    const saveLoader = useApiLoader({ autoFetch: false });
    const [submittingButtonType, setSubmittingButtonType] = useState(null);
    const [isSubmitFlowActive, setIsSubmitFlowActive] = useState(false);
    const isSubmitFlowActiveRef = useRef(false);

    const beginSubmit = useCallback((buttonType) => {
        isSubmitFlowActiveRef.current = true;
        setSubmittingButtonType(buttonType);
        setIsSubmitFlowActive(true);
    }, []);

    const endSubmit = useCallback(() => {
        isSubmitFlowActiveRef.current = false;
        setIsSubmitFlowActive(false);
        setSubmittingButtonType(null);
    }, []);

    const runSave = useCallback(
        async (buttonType, fetcher) => {
            const managesFlow = !isSubmitFlowActiveRef.current;
            if (managesFlow) {
                beginSubmit(buttonType);
            }
            try {
                return await saveLoader.refetch({
                    mode: 'create',
                    loaderConfig: AUTHORING_SAVE_LOADER_CONFIG,
                    fetcher: async () => fetcher(),
                });
            } finally {
                if (managesFlow) {
                    endSubmit();
                }
            }
        },
        [saveLoader, beginSubmit, endSubmit],
    );

    const isSubmitting = isSubmitFlowActive || saveLoader.isFetching;

    return {
        runSave,
        beginSubmit,
        endSubmit,
        isSubmitting,
        isSaveLoading: isSubmitting && submittingButtonType === 'save',
        isNextLoading: isSubmitting && submittingButtonType === 'form',
        isSendLoading: isSubmitting && submittingButtonType === 'send',
    };
};
