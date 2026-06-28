import { useCallback, useEffect, useRef, useState } from 'react';
const SCROLL_AMOUNT = 200;

export const normalizeTabIndex = (tab) => {
    if (tab === '' || tab === null || tab === undefined) return 0;
    const index = Number(tab);
    return Number.isFinite(index) ? index : 0;
};

/**
 * Shared tab selection state used by default, portlet, and slide variants.
 */
export const useTabState = ({
    defaultTab = 0,
    tabData = [],
    callBack = () => {},
    onTabChange,
    syncDefaultTab = true,
}) => {
    const notifyChange = onTabChange || callBack;
    const [selectedIdx, setSelectedIdx] = useState(defaultTab);
    const [tabconfig, setTabConfig] = useState(tabData);

    useEffect(() => {
        if (tabData?.length) {
            setTabConfig(tabData);
        }
    }, [tabData]);

    useEffect(() => {
        if (syncDefaultTab && defaultTab !== selectedIdx) {
            setSelectedIdx(defaultTab);
        }
    }, [defaultTab, syncDefaultTab]);

    const setSelectedIndex = useCallback(
        (index, isForceUpdate = false) => {
            setSelectedIdx(index);
            if (!isForceUpdate && tabData?.[index]) {
                notifyChange(tabData[index], index, isForceUpdate);
            }
        },
        [tabData, notifyChange],
    );

    return {
        selectedIdx,
        tabconfig,
        setSelectedIdx,
        setSelectedIndex,
        setTabConfig,
    };
};

/**
 * Horizontal scroll controls shared by slide and smartSlide variants.
 */
export const useHorizontalScroll = (dependencies = []) => {
    const tabsContainerRef = useRef(null);
    const scrollControlsRef = useRef(null);
    const [hasPrev, setHasPrev] = useState(false);
    const [hasNext, setHasNext] = useState(false);

    const updateScrollState = useCallback(() => {
        const container = tabsContainerRef.current;
        if (!container) return;

        setHasPrev(container.scrollLeft > 0);
        setHasNext(container.scrollLeft + container.clientWidth < container.scrollWidth - 1);
    }, []);

    const handleScrollLeft = useCallback(() => {
        tabsContainerRef.current?.scrollBy({ left: -SCROLL_AMOUNT, behavior: 'smooth' });
    }, []);

    const handleScrollRight = useCallback(() => {
        tabsContainerRef.current?.scrollBy({ left: SCROLL_AMOUNT, behavior: 'smooth' });
    }, []);

    useEffect(() => {
        const container = tabsContainerRef.current;
        if (!container) return;

        const handleScroll = () => updateScrollState();
        const handleWheel = (e) => {
            if (e.deltaY !== 0) {
                container.scrollBy({ left: e.deltaY, behavior: 'smooth' });
                e.preventDefault();
            }
        };

        container.addEventListener('scroll', handleScroll);
        container.addEventListener('wheel', handleWheel, { passive: false });
        window.addEventListener('resize', updateScrollState);
        updateScrollState();

        return () => {
            container.removeEventListener('scroll', handleScroll);
            container.removeEventListener('wheel', handleWheel);
            window.removeEventListener('resize', updateScrollState);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, dependencies);

    useEffect(() => {
        const node = scrollControlsRef.current;
        if (!node) return;

        const observer = new MutationObserver(() => {
            if (node.style.transform === 'none') {
                node.style.removeProperty('transform');
            }
            if (node.style.transition === 'none') {
                node.style.removeProperty('transition');
            }
        });
        observer.observe(node, { attributes: true, attributeFilter: ['style'] });
        return () => observer.disconnect();
    }, []);

    return {
        tabsContainerRef,
        scrollControlsRef,
        hasPrev,
        hasNext,
        handleScrollLeft,
        handleScrollRight,
        updateScrollState,
    };
};
