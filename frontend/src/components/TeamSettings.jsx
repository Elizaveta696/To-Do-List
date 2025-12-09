import React, { useEffect, useId, useState } from "react";
import {
  addUserToTeam,
  changeUserRole,
  deleteTeam,
  editTeam,
  fetchAllUsers,
  fetchTeamMembers,
  removeTeamMember,
} from "../api/teams";

export default function TeamSettings({
  teamId = "(unknown)",
  teamName = "My tasks",
  onChangeName,
  onNavigate,
}) {
  const [name, setName] = useState(teamName);
  const [password, setPassword] = useState("");

  const [users, setUsers] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [teamCode, setTeamCode] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [removeConfirm, setRemoveConfirm] = useState(null);
  const [newUserRole, setNewUserRole] = useState("member");
  const [selectedUserToAdd, setSelectedUserToAdd] = useState("");
  const [currentUserRole, setCurrentUserRole] = useState(null);
  const [forbiddenMessage, setForbiddenMessage] = useState(null);

  function updateRole(id, newRole) {
    if (currentUserRole !== "owner") {
      setForbiddenMessage("Only owner can do this action");
      return;
    }
    setUsers((u) =>
      u.map((usr) => (usr.userId === id ? { ...usr, role: newRole } : usr)),
    );
    changeUserRole(teamId, id, newRole).catch((e) => {
      console.error(e);
      alert("Failed to change role");
    });
  }

  function removeUser(id) {
    if (currentUserRole !== "owner") {
      setForbiddenMessage("Only owner can do this action");
      return;
    }

    // prevent removing yourself from the team via settings UI
    if (String(id) === String(currentUserId)) {
      setForbiddenMessage("You cannot remove yourself from the team here");
      return;
    }
    // call backend to remove
    removeTeamMember(teamId, id)
      .then(() => {
        setUsers((u) => u.filter((usr) => usr.userId !== id));
        // also remove from the allUsers list so the removed user
        // does not immediately reappear in the "add user" select
        setAllUsers((a) => a.filter((au) => au.userId !== id));
        // inform other parts of the app (header) to refresh team list
        try {
          window.dispatchEvent(new CustomEvent("teams:changed"));
        } catch (_e) {
          // ignore if dispatch not available
        }
      })
      .catch((e) => {
        console.error(e);
        alert("Failed to remove user");
      });
  }

  function handleSave() {
    if (currentUserRole !== "owner") {
      setForbiddenMessage("Only owner can do this action");
      return;
    }
    // call API to save team name/password
    editTeam(teamId, { name, password })
      .then(() => {
        if (onChangeName) onChangeName(name);
        setPassword("");
        // inform other parts of the app (header) to refresh team list
        try {
          window.dispatchEvent(new CustomEvent("teams:changed"));
        } catch (_) {
          // ignore if dispatch not available
        }
        alert("Settings saved");
      })
      .catch((e) => {
        console.error(e);
        alert("Failed to save settings");
      });
  }

  function handleDeleteConfirmed() {
    if (currentUserRole !== "owner") {
      setForbiddenMessage("Only owner can do this action");
      return;
    }
    deleteTeam(teamId)
      .then(() => {
        setConfirmOpen(false);
        alert("Team deleted");
        // navigate back to personal board
        if (onNavigate) onNavigate("tasks");
        // inform other parts of the app (header) to refresh team list
        try {
          window.dispatchEvent(new CustomEvent("teams:changed"));
        } catch (_) {
          // ignore if dispatch not available
        }
      })
      .catch((e) => {
        console.error(e);
        alert("Failed to delete team");
      });
  }

  function handleCancel() {
    // revert to the initial values
    setName(teamName);
    setPassword("");
    // reload members from server
    fetchTeamMembers(teamId)
      .then(({ users: members }) => setUsers(members))
      .catch((e) => console.error(e));
  }

  function addUser() {
    // add existing user from allUsers via add button
    if (!selectedUserToAdd) return;
    const userId = Number(selectedUserToAdd);
    if (currentUserRole !== "owner") {
      setForbiddenMessage("Only owner can do this action");
      return;
    }
    addUserToTeam(teamId, userId, newUserRole)
      .then(() => {
        const user = allUsers.find((u) => u.userId === userId);
        setUsers((u) => [
          ...u,
          { userId: user.userId, username: user.username, role: newUserRole },
        ]);
        setSelectedUserToAdd("");
        setNewUserRole("member");
      })
      .catch((e) => {
        console.error(e);
        alert("Failed to add user");
      });
  }

  const idName = useId();
  const idPassword = useId();
  const idJoin = useId();

  useEffect(() => {
    if (!teamId || String(teamId).startsWith("(")) return;
    // load team members and all users
    fetchTeamMembers(teamId)
      .then(({ users: members, team }) => {
        setUsers(members);
        // determine current user's id + role
        if (team?.teamCode) setTeamCode(team.teamCode);
        // determine current user's role
        try {
          const token = localStorage.getItem("token");
          if (token) {
            const payload = JSON.parse(
              atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
            );
            const uid = payload?.userId ?? null;
            setCurrentUserId(uid ?? null);
            const membership = (members || []).find(
              (m) => Number(m.userId) === Number(uid),
            );
            setCurrentUserRole(membership?.role ?? null);
          }
        } catch (_e) {
          setCurrentUserRole(null);
        }
      })
      .catch((e) => console.error(e));
    fetchAllUsers()
      .then((list) => setAllUsers(list))
      .catch((e) => console.error(e));
  }, [teamId]);

  useEffect(() => {
    if (!forbiddenMessage) return;
    const t = setTimeout(() => setForbiddenMessage(null), 4000);
    return () => clearTimeout(t);
  }, [forbiddenMessage]);

  return (
    <section className="settings-panel">
      {forbiddenMessage && (
        <div style={{ color: "#b00020", marginBottom: 12 }}>
          {forbiddenMessage}
        </div>
      )}
      <h2>Team Settings</h2>{" "}
      {currentUserRole && currentUserRole !== "owner" && (
        <div style={{ color: "#b00020", marginBottom: 8 }}>
          Only owner can perform administrative actions in this panel.
        </div>
      )}
      <div className="settings-row">
        <label htmlFor={idJoin}>Join code</label>
        <div className="settings-value">
          <input
            id={idJoin}
            type="text"
            value={teamCode || "(hidden)"}
            readOnly
          />
        </div>
      </div>
      <div className="settings-row">
        <label htmlFor={idName}>Change team name</label>
        <div className="settings-value">
          <input
            id={idName}
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
      </div>
      <div className="settings-row">
        <label htmlFor={idPassword}>Change password</label>
        <div className="settings-value">
          <input
            id={idPassword}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
      </div>
      <div className="settings-row">
        <div className="danger-label">Delete team</div>
        <div className="settings-value">
          <button
            className="btn btn-danger"
            type="button"
            onClick={() => setConfirmOpen(true)}
          >
            Delete team
          </button>
        </div>
      </div>
      <div className="settings-users">
        <h3>Team members</h3>
        <div className="users-grid">
          <div className="users-grid-head">User</div>
          <div className="users-grid-head">Role</div>
          {users.map((u) => (
            <React.Fragment key={u.userId}>
              <div className="users-grid-user">{u.username}</div>
              <div className="users-grid-role">
                <div className="role-with-actions">
                  <select
                    value={u.role}
                    onChange={(e) => updateRole(u.userId, e.target.value)}
                  >
                    <option value="owner">Owner</option>
                    <option value="member">Member</option>
                  </select>
                  {String(u.userId) !== String(currentUserId) && (
                    <button
                      type="button"
                      className="btn-icon remove-user-btn"
                      onClick={() =>
                        setRemoveConfirm({ id: u.userId, name: u.username })
                      }
                      aria-label={`Remove ${u.username}`}
                      title={`Remove ${u.username}`}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <title>{`Remove ${u.name}`}</title>
                        <path
                          d="M3 6h18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M10 11v6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M14 11v6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            </React.Fragment>
          ))}

          {removeConfirm && (
            <section className="modal-overlay">
              <div className="join-modal" role="dialog" aria-modal="true">
                <h3>Remove user</h3>
                <div className="modal-body">
                  <p>
                    Are you sure you want to remove{" "}
                    <strong>{removeConfirm.name}</strong> from the team?
                  </p>
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn"
                    onClick={() => setRemoveConfirm(null)}
                  >
                    No
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={() => {
                      removeUser(removeConfirm.id);
                      setRemoveConfirm(null);
                    }}
                  >
                    Yes
                  </button>
                </div>
              </div>
            </section>
          )}

          {/* Add-user row: input under User, select + Add button under Role */}
          <React.Fragment>
            <div className="users-grid-user">
              <select
                className="add-user-select"
                value={selectedUserToAdd}
                onChange={(e) => setSelectedUserToAdd(e.target.value)}
              >
                <option value="">Select user to add</option>
                {allUsers
                  .filter((au) => !users.find((m) => m.userId === au.userId))
                  .map((au) => (
                    <option key={au.userId} value={au.userId}>
                      {au.username} (id: {au.userId})
                    </option>
                  ))}
              </select>
            </div>
            <div className="users-grid-role">
              <div className="add-user-actions">
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="owner">Owner</option>
                </select>
                <button
                  type="button"
                  className="btn"
                  onClick={addUser}
                  disabled={!selectedUserToAdd}
                >
                  Add user
                </button>
              </div>
            </div>
          </React.Fragment>
        </div>
      </div>
      <div className="settings-actions">
        <button className="btn" type="button" onClick={handleCancel}>
          Cancel changes
        </button>
        <button className="btn btn-primary" type="button" onClick={handleSave}>
          Save changes
        </button>
      </div>
      {confirmOpen && (
        <section className="modal-overlay">
          <div className="join-modal" role="dialog" aria-modal="true">
            <h3>Delete team</h3>
            <div className="modal-body">
              <p>Are you sure you want to delete this team?</p>
            </div>
            <div className="modal-actions">
              <button
                type="button"
                className="btn"
                onClick={() => setConfirmOpen(false)}
              >
                No
              </button>
              <button
                type="button"
                className="btn btn-danger"
                onClick={handleDeleteConfirmed}
              >
                Yes
              </button>
            </div>
          </div>
        </section>
      )}
    </section>
  );
}
