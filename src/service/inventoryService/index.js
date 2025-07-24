import axiosService from '../axiosService';
import { INVENTORY_URL } from '../apiUrl'

const inventoryService = {

    getAllInventories: async (params) => {
        return axiosService()({
            url: INVENTORY_URL,
            method: 'GET',
            params,
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    getInventoryById: async (id) => {
        return axiosService()({
            url: `${INVENTORY_URL}/${id}`,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    getInventoryByWarehouseId: async (id, params) => {
        return axiosService()({
            url: `${INVENTORY_URL}/${id}/warehouses`,
            method: 'GET',
            params,
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    createInventory: async (data) => {
        return axiosService()({
            url: INVENTORY_URL,
            method: 'POST',
            data,
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    deleteInventory: async (id) => {
        return axiosService()({
            url: `${INVENTORY_URL}/${id}`,
            method: 'DELETE',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },
};

export default inventoryService;
