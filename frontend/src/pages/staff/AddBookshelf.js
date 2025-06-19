import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addBookshelf } from '../../services/bookShelfService';

export default function AddBookshelf() {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    location: ''
  });
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!formData.code.trim()) newErrors.code = 'Code is required';
    if (!formData.name.trim()) newErrors.name = 'Name is required';
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
      await addBookshelf(formData);
      navigate('/staff/bookshelf');
    } catch (err) {
      alert('Add failed: ' + err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-xl font-bold mb-4">Add Bookshelf</h2>
      <form onSubmit={handleSubmit} className="bg-white shadow p-4 rounded space-y-4">
        <div>
          <label className="block font-medium">Code:</label>
          <input
            name="code"
            value={formData.code}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          {errors.code && <p className="text-red-500 text-sm">{errors.code}</p>}
        </div>
        <div>
          <label className="block font-medium">Name:</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            required
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
        </div>
        <div>
          <label className="block font-medium">Description:</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className="w-full border p-2 rounded"
            rows={3}
          />
        </div>
        <div>
          <label className="block font-medium">Location:</label>
          <input
            name="location"
            value={formData.location}
            onChange={handleChange}
            className="w-full border p-2 rounded"
          />
        </div>
        <button className="bg-green-600 text-white px-4 py-2 rounded">
          Add
        </button>
      </form>
    </div>
  );
}
