import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface TableSkeletonProps {
    rowCount?: number; // For tables or lists
    columnCount?: number; // For tables
    customHeight?: string; // For custom height
    customWidth?: string; // For custom width
}

const TableSkeleton: React.FC<TableSkeletonProps> = ({
    rowCount = 1, // Default number of rows for table
    columnCount = 5, // Default number of columns for table
    customHeight = '250px',
}) => {
    return (
        <div className="table-skeleton bg-white">
            {Array(rowCount).fill(0).map((_, rowIndex) => (
                <div key={rowIndex} className="flex gap-2 mb-2 bg-opacity01 border rounded-2xl animate-pulse">
                    {Array(columnCount).fill(0).map((_, colIndex) => (
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
};

export default TableSkeleton;