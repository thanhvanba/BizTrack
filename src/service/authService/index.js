import axios from 'axios';
import { REFRESH_TOKEN_URL, REGISTER_URL, SIGNIN_URL, SIGN_OUT_URL } from '../apiUrl';
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
    // logOut: async () => {
    //     return axiosService()({
    //         method: 'POST',
    //         url: SIGN_OUT_URL,
    //     });
    // },
    // refreshToken: async (refresh_token) => {
    //     return axios({
    //         method: 'POST',
    //         url: REFRESH_TOKEN_URL,
    //         headers: {
    //             'Content-Type': 'text/plain',
    //         },
    //         data: refresh_token,
    //     })
    //         .then((res) => res.data)
    //         .catch((error) => {
    //             throw error;
    //         });
    // },
};

export default authService;