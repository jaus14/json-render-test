import { useState, useCallback, useMemo, useRef } from "react";
import { Renderer, JSONUIProvider } from "@json-render/react";
import type { Spec } from "@json-render/core";
import { registry } from "../lib/registry";
import { sampleUsers, type User } from "../lib/sampleUsers";
import { defaultSpec } from "../lib/defaultSpec";
import { saveSpec, loadSpec, clearSpec } from "../lib/specStorage";
import { ChatPanel } from "./ChatPanel";
import { v4 as uuidv4 } from "uuid";

export function UserManager() {
  const [currentSpec, setCurrentSpec] = useState<Spec>(
    () => loadSpec() || defaultSpec
  );
  const [users, setUsers] = useState<User[]>(sampleUsers);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [apiKey, setApiKey] = useState(() => localStorage.getItem("jr-api-key") || "");

  // Add user form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("viewer");

  // Edit user state
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editRole, setEditRole] = useState("");

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const specRevision = useRef(0);
  const handleSpecGenerated = useCallback((spec: Spec) => {
    specRevision.current += 1;
    setCurrentSpec(spec);
  }, []);

  const handleSaveSpec = useCallback(() => {
    saveSpec(currentSpec);
    alert("レイアウトを保存しました！");
  }, [currentSpec]);

  const handleResetSpec = useCallback(() => {
    clearSpec();
    setCurrentSpec(defaultSpec);
  }, []);

  const handleApiKeyChange = useCallback((key: string) => {
    setApiKey(key);
    localStorage.setItem("jr-api-key", key);
  }, []);

  const handleAddUser = useCallback(() => {
    if (!newName || !newEmail) return;
    const newUser: User = {
      id: uuidv4(),
      name: newName,
      email: newEmail,
      role: newRole as User["role"],
      status: "active",
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUsers((prev) => [...prev, newUser]);
    setNewName("");
    setNewEmail("");
    setNewRole("viewer");
    setShowAddForm(false);
  }, [newName, newEmail, newRole]);

  const handleDeleteUser = useCallback((userId: string) => {
    setUsers((prev) => prev.filter((u) => u.id !== userId));
    setSelectedIds((prev) => prev.filter((id) => id !== userId));
  }, []);

  const handleDeleteSelected = useCallback(() => {
    const set = new Set(selectedIds);
    setUsers((prev) => prev.filter((u) => !set.has(u.id)));
    setSelectedIds([]);
  }, [selectedIds]);

  const handleToggleSelect = useCallback((userId: string) => {
    setSelectedIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.length === filteredUsers.length
        ? []
        : filteredUsers.map((u) => u.id)
    );
  }, [filteredUsers]);

  const handleStartEdit = useCallback((user: User) => {
    setEditingUser(user);
    setEditName(user.name);
    setEditEmail(user.email);
    setEditRole(user.role);
  }, []);

  const handleSaveEdit = useCallback(() => {
    if (!editingUser) return;
    setUsers((prev) =>
      prev.map((u) =>
        u.id === editingUser.id
          ? { ...u, name: editName, email: editEmail, role: editRole as User["role"] }
          : u
      )
    );
    setEditingUser(null);
  }, [editingUser, editName, editEmail, editRole]);

  // Build state for json-render
  const stateModel = useMemo(
    () => ({
      "/users": users,
      "/filteredUsers": filteredUsers,
      "/selectedIds": selectedIds,
      "/searchQuery": searchQuery,
      "/newUserName": newName,
      "/newUserEmail": newEmail,
      "/newUserRole": newRole,
      "/editingUser": editingUser,
      "/showEditDialog": !!editingUser,
    }),
    [users, filteredUsers, selectedIds, searchQuery, newName, newEmail, newRole, editingUser]
  );

  // Action handlers that connect json-render actions to React state
  const actionHandlers = useMemo(
    () => ({
      addUser: async () => handleAddUser(),
      deleteUser: async (params: Record<string, unknown>) =>
        handleDeleteUser(params.userId as string),
      deleteSelectedUsers: async () => handleDeleteSelected(),
      editUser: async (params: Record<string, unknown>) => {
        const user = users.find((u) => u.id === params.userId);
        if (user) handleStartEdit(user);
      },
      saveUser: async (params: Record<string, unknown>) => {
        setUsers((prev) =>
          prev.map((u) =>
            u.id === params.userId
              ? {
                  ...u,
                  name: params.name as string,
                  email: params.email as string,
                  role: params.role as User["role"],
                }
              : u
          )
        );
        setEditingUser(null);
      },
      toggleSelect: async (params: Record<string, unknown>) =>
        handleToggleSelect(params.userId as string),
      toggleSelectAll: async () => handleToggleSelectAll(),
      searchUsers: async (params: Record<string, unknown>) =>
        setSearchQuery(params.query as string),
    }),
    [handleAddUser, handleDeleteUser, handleDeleteSelected, handleToggleSelect, handleToggleSelectAll, handleStartEdit, users]
  );

  const roleBadgeClass = (role: string) => {
    switch (role) {
      case "admin": return "badge-admin";
      case "editor": return "badge-editor";
      default: return "badge-viewer";
    }
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case "admin": return "管理者";
      case "editor": return "編集者";
      default: return "閲覧者";
    }
  };

  return (
    <div className="app-layout">
      <div className="main-content">
        <div className="spec-toolbar">
          <div className="spec-toolbar-left">
            <span className="spec-label">
              現在のレイアウト: <strong>{currentSpec === defaultSpec ? "デフォルト" : "カスタム"}</strong>
            </span>
          </div>
          <div className="spec-toolbar-right">
            <button className="btn btn-outline" onClick={handleResetSpec}>
              デフォルトに戻す
            </button>
            <button className="btn btn-primary" onClick={handleSaveSpec}>
              レイアウトを保存
            </button>
          </div>
        </div>

        {/* json-render rendered area */}
        <div className="rendered-ui">
          <JSONUIProvider
            key={specRevision.current}
            registry={registry}
            initialState={stateModel}
            handlers={actionHandlers}
          >
            <Renderer spec={currentSpec} registry={registry} />
          </JSONUIProvider>
        </div>

        {/* Native UI fallback - always functional regardless of spec */}
        <div className="native-ui">
          <div className="native-header">
            <h2>ユーザー管理</h2>
            <button className="btn btn-primary" onClick={() => setShowAddForm(!showAddForm)}>
              ＋ ユーザー追加
            </button>
          </div>

          {showAddForm && (
            <div className="add-form">
              <h3>新規ユーザー</h3>
              <div className="form-row">
                <input
                  placeholder="名前"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
                <input
                  placeholder="メールアドレス"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                />
                <select value={newRole} onChange={(e) => setNewRole(e.target.value)}>
                  <option value="viewer">閲覧者</option>
                  <option value="editor">編集者</option>
                  <option value="admin">管理者</option>
                </select>
                <button className="btn btn-primary" onClick={handleAddUser}>追加</button>
                <button className="btn btn-outline" onClick={() => setShowAddForm(false)}>キャンセル</button>
              </div>
            </div>
          )}

          <div className="toolbar">
            <input
              className="search-input"
              placeholder="名前またはメールで検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {selectedIds.length > 0 && (
              <button className="btn btn-danger" onClick={handleDeleteSelected}>
                選択を削除 ({selectedIds.length})
              </button>
            )}
          </div>

          <table className="user-table">
            <thead>
              <tr>
                <th className="th-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedIds.length === filteredUsers.length && filteredUsers.length > 0}
                    onChange={handleToggleSelectAll}
                  />
                </th>
                <th>名前</th>
                <th>メール</th>
                <th>ロール</th>
                <th>ステータス</th>
                <th>作成日</th>
                <th>操作</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.id} className={selectedIds.includes(user.id) ? "selected" : ""}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(user.id)}
                      onChange={() => handleToggleSelect(user.id)}
                    />
                  </td>
                  <td className="td-name">{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`badge ${roleBadgeClass(user.role)}`}>
                      {roleLabel(user.role)}
                    </span>
                  </td>
                  <td>
                    <span className={`status-dot ${user.status}`} />
                    {user.status === "active" ? "アクティブ" : "非アクティブ"}
                  </td>
                  <td>{user.createdAt}</td>
                  <td className="td-actions">
                    <button className="btn btn-sm btn-ghost" onClick={() => handleStartEdit(user)}>
                      編集
                    </button>
                    <button className="btn btn-sm btn-ghost-danger" onClick={() => handleDeleteUser(user.id)}>
                      削除
                    </button>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="empty-state">
                    ユーザーが見つかりません
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Edit modal */}
        {editingUser && (
          <div className="modal-overlay" onClick={() => setEditingUser(null)}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
              <h3>ユーザー編集</h3>
              <div className="form-stack">
                <label>
                  名前
                  <input value={editName} onChange={(e) => setEditName(e.target.value)} />
                </label>
                <label>
                  メールアドレス
                  <input value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
                </label>
                <label>
                  ロール
                  <select value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                    <option value="viewer">閲覧者</option>
                    <option value="editor">編集者</option>
                    <option value="admin">管理者</option>
                  </select>
                </label>
              </div>
              <div className="modal-actions">
                <button className="btn btn-outline" onClick={() => setEditingUser(null)}>
                  キャンセル
                </button>
                <button className="btn btn-primary" onClick={handleSaveEdit}>
                  保存
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Chat sidebar */}
      <ChatPanel
        currentSpec={currentSpec}
        onSpecGenerated={handleSpecGenerated}
        apiKey={apiKey}
        onApiKeyChange={handleApiKeyChange}
      />
    </div>
  );
}
