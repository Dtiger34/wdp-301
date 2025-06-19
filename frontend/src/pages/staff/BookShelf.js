import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getBookshelves,
  deleteBookshelf
} from '../../services/bookShelfService';

export default function BookShelf() {
  const [bookshelves, setBookshelves] = useState([]);
  const navigate = useNavigate();

  const fetchBookshelves = async () => {
    try {
      const data = await getBookshelves();
      setBookshelves(data);
    } catch (err) {
      alert('Error fetching bookshelves');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this bookshelf?')) {
      try {
        await deleteBookshelf(id);
        fetchBookshelves();
      } catch (err) {
        alert('Delete failed');
      }
    }
  };

  useEffect(() => {
    fetchBookshelves();
  }, []);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Bookshelf List</h2>
      <button
        onClick={() => navigate('/staff/add-bookshelf')}
        className="bg-green-600 text-white px-4 py-2 rounded mb-4"
      >
        + Add Bookshelf
      </button>
      <table className="w-full border">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 text-left">Name</th>
            <th className="p-2 text-left">Location</th>
            <th className="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {bookshelves.map((shelf) => (
            <tr key={shelf._id} className="border-t">
              <td className="p-2">{shelf.name}</td>
              <td className="p-2">{shelf.location}</td>
              <td className="p-2 text-center">
                <button
                  onClick={() => navigate(`/staff/update-bookshelf/${shelf._id}`)}
                  className="text-blue-600 hover:underline mr-2"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(shelf._id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {bookshelves.length === 0 && (
            <tr>
              <td colSpan="3" className="p-4 text-center text-gray-500">
                No bookshelves found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
