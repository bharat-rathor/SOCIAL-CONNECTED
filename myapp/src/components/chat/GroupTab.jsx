import React, { useState } from 'react';
import { Users, Plus, Shield, Check, X, Search, Sparkles } from 'lucide-react';
import { useGroup } from '../../context/GroupContext';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import Modal from '../common/Modal';

const CATEGORIES = ['Technology', 'Creative', 'Adventure', 'Music', 'Study', 'Fitness', 'General'];

const GroupTab = ({ activeGroupId, onSelectGroup }) => {
  const {
    groups,
    createGroup,
    groupInvitations,
    respondToInvitation,
    joinGroup,
    getGroupUnreadCount,
    getGroupMessages,
    getGroupJoinRequests,
    getUserJoinRequest
  } = useGroup();
  const { currentUser } = useAuth();
  const { showToast } = useNotification();

  const [searchQuery, setSearchQuery] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [newGroupDesc, setNewGroupDesc] = useState('');
  const [newGroupCategory, setNewGroupCategory] = useState('Technology');

  const pendingInvitations = (groupInvitations || []).filter(
    inv => inv.inviteeId === currentUser?.id && inv.status === 'pending'
  );

  const filteredGroups = (groups || []).filter(g =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.category && g.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (!newGroupName.trim()) {
      showToast('error', 'Group Name Required', 'Please provide a name for your group.');
      return;
    }
    const created = createGroup({
      name: newGroupName,
      description: newGroupDesc,
      category: newGroupCategory
    });
    if (created) {
      showToast('success', 'Group Created!', `"${created.name}" is now active and saved permanently.`);
      setNewGroupName('');
      setNewGroupDesc('');
      setShowCreateModal(false);
      onSelectGroup(created.id);
    }
  };

  const handleAcceptInvite = (inv) => {
    respondToInvitation(inv.id, true);
    showToast('success', 'Joined Group', `You have joined ${inv.groupName}!`);
  };

  const handleDeclineInvite = (inv) => {
    respondToInvitation(inv.id, false);
    showToast('info', 'Invitation Declined', `Declined invite for ${inv.groupName}.`);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--surface)' }}>
      {/* Top Search & Create Bar */}
      <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--border)', display: 'flex', gap: 8 }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <i className="fa-solid fa-magnifying-glass" style={{ position: 'absolute', left: 11, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '13px' }}></i>
          <input
            type="text"
            className="input"
            placeholder="Search groups..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: 32, fontSize: '13px', height: 36, width: '100%' }}
          />
        </div>
        <button
          className="btn btn-premium btn-sm"
          onClick={() => setShowCreateModal(true)}
          style={{ height: 36, padding: '0 14px', fontSize: '12px', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 6 }}
          title="Create New Group"
        >
          <i className="fa-solid fa-plus"></i> New
        </button>
      </div>

      {/* Pending Invitations Section */}
      {pendingInvitations.length > 0 && (
        <div style={{ padding: '10px 14px', background: 'rgba(234, 179, 8, 0.08)', borderBottom: '1px solid rgba(234, 179, 8, 0.2)' }}>
          <div style={{ fontSize: '11px', fontWeight: 800, color: '#eab308', textTransform: 'uppercase', marginBottom: 6, letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: 6 }}>
            <i className="fa-solid fa-envelope-open-text fa-bounce"></i> Pending Invitations ({pendingInvitations.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {pendingInvitations.map(inv => (
              <div key={inv.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'var(--surface)', padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)' }}>
                <span style={{ fontSize: '12px', fontWeight: 600 }}>{inv.groupName}</span>
                <div style={{ display: 'flex', gap: 4 }}>
                  <button className="btn btn-sm btn-premium" onClick={() => handleAcceptInvite(inv)} style={{ padding: '2px 10px', height: 26, fontSize: '11px', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <i className="fa-solid fa-check"></i> Join
                  </button>
                  <button className="btn btn-sm btn-ghost" onClick={() => handleDeclineInvite(inv)} style={{ padding: '2px 8px', height: 26, fontSize: '11px', color: 'var(--text-muted)' }}>
                    <i className="fa-solid fa-xmark"></i>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Groups List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
        {filteredGroups.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-muted)' }}>
            <i className="fa-solid fa-users" style={{ fontSize: '32px', marginBottom: 12, opacity: 0.5, display: 'block' }}></i>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>No groups found</div>
            <p style={{ fontSize: '12px', margin: '6px 0 14px' }}>Create your own group to start discussing with fellow members!</p>
            <button className="btn btn-premium btn-sm" onClick={() => setShowCreateModal(true)} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <i className="fa-solid fa-plus"></i> Create a Group
            </button>
          </div>
        ) : (
          filteredGroups.map(group => {
            const isMember = group.members && group.members.includes(currentUser?.id);
            const isAdmin = (group.admins || []).includes(currentUser?.id) || group.adminId === currentUser?.id;
            const isSelected = activeGroupId === group.id;
            const unread = isMember ? (getGroupUnreadCount ? getGroupUnreadCount(group.id) : 0) : 0;
            const lastMsg = isMember && getGroupMessages ? getGroupMessages(group.id).slice(-1)[0] : null;
            const pendingReqsCount = isAdmin && getGroupJoinRequests ? getGroupJoinRequests(group.id).length : 0;
            const myJoinReq = !isMember && getUserJoinRequest ? getUserJoinRequest(group.id) : null;

            return (
              <div
                key={group.id}
                onClick={() => onSelectGroup(group.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '10px 12px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  marginBottom: 6,
                  border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                  background: isSelected ? 'rgba(99, 102, 241, 0.12)' : 'var(--surface-elevated)',
                  transition: 'all 0.15s'
                }}
              >
                <img
                  src={group.avatar}
                  alt={group.name}
                  style={{ width: 44, height: 44, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: '13.5px', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {group.name}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
                      {isAdmin ? (
                        <span className="badge-premium" style={{ fontSize: '10px', padding: '2px 7px', borderRadius: 6, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <i className="fa-solid fa-crown" style={{ color: '#eab308', fontSize: '9px' }}></i> Admin
                        </span>
                      ) : isMember ? (
                        <span style={{ fontSize: '10px', background: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary)', padding: '2px 7px', borderRadius: 6, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <i className="fa-solid fa-users" style={{ fontSize: '9px' }}></i> Member
                        </span>
                      ) : myJoinReq ? (
                        <span style={{ fontSize: '10px', background: 'rgba(234, 179, 8, 0.18)', color: '#eab308', padding: '2px 7px', borderRadius: 6, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <i className="fa-solid fa-hourglass-half" style={{ fontSize: '9px' }}></i> Pending
                        </span>
                      ) : (
                        <span style={{ fontSize: '10px', background: 'var(--surface)', color: 'var(--text-muted)', border: '1px solid var(--border)', padding: '2px 7px', borderRadius: 6, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                          <i className="fa-solid fa-lock" style={{ fontSize: '9px' }}></i> Request
                        </span>
                      )}

                      {pendingReqsCount > 0 && (
                        <span style={{
                          background: '#eab308',
                          color: '#000',
                          fontSize: 10,
                          fontWeight: 800,
                          borderRadius: 999,
                          padding: '1px 6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 2
                        }} title={`${pendingReqsCount} pending join request(s)`}>
                          {pendingReqsCount} req
                        </span>
                      )}

                      {unread > 0 && (
                        <span style={{
                          background: 'var(--primary)',
                          color: '#fff',
                          fontSize: 10,
                          fontWeight: 800,
                          borderRadius: 999,
                          padding: '2px 6px',
                          minWidth: 18,
                          textAlign: 'center'
                        }}>
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </div>
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 2 }}>
                    {lastMsg
                      ? `${lastMsg.senderName || 'Member'}: ${lastMsg.message || '📷 Photo'}`
                      : group.description || `${group.category} discussion`}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, fontSize: '11px', color: 'var(--text-secondary)' }}>
                    <span>{group.members?.length || 1} members</span>
                    <span>•</span>
                    <span style={{ color: 'var(--primary)', fontWeight: 600 }}>{group.category}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Create Group Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Group"
        subtitle="Group data will persist permanently in browser storage"
      >
        <form onSubmit={handleCreateGroup}>
          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>
              Group Name *
            </label>
            <input
              type="text"
              className="input"
              required
              placeholder="e.g. AI & Web Developers Club"
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: 14 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>
              Category
            </label>
            <select
              className="input"
              value={newGroupCategory}
              onChange={(e) => setNewGroupCategory(e.target.value)}
              style={{ width: '100%', background: 'var(--surface-elevated)' }}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 700, marginBottom: 6, color: 'var(--text-secondary)' }}>
              Description
            </label>
            <textarea
              className="input"
              rows={3}
              placeholder="What is this group about?"
              value={newGroupDesc}
              onChange={(e) => setNewGroupDesc(e.target.value)}
              style={{ width: '100%', resize: 'none' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowCreateModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-premium btn-sm" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <i className="fa-solid fa-plus"></i> Create Group
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default GroupTab;
