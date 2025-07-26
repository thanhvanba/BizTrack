import { SEARCH_URL } from '../apiUrl';
import axiosService from '../axiosService';

const searchService = {
    // Tìm khách hàng theo số điện thoại/ tên
    searchCustomer: async (q, page = 1, limit = 10) => {
        return axiosService()({
            url: `${SEARCH_URL}/customers-search`,
            method: 'GET',
            params: { q, page, limit },
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Tìm đơn hàng theo số điện thoại
    searchOrdersByPhone: async (phone) => {
        return axiosService()({
            url: `${SEARCH_URL}/orders-by-phone`,
            method: 'GET',
            params: { phone },
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },
    searchOrders: async (q, page = 1, limit = 10) => {
        return axiosService()({
            url: `${SEARCH_URL}/orders-search`,
            method: 'GET',
            params: { q, page, limit },
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Tìm sản phẩm theo tên sku/ tên
    searchProducts: async (q, page = 1, limit = 10) => {
        return axiosService()({
            url: `${SEARCH_URL}/products-search`,
            method: 'GET',
            params: { q, page, limit },
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Tìm danh mục theo tên
    searchCategoryByName: async (name, page = 1, limit = 10) => {
        return axiosService()({
            url: `${SEARCH_URL}/categories-by-name`,
            method: 'GET',
            params: { name, page, limit },
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Tìm kho theo tên
    searchWarehouseByName: async (name, page = 1, limit = 10) => {
        return axiosService()({
            url: `${SEARCH_URL}/warehouses-by-name`,
            method: 'GET',
            params: { name, page, limit },
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Tìm kiếm tồn kho
    searchInventory: async (params = {}, page = 1, limit = 10) => {
        return axiosService()({
            url: `${SEARCH_URL}/inventory`,
            method: 'GET',
            params: { ...params, page, limit },
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },
};

export default searchService;
