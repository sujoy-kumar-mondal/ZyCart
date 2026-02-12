import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const Breadcrumb = ({ 
  mainCategory = '',
  subCategory = '',
  subSubCategory = '',
  productTitle = ''
}) => {
  const breadcrumbs = [
    { label: 'Home', href: '/', category: null },
    ...(mainCategory ? [{ label: mainCategory, href: `/products?mainCategory=${encodeURIComponent(mainCategory)}`, category: mainCategory }] : []),
    ...(subCategory ? [{ label: subCategory, href: `/products?mainCategory=${encodeURIComponent(mainCategory)}&subCategory=${encodeURIComponent(subCategory)}`, category: subCategory }] : []),
    ...(subSubCategory ? [{ label: subSubCategory, href: `/products?mainCategory=${encodeURIComponent(mainCategory)}&subCategory=${encodeURIComponent(subCategory)}&subSubCategory=${encodeURIComponent(subSubCategory)}`, category: subSubCategory }] : []),
    ...(productTitle ? [{ label: productTitle, href: null, isLast: true }] : []),
  ];

  return (
    <nav className="flex items-center gap-2 text-sm text-gray-600 mb-8 flex-wrap">
      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center gap-2">
          {crumb.href ? (
            <Link 
              to={crumb.href}
              className="hover:text-blue-600 text-gray-600 transition-colors duration-200"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className={crumb.isLast ? 'text-gray-900 font-medium' : 'text-gray-600'}>
              {crumb.label}
            </span>
          )}
          {index < breadcrumbs.length - 1 && (
            <span className="text-gray-400">/</span>
          )}
        </div>
      ))}
    </nav>
  );
};

export default Breadcrumb;
