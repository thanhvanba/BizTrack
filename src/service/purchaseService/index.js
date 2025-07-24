import { PURCHASE_ORDERS_URL, SUPPLIER_RETURN_URL } from '../apiUrl';
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

    // Tạo đơn trả hàng nhà cung cấp
    createReturn: async (data) => {
        return axiosService()({
            url: SUPPLIER_RETURN_URL,
            method: 'POST',
            data,
        }).then(res => res.data).catch(error => { throw error; });
    },
    // Lấy danh sách đơn trả hàng nhà cung cấp
    getReturns: async (params) => {
        return axiosService()({
            url: SUPPLIER_RETURN_URL,
            method: 'GET',
            params,
        }).then(res => res.data).catch(error => { throw error; });
    },
    // Lấy chi tiết đơn trả hàng nhà cung cấp
    getReturnById: async (return_id) => {
        return axiosService()({
            url: `${SUPPLIER_RETURN_URL}/${return_id}`,
            method: 'GET',
        }).then(res => res.data).catch(error => { throw error; });
    },
    // Cập nhật đơn trả hàng nhà cung cấp
    updateReturn: async (return_id, data) => {
        return axiosService()({
            url: `${SUPPLIER_RETURN_URL}/${return_id}`,
            method: 'PUT',
            data,
        }).then(res => res.data).catch(error => { throw error; });
    },
    // Xóa đơn trả hàng nhà cung cấp
    deleteReturn: async (return_id) => {
        return axiosService()({
            url: `${SUPPLIER_RETURN_URL}/${return_id}`,
            method: 'DELETE',
        }).then(res => res.data).catch(error => { throw error; });
    },
    // Duyệt đơn trả hàng nhà cung cấp
    approveReturn: async (return_id) => {
        return axiosService()({
            url: `${SUPPLIER_RETURN_URL}/${return_id}/approve`,
            method: 'POST',
        }).then(res => res.data).catch(error => { throw error; });
    },
    // Lấy danh sách đơn trả hàng theo nhà cung cấp
    getReturnBySupplierId: async (supplier_id) => {
        return axiosService()({
            url: `${SUPPLIER_RETURN_URL}/supplier/${supplier_id}`,
            method: 'GET',
        }).then(res => res.data).catch(error => { throw error; });
    },
    // Lấy danh sách đơn trả hàng theo trạng thái
    getReturnByStatus: async (status) => {
        return axiosService()({
            url: `${SUPPLIER_RETURN_URL}/status/${status}`,
            method: 'GET',
        }).then(res => res.data).catch(error => { throw error; });
    },
};

export default purchaseOrderService;
