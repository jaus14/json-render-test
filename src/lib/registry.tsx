import { defineRegistry } from "@json-render/react";
import { shadcnComponents } from "@json-render/shadcn";
import { catalog } from "./catalog";
import { v4 as uuidv4 } from "uuid";

export const { registry, handlers } = defineRegistry(catalog, {
  components: {
    Card: shadcnComponents.Card,
    Stack: shadcnComponents.Stack,
    Grid: shadcnComponents.Grid,
    Separator: shadcnComponents.Separator,
    Tabs: shadcnComponents.Tabs,
    Dialog: shadcnComponents.Dialog,
    Table: shadcnComponents.Table,
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
      const users = (state["/users"] as Array<Record<string, unknown>>) || [];
      const newUser = {
        id: uuidv4(),
        name: params.name,
        email: params.email,
        role: params.role,
        status: "active",
        createdAt: new Date().toISOString().split("T")[0],
      };
      setState((prev) => ({ ...prev, "/users": [...users, newUser] }));
    },
    deleteUser: async (params, setState, state) => {
      if (!params) return;
      const users = (state["/users"] as Array<Record<string, unknown>>) || [];
      setState((prev) => ({
        ...prev,
        "/users": users.filter(
          (u: Record<string, unknown>) => u.id !== params.userId
        ),
      }));
    },
    deleteSelectedUsers: async (_params, setState, state) => {
      const users = (state["/users"] as Array<Record<string, unknown>>) || [];
      const selected = (state["/selectedIds"] as string[]) || [];
      const selectedSet = new Set(selected);
      setState((prev) => ({
        ...prev,
        "/users": users.filter(
          (u: Record<string, unknown>) => !selectedSet.has(u.id as string)
        ),
        "/selectedIds": [],
      }));
    },
    editUser: async (params, setState, state) => {
      if (!params) return;
      const users = (state["/users"] as Array<Record<string, unknown>>) || [];
      const user = users.find(
        (u: Record<string, unknown>) => u.id === params.userId
      );
      if (user) {
        setState((prev) => ({
          ...prev,
          "/editingUser": user,
          "/showEditDialog": true,
        }));
      }
    },
    saveUser: async (params, setState, state) => {
      if (!params) return;
      const users = (state["/users"] as Array<Record<string, unknown>>) || [];
      setState((prev) => ({
        ...prev,
        "/users": users.map((u: Record<string, unknown>) =>
          u.id === params.userId
            ? { ...u, name: params.name, email: params.email, role: params.role }
            : u
        ),
        "/showEditDialog": false,
        "/editingUser": null,
      }));
    },
    toggleSelect: async (params, setState, state) => {
      if (!params) return;
      const selected = (state["/selectedIds"] as string[]) || [];
      const isSelected = selected.includes(params.userId);
      setState((prev) => ({
        ...prev,
        "/selectedIds": isSelected
          ? selected.filter((id: string) => id !== params.userId)
          : [...selected, params.userId],
      }));
    },
    toggleSelectAll: async (_params, setState, state) => {
      const users = (state["/users"] as Array<Record<string, unknown>>) || [];
      const selected = (state["/selectedIds"] as string[]) || [];
      const allSelected = selected.length === users.length;
      setState((prev) => ({
        ...prev,
        "/selectedIds": allSelected
          ? []
          : users.map((u: Record<string, unknown>) => u.id as string),
      }));
    },
    searchUsers: async (params, setState) => {
      if (!params) return;
      setState((prev) => ({ ...prev, "/searchQuery": params.query }));
    },
  },
});
