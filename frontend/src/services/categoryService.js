// services/categoryService.js
import api from "./api";

export const getCategories = async () => {
  try {
    const response = await api.get("/categories");
    return response.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

export const getCategory = async (id) => {
  try {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching category:", error);
    throw error;
  }
};

export const addCategory = async (category) => {
  try {
    const response = await api.post("/categories", category);
    return response.data;
  } catch (error) {
    console.error("Error adding category:", error);
    throw error;
  }
};

export const updateCategory = async (id, category) => {
  try {
    const response = await api.put(`/categories/${id}`, category);
    return response.data;
  } catch (error) {
    console.error("Error updating category:", error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  try {
    const response = await api.delete(`/categories/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting category:", error);
    throw error;
  }
};

export const getCategoryOptions = async () => {
  try {
    const res = await api.get("/categories");
    const rawData = res.data;

    // Chuyển đổi sang format [{ value, label }]
    return rawData.map((item) => ({
      value: item._id,
      label: item.name,
    }));
  } catch (err) {
    console.error("Error fetching category options:", err);
    return [];
  }
};
