import { SUPPLIERS_URL } from "../apiUrl";
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
};

export default supplierService;
