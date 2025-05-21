import { ORDERS_URL } from "../apiUrl";
import axiosService from "../axiosService";

const orderService = {
  getAllOrder: async () => {
    return axiosService()({
      url: ORDERS_URL,
      method: "GET",
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
};

export default orderService;
