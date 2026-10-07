import React from 'react';
import UserCard from './UserCard';
import EmptyState from '../common/EmptyState';
import { Users } from 'lucide-react';

const UserGrid = ({ users, onMessageClick, emptyTitle, emptyDescription }) => {
  if (!users || users.length === 0) {
    return (
      <EmptyState
        icon={<Users size={28} />}
        title={emptyTitle || 'No users found'}
        description={emptyDescription || 'Try changing your filters or search.'}
      />
    );
  }

  return (
    <div className="user-grid">
      {users.map(user => (
        <UserCard key={user.id} user={user} onMessageClick={onMessageClick} />
      ))}
    </div>
  );
};

export default UserGrid;
