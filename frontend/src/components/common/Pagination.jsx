// src/components/common/Pagination.jsx

import React from 'react';
import { Pagination as BootstrapPagination } from 'react-bootstrap';
import { DEFAULT_PAGE_SIZE } from '../../config/constants';

const Pagination = ({
  currentPage,
  totalItems,
  pageSize = DEFAULT_PAGE_SIZE,
  onPageChange,
  maxPageButtons = 5,
  className = '',
  showTotal = true,
}) => {
  // Calculate total number of pages
  const totalPages = Math.ceil(totalItems / pageSize);
  
  // Don't render pagination if there's only one page or no items
  if (totalPages <= 1 || totalItems === 0) {
    return null;
  }
  
  // Calculate the range of page buttons to show
  let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxPageButtons - 1);
  
  // Adjust start page if end page is at the maximum
  if (endPage === totalPages) {
    startPage = Math.max(1, endPage - maxPageButtons + 1);
  }
  
  // Generate page buttons
  const pageButtons = [];
  
  // First page button
  if (startPage > 1) {
    pageButtons.push(
      <BootstrapPagination.Item
        key="first"
        onClick={() => onPageChange(1)}
      >
        1
      </BootstrapPagination.Item>
    );
    
    // Add ellipsis if there's a gap
    if (startPage > 2) {
      pageButtons.push(
        <BootstrapPagination.Ellipsis key="ellipsis-1" disabled />
      );
    }
  }
  
  // Page buttons
  for (let page = startPage; page <= endPage; page++) {
    pageButtons.push(
      <BootstrapPagination.Item
        key={page}
        active={page === currentPage}
        onClick={() => onPageChange(page)}
      >
        {page}
      </BootstrapPagination.Item>
    );
  }
  
  // Last page button
  if (endPage < totalPages) {
    // Add ellipsis if there's a gap
    if (endPage < totalPages - 1) {
      pageButtons.push(
        <BootstrapPagination.Ellipsis key="ellipsis-2" disabled />
      );
    }
    
    pageButtons.push(
      <BootstrapPagination.Item
        key="last"
        onClick={() => onPageChange(totalPages)}
      >
        {totalPages}
      </BootstrapPagination.Item>
    );
  }
  
  // Calculate item range for current page
  const firstItem = (currentPage - 1) * pageSize + 1;
  const lastItem = Math.min(currentPage * pageSize, totalItems);
  
  return (
    <div className={`d-flex justify-content-between align-items-center ${className}`}>
      {showTotal && (
        <div className="small text-muted">
          Showing {firstItem}-{lastItem} of {totalItems} items
        </div>
      )}
      
      <BootstrapPagination className="mb-0">
        <BootstrapPagination.First
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
        />
        <BootstrapPagination.Prev
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        />
        
        {pageButtons}
        
        <BootstrapPagination.Next
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        />
        <BootstrapPagination.Last
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
        />
      </BootstrapPagination>
    </div>
  );
};

export default Pagination;