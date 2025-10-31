import Link from 'next/link'
import React from 'react';

export default function BreadcrumbsTitle({ title, items }) {
  return (
    <>
      <h2 className="text-2xl font-bold text-white my-2">{title}</h2>
      <nav className="flex items-center text-sm text-gray-400 mb-6">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.href && index < items.length - 1 ? (
              <Link
                href={item.href}
                className="text-blue-400 hover:text-blue-300 transition-colors duration-200 flex items-center gap-0.5"
              >
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </Link>
            ) : (
              <span className={`flex items-center gap-0.5 ${index < items.length - 1 ? 'font-normal' : 'font-semibold text-white'}`}>
                {item.icon && <span className="flex-shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </span>
            )}
            {index < items.length - 1 && <span className="mx-1 text-gray-500">/</span>}
          </React.Fragment>
        ))}
      </nav>
    </>
  )
}