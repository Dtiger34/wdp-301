import api from './api';
import { getToken } from '../utils/auth'; // Đảm bảo đường dẫn đúng

<<<<<<< Updated upstream
// Get all books
// Get books with optional filters
export const getBooks = async (params = {}) => {
=======
// =====================================
// 📚 BOOK APIs
// =====================================

// Lấy tất cả sách
export const getAllBooks = async (params = {}) => {
>>>>>>> Stashed changes
  try {
    const token = getToken();
    const response = await api.get('/books', {
      headers: { Authorization: `Bearer ${token}` },
      params,
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error;
  }
};

// Lấy chi tiết 1 cuốn sách
export const getBook = async (id) => {
  try {
    const token = getToken();
    const response = await api.get(`/books/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching book:', error);
    throw error;
  }
};

<<<<<<< Updated upstream
// Add new book
export const addBook = async (book) => {
  try {
    const token = getToken();
    const response = await api.post("/books", book, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error adding book:", error);
    throw error;
  }
};

// Update book by ID
export const updateBook = async (id, book) => {
  try {
    const token = getToken();
    const response = await api.put(`/books/${id}`, book, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error updating book:", error);
    throw error;
  }
=======
// Thêm sách mới
export const addBook = async (bookData) => {
  const formData = new FormData();
  formData.append('title', bookData.title);
  formData.append('isbn', bookData.isbn);
  formData.append('author', bookData.author);
  formData.append('publisher', bookData.publisher);
  formData.append('publishYear', bookData.publishYear);
  formData.append('description', bookData.description);
  formData.append('price', bookData.price);
  formData.append('bookshelf', bookData.bookshelf);
  bookData.categories.forEach((cat) => formData.append('categories[]', cat));
  formData.append('image', bookData.imageFile);

  const token = getToken();
  const response = await api.post('/books', formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
};

// Cập nhật sách
export const updateBook = async (id, bookData) => {
  const formData = new FormData();
  formData.append('title', bookData.title);
  formData.append('isbn', bookData.isbn);
  formData.append('author', bookData.author);
  formData.append('publisher', bookData.publisher);
  formData.append('publishYear', bookData.publishYear);
  formData.append('description', bookData.description);
  formData.append('price', bookData.price);
  formData.append('bookshelf', bookData.bookshelf);
  bookData.categories.forEach((cat) => formData.append('categories[]', cat));
  if (bookData.imageFile) {
    formData.append('image', bookData.imageFile);
  }

  const token = getToken();
  const response = await api.put(`/books/${id}`, formData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });

  return response.data;
>>>>>>> Stashed changes
};

// Xóa sách
export const deleteBook = async (id) => {
  try {
    const token = getToken();
    const response = await api.delete(`/books/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error('Error deleting book:', error);
    throw error;
  }
};

// Lọc sách
export const getBooksFilter = async (params = {}) => {
  try {
    const token = getToken();
    console.log("Token:", token);
    const queryString = new URLSearchParams(params).toString();
    const response = await api.get(`/books/filter?${queryString}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error filtering books:', error);
    throw error;
  }
};

// =====================================
// ⭐ REVIEW APIs
// =====================================

// Lấy danh sách review của sách
export const getReviewsByBook = async (bookId) => {
  try {
    const token = getToken();
    const res = await api.get(`/review/book/${bookId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

// Kiểm tra user có thể đánh giá sách không
export const checkCanReview = async (bookId) => {
  try {
    const token = getToken();
    const res = await api.get(`/review/can-review/${bookId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error checking review permission:', error);
    throw error;
  }
};

// Gửi đánh giá sách
export const submitReview = async (bookId, reviewData) => {
  try {
    const token = getToken();
    const res = await api.post(`/review/${bookId}`, reviewData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return res.data;
  } catch (error) {
    console.error('Error submitting review:', error);
    throw error;
  }
};
