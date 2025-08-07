import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

type SkeletonType = 'table' | 'card' | 'list' | 'custom';

interface CustomSkeletonProps {
  type?: SkeletonType;
  rowCount?: number; // For tables or lists
  columnCount?: number; // For tables
  cardCount?: number; // For card layout
  customHeight?: string; // For custom height
  customWidth?: string; // For custom width
}

const CustomSkeleton: React.FC<CustomSkeletonProps> = ({
  type = 'custom', // Default is 'custom'
  rowCount = 1, // Default number of rows for table
  columnCount = 5, // Default number of columns for table
  cardCount = 1, // Default number of cards
  customHeight = '250px',
  customWidth = '100%',
}) => {
  switch (type) {
    case 'table':
      return (
        <div className="table-skeleton bg-white">
          {Array(rowCount)
            .fill(0)
            .map((_, rowIndex) => (
              <div
                key={rowIndex}
                className="flex gap-2 mb-2 bg-opacity01 border rounded-2xl animate-pulse"
              >
                {Array(columnCount)
                  .fill(0)
                  .map((_, colIndex) => (
                    <Skeleton
                      key={colIndex}
                      width={`${100 / columnCount}%`}
                      height={customHeight}
                      className="rounded"
                    />
                  ))}
              </div>
            ))}
        </div>
      );

    case 'card':
      return (
        <div className="card-skeleton grid grid-cols-1 gap-4">
          {Array(cardCount)
            .fill(0)
            .map((_, cardIndex) => (
              <div key={cardIndex} className="p-4 border rounded-lg shadow-lg">
                <Skeleton height={150} className="mb-4 rounded" />
                <Skeleton width="80%" height="20px" className="mb-2 rounded" />
                <Skeleton width="60%" height="20px" className="rounded" />
              </div>
            ))}
        </div>
      );

    case 'list':
      return (
        <div className="list-skeleton">
          {Array(rowCount)
            .fill(0)
            .map((_, listIndex) => (
              <Skeleton
                key={listIndex}
                height={customHeight}
                width={customWidth}
                className="mb-2 rounded"
              />
            ))}
        </div>
      );

    case 'custom':
    default:
      return (
        <Skeleton
          height={customHeight}
          width={customWidth}
          className="rounded"
        />
      );
  }
};

export default CustomSkeleton;
