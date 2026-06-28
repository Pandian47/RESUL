const cache = new Map();

const CacheManager = {
    get: (key) => cache.get(key),
    set: (key, value) => cache.set(key, value),
    clear: (key) => key ? cache.delete(key) : cache.clear(),
    has: (key) => {
        const value = cache.get(key);
        return value && Object.keys(value).length > 0;
    }
};

export default CacheManager;