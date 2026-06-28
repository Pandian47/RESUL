import { useEffect, useState } from 'react';
export const useWindowSize = () => {
    const [windowSize, setWindowSize] = useState(() => {
        const height = window.innerHeight;
        return {
            width: window.innerWidth,
            height,
            pageSize: getPageSizeByHeight(height)
        };
    });

    useEffect(() => {
        let timeoutId = null;
        const handleResize = () => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                const height = window.innerHeight;
                const width = window.innerWidth;
                const pageSize = getPageSizeByHeight(height);

                setWindowSize((prev) => {
                    if (
                        prev.pageSize !== pageSize ||
                        prev.height !== height ||
                        prev.width !== width
                    ) {
                        return { width, height, pageSize };
                    }
                    return prev;
                });
            }, 100); // adjust delay if needed
        };

        window.addEventListener('resize', handleResize);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('resize', handleResize);
        };
    }, []);

    return windowSize;
};


const PAGE_SIZE_BREAKPOINTS = [
    [600, 3],
    [768, 5], 
    [900, 8], 
    [1080, 10],
    [1440, 15], 
    [2160, 20],
    [Infinity, 25]
];

export const getPageSizeByHeight = (height) => {
    for (const [breakHeight, size] of PAGE_SIZE_BREAKPOINTS) {
        if (height < breakHeight) return size;
    }
    return 25;
};