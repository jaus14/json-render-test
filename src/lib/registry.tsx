import { defineRegistry } from "@json-render/react";
import { shadcnComponents } from "@json-render/shadcn";
import { catalog } from "./catalog";
import { v4 as uuidv4 } from "uuid";
import { CustomTable } from "../components/CustomTable";

type UserRecord = Record<string, unknown>;
type State = Record<string, unknown>;

function filterUsers(users: UserRecord[], query: string): UserRecord[] {
  if (!query) return users;
  const q = query.toLowerCase();
  return users.filter(
    (u) =>
      (u.name as string).toLowerCase().includes(q) ||
      (u.email as string).toLowerCase().includes(q)
  );
}

function usersToRows(users: UserRecord[]): string[][] {
  return users.map((u) => [
    u.name as string,
    u.email as string,
    u.role as string,
    u.status as string,
    u.createdAt as string,
  ]);
}

function usersToRowIds(users: UserRecord[]): string[] {
  return users.map((u) => u.id as string);
}

function syncUsers(prev: State, newUsers: UserRecord[]): State {
  const query = (prev["searchQuery"] as string) || "";
  const filtered = filterUsers(newUsers, query);
  return {
    ...prev,
    users: newUsers,
    filteredUsers: filtered,
    userRows: usersToRows(filtered),
    userRowIds: usersToRowIds(filtered),
  };
}

export { usersToRows, usersToRowIds };

export const { registry, handlers } = defineRegistry(catalog, {
  components: {
    Card: shadcnComponents.Card,
    Stack: shadcnComponents.Stack,
    Grid: shadcnComponents.Grid,
    Separator: shadcnComponents.Separator,
    Tabs: shadcnComponents.Tabs,
    Dialog: shadcnComponents.Dialog,
    Table: CustomTable,
    Heading: shadcnComponents.Heading,
    Text: shadcnComponents.Text,
    Badge: shadcnComponents.Badge,
    Alert: shadcnComponents.Alert,
    Avatar: shadcnComponents.Avatar,
    Input: shadcnComponents.Input,
    Select: shadcnComponents.Select,
    Checkbox: shadcnComponents.Checkbox,
    Button: shadcnComponents.Button,
    DropdownMenu: shadcnComponents.DropdownMenu,
  },
  actions: {
    addUser: async (params, setState, state) => {
      if (!params) return;
      const users = (state["users"] as UserRecord[]) || [];
      const newUser = {
        id: uuidv4(),
        name: params.name,
        email: params.email,
        role: params.role,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
      };
      const newUsers = [...users, newUser];
      setState((prev) => syncUsers(prev, newUsers));
    },
    deleteUser: async (params, setState, state) => {
      if (!params) return;
      const users = (state["users"] as UserRecord[]) || [];
      const newUsers = users.filter((u) => u.id !== params.userId);
      setState((prev) => syncUsers(prev, newUsers));
    },
    deleteSelectedUsers: async (_params, setState, state) => {
      const users = (state["users"] as UserRecord[]) || [];
      const selected = (state["selectedIds"] as string[]) || [];
      const selectedSet = new Set(selected);
      const newUsers = users.filter((u) => !selectedSet.has(u.id as string));
      setState((prev) => ({
        ...syncUsers(prev, newUsers),
        selectedIds: [],
        selectedCount: 0,
      }));
    },
    editUser: async (params, setState, state) => {
      if (!params) return;
      const users = (state["users"] as UserRecord[]) || [];
      const user = users.find((u) => u.id === params.userId);
      if (user) {
        setState((prev) => ({
          ...prev,
          editingUser: user,
          showEditDialog: true,
        }));
      }
    },
    saveUser: async (params, setState, state) => {
      if (!params) return;
      const users = (state["users"] as UserRecord[]) || [];
      const newUsers = users.map((u) =>
        u.id === params.userId
          ? { ...u, name: params.name, email: params.email, role: params.role }
          : u
      );
      setState((prev) => ({
        ...syncUsers(prev, newUsers),
        showEditDialog: false,
        editingUser: null,
      }));
    },
    toggleSelect: async (params, setState, state) => {
      if (!params) return;
      const selected = (state["selectedIds"] as string[]) || [];
      const isSelected = selected.includes(params.userId);
      const newSelected = isSelected
        ? selected.filter((id: string) => id !== params.userId)
        : [...selected, params.userId];
      setState((prev) => ({
        ...prev,
        selectedIds: newSelected,
        selectedCount: newSelected.length,
      }));
    },
    toggleSelectAll: async (_params, setState, state) => {
      const users = (state["users"] as UserRecord[]) || [];
      const selected = (state["selectedIds"] as string[]) || [];
      const allSelected = selected.length === users.length;
      const newSelected = allSelected
        ? []
        : users.map((u) => u.id as string);
      setState((prev) => ({
        ...prev,
        selectedIds: newSelected,
        selectedCount: newSelected.length,
      }));
    },
    searchUsers: async (params, setState, state) => {
      if (!params) return;
      const users = (state["users"] as UserRecord[]) || [];
      const query = params.query || "";
      const filtered = filterUsers(users, query);
      setState((prev) => ({
        ...prev,
        searchQuery: query,
        filteredUsers: filtered,
        userRows: usersToRows(filtered),
        userRowIds: usersToRowIds(filtered),
      }));
    },
  },
});
