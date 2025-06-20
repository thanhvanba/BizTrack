import axios from 'axios';
import toastNotify from "../utils/useToastNotify";
import { jwtDecode } from 'jwt-decode';
import { checkTokenExp } from '../utils/token';
import { useNavigate } from 'react-router-dom';
import authService from './authService';

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
                        localStorage.setItem('token', response.data.result.accessToken);
                        localStorage.setItem('refreshToken', response.data.result.refreshToken);
                        config.headers = {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${response?.data?.result?.accessToken}`,
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

        (error) => {
            Promise.reject(error);
        }
    );

    axiosInstance.interceptors.response.use(
        (response) => response,
        (errors) => {
            if (!errors.response) {
                toastNotify('Lỗi khi kết nối với server', 'error');
            }

            if (errors?.response?.status === 401) {
                toastNotify('Phiên đăng nhập đã hết hạn', 'error');
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
                localStorage.removeItem('username');
                setTimeout(() => {
                    window.location.hash = '#/register';
                }, 2000);
            }
            throw errors;
        }
    );

    return axiosInstance
}
export default axiosService;
