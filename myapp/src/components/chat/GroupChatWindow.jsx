import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  ArrowLeft, Users, Send, UserPlus, LogOut, Shield, Info,
  MoreVertical, Crown, X, Edit2, Trash2, Check, UserMinus,
  CheckCheck, Eye, UserCheck, Clock, ShieldCheck, AlertCircle, MessageSquare
} from 'lucide-react';
import { useGroup } from '../../context/GroupContext';
import { useAuth } from '../../context/AuthContext';
import { useUserContext } from '../../context/UserContext';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../common/Modal';
import { DEFAULT_USER_PHOTO } from '../../data/users';
import { formatChatTime } from '../../utils/dateUtils';

// ── Member Avatar Stack ──────────────────────────────────────
const MemberAvatarStack = ({ memberIds, getUserById, limit = 5, onClick }) => {
  const visible = memberIds.slice(0, limit);
  const extra = memberIds.length - limit;

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', cursor: onClick ? 'pointer' : 'default' }}
      onClick={onClick}
      title={`${memberIds.length} members — click to view`}
    >
      {visible.map((id, idx) => {
        const u = getUserById(id);
        return (
          <img
            key={id}
            src={u?.image || DEFAULT_USER_PHOTO}
            alt={u?.name || 'Member'}
            onError={e => { e.target.src = DEFAULT_USER_PHOTO; }}
            style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              objectFit: 'cover',
              border: '2px solid var(--surface)',
              marginLeft: idx === 0 ? 0 : -9,
              zIndex: visible.length - idx,
              position: 'relative',
              background: 'var(--surface-elevated)'
            }}
          />
        );
      })}
      {extra > 0 && (
        <div style={{
          width: 30,
          height: 30,
          borderRadius: '50%',
          background: 'var(--primary)',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 10,
          fontWeight: 700,
          border: '2px solid var(--surface)',
          marginLeft: -9,
          zIndex: 0,
          position: 'relative'
        }}>
          +{extra}
        </div>
      )}
    </div>
  );
};

// ── Group Message Seen Status Component ──────────────────────
const GroupMessageStatus = ({ message, groupMembers = [], isMe }) => {
  if (!isMe) return null;

  const seenList = message.seenBy || [];
  const othersCount = groupMembers.filter(id => id !== message.senderId).length;
  const seenByOthers = seenList.filter(id => id !== message.senderId).length;

  if (othersCount <= 0) return null;

  if (seenByOthers >= othersCount) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#60a5fa' }}>
        <CheckCheck size={11} />
        Seen by all
      </span>
    );
  }

  if (seenByOthers > 0) {
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'rgba(255,255,255,0.7)' }}>
        <Eye size={11} />
        Seen by {seenByOthers} of {othersCount}
      </span>
    );
  }

  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
      <CheckCheck size={11} />
      Delivered
    </span>
  );
};

// ── Admin Join Requests Modal ────────────────────────────────
const JoinRequestsModal = ({
  group,
  requests,
  onAccept,
  onDecline,
  onClose
}) => {
  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Group Join Requests"
      subtitle={`Review permission requests for "${group.name}" (${requests.length} pending)`}
    >
      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
        {requests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)' }}>
            <UserCheck size={32} style={{ opacity: 0.4, marginBottom: 8 }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>No Pending Requests</div>
            <p style={{ fontSize: 12, marginTop: 4 }}>All join requests have been processed.</p>
          </div>
        ) : (
          requests.map(req => (
            <div
              key={req.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '12px 14px',
                borderRadius: 12,
                background: 'var(--surface-elevated)',
                border: '1px solid var(--border)',
                marginBottom: 10
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <img
                  src={req.userImage || DEFAULT_USER_PHOTO}
                  alt={req.userName}
                  style={{ width: 42, height: 42, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                  onError={e => { e.target.src = DEFAULT_USER_PHOTO; }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>
                    {req.userName}
                  </div>
                  <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>
                    {req.userBio}
                  </div>
                  <div style={{ fontSize: 10.5, color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} />
                    Requested {formatChatTime(req.timestamp)}
                  </div>
                </div>
              </div>

              {req.note && (
                <div style={{
                  fontSize: 12,
                  fontStyle: 'italic',
                  color: 'var(--text-secondary)',
                  background: 'rgba(99, 102, 241, 0.08)',
                  padding: '6px 10px',
                  borderRadius: 8,
                  borderLeft: '3px solid var(--primary)'
                }}>
                  "{req.note}"
                </div>
              )}

              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 4 }}>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => onDecline(req.id)}
                  style={{ fontSize: 12, color: 'var(--error)' }}
                >
                  <X size={13} /> Decline
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => onAccept(req.id)}
                  style={{ fontSize: 12, gap: 5, background: '#10b981', borderColor: '#10b981' }}
                >
                  <Check size={13} /> Accept & Add to Group
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
};

// ── User Request Permission Modal ────────────────────────────
const RequestPermissionModal = ({
  group,
  onSendRequest,
  onClose
}) => {
  const [note, setNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    onSendRequest(note);
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Request Permission to Join"
      subtitle={`Ask group admin for approval to join "${group.name}"`}
    >
      <form onSubmit={handleSubmit}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 14px',
          borderRadius: 12,
          background: 'var(--surface-elevated)',
          marginBottom: 16
        }}>
          <img
            src={group.avatar}
            alt={group.name}
            style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover' }}
            onError={e => { e.target.src = DEFAULT_USER_PHOTO; }}
          />
          <div>
            <div style={{ fontWeight: 700, fontSize: 14 }}>{group.name}</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              {group.category} • {group.members?.length || 1} members
            </div>
          </div>
        </div>

        <div style={{
          background: 'rgba(234, 179, 8, 0.1)',
          border: '1px solid rgba(234, 179, 8, 0.25)',
          borderRadius: 10,
          padding: '10px 12px',
          marginBottom: 16,
          display: 'flex',
          alignItems: 'flex-start',
          gap: 8,
          fontSize: 12.5,
          color: 'var(--text-secondary)'
        }}>
          <Shield size={16} style={{ color: '#eab308', flexShrink: 0, marginTop: 2 }} />
          <span>
            This group requires <strong>Admin approval</strong>. Once you submit this request, the group admin will review and accept your profile before you can chat.
          </span>
        </div>

        <div style={{ marginBottom: 18 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>
            Message / Note to Admin (Optional)
          </label>
          <textarea
            className="input"
            rows={3}
            placeholder="e.g. Hi! I'm passionate about web dev and would love to join your discussions."
            value={note}
            onChange={e => setNote(e.target.value)}
            style={{ width: '100%', resize: 'none', fontSize: 13, lineHeight: 1.4 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="btn btn-primary btn-sm"
            disabled={isSubmitting}
            style={{ gap: 6 }}
          >
            <Send size={14} /> Send Join Request
          </button>
        </div>
      </form>
    </Modal>
  );
};

// ── Group Info Panel ─────────────────────────────────────────
const GroupInfoPanel = ({
  group,
  members,
  currentUser,
  pendingRequests = [],
  onClose,
  onRename,
  onMakeAdmin,
  onRemoveMember,
  onLeave,
  onAcceptRequest,
  onDeclineRequest,
}) => {
  const isCurrentUserAdmin = (group.admins || []).includes(currentUser?.id) || group.adminId === currentUser?.id;
  const [renameValue, setRenameValue] = useState(group.name);
  const [showRename, setShowRename] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState(null);

  const handleRename = () => {
    if (!renameValue.trim()) return;
    onRename(renameValue.trim());
    setShowRename(false);
  };

  return (
    <div style={{
      position: 'absolute',
      top: 0, right: 0, bottom: 0,
      width: 'min(330px, 100%)',
      background: 'var(--surface)',
      borderLeft: '1px solid var(--border)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 40,
      overflowY: 'auto',
      boxShadow: '-4px 0 20px rgba(0,0,0,0.25)'
    }}>
      {/* Panel Header */}
      <div style={{
        padding: '14px 18px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface-elevated)',
        position: 'sticky',
        top: 0,
        zIndex: 5
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Info size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 800, fontSize: 15 }}>Group Info</span>
        </div>
        <button
          onClick={onClose}
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Group Avatar + Name */}
      <div style={{ padding: '24px 18px 16px', textAlign: 'center', borderBottom: '1px solid var(--border)' }}>
        <img
          src={group.avatar}
          alt={group.name}
          style={{ width: 80, height: 80, borderRadius: 20, objectFit: 'cover', border: '2px solid var(--border)', marginBottom: 12 }}
          onError={e => { e.target.src = DEFAULT_USER_PHOTO; }}
        />

        {showRename ? (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', marginBottom: 8 }}>
            <input
              className="input"
              value={renameValue}
              onChange={e => setRenameValue(e.target.value)}
              style={{ flex: 1, height: 34, fontSize: 13 }}
              onKeyDown={e => e.key === 'Enter' && handleRename()}
              autoFocus
            />
            <button className="btn btn-primary btn-sm" onClick={handleRename} style={{ height: 34, padding: '0 10px' }}>
              <Check size={14} />
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => { setShowRename(false); setRenameValue(group.name); }} style={{ height: 34, padding: '0 8px' }}>
              <X size={14} />
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 800 }}>{group.name}</h3>
            {isCurrentUserAdmin && (
              <button
                onClick={() => setShowRename(true)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 4 }}
                title="Rename Group"
              >
                <Edit2 size={14} />
              </button>
            )}
          </div>
        )}

        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 4 }}>
          {group.category} • {members.length} members
        </div>
        {group.description && (
          <div style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.5, marginTop: 6 }}>
            {group.description}
          </div>
        )}
      </div>

      {/* Admin Join Requests Section */}
      {isCurrentUserAdmin && (
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', background: pendingRequests.length > 0 ? 'rgba(234,179,8,0.04)' : 'transparent' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>
              <UserCheck size={15} style={{ color: '#eab308' }} />
              <span>Join Requests</span>
            </div>
            <span style={{
              fontSize: 11,
              fontWeight: 800,
              background: pendingRequests.length > 0 ? 'rgba(234, 179, 8, 0.2)' : 'var(--surface-elevated)',
              color: pendingRequests.length > 0 ? '#eab308' : 'var(--text-muted)',
              padding: '2px 8px',
              borderRadius: 999
            }}>
              {pendingRequests.length} pending
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              No pending requests. Non-members need admin permission to join.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {pendingRequests.map(req => (
                <div
                  key={req.id}
                  style={{
                    padding: '8px 10px',
                    borderRadius: 10,
                    background: 'var(--surface-elevated)',
                    border: '1px solid var(--border)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <img
                      src={req.userImage || DEFAULT_USER_PHOTO}
                      alt={req.userName}
                      style={{ width: 32, height: 32, borderRadius: '50%', objectFit: 'cover' }}
                      onError={e => { e.target.src = DEFAULT_USER_PHOTO; }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 12.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {req.userName}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {formatChatTime(req.timestamp)}
                      </div>
                    </div>
                  </div>
                  {req.note && (
                    <div style={{ fontSize: 11.5, color: 'var(--text-secondary)', marginBottom: 6, fontStyle: 'italic' }}>
                      "{req.note}"
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => onDeclineRequest(req.id)}
                      style={{ fontSize: 11, padding: '2px 8px', height: 24, color: 'var(--error)' }}
                    >
                      Decline
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => onAcceptRequest(req.id)}
                      style={{ fontSize: 11, padding: '2px 8px', height: 24, background: '#10b981', borderColor: '#10b981' }}
                    >
                      Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Members List */}
      <div style={{ padding: '12px 0', flex: 1 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 800,
          color: 'var(--text-muted)',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          padding: '6px 18px',
          marginBottom: 4
        }}>
          Members ({members.length})
        </div>

        {members.map(user => {
          if (!user) return null;
          const isMemberAdmin = (group.admins || []).includes(user.id) || group.adminId === user.id;
          const isThisCurrentUser = user.id === currentUser?.id;
          const canManage = isCurrentUserAdmin && !isThisCurrentUser;

          return (
            <div
              key={user.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '10px 18px',
                borderBottom: '1px solid var(--border-subtle)',
                transition: 'background 0.15s'
              }}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img
                  src={user.image || DEFAULT_USER_PHOTO}
                  alt={user.name}
                  style={{ width: 38, height: 38, borderRadius: '50%', objectFit: 'cover' }}
                  onError={e => { e.target.src = DEFAULT_USER_PHOTO; }}
                />
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 13.5, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {user.name}
                  {isThisCurrentUser && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>(you)</span>}
                </div>
                <div style={{ fontSize: 11.5, color: 'var(--text-muted)' }}>{user.city || 'Campus'}</div>
              </div>

              {isMemberAdmin && (
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  padding: '2px 8px',
                  borderRadius: 6,
                  background: 'rgba(234,179,8,0.15)',
                  color: '#eab308',
                  fontSize: 10.5,
                  fontWeight: 700,
                  flexShrink: 0
                }}>
                  <Crown size={10} />
                  Admin
                </span>
              )}

              {canManage && (
                <MemberMenu
                  onMakeAdmin={() => onMakeAdmin(user.id)}
                  onRemove={() => setConfirmRemove(user.id)}
                  showMakeAdmin={!isMemberAdmin}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Leave Group Button */}
      {group.members?.includes(currentUser?.id) && (
        <div style={{ padding: '14px 18px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onLeave}
            className="btn btn-outline"
            style={{ width: '100%', color: 'var(--error)', borderColor: 'var(--error)', gap: 8 }}
          >
            <LogOut size={16} />
            Leave Group
          </button>
        </div>
      )}

      {/* Confirm Remove Modal */}
      {confirmRemove && (
        <Modal
          isOpen={true}
          onClose={() => setConfirmRemove(null)}
          title="Remove Member"
          subtitle="This action will remove the member from the group."
        >
          <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 20 }}>
            Are you sure you want to remove <strong>{members.find(u => u.id === confirmRemove)?.name}</strong> from this group?
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn btn-secondary btn-sm" onClick={() => setConfirmRemove(null)}>Cancel</button>
            <button
              className="btn btn-sm"
              style={{ background: 'var(--error)', color: '#fff' }}
              onClick={() => {
                onRemoveMember(confirmRemove);
                setConfirmRemove(null);
              }}
            >
              <UserMinus size={14} /> Remove
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Member Dropdown Menu ─────────────────────────────────────
const MemberMenu = ({ onMakeAdmin, onRemove, showMakeAdmin }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      <button
        onClick={() => setOpen(p => !p)}
        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: 'var(--text-muted)' }}
      >
        <MoreVertical size={16} />
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 10,
          boxShadow: 'var(--shadow-lg)',
          minWidth: 150,
          zIndex: 100,
          overflow: 'hidden'
        }}>
          {showMakeAdmin && (
            <button
              onClick={() => { onMakeAdmin(); setOpen(false); }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)' }}
            >
              <Crown size={14} style={{ color: '#eab308' }} />
              Make Admin
            </button>
          )}
          <button
            onClick={() => { onRemove(); setOpen(false); }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '10px 14px', fontSize: 13, background: 'none', border: 'none', cursor: 'pointer', color: 'var(--error)' }}
          >
            <UserMinus size={14} />
            Remove Member
          </button>
        </div>
      )}
    </div>
  );
};

// ── Invite Member Panel ──────────────────────────────────────
const InvitePanel = ({ group, users, invitations = [], onInvite, onUninvite, onClose }) => {
  const [search, setSearch] = useState('');

  const available = useMemo(() =>
    (users || []).filter(u =>
      !(group.members || []).includes(u.id) &&
      (u.name?.toLowerCase().includes(search.toLowerCase()) ||
       u.email?.toLowerCase().includes(search.toLowerCase()))
    ),
    [users, group.members, search]
  );

  return (
    <Modal isOpen={true} onClose={onClose} title="Invite to Group" subtitle={`Invite people to "${group.name}"`}>
      <div style={{ marginBottom: 12 }}>
        <input
          className="input"
          placeholder="Search by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ width: '100%', marginBottom: 10 }}
          autoFocus
        />
        <div style={{ maxHeight: 290, overflowY: 'auto' }}>
          {available.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '24px 0', color: 'var(--text-muted)', fontSize: 13 }}>
              {search ? 'No users match your search.' : 'All available users are already members!'}
            </div>
          ) : (
            available.map(u => {
              const isInvited = (invitations || []).some(
                i => i.groupId === group.id && i.inviteeId === u.id && i.status === 'pending'
              );

              return (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '8px 4px',
                    borderBottom: '1px solid var(--border-subtle)'
                  }}
                >
                  <img
                    src={u.image || DEFAULT_USER_PHOTO}
                    alt={u.name}
                    style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }}
                    onError={e => { e.target.src = DEFAULT_USER_PHOTO; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{u.name}</div>
                    <div style={{ fontSize: 11.5, color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {u.city || u.email}
                    </div>
                  </div>

                  {isInvited ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      <span style={{
                        fontSize: 11,
                        fontWeight: 700,
                        color: '#10b981',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.28)',
                        padding: '3px 8px',
                        borderRadius: 6,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4
                      }}>
                        <i className="fa-solid fa-check"></i> Invited
                      </span>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => onUninvite(u.id)}
                        style={{
                          fontSize: 11.5,
                          padding: '3px 10px',
                          height: 32,
                          color: 'var(--error)',
                          background: 'rgba(239, 68, 68, 0.08)',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          borderRadius: 6,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 5,
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                        title="Revoke / Cancel invitation"
                      >
                        <i className="fa-solid fa-user-xmark"></i> Uninvite
                      </button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-premium btn-sm"
                      onClick={() => onInvite(u.id)}
                      style={{ flexShrink: 0, fontSize: 12, padding: '4px 14px', height: 32, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <i className="fa-solid fa-user-plus"></i> Invite
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--border)', paddingTop: 12 }}>
        <button className="btn btn-secondary btn-sm" onClick={onClose}>Done</button>
      </div>
    </Modal>
  );
};

// ── Main GroupChatWindow Component ───────────────────────────
const GroupChatWindow = ({ groupId, onBack }) => {
  const {
    groupInvitations,
    getGroupById,
    getGroupMessages,
    sendGroupMessage,
    markGroupMessagesSeen,
    inviteMember,
    uninviteMember,
    leaveGroup,
    makeAdmin,
    removeMember,
    renameGroup,
    requestToJoin,
    cancelJoinRequest,
    acceptJoinRequest,
    declineJoinRequest,
    getGroupJoinRequests,
    getUserJoinRequest,
  } = useGroup();

  const { currentUser } = useAuth();
  const { users, getUserById } = useUserContext();
  const { showToast, addNotification } = useNotification();

  const group = getGroupById(groupId);
  const messages = getGroupMessages(groupId);

  const [inputMessage, setInputMessage] = useState('');
  const [showInfo, setShowInfo] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showRequestsModal, setShowRequestsModal] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const isMember = group?.members && group.members.includes(currentUser?.id);
  const isAdmin = group && ((group.admins || []).includes(currentUser?.id) || group.adminId === currentUser?.id);

  // Pending Join Requests for Admins
  const pendingRequests = useMemo(() => {
    return group ? getGroupJoinRequests(group.id) : [];
  }, [group, getGroupJoinRequests]);

  // Current user's pending request if non-member
  const userPendingRequest = useMemo(() => {
    return group && currentUser ? getUserJoinRequest(group.id, currentUser.id) : null;
  }, [group, currentUser, getUserJoinRequest]);

  // Build full member user objects
  const memberUsers = useMemo(() =>
    (group?.members || []).map(id => getUserById(id)).filter(Boolean),
    [group?.members, getUserById]
  );

  // Auto-scroll to latest message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length]);

  // Mark all messages seen on open if member
  useEffect(() => {
    if (groupId && currentUser && isMember) {
      markGroupMessagesSeen(groupId);
    }
  }, [groupId, currentUser, isMember, messages.length, markGroupMessagesSeen]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;
    if (!isMember) {
      showToast('error', 'Admin Approval Required', 'You must be approved by the admin to send messages in this group.');
      return;
    }
    sendGroupMessage(groupId, inputMessage.trim());
    setInputMessage('');
    inputRef.current?.focus();
  };

  const handleInvite = (userId) => {
    const targetUser = getUserById(userId);
    const result = inviteMember(groupId, userId);
    if (result) {
      showToast('success', 'Invitation Sent', `Invitation sent to ${targetUser?.name || 'user'}.`);
      if (addNotification) {
        addNotification(
          'group_invite',
          `${currentUser?.name || 'Admin'} invited you to join "${group?.name}".`,
          currentUser?.id,
          `/messages?group=${groupId}`,
          Number(userId)
        );
      }
    } else {
      showToast('info', 'Already Invited', 'This user already has a pending invitation or is a member.');
    }
  };

  const handleUninvite = (userId) => {
    const targetUser = getUserById(userId);
    uninviteMember(groupId, userId);
    showToast('info', 'Invitation Revoked', `Uninvited ${targetUser?.name || 'user'}.`);
  };

  // ── Handle Request to Join ──
  const handleSendRequestToAdmin = (note) => {
    const res = requestToJoin(groupId, note);
    setShowRequestModal(false);
    if (res.success) {
      showToast('success', 'Permission Requested', 'Your request has been sent to the group admin for review.');
      if (addNotification) {
        addNotification(
          'group_request',
          `${currentUser.name} requested permission to join "${group.name}".`,
          currentUser.id,
          `/messages?group=${groupId}`
        );
      }
    } else {
      showToast('error', 'Request Failed', res.error);
    }
  };

  const handleCancelRequest = () => {
    cancelJoinRequest(groupId);
    showToast('info', 'Request Cancelled', 'Your join request was cancelled.');
  };

  // ── Handle Admin Accept Request ──
  const handleAcceptRequest = (requestId) => {
    const res = acceptJoinRequest(requestId);
    if (res.success) {
      showToast('success', 'Member Approved', `${res.user.userName} has been added to "${group.name}".`);
      if (addNotification) {
        addNotification(
          'group_accepted',
          `Your request to join "${group.name}" was approved by ${currentUser.name}! 🎉`,
          currentUser.id,
          `/messages?group=${groupId}`
        );
      }
    } else {
      showToast('error', 'Error', res.error);
    }
  };

  const handleDeclineRequest = (requestId) => {
    const res = declineJoinRequest(requestId);
    if (res.success) {
      showToast('info', 'Request Declined', 'Join request was declined.');
    } else {
      showToast('error', 'Error', res.error);
    }
  };

  const handleLeave = () => {
    const result = leaveGroup(groupId);
    if (!result.success) {
      showToast('error', 'Cannot Leave', result.error);
    } else {
      showToast('info', 'Left Group', `You have left "${group?.name}".`);
      setShowInfo(false);
      if (onBack) onBack();
    }
  };

  const handleMakeAdmin = (userId) => {
    const user = getUserById(userId);
    makeAdmin(groupId, userId);
    showToast('success', 'Admin Promoted', `${user?.name || 'User'} is now an admin.`);
  };

  const handleRemoveMember = (userId) => {
    const user = getUserById(userId);
    removeMember(groupId, userId);
    showToast('success', 'Member Removed', `${user?.name || 'User'} has been removed from the group.`);
  };

  const handleRename = (name) => {
    renameGroup(groupId, name);
    showToast('success', 'Group Renamed', `Group renamed to "${name}".`);
  };

  if (!group) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Group not found.
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)', position: 'relative', overflow: 'hidden' }}>
      {/* ── Group Header ──────────────────────────────────── */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'var(--surface-elevated)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
          {onBack && (
            <button className="btn btn-ghost btn-sm" onClick={onBack} style={{ padding: '4px 6px', flexShrink: 0 }}>
              <ArrowLeft size={18} />
            </button>
          )}
          <img
            src={group.avatar}
            alt={group.name}
            style={{ width: 40, height: 40, borderRadius: 12, objectFit: 'cover', flexShrink: 0, cursor: 'pointer' }}
            onClick={() => setShowInfo(true)}
            onError={e => { e.target.src = DEFAULT_USER_PHOTO; }}
          />
          <div
            style={{ minWidth: 0, cursor: 'pointer' }}
            onClick={() => setShowInfo(true)}
          >
            <div style={{ fontWeight: 800, fontSize: 14.5, display: 'flex', alignItems: 'center', gap: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {group.name}
              {isAdmin && (
                <span className="badge-premium" style={{ fontSize: 10, padding: '2px 7px', borderRadius: 6, fontWeight: 700, flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <i className="fa-solid fa-crown" style={{ color: '#eab308', fontSize: '9px' }}></i> Admin
                </span>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
              <MemberAvatarStack
                memberIds={group.members || []}
                getUserById={getUserById}
                limit={4}
                onClick={() => setShowInfo(true)}
              />
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                {group.members?.length || 1} members
              </span>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          {/* Admin Pending Requests Quick Review Button */}
          {isAdmin && pendingRequests.length > 0 && (
            <button
              className="btn btn-sm btn-premium-gold"
              onClick={() => setShowRequestsModal(true)}
              style={{
                gap: 6,
                fontSize: 12,
                fontWeight: 700,
                padding: '4px 12px',
                height: 32,
                display: 'inline-flex',
                alignItems: 'center'
              }}
              title="Review pending join requests"
            >
              <i className="fa-solid fa-user-check"></i>
              <span>{pendingRequests.length} Req{pendingRequests.length > 1 ? 's' : ''}</span>
            </button>
          )}

          {isMember && (
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => setShowInvite(true)}
              title="Invite Members"
              style={{ padding: '6px 10px', fontSize: 14 }}
            >
              <i className="fa-solid fa-user-plus" style={{ color: 'var(--primary)' }}></i>
            </button>
          )}

          <button
            className="btn btn-ghost btn-sm"
            onClick={() => setShowInfo(p => !p)}
            title="Group Info"
            style={{ padding: '6px 10px', fontSize: 14 }}
          >
            <i className="fa-solid fa-circle-info" style={{ color: 'var(--text-secondary)' }}></i>
          </button>
        </div>
      </div>

      {/* ── Admin Join Requests Alert Banner ───────────────── */}
      {isAdmin && pendingRequests.length > 0 && (
        <div style={{
          background: 'linear-gradient(90deg, rgba(234, 179, 8, 0.14), rgba(99, 102, 241, 0.10))',
          borderBottom: '1px solid rgba(234, 179, 8, 0.28)',
          padding: '8px 16px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 12,
          flexShrink: 0,
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12.5, color: 'var(--text-primary)' }}>
            <span style={{ fontSize: 15 }}>🛡️</span>
            <span>
              <strong>{pendingRequests.length} user{pendingRequests.length > 1 ? 's' : ''}</strong> requested permission to join this group.
            </span>
          </div>
          <button
            className="btn btn-sm btn-primary"
            onClick={() => setShowRequestsModal(true)}
            style={{ fontSize: 11.5, padding: '3px 12px', height: 28, gap: 4 }}
          >
            <UserCheck size={13} /> Review Requests
          </button>
        </div>
      )}

      {/* ── Messages Stream ───────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {messages.length === 0 ? (
          <div style={{ textAlign: 'center', margin: 'auto', color: 'var(--text-muted)' }}>
            <Users size={32} style={{ opacity: 0.4, marginBottom: 10 }} />
            <div style={{ fontSize: 14, fontWeight: 600 }}>No messages yet</div>
            <p style={{ fontSize: 12, marginTop: 4 }}>Be the first to start the conversation!</p>
          </div>
        ) : (
          messages.map(m => {
            const isMe = m.senderId === currentUser?.id;
            const isSystem = m.isSystem || m.senderId === 0;

            if (isSystem) {
              return (
                <div
                  key={m.id}
                  style={{
                    alignSelf: 'center',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    borderRadius: 20,
                    padding: '4px 14px',
                    fontSize: 11.5,
                    color: 'var(--text-secondary)',
                    margin: '6px 0',
                    textAlign: 'center'
                  }}
                >
                  {m.message}
                </div>
              );
            }

            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  flexDirection: isMe ? 'row-reverse' : 'row',
                  alignItems: 'flex-end',
                  gap: 8
                }}
              >
                {!isMe && (
                  <img
                    src={m.senderImage || DEFAULT_USER_PHOTO}
                    alt={m.senderName}
                    style={{ width: 30, height: 30, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }}
                    onError={e => { e.target.src = DEFAULT_USER_PHOTO; }}
                  />
                )}
                <div style={{ maxWidth: '72%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                  {!isMe && (
                    <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-secondary)', marginBottom: 3, paddingLeft: 4 }}>
                      {m.senderName}
                    </div>
                  )}
                  <div style={{
                    padding: '9px 13px',
                    borderRadius: isMe ? '16px 16px 2px 16px' : '16px 16px 16px 2px',
                    background: isMe ? 'var(--primary)' : 'var(--surface-elevated)',
                    color: isMe ? '#fff' : 'var(--text-primary)',
                    border: isMe ? 'none' : '1px solid var(--border)',
                    fontSize: 13.5,
                    lineHeight: 1.45,
                    wordBreak: 'break-word'
                  }}>
                    {m.image && (
                      <img
                        src={m.image}
                        alt="Shared"
                        style={{ width: '100%', maxWidth: 220, borderRadius: 8, marginBottom: m.message ? 6 : 0, display: 'block' }}
                      />
                    )}
                    {m.message}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: 'var(--text-muted)',
                    marginTop: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '0 4px'
                  }}>
                    {formatChatTime(m.timestamp)}
                    <GroupMessageStatus
                      message={m}
                      groupMembers={group.members}
                      isMe={isMe}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ── Input Bar or Admin Permission Required Banner ──── */}
      {isMember ? (
        <form
          onSubmit={handleSend}
          style={{
            padding: '10px 14px',
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: 8,
            background: 'var(--surface-elevated)',
            flexShrink: 0
          }}
        >
          <input
            ref={inputRef}
            type="text"
            className="input"
            placeholder={`Message ${group.name}...`}
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            style={{ flex: 1, height: 42, background: 'var(--surface)' }}
          />
          <button
            type="submit"
            className="btn btn-premium"
            disabled={!inputMessage.trim()}
            style={{ height: 42, padding: '0 18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <i className="fa-solid fa-paper-plane" style={{ fontSize: 14 }}></i>
          </button>
        </form>
      ) : (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid var(--border)',
          background: 'var(--surface-elevated)',
          flexShrink: 0
        }}>
          {userPendingRequest ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              background: 'rgba(234, 179, 8, 0.08)',
              border: '1px solid rgba(234, 179, 8, 0.28)',
              borderRadius: 14,
              padding: '12px 16px',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(234, 179, 8, 0.18)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#eab308',
                  flexShrink: 0
                }}>
                  <i className="fa-solid fa-hourglass-half fa-spin-pulse" style={{ fontSize: 16 }}></i>
                </div>
                <div>
                  <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: 6 }}>
                    Permission Request Pending
                    <span style={{ fontSize: 10, background: 'rgba(234,179,8,0.2)', color: '#eab308', padding: '1px 6px', borderRadius: 4 }}>
                      Waiting for Admin
                    </span>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    Your request has been delivered to the group admin. Once they accept it, you can chat freely.
                  </div>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-sm"
                onClick={handleCancelRequest}
                style={{ fontSize: 12, color: 'var(--text-muted)' }}
              >
                Cancel Request
              </button>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 14,
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  background: 'rgba(99, 102, 241, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary)',
                  flexShrink: 0
                }}>
                  <i className="fa-solid fa-shield-halved" style={{ fontSize: 18 }}></i>
                </div>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--text-primary)' }}>
                    Admin Permission Required
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>
                    To join this group and send messages, you must request permission from the group admin.
                  </div>
                </div>
              </div>
              <button
                className="btn btn-premium btn-sm"
                onClick={() => setShowRequestModal(true)}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', height: 36 }}
              >
                <i className="fa-solid fa-user-check"></i> Request to Join
              </button>
            </div>
          )}
        </div>
      )}

      {/* ── Group Info Slide-over Panel ───────────────────── */}
      {showInfo && (
        <GroupInfoPanel
          group={group}
          members={memberUsers}
          currentUser={currentUser}
          pendingRequests={pendingRequests}
          onClose={() => setShowInfo(false)}
          onRename={handleRename}
          onMakeAdmin={handleMakeAdmin}
          onRemoveMember={handleRemoveMember}
          onLeave={handleLeave}
          onAcceptRequest={handleAcceptRequest}
          onDeclineRequest={handleDeclineRequest}
        />
      )}

      {/* ── Invite Panel ──────────────────────────────────── */}
      {showInvite && (
        <InvitePanel
          group={group}
          users={users}
          invitations={groupInvitations}
          onInvite={handleInvite}
          onUninvite={handleUninvite}
          onClose={() => setShowInvite(false)}
        />
      )}

      {/* ── Admin Join Requests Modal ──────────────────────── */}
      {showRequestsModal && (
        <JoinRequestsModal
          group={group}
          requests={pendingRequests}
          onAccept={handleAcceptRequest}
          onDecline={handleDeclineRequest}
          onClose={() => setShowRequestsModal(false)}
        />
      )}

      {/* ── User Request Permission Modal ──────────────────── */}
      {showRequestModal && (
        <RequestPermissionModal
          group={group}
          onSendRequest={handleSendRequestToAdmin}
          onClose={() => setShowRequestModal(false)}
        />
      )}
    </div>
  );
};

export default GroupChatWindow;
