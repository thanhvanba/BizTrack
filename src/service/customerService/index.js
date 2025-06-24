import axios from "axios";
import { CUSTOMERS_URL, CUSTOMER_REPORT_URL } from "../apiUrl";
import axiosService from "../axiosService";

const customerService = {
  getAllCustomers: async (params) => {
    return axiosService()({
      url: CUSTOMERS_URL,
      method: "GET",
      params,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  getCustomerById: async (id) => {
    return axiosService()({
      url: `${CUSTOMERS_URL}/${id}`,
      method: "GET",
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  createCustomer: async (data) => {
    return axiosService()({
      url: CUSTOMERS_URL,
      method: "POST",
      data,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  updateCustomer: async (id, data) => {
    return axiosService()({
      url: `${CUSTOMERS_URL}/${id}`,
      method: "PUT",
      data,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  updateCustomerStatus: async (id, status) => {
    return axiosService()({
      url: `${CUSTOMERS_URL}/${id}/status`,
      method: "PUT",
      data: { status },
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  deleteCustomer: async (id) => {
    return axiosService()({
      url: `${CUSTOMERS_URL}/${id}`,
      method: "DELETE",
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

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

  getCustomerFinancialLedger: async (customerId) => {
    try {
      const response = await axios.get(`${CUSTOMER_REPORT_URL}/${customerId}/financial`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default customerService;
