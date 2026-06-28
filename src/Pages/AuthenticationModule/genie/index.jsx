import { encodeUrl, getUserDetails } from 'Utils/modules/crypto';
import { getUserDateTimeFormat } from 'Utils/modules/dateTime';
import { numberWithCommas } from 'Utils/modules/formatters';
import { userImg } from 'Assets/Images';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation, useNavigate } from 'react-router-dom';

import {
    GenieApp,
    buildResulGenieEmbedConfig,
    createResulSegmentPanelSpaceidResolver,
    mapExecutiveDashboardFromTokenUsages,
    mapSidebarTokenUsageFromTokensV1,
    pickEdmTemplateIdFromGenieDetail,
    runResulGenieCreateSpaceThenDateRange,
    useGenieEmbedStylesheet,
    useResulGenieEntryPrefetchFetchSpaceIdData,
} from 'resul-genie-ui';
/** Resolved URL so we can inject `<link data-genie-keep>` — parent shell disables all other same-origin CSS on Genie routes. */
import genieUiStylesUrl from 'resul-genie-ui/style.css?url';

import RSLoader from 'Components/Loader';
import {
    getInsights as getInsightsRequest,
    getWorkingsSegment as getWorkingsSegmentRequest,
    updateUI,
} from 'Reducers/genie';
import { getSessionId } from 'Reducers/globalState/selector';
import { globalStateSelector } from 'Utils/Selectors/app';

import { openAppPathInNewTab, runGenieCampaignEdit, runGenieChannelEdit } from './genieCommunicationEditFlow';

import { FALLBACK_DATE_RANGE_MAX, FALLBACK_DATE_RANGE_MIN, GENIE_DEV_EMPTY_SPACE_PLACEHOLDER, GENIE_ENVIRONMENT, GENIE_LAST_ACTIVE_SPACE_CLEARED_EVENT, GENIE_LAST_ACTIVE_SPACE_STORAGE_KEY, GENIE_PROMPT_GROUP_MY, SEGMENT_CATEGORY_GALLERY, createGenieStaticApi, defaultSegmentCategoryFromPromptTypes, extractPromptTypesFromGenieResponse, fetchPromptGalleryApi, galleryItemsFromApiResponse, getDateRangeGenie, getGenieChat, getGenieChatID, getPromptTypeGenie, getTokenUsages, getTokens, hasSessionForGenie, mapPreviousPrompts, pickSpaceIdFromCreateResponse, text, toGenieDateYmd } from './constants';
const SPELL_CHECK_DICTIONARY_BASE_URL = String(import.meta.env.BASE_URL ?? '/').replace(/\/$/, '');

export default function Genie() {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const location = useLocation();
    const { userId, clientId, departmentId } = useSelector((state) => getSessionId(state));

    const [spaceId, setSpaceId] = useState(() => {
        if (typeof window === 'undefined') return '';
        try {
            const s = sessionStorage.getItem(GENIE_LAST_ACTIVE_SPACE_STORAGE_KEY);
            if (s && String(s).trim()) return String(s).trim();
        } catch {
            /* ignore */
        }
        return '';
    });

    /** Same navigation as GenieAINew `Chatmessages` segment edit — audience screen runs GetEditListNew / panel APIs. */
    const onSegmentEdit = useCallback(
        (detail) => {
            dispatch(
                updateUI({
                    showModal: false,
                    editCheck: true,
                    showWorkings: false,
                    insights: false,
                }),
            );

            const cardIndex = detail?.cardIndex ?? '';
            const redirectedURL = typeof detail?.redirectedURL === 'string' ? detail.redirectedURL.trim() : '';
            if (redirectedURL) {
                try {
                    const parsed = new URL(redirectedURL, window.location.origin);
                    const lowerPath = parsed.pathname.toLowerCase();
                    const isCommunicationEdit =
                        lowerPath.includes('/communication/communication-creation') ||
                        lowerPath.includes('/communication/create-communication') ||
                        lowerPath.includes('/communication/mdc-workflow') ||
                        lowerPath.includes('/communication/');

                    if (isCommunicationEdit) {
                        const params = parsed.searchParams;
                        if (!params.has('isGen')) params.set('isGen', 'true');
                        if (!params.has('cardIndex')) params.set('cardIndex', String(cardIndex));
                        openAppPathInNewTab(`${parsed.pathname}?${params.toString()}`, spaceId);
                        return;
                    }
                } catch {
                    // Ignore URL parse issues and continue with list-editor fallback.
                }
            }

            const listId = detail?.listId;
            if (listId == null || listId === '') return;
            const listType = detail?.listType ?? 5;
            const isRFA = Boolean(detail?.isRequestForApproval);
            openAppPathInNewTab(
                `/audience/create-target-list?targetListId=${listId}&listType=${listType}&isRFA=${isRFA}&isGen=true&cardIndex=${cardIndex}`,
                spaceId,
            );
        },
        [dispatch, spaceId],
    );

    /** Communication card channel-level edit — same flow as `CommunicationCards` `handleChannelEdit` → `/communication/create-communication`. */
    const onChannelEdit = useCallback(
        async (detail) => {
            dispatch(
                updateUI({
                    showModal: false,
                    editCheck: true,
                    showWorkings: false,
                    insights: false,
                    howerStaricon: false,
                }),
            );

            const cardIndex = detail?.cardIndex ?? '';
            const redirectedURL = typeof detail?.redirectedURL === 'string' ? detail.redirectedURL.trim() : '';
            if (redirectedURL) {
                try {
                    const parsed = new URL(redirectedURL, window.location.origin);
                    const pathLower = parsed.pathname.toLowerCase();
                    const needsEncryptedBootstrap =
                        pathLower.includes('/communication/create-communication') ||
                        pathLower.includes('/communication/communication-creation') ||
                        pathLower.includes('/communication/create-mdc-communication') ||
                        pathLower.includes('/communication/mdc-workflow');
                    const qParam = parsed.searchParams.get('q');
                    const hasQ = qParam != null && String(qParam).trim() !== '';
                    /** Without `q`, a new tab has no campaign/channel bootstrap — build URL via `runGenieChannelEdit`. */
                    if (!(needsEncryptedBootstrap && !hasQ)) {
                        const params = parsed.searchParams;
                        if (!params.has('isGen')) params.set('isGen', 'true');
                        if (!params.has('cardIndex')) params.set('cardIndex', String(cardIndex));
                        openAppPathInNewTab(`${parsed.pathname}?${params.toString()}`, spaceId);
                        return;
                    }
                } catch {
                    /* fall through to RESUL flow */
                }
            }
            await runGenieChannelEdit({
                dispatch,
                detail,
                cardIndex,
                departmentId,
                genieSpaceId: spaceId,
            });
        },
        [dispatch, departmentId, spaceId],
    );

    /** Communication card campaign-level edit — same as `CommunicationCards` `handleEdit` → `/communication/communication-creation` + `commPlanTab`. */
    const onCampaignEdit = useCallback(
        (detail) => {
            dispatch(
                updateUI({
                    showModal: false,
                    editCheck: true,
                    showWorkings: false,
                    insights: false,
                    howerStaricon: false,
                }),
            );
            const cardIndex = detail?.cardIndex ?? '';
            const redirectedURL = typeof detail?.redirectedURL === 'string' ? detail.redirectedURL.trim() : '';
            if (redirectedURL) {
                try {
                    const parsed = new URL(redirectedURL, window.location.origin);
                    const params = parsed.searchParams;
                    if (!params.has('isGen')) params.set('isGen', 'true');
                    if (!params.has('cardIndex')) params.set('cardIndex', String(cardIndex));
                    openAppPathInNewTab(`${parsed.pathname}?${params.toString()}`, spaceId);
                    return;
                } catch {
                    /* fall through */
                }
            }
            runGenieCampaignEdit({ dispatch, detail, cardIndex, genieSpaceId: spaceId });
        },
        [dispatch, spaceId],
    );

    /** Header “Exit Genie” → dashboard and clear last-chat hint so the next Genie entry (e.g. logo) opens a fresh prompt, not auto-restore. */
    const onExitGenie = useCallback(() => {
        try {
            sessionStorage.removeItem(GENIE_LAST_ACTIVE_SPACE_STORAGE_KEY);
        } catch {
            /* ignore */
        }
        navigate('/dashboard');
    }, [navigate]);

    /**
     * Genie UI “Edit in email builder” for generated EDM.
     * Do not call FetchTemplateById here — the email builder tab loads the template once via `getTemplate_AIEmail_byId`
     * (duplicate calls were caused by prefetch in Genie + builder mount, Strict Mode, and effect cleanup).
     */
    const onOpenEmailBuilder = useCallback(
        (detail) => {
            const channelId = Number(detail?.channelId ?? detail?.channelMode ?? 1) || 1;
            const resolvedTemplateId = pickEdmTemplateIdFromGenieDetail(detail);
            const templateName = detail?.templateName ?? detail?.name ?? '';
            const createdDate = detail?.createdDate ?? detail?.templateDate ?? '';
            const messageCardIndex = detail?.cardIndex ?? detail?.messageIndex;

            if (!resolvedTemplateId) {
                console.warn('Genie onOpenEmailBuilder: missing templateId in detail', detail);
                return;
            }

            dispatch(
                updateUI({
                    showModal: false,
                    editCheck: true,
                    showWorkings: false,
                    insights: false,
                    howerStaricon: false,
                }),
            );

            /**
             * Small `q` only (no JsonContent) — see encodeLargeState / cross-tab sessionStorage notes in prior commits.
             */
            const navStateForUrl = {
                templateId: resolvedTemplateId,
                mode: 'edit',
                templateName,
                templateDate: createdDate,
                templateType: '',
                templateCategoryType: undefined,
                from: 'genie',
                channelId,
            };

            try {
                sessionStorage.setItem('genieFromEmailBuilderEdit', '1');
                if (messageCardIndex != null && messageCardIndex !== '') {
                    sessionStorage.setItem('scrollToCard', String(messageCardIndex));
                }
            } catch {
                /* ignore */
            }

            const encryptState = encodeUrl(navStateForUrl);
            setTimeout(() => {
                openAppPathInNewTab(
                    `/preferences/template-gallery/email-builder?q=${encryptState}&mode=edit`,
                    spaceId,
                );
            }, 0);
        },
        [dispatch, spaceId],
    );

    const { isGenieCssReady, genieStylesLoadFailed } = useGenieEmbedStylesheet(genieUiStylesUrl);

    const { profilePicture } = useSelector((state) => globalStateSelector(state));
    /** Array required in DEV: genie only binds `prompts.promptGallery` when `Array.isArray(...)`. */
    const [promptGallery, setPromptGallery] = useState([]);
    const [previousPrompts, setPreviousPrompts] = useState(() => mapPreviousPrompts({}));
    /** DEV UI: `Audience/GetTokenUsagesv1` → sidebarTokenUsage; `Audience/GetTokenUsages` → executiveDashboard */
    const [genieUi, setGenieUi] = useState({});
    const [isCreateSpaceLoading, setIsCreateSpaceLoading] = useState(false);
    /** Exposed on `config.ui.fetchSpaceIdDataLoading` for package loaders (entry prefetch + `api.fetchSpaceIdData`). */
    const [isFetchSpaceIdDataLoading, setIsFetchSpaceIdDataLoading] = useState(false);
    const fetchSpaceApiLoadingCountRef = useRef(0);
    /** Bumps on every package “New prompt” (`clearGenieLastActiveSpace`) — same-route navigate does not change `location.pathname`. */
    const [newPromptEpoch, setNewPromptEpoch] = useState(0);
    const createSpaceInFlightRef = useRef(null);
    const tokenUsageInFlightRef = useRef(null);
    const fetchSpaceInFlightRef = useRef(new Map());
    /** `GetListingPreviewImage` — cached response + in-flight dedupe per thread + listing row (insights/workings-style reuse). */
    const listingPreviewCacheRef = useRef(new Map());
    const listingPreviewInFlightRef = useRef(new Map());
    /** Last `GetDateRangeGenie` range for gallery refetches when the package omits dates (tab bar). */
    const galleryDateRangeRef = useRef({
        start: FALLBACK_DATE_RANGE_MIN,
        end: FALLBACK_DATE_RANGE_MAX,
    });
    /** `Audience/GetPromptTypesByGenie` rows — drives default `segmentcategory` + id → name for gallery. */
    const [geniePromptTypes, setGeniePromptTypes] = useState([]);
    const [genieGallerySegmentCategory, setGenieGallerySegmentCategory] = useState(SEGMENT_CATEGORY_GALLERY);

    const bumpFetchSpaceIdDataLoading = useCallback((delta) => {
        const next = Math.max(0, fetchSpaceApiLoadingCountRef.current + delta);
        fetchSpaceApiLoadingCountRef.current = next;
        setIsFetchSpaceIdDataLoading(next > 0);
    }, []);

    /** GenieAINew `handleNewChat`: CreateSpaceIDByGenie then GetDateRangeGenie; loader stays until both complete. */
    const runCreateSpaceThenDateRange = useCallback(
        (createSpaceFn) =>
            runResulGenieCreateSpaceThenDateRange(createSpaceFn, () =>
                getDateRangeGenie({ userId, clientId, departmentId }),
            ),
        [userId, clientId, departmentId],
    );

    const upsertGenieUi = useCallback((partial) => {
        if (!partial || typeof partial !== 'object' || !Object.keys(partial).length) return;
        setGenieUi((prev) => ({ ...prev, ...partial }));
    }, []);

    /** After “New prompt”, genie clears `sessionStorage` but React `spaceId` can stay stale — align so new chats do not reuse the old thread id. */
    useEffect(() => {
        const p = location.pathname;
        const isGenieHome = p === '/genie' || p === '/genie/';
        if (!isGenieHome) return;
        try {
            const s = String(sessionStorage.getItem(GENIE_LAST_ACTIVE_SPACE_STORAGE_KEY) ?? '').trim();
            if (!s) setSpaceId('');
        } catch {
            setSpaceId('');
        }
    }, [location.pathname]);

    useEffect(() => {
        const onLastActiveCleared = () => {
            setSpaceId('');
            setNewPromptEpoch((e) => e + 1);
            listingPreviewCacheRef.current.clear();
            listingPreviewInFlightRef.current.clear();
        };
        window.addEventListener(GENIE_LAST_ACTIVE_SPACE_CLEARED_EVENT, onLastActiveCleared);
        return () => window.removeEventListener(GENIE_LAST_ACTIVE_SPACE_CLEARED_EVENT, onLastActiveCleared);
    }, []);

    /**
     * Every “New prompt” bumps `newPromptEpoch` (see `GENIE_LAST_ACTIVE_SPACE_CLEARED_EVENT`).
     * Pre-create space + date range each time, including repeated clicks on `/genie` (no pathname change).
     */
    useEffect(() => {
        const p = location.pathname;
        const isGenieHome = p === '/genie' || p === '/genie/';
        if (!isGenieHome) return;
        if (!hasSessionForGenie(userId, clientId, departmentId)) return;
        if (newPromptEpoch === 0) return;

        let cancelled = false;
        setIsCreateSpaceLoading(true);
        (async () => {
            try {
                const basePayload = { userId, clientId, departmentId };
                const res = await runCreateSpaceThenDateRange(() => getGenieChatID(basePayload));
                const newId = pickSpaceIdFromCreateResponse(res);
                if (!cancelled && newId) setSpaceId(String(newId));
            } catch (err) {
                console.error('Genie createSpaceId (new prompt pre-create) failed:', err);
            } finally {
                setIsCreateSpaceLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [newPromptEpoch, location.pathname, userId, clientId, departmentId, runCreateSpaceThenDateRange]);

    /**
     * Insights / Workings payloads use `spaceid` from the request body, React `spaceId`, then
     * `genie:lastActiveSpaceId` (written by `resul-genie-ui` `ChatPage` for the active thread).
     * When `getGenieConfig().session` is briefly empty (e.g. DEV `id === 'new'` clears merged session)
     * but the chat UI already has a thread, payload + state can both be blank while sessionStorage still
     * holds the correct id — without a stored fallback `Audience/FetchSegmentInsights` would post empty `spaceid`.
     */
    const segmentPanelSpaceidResolve = useMemo(
        () =>
            createResulSegmentPanelSpaceidResolver({
                storageKey: GENIE_LAST_ACTIVE_SPACE_STORAGE_KEY,
                devEmptyPlaceholder: GENIE_DEV_EMPTY_SPACE_PLACEHOLDER,
            }),
        [],
    );

    const resolveSegmentPanelSpaceid = useCallback(
        (payload) => segmentPanelSpaceidResolve(payload, spaceId),
        [segmentPanelSpaceidResolve, spaceId],
    );

    const tenantShortCode3 = useMemo(() => {
        const userDetails = getUserDetails() || {};
        const raw = String(userDetails?.tenantShortCode ?? userDetails?.tenantShortcode ?? 'res').trim();
        if (raw.length >= 3) return raw.slice(0, 3);
        return raw.padEnd(3, 'x');
    }, [userId, clientId, departmentId, upsertGenieUi]);

    const userProfile = useMemo(() => {
        const userDetails = getUserDetails() || {};
        const { profileImage } = userDetails;
        /** Same resolution order as GenieAINew SideNav `getProfileImage`. */
        const image = (() => {
            if (profilePicture) {
                return `data:image/png;base64,${profilePicture}`;
            }
            
            if (profileImage) {
                return `data:image/png;base64,${profileImage}`;
                
            }
        
            return userImg;
        })();
        const firstName = text(userDetails?.firstName).trim();
        const lastName = text(userDetails?.lastName).trim();
        const role = text(userDetails?.role || userDetails?.userRole || '');
        return {
            id: userId,
            name: [firstName, lastName].filter(Boolean).join(' ') || text(userDetails?.username || 'User'),
            firstName: firstName || undefined,
            lastName: lastName || undefined,
            role,
            email: text(userDetails?.email || userDetails?.emailId || ''),
            image,
            timezone: text(userDetails?.timezoneName || ''),
            timezoneId: userDetails?.timeZoneId ?? null,
            dateFormatId: userDetails?.dateFormatId ?? null,
            timeFormatId: userDetails?.timeFormatId ?? null,
            language: text(userDetails?.language || ''),
        };
    }, [profilePicture, userId, clientId, departmentId]);

    /** Token dashboard / sidebar — host date + number formatting (parity with GenieAINew). */
    const resulTokenUiFormatters = useMemo(
        () => ({
            formatDate: (d) => {
                try {
                    const s = getUserDateTimeFormat(d, 'formatDate');
                    return s && String(s).trim() ? s : null;
                } catch {
                    return null;
                }
            },
            formatNumber: numberWithCommas,
        }),
        [],
    );

    useEffect(() => {
        let mounted = true;
        const basePayload = { userId, clientId, departmentId };

        const bootstrap = async () => {
            let resumeSpaceId = '';
            try {
                resumeSpaceId = String(
                    sessionStorage.getItem(GENIE_LAST_ACTIVE_SPACE_STORAGE_KEY) ?? '',
                ).trim();
            } catch {
                resumeSpaceId = '';
            }

            try {
                let initialCreatedSpaceId = '';

                if (resumeSpaceId) {
                    if (mounted) setSpaceId(resumeSpaceId);
                } else {
                    try {
                        if (mounted) setIsCreateSpaceLoading(true);
                        const createRes = await runCreateSpaceThenDateRange(() => getGenieChatID(basePayload));
                        initialCreatedSpaceId = pickSpaceIdFromCreateResponse(createRes);
                        if (mounted && initialCreatedSpaceId) {
                            setSpaceId(initialCreatedSpaceId);
                        }
                    } catch (err) {
                        console.error('Genie CreateSpaceIDByGenie (bootstrap) failed:', err);
                    } finally {
                        if (mounted) setIsCreateSpaceLoading(false);
                    }
                }

                const bootstrapResults = await Promise.allSettled([
                    getGenieChat(basePayload),
                    getPromptTypeGenie(basePayload),
                    getTokenUsages({ ...basePayload, frequency: 'last30days' }),
                    getTokens({ ...basePayload, frequency: 'last30days' }),
                ]);

                const listSpaceRes =
                    bootstrapResults[0]?.status === 'fulfilled' ? bootstrapResults[0].value : null;
                const promptTypesRes =
                    bootstrapResults[1]?.status === 'fulfilled' ? bootstrapResults[1].value : null;
                const tokenUsagesRes =
                    bootstrapResults[2]?.status === 'fulfilled' ? bootstrapResults[2].value : null;
                const tokensV1Res =
                    bootstrapResults[3]?.status === 'fulfilled' ? bootstrapResults[3].value : null;

                const promptTypesList = extractPromptTypesFromGenieResponse(promptTypesRes);
                const segmentCategoryGallery = defaultSegmentCategoryFromPromptTypes(promptTypesRes);

                if (mounted) {
                    setGeniePromptTypes(promptTypesList);
                    setGenieGallerySegmentCategory(segmentCategoryGallery);
                    let gallerySpaceId =
                        resumeSpaceId ||
                        initialCreatedSpaceId ||
                        (() => {
                            try {
                                return String(
                                    sessionStorage.getItem(GENIE_LAST_ACTIVE_SPACE_STORAGE_KEY) ?? '',
                                ).trim();
                            } catch {
                                return '';
                            }
                        })();
                    let galleryItems = [];
                    try {
                        const drRaw = await getDateRangeGenie(basePayload);
                        const drD = drRaw?.data ?? drRaw;
                        const minRaw = drD?.min_date ?? drD?.minDate ?? FALLBACK_DATE_RANGE_MIN;
                        const maxRaw = drD?.max_date ?? drD?.maxDate ?? FALLBACK_DATE_RANGE_MAX;
                        const min = toGenieDateYmd(minRaw, FALLBACK_DATE_RANGE_MIN);
                        const max = toGenieDateYmd(maxRaw, FALLBACK_DATE_RANGE_MAX);
                        galleryDateRangeRef.current = { start: min, end: max };
                        const rawGallery = await fetchPromptGalleryApi({
                            ...basePayload,
                            spaceid: gallerySpaceId,
                            PromptGroup: GENIE_PROMPT_GROUP_MY,
                            segmentcategory: segmentCategoryGallery,
                            startdate: min,
                            enddate: max,
                        });
                        galleryItems = galleryItemsFromApiResponse(rawGallery, true);
                    } catch (ge) {
                        console.warn('Genie prompt gallery bootstrap (GetRetrievefinetuneprompts):', ge);
                    }
                    setPromptGallery(galleryItems);
                    setPreviousPrompts(mapPreviousPrompts(listSpaceRes ?? {}));

                    const sidebar = mapSidebarTokenUsageFromTokensV1(
                        tokensV1Res,
                        userId,
                        resulTokenUiFormatters,
                    );
                    const execDash = mapExecutiveDashboardFromTokenUsages(
                        tokenUsagesRes,
                        resulTokenUiFormatters,
                    );
                    upsertGenieUi({
                        ...(sidebar ? { sidebarTokenUsage: sidebar } : {}),
                        ...(execDash ? { executiveDashboard: execDash } : {}),
                    });
                }
            } catch (error) {
                console.error('Genie bootstrap failed:', error);
            }
        };

        if (hasSessionForGenie(userId, clientId, departmentId)) bootstrap();
        else setIsCreateSpaceLoading(false);
        return () => {
            mounted = false;
        };
    }, [userId, clientId, departmentId, runCreateSpaceThenDateRange, resulTokenUiFormatters]);

    const staticApi = useMemo(() => createGenieStaticApi(), []);
    const sessionPayload = useMemo(
        () => ({ userId, clientId, departmentId }),
        [userId, clientId, departmentId],
    );

    useResulGenieEntryPrefetchFetchSpaceIdData({
        userId,
        clientId,
        departmentId,
        lastActiveSpaceStorageKey: GENIE_LAST_ACTIVE_SPACE_STORAGE_KEY,
        devEmptyPlaceholder: GENIE_DEV_EMPTY_SPACE_PLACEHOLDER,
        staticApi,
        bumpFetchSpaceIdDataLoading,
        setSpaceId,
    });

    const genieConfig = useMemo(
        () =>
            buildResulGenieEmbedConfig({
                environment: GENIE_ENVIRONMENT,
                spellCheckDictionaryBaseUrl: SPELL_CHECK_DICTIONARY_BASE_URL,
                genieDevEmptySpacePlaceholder: GENIE_DEV_EMPTY_SPACE_PLACEHOLDER,
                lastActiveSpaceStorageKey: GENIE_LAST_ACTIVE_SPACE_STORAGE_KEY,
                sessionPayload,
                userId,
                clientId,
                departmentId,
                spaceId,
                setSpaceId,
                staticApi,
                genieUi,
                isCreateSpaceLoading,
                setIsCreateSpaceLoading,
                isFetchSpaceIdDataLoading,
                isGenieCssReady,
                genieStylesLoadFailed,
                promptGallery,
                previousPrompts,
                geniePromptTypes,
                genieGallerySegmentCategory,
                userProfile,
                tenantShortCode3,
                callbacks: {
                    onSegmentEdit,
                    onChannelEdit,
                    onCampaignEdit,
                    onOpenEmailBuilder,
                    onExitGenie,
                },
                listingPreviewCacheRef,
                listingPreviewInFlightRef,
                createSpaceInFlightRef,
                tokenUsageInFlightRef,
                fetchSpaceInFlightRef,
                galleryDateRangeRef,
                bumpFetchSpaceIdDataLoading,
                runCreateSpaceThenDateRange,
                resolveSegmentPanelSpaceid,
                upsertGenieUi,
                dispatch,
                getInsightsRequest,
                getWorkingsSegmentRequest,
                getTokenUsages,
                getTokens,
                getGenieChat,
                fetchPromptGalleryApi,
                mapPreviousPrompts,
                setPreviousPrompts,
                resulTokenUiFormatters,
            }),
        [
            userId,
            clientId,
            departmentId,
            promptGallery,
            previousPrompts,
            geniePromptTypes,
            genieGallerySegmentCategory,
            spaceId,
            userProfile,
            staticApi,
            sessionPayload,
            genieUi,
            tenantShortCode3,
            onSegmentEdit,
            onChannelEdit,
            onCampaignEdit,
            onOpenEmailBuilder,
            onExitGenie,
            resolveSegmentPanelSpaceid,
            upsertGenieUi,
            isCreateSpaceLoading,
            isFetchSpaceIdDataLoading,
            isGenieCssReady,
            genieStylesLoadFailed,
            bumpFetchSpaceIdDataLoading,
            runCreateSpaceThenDateRange,
            resulTokenUiFormatters,
            dispatch,
            getInsightsRequest,
            getWorkingsSegmentRequest,
            getTokenUsages,
            getTokens,
            getGenieChat,
            fetchPromptGalleryApi,
            mapPreviousPrompts,
            setPreviousPrompts,
        ],
    );

    return (
        <>
            {!isGenieCssReady ? (
                <div
                    className="genie-host-styles-gate"
                    style={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: '#f4f6f8',
                    }}
                    aria-busy="true"
                    aria-live="polite"
                    role="status"
                >
                    <RSLoader fallback />
                </div>
            ) : (
                <GenieApp config={genieConfig} />
            )}
        </>
    );
}
