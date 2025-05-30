import { CUSTOMERS_URL } from "../apiUrl";
import axiosService from "../axiosService";
import qs from "qs";

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
};

export default customerService;
