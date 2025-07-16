// frontend/components/FriendList.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  isFriend?: boolean;
}

interface FriendListProps {
  friends: User[];
  onAddFriend: (friendEmail: string) => void;
}

export default function FriendList({ friends, onAddFriend }: FriendListProps) {
  const [friendEmail, setFriendEmail] = useState('');
  const [showModal, setShowModal] = useState(false);
  const currentEmail = typeof window !== 'undefined' ? localStorage.getItem('email') : null;

  const handleAddFriend = () => {
    if (!friendEmail || friendEmail === currentEmail) {
      toast.error('Email không hợp lệ hoặc không thể thêm chính mình');
      return;
    }
    onAddFriend(friendEmail);
    setFriendEmail('');
    setShowModal(false);
  };

  return (
    <div className="card">
      <ToastContainer />
      <div className="card-body">
        <h4 className="card-title">Danh sách người dùng</h4>
        <button
          className="btn btn-primary mb-3"
          onClick={() => setShowModal(true)}
        >
          Thêm bạn
        </button>
        <ul className="list-group list-group-flush">
          {friends.length === 0 && (
            <li className="list-group-item">Không có người dùng nào</li>
          )}
          {friends.map((friend) => (
            <li
              key={friend.id}
              className="list-group-item d-flex align-items-center"
            >
              <Link
                href={`/profile/${friend.id}`}
                className="d-flex align-items-center text-decoration-none me-auto"
              >
                <img
                  src={friend.avatar || '/default-avatar.png'}
                  alt={friend.username || friend.email}
                  className="rounded-circle me-2"
                  width="30"
                />
                {friend.username || friend.email}
              </Link>
              {friend.isFriend ? (
                <span className="badge bg-success">Bạn bè</span>
              ) : (
                <button
                  className="btn btn-sm btn-primary"
                  onClick={() => onAddFriend(friend.email)}
                >
                  Thêm bạn
                </button>
              )}
            </li>
          ))}
        </ul>

        {/* Modal for adding friend */}
        <div
          className={`modal fade ${showModal ? 'show' : ''}`}
          style={{ display: showModal ? 'block' : 'none' }}
          tabIndex={-1}
          role="dialog"
          aria-labelledby="addFriendModalLabel"
          aria-hidden={!showModal}
        >
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="addFriendModalLabel">
                  Thêm bạn
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label htmlFor="friendEmail" className="form-label">
                    Email của bạn bè
                  </label>
                  <input
                    type="email"
                    className="form-control"
                    id="friendEmail"
                    value={friendEmail}
                    onChange={(e) => setFriendEmail(e.target.value)}
                    placeholder="Nhập email của bạn bè"
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Đóng
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handleAddFriend}
                >
                  Gửi yêu cầu
                </button>
              </div>
            </div>
          </div>
        </div>
        {showModal && <div className="modal-backdrop fade show"></div>}
      </div>
    </div>
  );
}