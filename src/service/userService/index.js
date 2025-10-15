import { USERS_URL } from "../apiUrl";
import axiosService from "../axiosService";
const userService = {
  getAllUser: async () => {
    return axiosService()({
      url: USERS_URL,
      method: "GET",
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },
  getUserByUserID: async (id) => {
    return axiosService()({
      url: `${USERS_URL}/${id}`,
      method: "GET",
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },
  createUser: async (data) => {
    return axiosService()({
      url: `${USERS_URL}`,
      method: "POST",
      data,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },
  updateUser: async (id, data) => {
    return axiosService()({
      url: `${USERS_URL}/${id}`,
      method: "PUT",
      data,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },
  deleteStudent: async (ids) => {
    return axiosService()({
      url: `${USERS_URL}`,
      method: "DELETE",
      params: {
        id: ids,
      },
      paramsSerializer: (params) =>
        qs.stringify(params, { arrayFormat: "repeat" }),
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },
};
export default userService;
