import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { checkUserAuth } from "./utils/auth";
import "../src/css/Global.css";
// Common / Auth
import Login from "./components/Login";
import HomePage from "./components/HomePage";
import ChangePassword from "./components/ChangePassword";
import ViewUserProfile from "./pages/user/ViewUserProfile";
import ForgotPassword from "./components/ForgotPassword";
import ResetPassword from "./components/ResetPassword";
// Admin
import AdminDashboard from "./pages/admin/AdminDashboard";
import UserListPage from "./pages/admin/UserListPage";
import AddAccountPage from "./pages/admin/AddAccountPage";
import StaffDashboard from "./pages/staff/StaffDashboard";
// Staff - Book
import ViewBookList from "./pages/staff/ViewBookList";
import AddBook from "./pages/staff/AddBook";
import UpdateBook from "./pages/staff/UpdateBook";

// Staff - Bookshelf
import BookShelf from "./pages/staff/BookShelf";
import AddBookshelf from "./pages/staff/AddBookshelf";
import UpdateBookshelf from "./pages/staff/UpdateBookshelf";

// Staff - Category
import ViewCategoryList from "./pages/staff/ViewCategoryList";
import AddCategory from "./pages/staff/AddCategory";
import UpdateCategory from "./pages/staff/UpdateCategory";

// Staff - Request
import ViewListRequest from "./pages/staff/ViewListRequest";
import ViewListBorrowed from "./pages/staff/ViewListBorrowed";

// User - Book Detail
import ViewBookDetail from "./pages/user/ViewBookDetail";
import HistoryBorrowByUser from "./pages/user/HistoryBorrowByUser";
// Staff - Borrow History
import HistoryReturnBook from "./pages/staff/HistoryReturnBook";

// Staff - Report
import Report from "./pages/staff/Report";

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("jwt");
    const userData = checkUserAuth(token);
    setUser(userData || null);
    setLoading(false);
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Routes>
      {/* Common / Auth */}
      <Route path="/" element={user?.role === "staff" ? <StaffDashboard /> : <HomePage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/home" element={user?.role === "staff" ? <StaffDashboard /> : <HomePage />} />
      <Route path="/profile" element={user ? <ViewUserProfile /> : <Navigate to="/login" />} />
      <Route path="/change-password" element={localStorage.getItem("user") ? <ChangePassword /> : <Navigate to="/login" />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      {/* Admin */}
      <Route path="/admin-dashboard" element={user?.role === "admin" ? <AdminDashboard /> : <Navigate to="/login" />
      }
      />
      <Route path="/admin/users" element={user?.role === "admin" ? <UserListPage /> : <Navigate to="/login" />}
      />
      <Route path="/admin/add-account" element={user?.role === "admin" ? <AddAccountPage /> : <Navigate to="/login" />
      }
      />

      <Route path="/history-borrowed-user" element={user ? <HistoryBorrowByUser /> : <Navigate to="/login" />} />

      {/* Redirect if not logged in */}
      <Route path="/staff-dashboard" element={user?.role === "staff" ? <StaffDashboard /> : <Navigate to="/home" />} />
      {/* Staff - Book CRUD */}
      <Route path="/staff/view-books" element={user?.role === "staff" ? <ViewBookList /> : <Navigate to="/home" />} />
      <Route path="/staff/add-book" element={user?.role === "staff" ? <AddBook /> : <Navigate to="/home" />} />
      <Route path="/staff/update-book/:id" element={user?.role === "staff" ? <UpdateBook /> : <Navigate to="/home" />} />

      {/* Staff - Bookshelf CRUD */}
      <Route path="/staff/bookshelf" element={user?.role === "staff" ? <BookShelf /> : <Navigate to="/home" />} />
      <Route path="/staff/add-bookshelf" element={user?.role === "staff" ? <AddBookshelf /> : <Navigate to="/home" />} />
      <Route path="/staff/update-bookshelf/:id" element={user?.role === "staff" ? <UpdateBookshelf /> : <Navigate to="/home" />} />

      {/* Staff - Category CRUD */}
      <Route path="/staff/ViewCategoryList" element={user?.role === "staff" ? <ViewCategoryList /> : <Navigate to="/home" />} />
      <Route path="/staff/AddCategory" element={user?.role === "staff" ? <AddCategory /> : <Navigate to="/home" />} />
      <Route path="/staff/UpdateCategory" element={user?.role === "staff" ? <UpdateCategory /> : <Navigate to="/home" />} />

      {/* Staff - Request */}
      <Route path="/staff/ViewListRequest" element={user?.role === "staff" ? <ViewListRequest /> : <Navigate to="/home" />} />
      <Route path="/staff/view-borrowing-books" element={user?.role === "staff" ? <ViewListBorrowed /> : <Navigate to="/home" />} />
      <Route path="/staff/borrows/borrow-history" element={user?.role === "staff" ? <HistoryReturnBook /> : <Navigate to="/home" />} />

      {/* User - Book Detail */}
      <Route path="/detail-book/:id" element={<ViewBookDetail />} />

      {/* Staff - Report */}
      <Route path="/staff/report" element={user?.role === "staff" ? <Report /> : <Navigate to="/login" />} />

    </Routes>
  );
}

export default App;
