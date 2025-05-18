import { WAREHOUSES_URL } from '../apiUrl';
import axiosService from '../axiosService';

const warehouseService = {
  getAllWarehouses: async () => {
    return axiosService()({
      url: WAREHOUSES_URL,
      method: 'GET',
    })
      .then(res => res.data)
      .catch(error => { throw error; });
  },

  getWarehouseById: async (id) => {
    return axiosService()({
      url: `${WAREHOUSES_URL}/${id}`,
      method: 'GET',
    })
      .then(res => res.data)
      .catch(error => { throw error; });
  },

  createWarehouse: async (data) => {
    return axiosService()({
      url: WAREHOUSES_URL,
      method: 'POST',
      data,
    })
      .then(res => res.data)
      .catch(error => { throw error; });
  },

  updateWarehouse: async (id, data) => {
    return axiosService()({
      url: `${WAREHOUSES_URL}/${id}`,
      method: 'PUT',
      data,
    })
      .then(res => res.data)
      .catch(error => { throw error; });
  },

  deleteWarehouse: async (id) => {
    return axiosService()({
      url: `${WAREHOUSES_URL}/${id}`,
      method: 'DELETE',
    })
      .then(res => res.data)
      .catch(error => { throw error; });
  },
};

export default warehouseService;
