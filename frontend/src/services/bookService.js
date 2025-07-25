import api from "./api";
import { getToken } from "../utils/auth"; // điều chỉnh đường dẫn nếu khác

// Get all books
// Get books with optional filters
export const getAllBooks = async (params = {}) => {
  try {
    const token = getToken();
    const response = await api.get("/books", {
      headers: { Authorization: `Bearer ${token}` },
      params, // 👈 truyền các query params ở đây
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching books:", error);
    throw error;
  }
};

// Get a single book by ID
export const getBook = async (id) => {
  try {
    const token = getToken();
    const response = await api.get(`/books/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching book:", error);
    throw error;
  }
};

// Add new book
export const addBook = async (bookData) => {
  const formData = new FormData();
  formData.append("title", bookData.title);
  formData.append("isbn", bookData.isbn);
  formData.append("author", bookData.author);
  formData.append("publisher", bookData.publisher);
  formData.append("publishYear", bookData.publishYear);
  formData.append("description", bookData.description);
  formData.append("price", bookData.price);
  formData.append("bookshelf", bookData.bookshelf);
  bookData.categories.forEach((cat) => formData.append("categories[]", cat));
  formData.append("image", bookData.imageFile); // file thực

  const response = await api.post("/books", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

// Update book by ID
export const updateBook = async (id, bookData) => {
  const formData = new FormData();
  formData.append("title", bookData.title);
  formData.append("isbn", bookData.isbn);
  formData.append("author", bookData.author);
  formData.append("publisher", bookData.publisher);
  formData.append("publishYear", bookData.publishYear);
  formData.append("description", bookData.description);
  formData.append("price", bookData.price);
  formData.append("bookshelf", bookData.bookshelf);
  bookData.categories.forEach((cat) => formData.append("categories[]", cat));

  if (bookData.imageFile) {
    formData.append("image", bookData.imageFile); // Gửi ảnh mới nếu có
  }

  const response = await api.put(`/books/${id}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

// Delete book by ID
export const deleteBook = async (id) => {
  try {
    const token = getToken();
    const response = await api.delete(`/books/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting book:", error);
    throw error;
  }
};

export const getBooksFilter = async (params = {}) => {
  try {
    const token = getToken();
    const queryString = new URLSearchParams(params).toString();
    const res = await api.get(`/books/filter?${queryString}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error("getBooksFilter error:", error);
  }
};
export const createReview = async (reviewData) => {
  try {
    const token = getToken();
    const response = await api.post("/books/review", reviewData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error creating review:", error);
    throw error;
  }
};
export const getReviewsByBookId = async (bookId) => {
  try {
    const token = getToken();
    const response = await api.get(`/books/${bookId}/reviews`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching book reviews:", error);
    throw error;
  }
};

export const checkIfReviewedByUser = async (bookId, userId) => {
  try {
    const token = getToken();

    const response = await api.get("/books/check-if-reviewed", {
      headers: {
        Authorization: `Bearer ${token}`, // Truyền token trong header
      },
      params: { bookId, userId },
    });
    return response.data;
  } catch (error) {
    console.error(
      "Error checking if user has reviewed:",
      error.response?.data || error.message
    );
    throw error;
  }
};
