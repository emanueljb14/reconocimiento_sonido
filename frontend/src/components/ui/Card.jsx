import React from 'react';

export default function Card({ children, className = '', title, action }) {
  return (
    <section className={`rounded-xl border border-slate-200 dark:border-sg-line bg-white dark:bg-sg-panel text-slate-800 dark:text-white shadow-sm transition-colors duration-200 ${className}`}>
      {title && (
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-sg-line px-4 py-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">{title}</h3>
          {action}
        </div>
      )}
      {children}
    </section>
  );
}