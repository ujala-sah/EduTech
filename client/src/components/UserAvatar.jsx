import { assetUrl } from '../services/api';

const roleEmoji = {
  student: '🎓',
  teacher: '📚',
  admin: '🛡️',
};

function photoSrc(path) {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('blob:') || path.startsWith('data:')) return path;
  return assetUrl(path);
}

function UserAvatar({ user, size = 'md' }) {
  if (!user) return null;
  const photo = photoSrc(user.profilePhoto);
  const emoji = roleEmoji[user.role] || '🙂';

  return (
    <span className={`user-avatar ${size}`} aria-hidden={!photo}>
      {photo ? <img src={photo} alt="" /> : <span className="user-avatar-emoji">{emoji}</span>}
    </span>
  );
}

export default UserAvatar;
