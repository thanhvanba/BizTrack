import axiosService from '../axiosService';
import { ANALYSIS_URL } from '../apiUrl';

const analysisService = {

    // Lấy hóa đơn với bộ lọc   
    getInvoicesWithFilters: async (params) => {
        return axiosService()({
            url: `${ANALYSIS_URL}/invoices`,
            method: 'GET',
            params, // query parameters for filters
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Tổng thu chi
    getOutstandingDebt: async () => {
        return axiosService()({
            url: `${ANALYSIS_URL}/dashboard/money`,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Lấy doanh thu theo khoảng thời gian
    getRevenueByTimePeriod: async (params) => {
        return axiosService()({
            url: `${ANALYSIS_URL}/finance/revenue`,
            method: 'GET',
            params, // e.g., { start_date, end_date }
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Lấy danh sách đơn hàng phải thu
    getReceivableOrders: async () => {
        return axiosService()({
            url: `${ANALYSIS_URL}/finance/receivable_orders`,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Lấy danh sách đơn nhập hàng phải trả
    getPayablePurchaseOrders: async () => {
        return axiosService()({
            url: `${ANALYSIS_URL}/finance/payable_purchase_orders`,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Lấy danh sách đơn nhập hàng phải trả
    getFinancialStatistics: async (params) => {
        return axiosService()({
            url: `${ANALYSIS_URL}/finance/management`,
            method: 'GET',
            params,
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Lấy top các khách hàng mua hàng nhiều nhất
    getTopCustomers: async (params) => {
        return axiosService()({
            url: `${ANALYSIS_URL}/finance/top-customers`,
            method: 'GET',
            params,
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    getTopSelling: async (params) => {
        return axiosService()({
            url: `${ANALYSIS_URL}/products/top-selling`,
            method: 'GET',
            params,
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    getTopPurchasing: async (params) => {
        return axiosService()({
            url: `${ANALYSIS_URL}/suppliers/top-purchasing`,
            method: 'GET',
            params,
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    getRevenueByCategory: async (params) => {
        return axiosService()({
            url: `${ANALYSIS_URL}/category/revenue`,
            method: 'GET',
            params,
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Lấy số khách hàng mới trong tháng hiện tại
    getNewCustomersInMonth: async () => {
        return axiosService()({
            url: `${ANALYSIS_URL}/dashboard/customers-new-in-month`,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Lấy số sản phẩm mới trong tháng hiện tại
    getNewProductsInMonth: async () => {
        return axiosService()({
            url: `${ANALYSIS_URL}/dashboard/products-new-in-month`,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Lấy tổng số khách hàng
    getTotalCustomers: async () => {
        return axiosService()({
            url: `${ANALYSIS_URL}/dashboard/total-customers`,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Lấy tổng số sản phẩm
    getTotalProducts: async () => {
        return axiosService()({
            url: `${ANALYSIS_URL}/dashboard/total-products`,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },
};

export default analysisService;
