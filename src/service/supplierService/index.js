import { SUPPLIERS_URL, PURCHASE_ORDERS_URL, SUPPLIER_REPORT_URL } from "../apiUrl";
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
  getSupplierHistory: async (supplierId, params) => {
    return axiosService()({
      url: `${PURCHASE_ORDERS_URL}/supplier/${supplierId}/history`,
      method: "GET",
      params
    })
      .then((res) => res.data)
      .catch((error) => { throw error; });
  },

  // Lấy công nợ nhà cung cấp
  getSupplierReceivables: async (supplierId) => {
    return axiosService()({
      url: `${PURCHASE_ORDERS_URL}/supplier/${supplierId}/receivables`,
      method: "GET",
    })
      .then((res) => res.data)
      .catch((error) => { throw error; });
  },

  // Lấy sổ cái giao dịch của nhà cung cấp
  getSupplierTransactionLedger: async (supplierId, params = {}) => {
    return axiosService()({
      url: `${SUPPLIER_REPORT_URL}/${supplierId}/transaction-ledger`,
      method: "GET",
      params,
    })
      .then((res) => res.data)
      .catch((error) => { throw error; });
  },

  // Lấy lịch sử đơn nhập hàng của nhà cung cấp
  getSupplierPOHistory: async (supplierId, params = {}) => {
    return axiosService()({
      url: `${SUPPLIER_REPORT_URL}/${supplierId}/po-history`,
      method: "GET",
      params,
    })
      .then((res) => res.data)
      .catch((error) => { throw error; });
  },

  // Lấy công nợ phải trả nhà cung cấp
  getSupplierPayable: async (supplierId, params = {}) => {
    return axiosService()({
      url: `${SUPPLIER_REPORT_URL}/${supplierId}/payable`,
      method: "GET",
      params,
    })
      .then((res) => res.data)
      .catch((error) => { throw error; });
  },

  // Tạo giao dịch cho nhà cung cấp
  createSupplierTransaction: async (supplierId, data) => {
    return axiosService()({
      url: `${SUPPLIER_REPORT_URL}/${supplierId}/transaction`,
      method: "POST",
      data,
    })
      .then((res) => res.data)
      .catch((error) => { throw error; });
  },
};

export default supplierService;
