import React from 'react';

interface Friend {
  id: string;
  username: string;
  status: string;
}

interface FriendListProps {
  friends: Friend[];
  onAddFriend: () => void;
}

export default function FriendList({ friends, onAddFriend }: FriendListProps) {
  return (
    <div className="card">
      <div className="card-header bg-success text-white">Friends List</div>
      <div className="card-body p-0">
        <button className="btn btn-primary mb-3 mx-3 mt-3" onClick={onAddFriend}>
          Add Friend
        </button>
        <ul className="list-group list-group-flush">
          {friends.map((friend) => (
            <li
              key={friend.id}
              className={`list-group-item ${
                friend.status === 'online' ? 'bg-success text-white' : 'bg-light'
              }`}
            >
              {friend.username} ({friend.status})
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}