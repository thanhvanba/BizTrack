import { CATEGORIES_URL } from '../apiUrl';
import axiosService from '../axiosService';

const categoryService = {

    getAllCategories: async () => {
        return axiosService()({
            url: CATEGORIES_URL,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    getCategoryById: async (id) => {
        return axiosService()({
            url: `${CATEGORIES_URL}/${id}`,
            method: 'GET',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    createCategory: async (data) => {
        return axiosService()({
            url: CATEGORIES_URL,
            method: 'POST',
            data, // data: { name: '...', ... }
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    updateCategory: async (id, data) => {
        return axiosService()({
            url: `${CATEGORIES_URL}/${id}`,
            method: 'PUT',
            data, // data: { name: '...', ... }
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },

    deleteCategory: async (id) => {
        return axiosService()({
            url: `${CATEGORIES_URL}/${id}`,
            method: 'DELETE',
        })
            .then(res => res.data)
            .catch(error => { throw error; });
    },
};

export default categoryService;
