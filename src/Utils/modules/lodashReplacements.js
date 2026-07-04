/** Vanilla-JS replacements for the lodash functions previously used across this codebase. */

/** Trailing-edge debounce, matching the subset of lodash's debounce API actually used here (call + .cancel()). */
export function debounce(fn, wait = 0) {
    let timeoutId;
    const debounced = (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), wait);
    };
    debounced.cancel = () => clearTimeout(timeoutId);
    return debounced;
}

const toPath = (path) => {
    if (path == null) return [];
    if (Array.isArray(path)) return path;
    return String(path)
        .replace(/\[(\d+)\]/g, '.$1')
        .split('.')
        .filter(Boolean);
};

const toCollection = (collection) => {
    if (collection == null) return [];
    return Array.isArray(collection) ? collection : Object.values(collection);
};

export function get(object, path, defaultValue) {
    const pathArray = toPath(path);
    if (!pathArray.length) return object;
    const result = pathArray.reduce((current, key) => current?.[key], object);
    return result === undefined ? defaultValue : result;
}

export function hasIn(object, path) {
    let current = object;
    for (const key of toPath(path)) {
        if (current == null || !(key in Object(current))) return false;
        current = current[key];
    }
    return true;
}

export function map(collection, iteratee) {
    const fn = resolveIteratee(iteratee);
    if (Array.isArray(collection)) return collection.map(fn);
    if (collection == null) return [];
    return Object.entries(collection).map(([key, value]) => fn(value, key));
}

export function forEach(collection, iteratee) {
    if (collection == null) return collection;
    if (Array.isArray(collection)) {
        collection.forEach(iteratee);
        return collection;
    }
    Object.entries(collection).forEach(([key, value]) => iteratee(value, key));
    return collection;
}

export function filter(collection, predicate) {
    const fn = resolveMatchPredicate(predicate);
    return toCollection(collection).filter(fn);
}

export function reduce(collection, iteratee, initialValue) {
    const entries = toCollection(collection);
    if (arguments.length >= 3) return entries.reduce(iteratee, initialValue);
    return entries.reduce(iteratee);
}

export function sum(array) {
    return (array || []).reduce((total, value) => total + Number(value || 0), 0);
}

export function some(collection, predicate) {
    const fn = resolveMatchPredicate(predicate);
    return toCollection(collection).some(fn);
}

export function find(collection, predicate) {
    const fn = resolveMatchPredicate(predicate);
    return toCollection(collection).find(fn);
}

export function findIndex(collection, predicate) {
    const fn = resolveMatchPredicate(predicate);
    return toCollection(collection).findIndex(fn);
}

/** Deep equality, matching lodash's isEqual for plain objects/arrays/primitives/Date. */
export function deepEqual(a, b) {
    if (Object.is(a, b)) return true;
    if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false;
    if (a instanceof Date && b instanceof Date) return a.getTime() === b.getTime();
    if (a instanceof Date || b instanceof Date) return false;
    if (Array.isArray(a) || Array.isArray(b)) {
        if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
        return a.every((item, i) => deepEqual(item, b[i]));
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    return aKeys.every((key) => Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key]));
}

export const isEqual = deepEqual;

export function cloneDeep(value) {
    if (typeof structuredClone === 'function') {
        try {
            return structuredClone(value);
        } catch {
            // Fall back for values structuredClone cannot copy in older browser/runtime paths.
        }
    }
    if (value === null || typeof value !== 'object') return value;
    if (value instanceof Date) return new Date(value.getTime());
    if (Array.isArray(value)) return value.map(cloneDeep);
    return Object.entries(value).reduce((acc, [key, item]) => {
        acc[key] = cloneDeep(item);
        return acc;
    }, {});
}

const resolveIteratee = (iteratee) => {
    if (typeof iteratee === 'function') return iteratee;
    return (item) => get(item, iteratee);
};


const resolveMatchPredicate = (predicate) => {
    if (typeof predicate === 'function') return predicate;
    if (Array.isArray(predicate)) {
        if (predicate.length === 2) {
            const [path, expected] = predicate;
            return (item) => get(item, path) === expected;
        }
        return (item) =>
            Object.entries(predicate).every(([key, value]) => get(item, key) === value);
    }
    if (predicate && typeof predicate === 'object') {
        return (item) =>
            Object.entries(predicate).every(([key, value]) => get(item, key) === value);
    }
    if (typeof predicate === 'string') {
        return (item) => Boolean(get(item, predicate));
    }
    return () => false;
};

/** Sorts a copy of `collection` by one or more iteratees (string keys or functions), each ascending. */
export function sortBy(collection, iteratees) {
    const fns = (Array.isArray(iteratees) ? iteratees : [iteratees]).map(resolveIteratee);
    return [...(collection || [])].sort((a, b) => {
        for (const fn of fns) {
            const av = fn(a);
            const bv = fn(b);
            if (av < bv) return -1;
            if (av > bv) return 1;
        }
        return 0;
    });
}

/** Sorts a copy of `collection` by one or more iteratees, each with its own 'asc' | 'desc' order. */
export function orderBy(collection, iteratees, orders) {
    const fns = (Array.isArray(iteratees) ? iteratees : [iteratees]).map(resolveIteratee);
    const dirs = Array.isArray(orders) ? orders : [orders];
    return [...(collection || [])].sort((a, b) => {
        for (let i = 0; i < fns.length; i++) {
            const av = fns[i](a);
            const bv = fns[i](b);
            const dir = dirs[i] === 'desc' ? -1 : 1;
            if (av < bv) return -1 * dir;
            if (av > bv) return 1 * dir;
        }
        return 0;
    });
}

/** Groups `collection` items into an object keyed by `iteratee(item)`. */
export function groupBy(collection, iteratee) {
    const fn = resolveIteratee(iteratee);
    return (collection || []).reduce((acc, item) => {
        const key = fn(item);
        (acc[key] ??= []).push(item);
        return acc;
    }, {});
}

/** De-duplicates `collection` by `iteratee(item)`, keeping the first occurrence of each key. */
export function uniqBy(collection, iteratee) {
    const fn = resolveIteratee(iteratee);
    const seen = new Set();
    const result = [];
    for (const item of collection || []) {
        const key = fn(item);
        if (!seen.has(key)) {
            seen.add(key);
            result.push(item);
        }
    }
    return result;
}

/** Union of `arrays`, de-duplicated by `iteratee(item)` (last arg), keeping first occurrence of each key. */
export function unionBy(...args) {
    const iteratee = args[args.length - 1];
    const arrays = args.slice(0, -1);
    return uniqBy(arrays.flat(), iteratee);
}

/** Items in `array` whose `iteratee(item)` value isn't present among `values.map(iteratee)`. */
export function differenceBy(array, values, iteratee) {
    const fn = resolveIteratee(iteratee);
    const excluded = new Set((values || []).map(fn));
    return (array || []).filter((item) => !excluded.has(fn(item)));
}

/** Items in `array` with no match in `values` per the `comparator(arrayItem, valueItem)` function. */
export function differenceWith(array, values, comparator) {
    return (array || []).filter((item) => !(values || []).some((value) => comparator(item, value)));
}

/** Maps `object`'s keys through `iteratee(value, key)`, keeping the original values. */
export function mapKeys(object, iteratee) {
    const fn =
        typeof iteratee === 'function' ? iteratee : (value, key) => get(value, iteratee) ?? key;
    return Object.entries(object || {}).reduce((acc, [key, value]) => {
        acc[fn(value, key)] = value;
        return acc;
    }, {});
}

export function keys(object) {
    return Object.keys(object || {});
}

export function omit(object, paths) {
    const excluded = new Set(Array.isArray(paths) ? paths : [paths]);
    return Object.entries(object || {}).reduce((acc, [key, value]) => {
        if (!excluded.has(key)) acc[key] = value;
        return acc;
    }, {});
}

export function compact(array) {
    return (array || []).filter(Boolean);
}

export function flatten(array) {
    return (array || []).flat();
}

export function uniq(array) {
    return [...new Set(array || [])];
}

let uniqueIdCounter = 0;
export function uniqueId(prefix = '') {
    uniqueIdCounter += 1;
    return `${prefix}${uniqueIdCounter}`;
}

export function includes(collection, value) {
    if (typeof collection === 'string' || Array.isArray(collection)) return collection.includes(value);
    return Object.values(collection || {}).includes(value);
}

export function every(collection, predicate) {
    const fn = resolveMatchPredicate(predicate);
    return toCollection(collection).every(fn);
}

export function slice(array, start, end) {
    return (array || []).slice(start, end);
}

export function split(string, separator, limit) {
    return String(string ?? '').split(separator, limit);
}

export function replace(string, pattern, replacement) {
    return String(string ?? '').replace(pattern, replacement);
}

export function first(array) {
    return array?.[0];
}

export function last(array) {
    return array?.[array.length - 1];
}

export function size(value) {
    if (value == null) return 0;
    if (typeof value === 'string' || Array.isArray(value)) return value.length;
    if (value instanceof Map || value instanceof Set) return value.size;
    return Object.keys(value).length;
}

export function isEmpty(value) {
    if (value == null) return true;
    if (typeof value === 'string' || Array.isArray(value)) return value.length === 0;
    if (value instanceof Map || value instanceof Set) return value.size === 0;
    return Object.keys(value).length === 0;
}

export function isNil(value) {
    return value == null;
}

export function isNumber(value) {
    return typeof value === 'number' || value instanceof Number;
}

export function isArray(value) {
    return Array.isArray(value);
}

export function method(path, ...args) {
    return (object) => {
        const fn = get(object, path);
        return typeof fn === 'function' ? fn.apply(object, args) : undefined;
    };
}

/** Item in `collection` with the largest `iteratee(item)` value (lodash returns undefined for an empty collection). */
export function maxBy(collection, iteratee) {
    const fn = resolveIteratee(iteratee);
    return (collection || []).reduce(
        (max, item) => (max === undefined || fn(item) > fn(max) ? item : max),
        undefined,
    );
}

const WORD_RE = /[A-Z]+(?=[A-Z][a-z])|[A-Z]?[a-z]+|[A-Z]+|[0-9]+/g;
const words = (string) => String(string ?? '').match(WORD_RE) || [];

/** lodash-style camelCase: tokenizes into words, lowercases all but the first letter of each word after the first. */
export function camelCase(string) {
    return words(string)
        .map((word, i) => {
            const lower = word.toLowerCase();
            return i === 0 ? lower : lower.charAt(0).toUpperCase() + lower.slice(1);
        })
        .join('');
}

export function capitalize(string) {
    const value = String(string ?? '').toLowerCase();
    return value.charAt(0).toUpperCase() + value.slice(1);
}

/** lodash-style upperCase: tokenizes into words, uppercases each, joins with a space. */
export function upperCase(string) {
    return words(string).map((word) => word.toUpperCase()).join(' ');
}

/** lodash-style lowerCase: tokenizes into words, lowercases each, joins with a space. */
export function lowerCase(string) {
    return words(string).map((word) => word.toLowerCase()).join(' ');
}

export default {
    camelCase,
    capitalize,
    cloneDeep,
    compact,
    debounce,
    deepEqual,
    differenceBy,
    differenceWith,
    every,
    filter,
    find,
    findIndex,
    first,
    flatten,
    forEach,
    get,
    groupBy,
    hasIn,
    includes,
    isArray,
    isEmpty,
    isEqual,
    isNil,
    isNumber,
    keys,
    last,
    lowerCase,
    map,
    mapKeys,
    maxBy,
    method,
    omit,
    orderBy,
    reduce,
    replace,
    size,
    slice,
    some,
    sortBy,
    split,
    sum,
    unionBy,
    uniq,
    uniqBy,
    uniqueId,
    upperCase,
};
