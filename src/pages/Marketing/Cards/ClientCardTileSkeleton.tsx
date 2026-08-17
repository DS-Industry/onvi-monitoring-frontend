import React from 'react';
import { Skeleton } from 'antd';

type ClientCardTileSkeletonProps = {
  compact?: boolean;
  count?: number;
};

const ClientCardTileSkeleton: React.FC<ClientCardTileSkeletonProps> = ({
  compact = false,
  count = 1,
}) => (
  <>
    {Array.from({ length: count }).map((_, index) => (
      <div
        key={index}
        className={`rounded-2xl px-5 flex flex-col justify-between bg-primary02/25 w-full ${
          compact ? 'py-3 min-h-[100px]' : 'py-4 min-h-[120px]'
        }`}
      >
        <Skeleton.Input active size="small" style={{ width: '55%', minWidth: 0 }} />
        <Skeleton.Input
          active
          size={compact ? 'default' : 'large'}
          style={{ width: '70%', minWidth: 0, margin: '8px 0' }}
        />
        <div className="flex justify-between gap-3">
          <Skeleton.Input active size="small" style={{ width: 72, minWidth: 0 }} />
          <Skeleton.Input active size="small" style={{ width: 64, minWidth: 0 }} />
        </div>
      </div>
    ))}
  </>
);

export default ClientCardTileSkeleton;
