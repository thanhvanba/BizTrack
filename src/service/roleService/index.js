import { ROLES_URL } from "../apiUrl";
import axiosService from "../axiosService";

const roleService = {
  getAllRoles: async (params) => {
    return axiosService()({
      url: `${ROLES_URL}`,
      method: "GET",
      params,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  createRoleWithPermissions: async (data) => {
    return axiosService()({
      url: `${ROLES_URL}/create-with-permissions`,
      method: "POST",
      data,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  updateRoleWithPermissions: async (id, data) => {
    console.log("🚀 ~ id:", id);
    return axiosService()({
      url: `${ROLES_URL}/${id}/update-with-permissions`,
      method: "PUT",
      data,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },
};

export default roleService;
