import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

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
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/staff/view-books" />} />

        {/* CRUD Book */}
        <Route path="/staff/view-books" element={<ViewBookList />} />
        <Route path="/staff/add-book" element={<AddBook />} />
        <Route path="/staff/update-book/:id" element={<UpdateBook />} />

        {/* CRUD Bookshelf */}
        <Route path="/staff/bookshelf" element={<BookShelf />} />
        <Route path="/staff/add-bookshelf" element={<AddBookshelf />} />
        <Route path="/staff/update-bookshelf/:id" element={<UpdateBookshelf />} />

        {/* CRUD Category */}
        <Route path="/staff/ViewCategoryList" element={<ViewCategoryList />} />
        <Route path="/staff/AddCategory" element={<AddCategory />} />
        <Route path="/staff/UpdateCategory" element={<UpdateCategory />} />
      </Routes>
    </Router>
  );
}

export default App;
