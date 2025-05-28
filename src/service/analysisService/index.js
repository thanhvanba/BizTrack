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
};

export default analysisService;
