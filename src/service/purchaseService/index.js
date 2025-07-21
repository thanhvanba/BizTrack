import { PURCHASE_ORDERS_URL } from '../apiUrl';
import axiosService from '../axiosService';

const purchaseOrderService = {
    getAllPurchaseOrders: async () => {
        return axiosService()({
            url: PURCHASE_ORDERS_URL,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    getPurchaseOrderById: async (id) => {
        return axiosService()({
            url: `${PURCHASE_ORDERS_URL}/${id}`,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },
    getPurchaseOrderDetail: async (id) => {
        return axiosService()({
            url: `${PURCHASE_ORDERS_URL}/${id}/details`,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },
    ApprovePO: async (id) => {
        return axiosService()({
            url: `${PURCHASE_ORDERS_URL}/${id}/post`,
            method: 'POST',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    createPurchaseOrder: async (data) => {
        return axiosService()({
            url: PURCHASE_ORDERS_URL,
            method: 'POST',
            data,
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    updatePurchaseOrder: async (id, data) => {
        return axiosService()({
            url: `${PURCHASE_ORDERS_URL}/${id}/podetails`,
            method: 'PUT',
            data,
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    deletePurchaseOrder: async (id) => {
        return axiosService()({
            url: `${PURCHASE_ORDERS_URL}/${id}`,
            method: 'DELETE',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },
};

export default purchaseOrderService;
