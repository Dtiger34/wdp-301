// ✅ Chỉ import Routes, Route, Navigate (KHÔNG import BrowserRouter nữa)
import { Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { checkUserAuth } from './utils/auth';

import Login from './components/Login';
import HomePage from './components/HomePage';
import ViewUserProfile from './pages/user/ViewUserProfile';

import ViewBookList from './pages/staff/ViewBookList';
import AddBook from './pages/staff/AddBook';
import UpdateBook from './pages/staff/UpdateBook';

import BookShelf from './pages/staff/BookShelf';
import AddBookshelf from './pages/staff/AddBookshelf';
import UpdateBookshelf from './pages/staff/UpdateBookshelf';

import ViewCategoryList from './pages/staff/ViewCategoryList';
import AddCategory from './pages/staff/AddCategory';
import UpdateCategory from './pages/staff/UpdateCategory';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const userData = checkUserAuth(token);
    setUser(userData || null);
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      {/* Auth / Common */}
      <Route path="/" element={<Navigate to={user ? "/home" : "/login"} />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/profile" element={user ? <ViewUserProfile /> : <Navigate to="/login" />} />

      {/* Staff - Book CRUD */}
      <Route path="/staff/view-books" element={<ViewBookList />} />
      <Route path="/staff/add-book" element={<AddBook />} />
      <Route path="/staff/update-book/:id" element={<UpdateBook />} />

      {/* Staff - Bookshelf CRUD */}
      <Route path="/staff/bookshelf" element={<BookShelf />} />
      <Route path="/staff/add-bookshelf" element={<AddBookshelf />} />
      <Route path="/staff/update-bookshelf/:id" element={<UpdateBookshelf />} />

      {/* Staff - Category CRUD */}
      <Route path="/staff/ViewCategoryList" element={<ViewCategoryList />} />
      <Route path="/staff/AddCategory" element={<AddCategory />} />
      <Route path="/staff/UpdateCategory" element={<UpdateCategory />} />
    </Routes>
  );
}

export default App;
