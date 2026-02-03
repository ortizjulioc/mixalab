'use client'
import React from 'react'

export default function Table({
  columns = [],
  data = [],
  renderActions,
  loading = false,
  emptyMessage = 'No records found.',

}) {
  if (loading) {
    return (
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
    )
  }

  if (!data || data.length === 0) {
    return (
      <div className="p-8 text-center text-gray-400 liquid-glass rounded-2xl border border-white/20">
        {emptyMessage}
      </div>
    )
  }

  return (
    <div className="border border-white/20 rounded-2xl liquid-glass overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="bg-white/5">
            {columns.map((col) => (
              <th
                key={col.key}
                className="p-4 text-left text-white font-semibold border-b border-white/20"
              >
                {col.label}
              </th>
            ))}
            {renderActions && (
              <th className="p-4 text-right text-white font-semibold border-b border-white/20">
                Actions
              </th>
            )}
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr
              key={item.id}
              className="border-b border-white/10 hover:bg-white/5 transition"
            >
              {columns.map((col) => (
                <td key={col.key} className="p-4 text-gray-300">
                  {col.render ? col.render(item[col.key], item) : item[col.key]}
                </td>
              ))}

              {renderActions && (
                <td className="p-4 text-right">{renderActions(item)}</td>
              )}
            </tr>
          ))}
        </tbody>
      </table>


    </div>
  )
}
