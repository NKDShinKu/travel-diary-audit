import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';

// 定义刷新令牌接口的返回数据类型
interface RefreshResponse {
    message: string;
    user: {
        id: number;
        username: string;
        email: string;
    };
    token: string;
    refreshToken: string;
}

// 使用环境变量获取API基础URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://travel.achamster.live/api';

// 创建 axios 实例
const request: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
    // 添加跨域支持
    withCredentials: true,
});

let isRefreshing = false;
let requests: (() => void)[] = [];

// 请求拦截器
request.interceptors.request.use(
    config => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => {
        return Promise.reject(error);
    }
);

// 响应拦截器
request.interceptors.response.use(
    response => {
        // 成功状态码处理：200和201都是成功的响应
        // 201 Created 表示成功创建资源，在登录和注册时后端可能返回此状态码
        if (response.status === 200 || response.status === 201) {
            return response.data;
        }
        return response.data;
    },
    async error => {
        const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
        const errorCode = error.response?.data?.errorCode;

        if(error.response?.status === 401 && (error.response?.data.message === '密码错误' || error.response?.data.message === '用户不存在') ) {
            return Promise.reject(new Error('用户名或密码错误'));
        }

        // 处理 401/403 且不是刷新 token 的请求
        if (
            (error.response?.status === 401 || error.response?.status === 403) &&
            !originalRequest._retry &&
            !originalRequest.url?.includes('/auth/refresh') &&
            errorCode !== 'USER_ALREADY_REGISTERED'
        ) {
            console.log(error)
            if (isRefreshing) {
                // 如果正在刷新，返回一个未 resolve 的 promise
                return new Promise((resolve) => {
                    requests.push(() => {
                        resolve(request(originalRequest));
                    });
                });
            }

            originalRequest._retry = true;
            isRefreshing = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (!refreshToken) {
                    throw new Error('No refresh token');
                }

                // 发送刷新 token 请求
                const { data } = await axios.post<RefreshResponse>(`${BASE_URL}/auth/refresh`, {
                    refreshToken,
                });

                // 存储新的 token
                localStorage.setItem('token', data.token);
                localStorage.setItem('refreshToken', data.refreshToken);
                localStorage.setItem('userInfo', JSON.stringify(data.user));

                // 重试原始请求
                if (originalRequest.headers) {
                    originalRequest.headers.Authorization = `Bearer ${data.token}`;
                }

                // 执行挂起的请求
                requests.forEach(cb => cb());
                requests = [];

                return request(originalRequest);
            } catch (refreshError) {
                // 刷新 token 失败，清除存储并跳转登录
                localStorage.removeItem('token');
                localStorage.removeItem('refreshToken');
                localStorage.removeItem('userInfo');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            } finally {
                isRefreshing = false;
            }
        }        // 特殊处理 201 状态码（一般表示资源创建成功，例如登录成功）
        if (error.response?.status === 201) {
            return error.response.data;
        }

        // 处理可能的 CORS 错误
        if (!error.response && error.message === 'Network Error') {
            console.error('可能存在跨域问题:', error);
            return Promise.reject(new Error('网络请求失败，可能是跨域限制导致'));
        }
        
        // 其他错误处理
        return Promise.reject(error);
    }
);

export default request;