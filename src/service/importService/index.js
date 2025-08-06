npimport { IMPORT_URL } from "../apiUrl";
import axiosService from "../axiosService";

const importService = {
  // Fetch entity types
  getEntityTypes: async () => {
    return axiosService()({
      url: `${IMPORT_URL}/entity-types`,
      method: "GET",
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  // Download template for entity type
  getTemplate: async (entityType) => {
    return axiosService()({
      url: `${IMPORT_URL}/${entityType}/template`,
      method: "GET",
      responseType: "text",
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },

  // Import data for entity type
  importData: async (entityType, data) => {
    return axiosService()({
      url: `${IMPORT_URL}/${entityType}`,
      method: "POST",
      data,
    })
      .then((res) => res.data)
      .catch((error) => {
        throw error;
      });
  },
};

export default importService;
