import axios from "axios";
import { SUPPLIERS_URL, PURCHASE_ORDERS_URL } from "../apiUrl";
import axiosService from "../axiosService";

const supplierService = {
  getAllSuppliers: async (params) => {
    return axiosService()({
      url: SUPPLIERS_URL,
      method: "GET",
      params,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  getSupplierById: async (id) => {
    return axiosService()({
      url: `${SUPPLIERS_URL}/${id}`,
      method: "GET",
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  createSupplier: async (data) => {
    return axiosService()({
      url: SUPPLIERS_URL,
      method: "POST",
      data,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  updateSupplier: async (id, data) => {
    return axiosService()({
      url: `${SUPPLIERS_URL}/${id}`,
      method: "PUT",
      data,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  deleteSupplier: async (id) => {
    return axiosService()({
      url: `${SUPPLIERS_URL}/${id}`,
      method: "DELETE",
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  // Lấy lịch sử nhập hàng từ nhà cung cấp
  getSupplierHistory: async (supplierId) => {
    try {
      const response = await axios.get(`${PURCHASE_ORDERS_URL}/supplier/${supplierId}/history`);
      return response.data;
    } catch (error) {
      throw error;
    }
  },

  // Lấy công nợ nhà cung cấp
  getSupplierReceivables: async (supplierId) => {
    try {
      const response = await axios.get(`${PURCHASE_ORDERS_URL}/supplier/${supplierId}/receivables`);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};

export default supplierService;
