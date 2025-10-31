// app/genres/page.js
'use client';

import useGenres from '@/hooks/useGenres';
import React, { useState, useEffect } from 'react';
import { Edit, Home, Trash2 } from 'lucide-react';
import Pagination from '@/components/Pagination';
import Button from '@/components/Button';
import Input from '@/components/Input';
import BreadcrumbsTitle from '@/components/Breadcrumbs';


export default function GenresPage() {
  const { genres, loading, error, filters, handleChangeFilter, pagination, createGenre, updateGenre, deleteGenre, fetchGenres } = useGenres();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState('');
  const [formLoading, setFormLoading] = useState(false);

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
    setFormLoading(true);
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
    } finally {
      setFormLoading(false);
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
        <Button
          onClick={fetchGenres}
          color="blue"
          size="md"
          className="px-4 py-2"
        >
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6 shadow-2xl">
      {/* Título con Breadcrumbs */}
                <BreadcrumbsTitle
                    title="Genres"  
                    items={[
                        { label: 'Dashboard', href: '/admin/home', icon: <Home size={18} /> },
                        { label: 'Genres' },  
                    ]}
                />
      {/* Header with Search and New Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 p-6 border border-white/20 rounded-2xl liquid-glass">
        <Input
          type="text"
          placeholder="Search genres..."
          value={filters.search}
          onChange={(e) => handleChangeFilter('search', e.target.value)}
          className="flex-1 p-3 rounded-xl  text-white placeholder-gray-400 focus:outline-none focus:border-white/50 "
        />
        <Button
          onClick={() => openModal()}
          color="blue"
          size="lg"
          disabled={loading}
          className="px-8"
        >
          {loading ? 'Loading...' : 'New'}
        </Button>
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
                <th className="p-4 text-right text-white font-semibold border-b border-white/20">Actions</th>
              </tr>
            </thead>
            <tbody>
              {genres.map((genre) => (
                <tr key={genre.id} className="border-b border-white/10 hover:bg-white/5 transition">
                  <td className="p-4 text-white">{genre.name}</td>
                  <td className="p-4 text-gray-400">{new Date(genre.createdAt).toLocaleDateString()}</td>
                  <td className="p-4 text-right">
                    <Button
                      onClick={() => handleEdit(genre.id)}
                      color="blue"
                      size="sm"
                      className="mr-2 p-2 border-0 hover:scale-100"
                      variant="secondary"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(genre.id)}
                      color="red"
                      size="sm"
                      className="p-2 border-0 hover:scale-100"
                      variant="secondary"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {/* Pagination */}
          <Pagination
            pagination={{
              page: pagination.currentPage || pagination.page,
              pages: pagination.totalPages || pagination.pages,
            }}
            onPageChange={(newPage) => handleChangeFilter('page', newPage)}
          />
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
              <Input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Genre name"
                className="w-full p-3 rounded-xl   bg-transparent text-white placeholder-gray-400 focus:outline-none focus:border-white/50 " 
                
              />
              <div className="flex justify-end space-x-3">
                <Button
                  type="button"
                  onClick={closeModal}
                  color="gray"
                  size="md"
                  className="px-6"
                  variant="secondary"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="blue"
                  size="md"
                  loading={formLoading}
                  disabled={formLoading}
                  className="px-6 flex-0"
                >
                  {editingId ? 'Update' : 'Create'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}