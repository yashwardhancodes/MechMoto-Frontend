'use client';

import { useSelector } from 'react-redux';
import Link from 'next/link';
import { RootState } from '@/lib/redux/store'; // Adjust the import path based on your project structure

// Define the BreadcrumbItem interface
interface BreadcrumbItem {
  label: string;
  href?: string;
}

function Breadcrumb() {
  const items = useSelector((state: RootState) => state.breadcrumb.items) as BreadcrumbItem[];

  console.log('Breadcrumb items:', items);

  if (!Array.isArray(items)) {
    return null;
  }

  if (items.length === 0) return null;

  return (
    <nav aria-label="breadcrumb">
      <ol style={{ listStyle: 'none', display: 'flex', gap: '8px' }}>
        {items.map((item, index) => (
          <li key={item.href || item.label}>
            {index > 0 && <span> &gt; </span>}
            {item.href ? (
              <Link
                href={item.href || '#'}
                style={{
                  color: index === items.length - 1 ? 'green' : 'black',
                  textDecoration: 'none',
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span style={{ color: 'green' }}>{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export default Breadcrumb;