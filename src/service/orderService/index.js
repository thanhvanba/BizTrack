import axios from "axios";
import { ORDERS_URL, CUSTOMER_RETURN_URL } from "../apiUrl";
import axiosService from "../axiosService";

const orderService = {
  getAllOrder: async (params) => {
    return axiosService()({
      url: ORDERS_URL,
      method: "GET",
      params,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  getOrderById: async (id) => {
    return axiosService()({
      url: `${ORDERS_URL}/${id}`,
      method: "GET",
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  createOrder: async (data) => {
    return axiosService()({
      url: ORDERS_URL,
      method: "POST",
      data,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  createOrderWithDetails: async (data) => {
    return axiosService()({
      url: `${ORDERS_URL}/with-details`,
      method: "POST",
      data,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  updateOrder: async (id, data) => {
    return axiosService()({
      url: `${ORDERS_URL}/${id}`,
      method: "PUT",
      data,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  updateOrderWithDetail: async (id, data) => {
    return axiosService()({
      url: `${ORDERS_URL}/${id}/with-details`,
      method: "PUT",
      data,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  deleteOrder: async (ids) => {
    return axiosService()({
      url: ORDERS_URL,
      method: "DELETE",
      params: {
        id: ids,
      },
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  getOrderSummaryByStatus: async (params) => {
    return axiosService()({
      url: `${ORDERS_URL}/summary/status`,
      method: "GET",
      params,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  createReturn: async (data) => {
    return axios({
      url: `${CUSTOMER_RETURN_URL}`,
      method: "POST",
      data,
    }).then(res => res.data).catch(error => { throw error; });
  },

  getReturns: async (params) => {
    return axios({
      url: `${CUSTOMER_RETURN_URL}`,
      method: "GET",
      params,
    }).then(res => res.data).catch(error => { throw error; });
  },

  getReturnStatistics: async () => {
    return axios({
      url: `${CUSTOMER_RETURN_URL}/statistics`,
      method: "GET",
    }).then(res => res.data).catch(error => { throw error; });
  },

  getReturnReport: async () => {
    return axios({
      url: `${CUSTOMER_RETURN_URL}/report`,
      method: "GET",
    }).then(res => res.data).catch(error => { throw error; });
  },

  getReturnById: async (returnId) => {
    return axios({
      url: `${CUSTOMER_RETURN_URL}/${returnId}`,
      method: "GET",
    }).then(res => res.data).catch(error => { throw error; });
  },

  updateReturn: async (returnId, data) => {
    return axios({
      url: `${CUSTOMER_RETURN_URL}/${returnId}`,
      method: "PUT",
      data,
    }).then(res => res.data).catch(error => { throw error; });
  },

  deleteReturn: async (returnId) => {
    return axios({
      url: `${CUSTOMER_RETURN_URL}/${returnId}`,
      method: "DELETE",
    }).then(res => res.data).catch(error => { throw error; });
  },

  processReturn: async (returnId, data) => {
    return axios({
      url: `${CUSTOMER_RETURN_URL}/${returnId}/process`,
      method: "POST",
      data,
    }).then(res => res.data).catch(error => { throw error; });
  },

  approveReturn: async (returnId) => {
    return axios({
      url: `${CUSTOMER_RETURN_URL}/${returnId}/approve`,
      method: "POST",
    }).then(res => res.data).catch(error => { throw error; });
  },

  rejectReturn: async (returnId, data) => {
    return axios({
      url: `${CUSTOMER_RETURN_URL}/${returnId}/reject`,
      method: "POST",
      data,
    }).then(res => res.data).catch(error => { throw error; });
  },

  calculateRefund: async (returnId) => {
    return axios({
      url: `${CUSTOMER_RETURN_URL}/${returnId}/calculate-refund`,
      method: "GET",
    }).then(res => res.data).catch(error => { throw error; });
  },

  checkOrderEligibility: async (orderId) => {
    return axios({
      url: `${CUSTOMER_RETURN_URL}/order/${orderId}/eligibility`,
      method: "GET",
    }).then(res => res.data).catch(error => { throw error; });
  },

  getReturnsByCustomer: async (customerId) => {
    return axios({
      url: `${CUSTOMER_RETURN_URL}/customer/${customerId}`,
      method: "GET",
    }).then(res => res.data).catch(error => { throw error; });
  },

  getReturnsByOrder: async (orderId) => {
    return axios({
      url: `${CUSTOMER_RETURN_URL}/order/${orderId}/returns`,
      method: "GET",
    }).then(res => res.data).catch(error => { throw error; });
  },

  updateRefundAmount: async (returnItemId, data) => {
    return axios({
      url: `${CUSTOMER_RETURN_URL}/item/${returnItemId}/refund-amount`,
      method: "PUT",
      data,
    }).then(res => res.data).catch(error => { throw error; });
  },

};

export default orderService;
