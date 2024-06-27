import  { useState } from 'react';
import { usePagination, DOTS } from './usePagination';
import './pagination.scss';
import { uuid } from '../../utils/helpers';

export const Pagination = (props: any) => {
  const { onPageChange, totalCount, siblingCount = 1, currentPage, pageSize, className } = props;

  const paginationRange = usePagination({
    currentPage,
    totalCount,
    siblingCount,
    pageSize,
  });

  if (currentPage === 0 || (paginationRange && paginationRange.length < 2)) {
    return null;
  }

  const onNext = () => {
    onPageChange(currentPage + 1);
  };

  const onPrevious = () => {
    onPageChange(currentPage - 1);
  };


  const lastPage = paginationRange && paginationRange[paginationRange.length - 1];

  return (
    <div className="flex space-x-4  justify-center">
      <ul className={`pagination-container ${className}`}>
        <li
          key={uuid()}
          className={`arrow-icon pagination-item ${currentPage === 1 ? 'disabled' : ''}`}
          onClick={onPrevious}
        >
          <div className="arrow left" />
        </li>
        {paginationRange?.map((pageNumber) => {
          if (pageNumber === DOTS) {
            return (
              <li key={uuid()} className="pagination-item dots">
                &#8230;
              </li>
            );
          }

          return (
            <li
              key={uuid()}
              className={`pagination-item ${pageNumber === currentPage ? 'selected' : ''}`}
              onClick={() => onPageChange(pageNumber)}
            >
              {pageNumber}
            </li>
          );
        })}
        <li
          key={uuid()}
          className={`arrow-icon pagination-item ${currentPage === lastPage ? 'disabled' : ''}`}
          onClick={onNext}
        >
          <div className="arrow right" />
        </li>
      </ul>
    </div>
  );
};

export default Pagination;
