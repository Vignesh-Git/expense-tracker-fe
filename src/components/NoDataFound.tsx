import React from 'react';
import { Button } from 'primereact/button';

/**
 * No data found component for consistent empty states
 * Provides various layouts and actions for different content types
 */

interface NoDataFoundProps {
  type?: 'expenses' | 'categories' | 'users' | 'notifications' | 'search' | 'custom';
  title?: string;
  message?: string;
  icon?: string;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
  className?: string;
}

const NoDataFound: React.FC<NoDataFoundProps> = ({
  type = 'custom',
  title,
  message,
  icon,
  actionLabel,
  onAction,
  showAction = false,
  className = ''
}) => {
  const getDefaultContent = () => {
    switch (type) {
      case 'expenses':
        return {
          title: 'No Expenses Found',
          message: 'You haven\'t added any expenses yet. Start tracking your spending by adding your first expense.',
          icon: 'pi-receipt',
          actionLabel: 'Add Expense',
          showAction: true
        };

      case 'categories':
        return {
          title: 'No Categories Found',
          message: 'No expense categories have been created yet. Create categories to better organize your expenses.',
          icon: 'pi-tags',
          actionLabel: 'Create Category',
          showAction: true
        };

      case 'users':
        return {
          title: 'No Users Found',
          message: 'No users are currently registered in the system.',
          icon: 'pi-users',
          actionLabel: 'Invite Users',
          showAction: true
        };

      case 'notifications':
        return {
          title: 'No Notifications',
          message: 'You\'re all caught up! No new notifications at the moment.',
          icon: 'pi-bell',
          actionLabel: '',
          showAction: false
        };

      case 'search':
        return {
          title: 'No Results Found',
          message: 'No items match your search criteria. Try adjusting your search terms.',
          icon: 'pi-search',
          actionLabel: 'Clear Search',
          showAction: true
        };

      default:
        return {
          title: title || 'No Data Found',
          message: message || 'There is no data to display at the moment.',
          icon: icon || 'pi-inbox',
          actionLabel: actionLabel || '',
          showAction: showAction
        };
    }
  };

  const content = getDefaultContent();

  return (
    <div className={`no-data-found flex flex-column align-items-center justify-content-center p-6 ${className}`}>
      <div className="text-center">
        {/* Icon */}
        <div className="no-data-icon mb-4">
          <i className={`pi ${content.icon} text-6xl text-400`}></i>
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-700 mb-2">
          {content.title}
        </h3>

        {/* Message */}
        <p className="text-500 mb-4 max-w-md">
          {content.message}
        </p>

        {/* Action Button */}
        {content.showAction && onAction && (
          <Button
            label={content.actionLabel}
            icon="pi pi-plus"
            onClick={onAction}
            className="p-button-primary"
          />
        )}
      </div>
    </div>
  );
};

export default NoDataFound; 