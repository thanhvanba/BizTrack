import axios from 'axios';
import { REFRESH_TOKEN_URL, REGISTER_URL, SIGNIN_URL, SIGN_OUT_URL, PROFILE_URL } from '../apiUrl';
import axiosService from '../axiosService';
const authService = {
    logIn: async (payload) => {
        console.log("🚀 ~ logIn: ~ payload:", payload)
        return axios({
            url: SIGNIN_URL,
            method: 'POST',
            data: payload,
        })
            .then((res) => res.data)
            .catch((error) => {
                throw error;
            });
    },
    register: async (payload) => {
        return axios({
            url: REGISTER_URL,
            method: 'POST',
            data: payload,
        })
            .then((res) => res.data)
            .catch((error) => {
                throw error;
            });
    },
    logOut: async (payload) => {
        return axiosService()({
            method: 'POST',
            url: SIGN_OUT_URL,
            data: payload,
        });
    },
    refreshToken: async (refreshToken) => {
        return axios({
            method: 'POST',
            url: REFRESH_TOKEN_URL,
            headers: {
                'Content-Type': 'application/json'
            },
            data: { refreshToken },
        })
            .then((res) => res.data)
            .catch((error) => {
                throw error;
            });
    },
    getUserInfo: async () => {
        return axiosService()({
            baseURL: `${PROFILE_URL}`,
            method: 'GET',
        })
            .then((res) => res.data)
            .catch((err) => {
                throw err;
            });
    },
};

export default authService;