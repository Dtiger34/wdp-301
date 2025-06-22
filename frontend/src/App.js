import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { checkUserAuth } from './utils/auth';
import Login from './components/Login';
import HomePage from './components/HomePage';
import AdminDashboard from './pages/admin/AdminDashboard';
import ViewUserProfile from './pages/user/ViewUserProfile';
import ViewBookList from './pages/staff/ViewBookList';
import AddBook from './pages/staff/AddBook';
import UpdateBook from './pages/staff/UpdateBook';
import BookShelf from './pages/staff/BookShelf';
import AddBookshelf from './pages/staff/AddBookshelf';
import UpdateBookshelf from './pages/staff/UpdateBookshelf';
import ChangePassword from './components/ChangePassword';
import UserListPage from './pages/admin/UserListPage';
import AddAccountPage from './pages/admin/AddAccountPage';
import ViewBookDetail from './pages/user/ViewBookDetail';
function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    const userData = checkUserAuth(token);
    if (userData) {
      setUser(userData);
    } else {
      setUser(null);
    }
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" />} />

      {/* CRUD Book */}
      <Route path="/staff/view-books" element={<ViewBookList />} />
      <Route path="/staff/add-book" element={<AddBook />} />
      <Route path="/staff/update-book/:id" element={<UpdateBook />} />
      <Route path="/staff/bookshelf" element={<BookShelf />} />
      <Route path="/staff/add-bookshelf" element={<AddBookshelf />} />
      <Route path="/staff/update-bookshelf/:id" element={<UpdateBookshelf />} />

      {/* User Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/profile" element={user ? <ViewUserProfile /> : <Navigate to="/login" />} />
      <Route path='/change-password' element={user ? <ChangePassword /> : <Navigate to="/Home" />} />
      <Route path='/admin-dashboard' element={user && user.role === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
      <Route path="/admin/users" element={<UserListPage />} />
      <Route path="/admin/add-account" element={<AddAccountPage />} />

      {/* Borrow */}
      <Route path="/detail-book/:id" element={<ViewBookDetail />} />

    </Routes>
  );
}

export default App;