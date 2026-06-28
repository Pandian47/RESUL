import { useEffect, useRef } from 'react';
const useSkipFirstRender = (func, deps) => {
    const isFirstRender  = useRef(true);
    const prevDeps = useRef(deps);
    useEffect(() => {
        const changed = deps?.some((dep, i) => JSON.stringify(dep) !== JSON.stringify(prevDeps.current[i]));
        if (!isFirstRender.current && changed) {
            func?.();
        }
        isFirstRender.current = false;
        prevDeps.current = deps;
    }, deps);
};

export default useSkipFirstRender;
