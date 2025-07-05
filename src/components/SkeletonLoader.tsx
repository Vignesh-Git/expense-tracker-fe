import React from 'react';
import { Skeleton } from 'primereact/skeleton';

/**
 * Skeleton loader component for consistent loading states
 * Provides various skeleton layouts for different content types
 */

interface SkeletonLoaderProps {
  type?: 'card' | 'table' | 'list' | 'chart' | 'form' | 'custom';
  count?: number;
  className?: string;
  height?: string;
  width?: string;
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  type = 'card',
  count = 1,
  className = '',
  height,
  width
}) => {
  const renderSkeleton = () => {
    switch (type) {
      case 'card':
        return (
          <div className={`skeleton-card skeleton-stack ${className}`}>
            <Skeleton height="200px" />
            <Skeleton height="1rem" width="60%" />
            <Skeleton height="1rem" width="40%" />
            <Skeleton height="1rem" width="80%" />
          </div>
        );

      case 'table':
        return (
          <div className={`skeleton-table skeleton-stack ${className}`}>
            {/* Table header */}
            <div className="skeleton-stack" style={{ flexDirection: 'row', gap: '1rem' }}>
              <Skeleton height="2rem" width="200px" />
              <Skeleton height="2rem" width="120px" />
            </div>
            {/* Table rows */}
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="skeleton-stack" style={{ flexDirection: 'row', gap: '1rem' }}>
                <Skeleton height="2rem" width="60px" />
                <Skeleton height="1rem" width="150px" />
                <Skeleton height="1rem" width="100px" />
                <Skeleton height="1rem" width="80px" />
                <Skeleton height="1rem" width="60px" />
              </div>
            ))}
          </div>
        );

      case 'list':
        return (
          <div className={`skeleton-list skeleton-stack ${className}`}>
            {Array.from({ length: count }).map((_, index) => (
              <div key={index} className="skeleton-stack" style={{ flexDirection: 'row', gap: '1rem', alignItems: 'center' }}>
                <Skeleton shape="circle" size="3rem" />
                <div className="skeleton-stack" style={{ flex: 1 }}>
                  <Skeleton height="1rem" width="70%" />
                  <Skeleton height="0.8rem" width="50%" />
                </div>
                <Skeleton height="1rem" width="80px" />
              </div>
            ))}
          </div>
        );

      case 'chart':
        return (
          <div className={`skeleton-chart skeleton-stack ${className}`}>
            <Skeleton height="300px" />
            <div className="skeleton-stack" style={{ flexDirection: 'row', gap: '1rem', justifyContent: 'center' }}>
              <Skeleton height="1rem" width="60px" />
              <Skeleton height="1rem" width="60px" />
              <Skeleton height="1rem" width="60px" />
            </div>
          </div>
        );

      case 'form':
        return (
          <div className={`skeleton-form skeleton-stack ${className}`}>
            <Skeleton height="2rem" />
            <Skeleton height="2rem" />
            <Skeleton height="2rem" />
            <Skeleton height="2rem" />
            <Skeleton height="2rem" width="120px" />
          </div>
        );

      case 'custom':
        return (
          <Skeleton 
            height={height || "1rem"} 
            width={width || "100%"} 
            className={className} 
          />
        );

      default:
        return <Skeleton height="1rem" className={className} />;
    }
  };

  return (
    <div className="skeleton-loader">
      {renderSkeleton()}
    </div>
  );
};

export default SkeletonLoader; 