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
      props: { direction: "vertical", gap: "lg", align: "stretch" },
      children: ["header", "toolbar", "user-table", "bottom-bar", "matrix-section"],
    },

    // Header
    header: {
      type: "Stack",
      props: { direction: "horizontal", justify: "between", align: "center" },
      children: ["title-section"],
    },
    "title-section": {
      type: "Stack",
      props: { direction: "vertical", gap: "sm" },
      children: ["page-title", "page-desc"],
    },
    "page-title": {
      type: "Heading",
      props: { level: "h2", text: "ユーザー管理" },
      children: [],
    },
    "page-desc": {
      type: "Text",
      props: { text: "ユーザーの追加・編集・削除を行います", variant: "muted" },
      children: [],
    },

    // Toolbar: search
    toolbar: {
      type: "Stack",
      props: { direction: "horizontal", gap: "md", align: "center" },
      children: ["search-input"],
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

    // User table
    "user-table": {
      type: "Table",
      props: {
        columns: ["名前", "メール", "ロール", "ステータス", "作成日"],
        rows: { $state: "/userRows" },
        rowIds: { $state: "/userRowIds" },
        selectedIds: { $state: "/selectedIds" },
      },
      children: [],
    },

    // Matrix table section
    "matrix-section": {
      type: "Stack",
      props: { direction: "vertical", gap: "md", align: "stretch" },
      children: ["matrix-title", "matrix-desc", "matrix-table"],
    },
    "matrix-title": {
      type: "Heading",
      props: { level: "h3", text: "四半期売上レポート" },
      children: [],
    },
    "matrix-desc": {
      type: "Text",
      props: { text: "地域別・四半期別の売上データ（万円）", variant: "muted" },
      children: [],
    },
    "matrix-table": {
      type: "MatrixTable",
      props: {
        cornerLabel: "地域 \\ 四半期",
        columnHeaders: ["Q1", "Q2", "Q3", "Q4"],
        rowHeaders: ["東京", "大阪", "名古屋", "福岡", "札幌"],
        rows: [
          ["1,250", "1,380", "1,420", "1,510"],
          ["890", "920", "980", "1,050"],
          ["650", "700", "680", "720"],
          ["420", "450", "480", "510"],
          ["310", "280", "320", "350"],
        ],
        caption: null,
      },
      children: [],
    },

    // Bottom action bar — only visible when at least 1 user is selected
    "bottom-bar": {
      type: "Card",
      props: {
        title: "",
        description: "",
      },
      children: ["bottom-bar-content"],
      visible: { $state: "/selectedCount", gt: 0 },
    },
    "bottom-bar-content": {
      type: "Stack",
      props: { direction: "horizontal", gap: "md", align: "center", justify: "between" },
      children: ["selected-count-text", "delete-selected-btn"],
    },
    "selected-count-text": {
      type: "Text",
      props: {
        text: { $template: "${/selectedCount} 件選択中" },
        variant: "default",
      },
      children: [],
    },
    "delete-selected-btn": {
      type: "Button",
      props: { label: "選択したユーザーを削除", variant: "destructive" },
      children: [],
      on: {
        press: {
          action: "deleteSelectedUsers",
          confirm: {
            title: "ユーザーの削除",
            message: "選択したユーザーを削除しますか？この操作は取り消せません。",
            confirmLabel: "削除する",
            cancelLabel: "キャンセル",
            variant: "danger",
          },
        },
      },
    },
  },
};
