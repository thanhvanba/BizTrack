import { PERMISSIONS_URL } from "../apiUrl";
import axiosService from "../axiosService";

const permisstionService = {
  getAllPermissions: async (params) => {
    return axiosService()({
      url: `${PERMISSIONS_URL}`,
      method: "GET",
      params,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  getPermissionsByRole: async (id) => {
    return axiosService()({
      url: `${PERMISSIONS_URL}/role/${id}`,
      method: "GET",
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  assignPermissionsToRole: async (id, data) => {
    return axiosService()({
      url: `${PERMISSIONS_URL}/role/${id}/assign-multiple`,
      method: "POST",
      data,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },
};

export default permisstionService;
