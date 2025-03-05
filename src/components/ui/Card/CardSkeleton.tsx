import React from 'react';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

interface CardSkeletonProps {
    cardCount?: number; // Number of skeleton cards to render
    cardHeight?: string; // Height of each card
    cardWidth?: string; // Width of each card
}

const CardSkeleton: React.FC<CardSkeletonProps> = ({
    cardCount = 1, // Default number of skeleton cards
    cardHeight = '200px', // Default card height
    cardWidth = '100%', // Default card width
}) => {
    return (
        <div className={`table-skeleton bg-white w-[${cardWidth}]`}>
            {[...Array(cardCount)].map((_, index) => (
                <div key={index} className="bg-opacity01 border rounded-2xl animate-pulse">
                    <Skeleton height={cardHeight} width={cardWidth} className="rounded w-full" />
                </div>
            ))}
        </div>
    );
};

export default CardSkeleton;
