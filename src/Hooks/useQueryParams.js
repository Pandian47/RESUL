import { decryptWithAES, decodeLargeState } from 'Utils/modules/crypto';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';


// Memoized function to parse query params
const parseQueryParams = (param) => {
    if (!param) return null;
    try {
        const result = decodeLargeState(param);
        
        if (!result) {
            try {
                const normalizedParam = param.replaceAll(' ', '+');
                const decryptedState = decryptWithAES(decodeURIComponent(normalizedParam));
                const parsed = JSON.parse(decryptedState);
                if (parsed?.__v === 2 && parsed?.__sid) {
                    return null;
                }
                return parsed;
            } catch (fallbackErr) {
                return null;
            }
        }
        
        return result;
    } catch (err) {
        try {
            const normalizedParam = param.replaceAll(' ', '+');
            const decryptedState = decryptWithAES(decodeURIComponent(normalizedParam));
            const parsed = JSON.parse(decryptedState);
            if (parsed?.__v === 2 && parsed?.__sid) {
                return null;
            }
            return parsed;
        } catch (fallbackErr) {
            return null;
        }
    }
};

const useQueryParams = (url) => {
    const navigate = useNavigate();
    
    const getInitialState = useCallback(() => {
        const searchParams = new URLSearchParams(location.search);
        const param = searchParams.get('q');
        return parseQueryParams(param);
    }, []);

    const [state, setState] = useState(getInitialState);

    const param = useMemo(() => {
        const searchParams = new URLSearchParams(location.search);
        return searchParams.get('q');
    }, [location.search]);

    useEffect(() => {
        try {
            const parsedState = parseQueryParams(param);
            if (JSON.stringify(parsedState) !== JSON.stringify(state)) {
                setState(parsedState);
            }
        } catch (err) {
            navigate(url);
        }
    }, [param, url, navigate, state]);

    useEffect(() => {
        const handleQueryParamsChange = () => {
            const searchParams = new URLSearchParams(window.location.search);
            const newParam = searchParams.get('q');
            const parsedState = parseQueryParams(newParam);
            if (parsedState && JSON.stringify(parsedState) !== JSON.stringify(state)) {
                setState(parsedState);
            }
        };

        window.addEventListener('queryparamschange', handleQueryParamsChange);
        return () => {
            window.removeEventListener('queryparamschange', handleQueryParamsChange);
        };
    }, [state]);

    return state;
};

export default useQueryParams;
