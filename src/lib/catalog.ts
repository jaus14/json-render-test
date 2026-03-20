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
    Table: shadcnComponentDefinitions.Table,
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
