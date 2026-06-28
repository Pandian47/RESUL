import axios from 'axios';

export default class HTTPInterceptor {
    constructor(baseURL, config = {}) {
        this._request = axios.create({
            baseURL,
            ...config,
        });
    }

    _requestInterceptor() {
        this._request.interceptors.use(this._requestHeader);
    }

    _responseInterceptor() {
        this._request.interceptors.response.use(this._saveResponse, this._errorHandler);
    }

    _saveResponse(res) {
        return res;
    }

    _errorHandler(error) {
        return Promise.reject(error);
    }

    _requestHeader() {
        return {
           // 'Content-Type': 'application/json',
            accept: 'application/json',
            // accessToken: localStorage.getItem('accessToken') || null,
        };
    }

    getRequest() {
        return this._request;
    }
}

