import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getBookshelf,
  updateBookshelf
} from '../../services/bookShelfService';

export default function UpdateBookshelf() {
  const { id } = useParams();
  const [formData, setFormData] = useState({ name: '', location: '' });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShelf = async () => {
      try {
        const data = await getBookshelf(id);
        setFormData({ name: data.name, location: data.location });
      } catch (err) {
        alert('Shelf not found');
      }
    };
    fetchShelf();
  }, [id]);

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.location.trim()) newErrors.location = 'Location is required';
    return newErrors;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    try {
      await updateBookshelf(id, formData);
      navigate('/staff/bookshelf');
    } catch (err) {
      alert('Update failed');
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Update Bookshelf</h2>
      <form onSubmit={handleSubmit} className="bg-white shadow p-4 rounded">
        <div className="mb-2">
          <label className="block">Name:</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div className="mb-2">
          <label className="block">Location:</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
          {errors.location && <p className="text-red-500 text-sm">{errors.location}</p>}
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded">
          Update
        </button>
      </form>
    </div>
  );
}
