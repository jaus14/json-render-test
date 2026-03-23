import { defineRegistry } from "@json-render/react";
import { shadcnComponents } from "@json-render/shadcn";
import { catalog } from "./catalog";
import { v4 as uuidv4 } from "uuid";
import { CustomTable } from "../components/CustomTable";
import { LineChartComponent } from "../components/LineChartComponent";
import { PieChartComponent } from "../components/PieChartComponent";

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

const ROLE_LABELS = ["admin", "editor", "viewer"];

function computeChartData(users: UserRecord[]) {
  // Pie chart: role distribution
  const roleCounts = new Map<string, number>();
  for (const u of users) {
    const role = u.role as string;
    roleCounts.set(role, (roleCounts.get(role) ?? 0) + 1);
  }
  const pieLabels = ROLE_LABELS.filter((r) => roleCounts.has(r));
  const pieValues = pieLabels.map((r) => roleCounts.get(r) ?? 0);

  // Line chart: cumulative user count per month, per role
  const sorted = [...users].sort(
    (a, b) => (a.createdAt as string).localeCompare(b.createdAt as string)
  );
  const monthSet = new Set<string>();
  for (const u of sorted) {
    monthSet.add((u.createdAt as string).slice(0, 7)); // "YYYY-MM"
  }
  const months = [...monthSet].sort();
  const xLabels = months.map((m) => {
    const [, mm] = m.split("-");
    return `${parseInt(mm)}月`;
  });

  const series = ROLE_LABELS
    .filter((role) => users.some((u) => u.role === role))
    .map((role) => {
      let cumulative = 0;
      const values = months.map((month) => {
        cumulative += sorted.filter(
          (u) => u.role === role && (u.createdAt as string).startsWith(month)
        ).length;
        return cumulative;
      });
      return { name: role, values };
    });

  return { pieLabels, pieValues, lineXLabels: xLabels, lineSeries: series };
}

function syncUsers(prev: State, newUsers: UserRecord[]): State {
  const query = (prev["searchQuery"] as string) || "";
  const filtered = filterUsers(newUsers, query);
  const chart = computeChartData(newUsers);
  return {
    ...prev,
    users: newUsers,
    filteredUsers: filtered,
    userRows: usersToRows(filtered),
    userRowIds: usersToRowIds(filtered),
    pieLabels: chart.pieLabels,
    pieValues: chart.pieValues,
    lineXLabels: chart.lineXLabels,
    lineSeries: chart.lineSeries,
  };
}

export { usersToRows, usersToRowIds, computeChartData };

export const { registry, handlers } = defineRegistry(catalog, {
  components: {
    Card: shadcnComponents.Card,
    Stack: shadcnComponents.Stack,
    Grid: shadcnComponents.Grid,
    Separator: shadcnComponents.Separator,
    Tabs: shadcnComponents.Tabs,
    Dialog: shadcnComponents.Dialog,
    Table: CustomTable,
    LineChart: LineChartComponent,
    PieChart: PieChartComponent,
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
