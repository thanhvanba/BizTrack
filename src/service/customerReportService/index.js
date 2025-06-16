import axios from 'axios';
import { CUSTOMER_REPORT_URL } from '../apiUrl'; // Cần đảm bảo CUSTOMER_REPORT_URL được khai báo đúng

const customerReportService = {
    // Tổng quan khách hàng
    getCustomerOverview: async (customerId) => {
        return axios({
            url: `${CUSTOMER_REPORT_URL}/${customerId}/overview`,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Lịch sử trả hàng
    getCustomerSalesReturnHistory: async (customerId) => {
        return axios({
            url: `${CUSTOMER_REPORT_URL}/${customerId}/sales-return-history`,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Lịch sử đơn hàng
    getCustomerOrderHistory: async (customerId) => {
        return axios({
            url: `${CUSTOMER_REPORT_URL}/${customerId}/order-history`,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    // Công nợ
    getCustomerReceivables: async (customerId) => {
        return axios({
            url: `${CUSTOMER_REPORT_URL}/${customerId}/receivables`,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },
};

export default customerReportService;
