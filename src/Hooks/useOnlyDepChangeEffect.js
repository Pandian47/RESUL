import { useEffect, useRef } from 'react';
function useOnlyDepChangeEffect(callback, dependencies) {
    const previousDependencies = useRef(dependencies);

    useEffect(() => {
        const dependencyChanged =
            dependencies?.length !== previousDependencies.current?.length ||
            dependencies.some((dep, index) => dep !== previousDependencies.current[index]);

        if (dependencyChanged) {
            callback();
        }

        previousDependencies.current = dependencies;
    }, dependencies);
}

export default useOnlyDepChangeEffect;
