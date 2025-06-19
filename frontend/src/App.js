import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import ViewBookList from './pages/staff/ViewBookList';
import AddBook from './pages/staff/AddBook';
import UpdateBook from './pages/staff/UpdateBook';
import BookShelf from './pages/staff/BookShelf';
import AddBookshelf from './pages/staff/AddBookshelf';
import UpdateBookshelf from './pages/staff/UpdateBookshelf';
function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/staff/view-books" />} />

        {/* CRUD Book */}
        <Route path="/staff/view-books" element={<ViewBookList />} />
        <Route path="/staff/add-book" element={<AddBook />} />
        <Route path="/staff/update-book/:id" element={<UpdateBook />} />
        <Route path="/staff/bookshelf" element={<BookShelf />} />
        <Route path="/staff/add-bookshelf" element={<AddBookshelf />} />
        <Route path="/staff/update-bookshelf/:id" element={<UpdateBookshelf />} />
      </Routes>
    </Router>
  );
}

export default App;
