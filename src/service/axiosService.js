import axios from 'axios';
import toastNotify from "../utils/useToastNotify";
import { jwtDecode } from 'jwt-decode';
import { checkTokenExp } from '../utils/token';
import { useNavigate } from 'react-router-dom';
import authService from './authService';
import sessionExpiredService from '../utils/sessionExpiredService';

let refreshTokenRequest = null;

const axiosService = () => {


    // eslint-disable-next-line react-hooks/rules-of-hooks
    const accessToken = localStorage.getItem('access_token') || '';
    const refreshToken = localStorage.getItem('refresh_token') || '';

    const loadRefreshToken = async () => {
        try {
            if (refreshToken) {
                const response = await authService.refreshToken(refreshToken);
                return response;
            }
        } catch (error) {
            console.log('error when call refresh token: ', error);
            throw error;
        }
    };

    const axiosInstance = axios.create({
        baseURL: `${import.meta.env.VITE_API_BASE_URL}`,
        headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    });
    // Truoc khi gui server
    axiosInstance.interceptors.request.use(
        async (config) => {
            if (!checkTokenExp(accessToken)) {
                refreshTokenRequest = loadRefreshToken();
                try {
                    const response = await refreshTokenRequest;
                    if (response) {
                        localStorage.setItem('access_token', response?.accessToken);
                        // localStorage.setItem('refresh_token', response.data.result.refreshToken);
                        config.headers = {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${response?.accessToken}`,
                        };
                        // reset token request for the next expiration
                        refreshTokenRequest = null;
                    }
                } catch (error) {
                    refreshTokenRequest = null;
                    if (!error.response) {
                        if (!error.response) {
                            toastNotify('Lỗi khi kết nối với server', "error")
                            // console.log('Lỗi khi kết nối với server', { variant: 'error' });
                        }
                    }
                }
                return config;
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    axiosInstance.interceptors.response.use(
        (response) => response,
        (errors) => {
            if (!errors.response) {
                toastNotify('Lỗi khi kết nối với server', 'error');
            }

            if (errors?.response?.status === 401) {
                // Hiển thị modal thay vì tự động chuyển hướng
                sessionExpiredService.showModal();
            }
            throw errors;
        }
    );

    return axiosInstance
}
export default axiosService;
