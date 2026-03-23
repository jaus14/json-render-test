import { defineCatalog } from "@json-render/core";
import { schema } from "@json-render/react/schema";
import { shadcnComponentDefinitions } from "@json-render/shadcn/catalog";
import { z } from "zod";

export const catalog = defineCatalog(schema, {
  components: {
    // Layout
    Card: shadcnComponentDefinitions.Card,
    Stack: shadcnComponentDefinitions.Stack,
    Grid: shadcnComponentDefinitions.Grid,
    Separator: shadcnComponentDefinitions.Separator,
    Tabs: shadcnComponentDefinitions.Tabs,
    Dialog: shadcnComponentDefinitions.Dialog,

    // Data Display
    Table: {
      props: z.object({
        columns: z.array(z.string()),
        rows: z.array(z.array(z.string())),
        caption: z.string().nullable(),
        rowIds: z.array(z.string()).nullable(),
        selectedIds: z.array(z.string()).nullable(),
      }),
      description:
        'Data table with optional row checkboxes. columns: header labels. rows: 2D string array. rowIds: optional array of IDs per row (enables checkboxes). selectedIds: state-bound array of selected IDs.',
      example: {
        columns: ["Name", "Role"],
        rows: [["Alice", "Admin"], ["Bob", "User"]],
      },
    },
    MatrixTable: {
      props: z.object({
        columnHeaders: z.array(z.string()),
        rowHeaders: z.array(z.string()),
        rows: z.array(z.array(z.string())),
        caption: z.string().nullable(),
        cornerLabel: z.string().nullable(),
      }),
      description:
        'Cross-tabulation table with both X-axis (column) and Y-axis (row) headers. cornerLabel: label for the top-left cell. columnHeaders: X-axis labels. rowHeaders: Y-axis labels. rows: 2D data array.',
      example: {
        cornerLabel: "Region / Q",
        columnHeaders: ["Q1", "Q2", "Q3", "Q4"],
        rowHeaders: ["East", "West"],
        rows: [["100", "120", "130", "110"], ["90", "95", "100", "105"]],
      },
    },
    PieChart: {
      props: z.object({
        labels: z.array(z.string()),
        values: z.array(z.number()),
        caption: z.string().nullable(),
      }),
      description:
        'Donut-style pie chart. labels: slice names. values: numeric values per slice. caption: optional description text.',
      example: {
        labels: ["Desktop", "Mobile", "Tablet"],
        values: [60, 30, 10],
        caption: "Device breakdown",
      },
    },
    Heading: shadcnComponentDefinitions.Heading,
    Text: shadcnComponentDefinitions.Text,
    Badge: shadcnComponentDefinitions.Badge,
    Alert: shadcnComponentDefinitions.Alert,
    Avatar: shadcnComponentDefinitions.Avatar,

    // Form
    Input: shadcnComponentDefinitions.Input,
    Select: shadcnComponentDefinitions.Select,
    Checkbox: shadcnComponentDefinitions.Checkbox,

    // Actions
    Button: shadcnComponentDefinitions.Button,
    DropdownMenu: shadcnComponentDefinitions.DropdownMenu,
  },
  actions: {
    addUser: {
      description: "Add a new user",
      params: z.object({
        name: z.string(),
        email: z.string(),
        role: z.string(),
      }),
    },
    deleteUser: {
      description: "Delete a user by ID",
      params: z.object({
        userId: z.string(),
      }),
    },
    deleteSelectedUsers: {
      description: "Delete all currently selected users",
    },
    editUser: {
      description: "Open edit dialog for a user",
      params: z.object({
        userId: z.string(),
      }),
    },
    saveUser: {
      description: "Save edited user data",
      params: z.object({
        userId: z.string(),
        name: z.string(),
        email: z.string(),
        role: z.string(),
      }),
    },
    toggleSelect: {
      description: "Toggle selection of a user",
      params: z.object({
        userId: z.string(),
      }),
    },
    toggleSelectAll: {
      description: "Toggle selection of all users",
    },
    searchUsers: {
      description: "Filter users by search query",
      params: z.object({
        query: z.string(),
      }),
    },
  },
});

export type Catalog = typeof catalog;
