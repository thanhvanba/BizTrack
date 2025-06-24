import axios from 'axios';
import { PRODUCTS_URL, PRODUCT_REPORT_URL } from '../apiUrl';
import axiosService from '../axiosService';

const productService = {

    getAllProducts: async (params) => {
        return axiosService()({
            url: PRODUCTS_URL,
            method: 'GET',
            params,
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    getProductById: async (id) => {
        return axiosService()({
            url: `${PRODUCTS_URL}/${id}`,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    createProduct: async (data) => {
        return axiosService()({
            url: PRODUCTS_URL,
            method: 'POST',
            data,
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    updateProduct: async (id, data) => {
        return axiosService()({
            url: `${PRODUCTS_URL}/${id}`,
            method: 'PUT',
            data,
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    deleteProduct: async (id) => {
        return axiosService()({
            url: `${PRODUCTS_URL}/${id}`,
            method: 'DELETE',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Lấy lịch sử sản phẩm theo ID sản phẩm
    getProductHistory: async (id) => {
        return axiosService()({
            url: `${PRODUCT_REPORT_URL}/${id}/history`,
            method: "GET",
        })
            .then((res) => res.data)
            .catch((error) => {
                throw error;
            });
    },

    // Lấy lịch sử sản phẩm theo ID sản phẩm + ID kho
    getProductHistoryByProductAndWarehouse: async (productId, warehouseId) => {
        return axiosService()({
            url: `${PRODUCT_REPORT_URL}/${productId}/${warehouseId}/history`,
            method: "GET",
        })
            .then((res) => res.data)
            .catch((error) => {
                throw error;
            });
    },
};

export default productService;
