import React, { useState } from 'react';
import { MdAddCircleOutline } from 'react-icons/md';
import { FiLoader } from 'react-icons/fi';
import PageLayout from '../components/layout/PageLayout';

export default function InterfaceSetup() {
  const [formData, setFormData] = useState({ name: '', description: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem('eco_monitor_user_jwt');
      const response = await fetch('http://localhost:8000/api/interface', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log('Success:', result);
      alert('✅ Interface added successfully!');
      setFormData({ name: '', description: '' });
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Failed to add interface.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4 py-20">
        <form
          onSubmit={handleSubmit}
          className="bg-white dark:bg-slate-900 border border-slate-700 p-8 rounded-2xl shadow-2xl w-full max-w-md transition-all duration-300"
        >
          <div className="flex items-center gap-3 mb-6 justify-center">
            <MdAddCircleOutline className="text-3xl text-primary-500" />
            <h2 className="text-2xl font-semibold text-gray-100">Create New Interface</h2>
          </div>

          <label className="block text-sm text-gray-300 mb-1">Name</label>
          <input
            name="name"
            type="text"
            placeholder="Enter interface name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 mb-4 border border-slate-600 bg-slate-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <label className="block text-sm text-gray-300 mb-1">Description</label>
          <textarea
            name="description"
            placeholder="Enter interface description"
            value={formData.description}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 mb-6 border border-slate-600 bg-slate-800 text-white rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={4}
          />

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full py-2 px-4 rounded-full text-white font-medium transition duration-300 ${
              isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {isLoading ? (
              <span className="flex items-center justify-center gap-2">
                <FiLoader className="animate-spin" /> Submitting...
              </span>
            ) : (
              'Add Interface'
            )}
          </button>
        </form>
      </div>
    </PageLayout>
  );
}
