// frontend/components/FriendList.tsx
import Link from 'next/link';

interface Friend {
  id: string;
  username: string;
  avatar: string;
}

interface FriendListProps {
  friends: Friend[];
  onAddFriend: (friendEmail: string) => void;
}

export default function FriendList({ friends, onAddFriend }: FriendListProps) {
  const handleAdd = () => {
    const friendEmail = prompt('Enter friend email to add:');
    if (friendEmail) onAddFriend(friendEmail);
  };

  return (
    <div className="card">
      <div className="card-body">
        <h4 className="card-title">Your Friends</h4>
        <button className="btn btn-primary mb-3" onClick={handleAdd}>
          Add Friend
        </button>
        <ul className="list-group list-group-flush">
          {friends.map((friend) => (
            <li key={friend.id} className="list-group-item">
              <Link href={`/profile/${friend.id}`} className="d-flex align-items-center">
                <img src={friend.avatar} alt={friend.username} className="rounded-circle me-2" width="30" />
                {friend.username}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}