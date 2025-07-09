import axios from "axios";
import { INVOICES_URL } from "../apiUrl";

const invoiceService = {
    // Lấy tất cả hóa đơn
    getAllInvoices: async () => {
        return axios({
            url: `${INVOICES_URL}/`,
            method: "GET",
        }).then(res => res.data).catch(error => { throw error; });
    },

    // Lấy danh sách hóa đơn đã thanh toán
    getPaidInvoices: async () => {
        return axios({
            url: `${INVOICES_URL}/paid`,
            method: "GET",
        }).then(res => res.data).catch(error => { throw error; });
    },

    // Lấy danh sách hóa đơn chưa thanh toán
    getUnpaidInvoices: async (params) => {
        return axios({
            url: `${INVOICES_URL}/unpaid`,
            method: "GET",
            params,
        }).then(res => res.data).catch(error => { throw error; });
    },

    // Lấy hóa đơn theo invoice_code
    getInvoiceByCode: async (invoiceCode) => {
        return axios({
            url: `${INVOICES_URL}/${invoiceCode}`,
            method: "GET",
        }).then(res => res.data).catch(error => { throw error; });
    },

    // Tạo hóa đơn mới
    createInvoice: async (invoiceData) => {
        return axios({
            url: `${INVOICES_URL}/`,
            method: "POST",
            data: invoiceData,
        }).then(res => res.data).catch(error => { throw error; });
    },

    // Cập nhật hóa đơn
    updateInvoice: async (invoiceId, data) => {
        return axios({
            url: `${INVOICES_URL}/${invoiceId}`,
            method: "PUT",
            data,
        }).then(res => res.data).catch(error => { throw error; });
    },

    // Xoá hóa đơn
    deleteInvoice: async (invoiceId) => {
        return axios({
            url: `${INVOICES_URL}/${invoiceId}`,
            method: "DELETE",
        }).then(res => res.data).catch(error => { throw error; });
    },

    // Lấy danh sách tất cả các khoản thanh toán
    getAllPayments: async () => {
        return axios({
            url: `${INVOICES_URL}/payments/all`,
            method: "GET",
        }).then(res => res.data).catch(error => { throw error; });
    },
};

export default invoiceService;
