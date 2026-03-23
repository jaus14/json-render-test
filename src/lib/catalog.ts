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
    LineChart: {
      props: z.object({
        xLabels: z.array(z.string()),
        series: z.array(
          z.object({ name: z.string(), values: z.array(z.number()) })
        ),
        caption: z.string().nullable(),
        xAxisLabel: z.string().nullable(),
        yAxisLabel: z.string().nullable(),
      }),
      description:
        'Line chart with X/Y axes. xLabels: X-axis tick labels. series: array of {name, values[]} for each line. xAxisLabel/yAxisLabel: axis titles.',
      example: {
        xLabels: ["Jan", "Feb", "Mar"],
        series: [{ name: "Sales", values: [100, 150, 130] }],
        caption: "Monthly sales",
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
