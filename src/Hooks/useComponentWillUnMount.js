import { useEffect, useRef } from 'react';

function useComponentWillUnmount(cleanupCallback = () => {}) {
    const callbackRef = useRef(cleanupCallback);
    const isMounted = useRef(false);

    callbackRef.current = cleanupCallback;

    useEffect(() => {
        isMounted.current = true;

        return () => {
            isMounted.current = false;
            callbackRef.current?.();
        };
    }, []);

    return { isMounted };
}

export default useComponentWillUnmount;