import axiosService from '../axiosService';
import { CASHBOOK_URL } from '../apiUrl';

const cashbookService = {
  // Tạo giao dịch mới
  createTransaction: async (data) => {
    return axiosService()({
      url: `${CASHBOOK_URL}/transaction`,
      method: 'POST',
      data,
    })
      .then(res => res.data)
      .catch(error => { throw error; });
  },

  // Lấy sổ cái
  getLedger: async (params) => {
    return axiosService()({
      url: `${CASHBOOK_URL}/ledger`,
      method: 'GET',
      params,
    })
      .then(res => res.data)
      .catch(error => { throw error; });
  },

  // Lấy sổ cái giao dịch hệ thống
  getSystemTransactionLedger: async (params) => {
    return axiosService()({
      url: `${CASHBOOK_URL}/system-ledger`,
      method: 'GET',
      params,
    })
      .then(res => res.data)
      .catch(error => { throw error; });
  },

  // Lấy tổng kết giao dịch hệ thống
  getSystemTransactionSummary: async (params) => {
    return axiosService()({
      url: `${CASHBOOK_URL}/system-summary`,
      method: 'GET',
      params,
    })
      .then(res => res.data)
      .catch(error => { throw error; });
  },
};

export default cashbookService; 