import type { Spec } from "@json-render/core";

/**
 * Default UI spec for the user management interface.
 * This is the initial layout that gets rendered when no custom spec is saved.
 * AI chat can generate alternative specs to change the look and feel.
 */
export const defaultSpec: Spec = {
  root: "page",
  elements: {
    // Page container
    page: {
      type: "Stack",
      props: { direction: "vertical", gap: "lg" },
      children: ["header", "toolbar", "user-table"],
    },

    // Header
    header: {
      type: "Stack",
      props: { direction: "horizontal", justify: "between", align: "center" },
      children: ["title-section", "add-btn"],
    },
    "title-section": {
      type: "Stack",
      props: { direction: "vertical", gap: "sm" },
      children: ["page-title", "page-desc"],
    },
    "page-title": {
      type: "Heading",
      props: { level: 2, text: "ユーザー管理" },
      children: [],
    },
    "page-desc": {
      type: "Text",
      props: { text: "ユーザーの追加・編集・削除を行います", variant: "muted" },
      children: [],
    },
    "add-btn": {
      type: "Button",
      props: { label: "＋ ユーザー追加", variant: "default" },
      children: [],
      on: {
        press: {
          action: "addUser",
          params: {
            name: { $state: "/newUserName" },
            email: { $state: "/newUserEmail" },
            role: { $state: "/newUserRole" },
          },
        },
      },
    },

    // Toolbar: search + bulk actions
    toolbar: {
      type: "Stack",
      props: { direction: "horizontal", gap: "md", align: "center" },
      children: ["search-input", "bulk-delete-btn"],
    },
    "search-input": {
      type: "Input",
      props: {
        placeholder: "名前またはメールで検索...",
        value: { $bindState: "/searchQuery" },
      },
      children: [],
      on: {
        change: {
          action: "searchUsers",
          params: { query: { $state: "/searchQuery" } },
        },
      },
    },
    "bulk-delete-btn": {
      type: "Button",
      props: { label: "選択を削除", variant: "destructive" },
      children: [],
      on: {
        press: { action: "deleteSelectedUsers" },
      },
    },

    // User table
    "user-table": {
      type: "Table",
      props: {
        columns: [
          { key: "select", header: "選択", width: "60px" },
          { key: "name", header: "名前" },
          { key: "email", header: "メール" },
          { key: "role", header: "ロール" },
          { key: "status", header: "ステータス" },
          { key: "createdAt", header: "作成日" },
          { key: "actions", header: "操作" },
        ],
        data: { $state: "/filteredUsers" },
      },
      children: [],
    },
  },
};
