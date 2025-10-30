'use client';
import React from 'react';

export default function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.pages <= 1) return null;

  const { page, pages } = pagination;

  const handlePageClick = (newPage) => {
    if (newPage >= 1 && newPage <= pages && newPage !== page) {
      onPageChange(newPage);
    }
  };

  return (
    <div className="flex justify-center space-x-2 p-4 bg-white/5 rounded-b-2xl">
      {/* Botón anterior */}
      <button
        onClick={() => handlePageClick(page - 1)}
        disabled={page === 1}
        className="px-4 py-2 bg-gray-600/50 hover:bg-gray-700/50 text-white rounded-xl disabled:opacity-50 transition"
      >
        Previous
      </button>

      {/* Números de página */}
      {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
        <button
          key={p}
          onClick={() => handlePageClick(p)}
          className={`px-4 py-2 rounded-xl transition ${
            p === page
              ? 'bg-blue-600/50 text-white border border-blue-500/30'
              : 'bg-gray-600/50 hover:bg-gray-700/50 text-white'
          }`}
        >
          {p}
        </button>
      ))}

      {/* Botón siguiente */}
      <button
        onClick={() => handlePageClick(page + 1)}
        disabled={page === pages}
        className="px-4 py-2 bg-gray-600/50 hover:bg-gray-700/50 text-white rounded-xl disabled:opacity-50 transition"
      >
        Next
      </button>
    </div>
  );
}
