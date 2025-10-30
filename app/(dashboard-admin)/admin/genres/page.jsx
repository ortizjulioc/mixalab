// app/genres/page.js
'use client';

import useGenres from '@/app/hooks/useGenres';
import React, { useState, useEffect } from 'react';


export default function GenresPage() {
  const {
    genres,
    loading,
    error,
    filters,
    handleChangeFilter,
    pagination,
    createGenre,
    updateGenre,
    deleteGenre,
    fetchGenres
  } = useGenres();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');

  const openModal = (editId) => {
    if (editId) {
      setEditingId(editId);
      // Pre-fill if needed (fetch via hook or assume from list)
      const genreToEdit = genres.find(g => g.id === editId);
      setName(genreToEdit ? genreToEdit.name : '');
    } else {
      setEditingId(null);
      setName('');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setName('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    try {
      if (editingId) {
        await updateGenre(editingId, { name: name.trim() });
      } else {
        await createGenre({ name: name.trim() });
      }
      closeModal();
      await fetchGenres(); // Refresh list
    } catch (err) {
      console.error('Error saving genre:', err);
    }
  };

  const handleEdit = (id) => openModal(id);

  const handleDelete = async (id) => {
    await deleteGenre(id); // Hook handles confirmation
    await fetchGenres(); // Refresh
  };

    useEffect(() => {
    fetchGenres()
  }, [fetchGenres])

  if (error) {
    return (
      <div className="p-8 text-center liquid-glass rounded-2xl border border-white/20">
        <p className="text-red-400 mb-4">Error: {error}</p>
        <button onClick={fetchGenres} className="px-4 py-2 bg-blue-600/50 hover:bg-blue-700/50 text-white rounded-xl border border-blue-500/30">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6   shadow-2xl">
      {/* Header with Search and New Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border border-white/20 rounded-2xl liquid-glass">
        <input
          type="text"
          placeholder="Search genres..."
          value={filters.search}
          onChange={(e) => handleChangeFilter('search', e.target.value)}
          className="flex-1 p-3 rounded-xl border border-white/20 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-white/50 liquid-glass"
        />
        <button
          onClick={() => openModal()}
          className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-semibold transition hover:scale-105 border border-white/20"
          disabled={loading}
        >
          {loading ? 'Loading...' : 'New'}
        </button>
      </div>

      {/* Table with Skeleton */}
      {loading ? (
        <div className="space-y-4 p-4 border border-white/20 rounded-2xl liquid-glass">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center p-4 space-x-4">
              <div className="h-4 bg-white/10 rounded w-1/4 animate-pulse"></div>
              <div className="h-4 bg-white/10 rounded w-1/2 animate-pulse"></div>
              <div className="flex space-x-2 ml-auto">
                <div className="h-8 bg-white/10 rounded w-16 animate-pulse"></div>
                <div className="h-8 bg-white/10 rounded w-16 animate-pulse"></div>
              </div>
            </div>
          ))}
        </div>
      ) : genres.length === 0 ? (
        <div className="p-8 text-center text-gray-400 liquid-glass rounded-2xl border border-white/20">
          No genres found. Create one above!
        </div>
      ) : (
        <div className="overflow-x-auto border border-white/20 rounded-2xl liquid-glass">
          <table className="w-full">
            <thead>
              <tr className="bg-white/5">
                <th className="p-4 text-left text-white font-semibold border-b border-white/20">Name</th>
                <th className="p-4 text-left text-white font-semibold border-b border-white/20">Created At</th>
                <th className="p-4 text-left text-white font-semibold border-b border-white/20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {genres.map((genre) => (
                <tr key={genre.id} className="border-b border-white/10 hover:bg-white/5 transition">
                  <td className="p-4 text-white">{genre.name}</td>
                  <td className="p-4 text-gray-400">{new Date(genre.createdAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEdit(genre.id)}
                      className="mr-2 px-4 py-2 bg-blue-600/50 hover:bg-blue-700/50 text-white rounded-xl text-sm font-medium transition border border-blue-500/30 hover:scale-105"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(genre.id)}
                      className="px-4 py-2 bg-red-600/50 hover:bg-red-700/50 text-white rounded-xl text-sm font-medium transition border border-red-500/30 hover:scale-105"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex justify-center space-x-2 p-4 bg-white/5 rounded-b-2xl">
              <button
                onClick={() => handleChangeFilter('page', pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 bg-gray-600/50 hover:bg-gray-700/50 text-white rounded-xl disabled:opacity-50 transition"
              >
                Previous
              </button>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handleChangeFilter('page', page)}
                  className={`px-4 py-2 rounded-xl transition ${
                    pagination.currentPage === page
                      ? 'bg-blue-600/50 text-white border border-blue-500/30'
                      : 'bg-gray-600/50 hover:bg-gray-700/50 text-white'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => handleChangeFilter('page', pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 bg-gray-600/50 hover:bg-gray-700/50 text-white rounded-xl disabled:opacity-50 transition"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {/* Inline Modal for Create/Edit */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-transparent liquid-glass rounded-2xl border border-white/20 p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white">
              {editingId ? 'Edit Genre' : 'Create New Genre'}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Genre name"
                className="w-full p-3 rounded-xl border border-white/20 bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-white/50 liquid-glass"
                required
              />
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 bg-gray-600/50 hover:bg-gray-700/50 text-white rounded-xl transition border border-white/20"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-blue-600/50 hover:bg-blue-700/50 text-white rounded-xl font-semibold transition border border-blue-500/30 hover:scale-105"
                >
                  {editingId ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}