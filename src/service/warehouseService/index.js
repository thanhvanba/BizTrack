import { WAREHOUSE_URL } from "../apiUrl";
import axiosService from "../axiosService";

const warehouseService = {
  getAllWarehouses: async () => {
    return axiosService()({
      url: WAREHOUSE_URL,
      method: "GET",
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },
};

export default warehouseService;
