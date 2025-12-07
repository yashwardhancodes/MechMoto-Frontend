// 'use client';

// import { useSelector } from 'react-redux';
// import Link from 'next/link';
// import { RootState } from '@/lib/redux/store';

// interface BreadcrumbItem {
//   label: string;
//   href?: string;
// }

// export default function Breadcrumb() {
//   const items = useSelector((state: RootState) => state.breadcrumb.items) as BreadcrumbItem[];

//   if (!Array.isArray(items) || items.length === 0) return null;

//   return (
//     <nav aria-label="Breadcrumb" className="py-3 overflow-x-auto whitespace-nowrap scrollbar-hide">
//       <ol className="flex items-center text-sm md:text-base font-medium">
//         {items.map((item, index) => {
//           const isLast = index === items.length - 1;

//           return (
//             <li key={item.href || item.label} className="flex items-center">
//               {index > 0 && (
//                 <span className="mx-2 text-gray-400" aria-hidden="true">
//                   ›
//                 </span>
//               )}

//               {item.href && !isLast ? (
//                 <Link
//                   href={item.href}
//                   className="text-gray-600 hover:text-gray-800 hover:underline transition-colors"
//                 >
//                   {item.label}
//                 </Link>
//               ) : (
//                 <span className="text-[#9AE144] font-semibold">
//                   {item.label}
//                 </span>
//               )}
//             </li>
//           );
//         })}
//       </ol>
//     </nav>
//   );
// }



'use client';

import { useSelector } from 'react-redux';
import { RootState } from '@/lib/redux/store';

interface BreadcrumbItem {
  label: string;
  href?: string;
}

export default function Breadcrumb() {
  const items = useSelector((state: RootState) => state.breadcrumb.items) as BreadcrumbItem[];

  if (!Array.isArray(items) || items.length === 0) return null;

  return (
    <nav
      aria-label="Breadcrumb"
      className="py-3 overflow-x-auto whitespace-nowrap scrollbar-hide"
    >
      <ol className="flex items-center text-sm md:text-base font-medium">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          return (
            <li key={item.label} className="flex items-center">
              {/* Separator */}
              {index > 0 && (
                <span className="mx-2 text-gray-400" aria-hidden="true">
                  ›
                </span>
              )}

              {/* Always render as plain text – no Link, no hover */}
              <span
                className={`${
                  isLast
                    ? 'text-[#9AE144] font-semibold'
                    : 'text-gray-600'
                }`}
                // Optional: add aria-current for accessibility
                {...(isLast ? { 'aria-current': 'page' } : {})}
              >
                {item.label}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}