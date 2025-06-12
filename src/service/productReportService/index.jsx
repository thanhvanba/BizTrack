import { PRODUCT_REPORT_URL } from "../apiUrl";
import axiosService from "../axiosService";

const productReportService = {
    // Lấy lịch sử sản phẩm theo ID sản phẩm
    getProductHistory: async (id) => {
        return axiosService()({
            url: `${PRODUCT_REPORT_URL}/${id}/history`,
            method: "GET",
        })
            .then((res) => res.data)
            .catch((error) => {
                throw error;
            });
    },

    // Lấy lịch sử sản phẩm theo ID sản phẩm + ID kho
    getProductHistoryByProductAndWarehouse: async (productId, warehouseId) => {
        return axiosService()({
            url: `${PRODUCT_REPORT_URL}/${productId}/${warehouseId}/history`,
            method: "GET",
        })
            .then((res) => res.data)
            .catch((error) => {
                throw error;
            });
    },
};

export default productReportService;
