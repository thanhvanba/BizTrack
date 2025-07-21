import { SEARCH_URL } from '../apiUrl';
import axiosService from '../axiosService';

const searchService = {
    // Tìm khách hàng theo số điện thoại
    searchCustomerByPhone: async (phone) => {
        return axiosService()({
            url: `${SEARCH_URL}/customers-by-phone`,
            method: 'GET',
            params: { phone },
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

    // Tìm sản phẩm theo tên
    searchProductsByName: async (name) => {
        return axiosService()({
            url: `${SEARCH_URL}/products-by-name`,
            method: 'GET',
            params: { name },
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },
};

export default searchService;
