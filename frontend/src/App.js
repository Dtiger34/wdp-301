import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

import ViewBookList from './pages/staff/ViewBookList';
import AddBook from './pages/staff/AddBook';
import UpdateBook from './pages/staff/UpdateBook';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/staff/view-books" />} />

        {/* CRUD Book */}
        <Route path="/staff/view-books" element={<ViewBookList />} />
        <Route path="/staff/add-book" element={<AddBook />} />
        <Route path="/staff/update-book/:id" element={<UpdateBook />} />

      </Routes>
    </Router>
  );
}

export default App;
