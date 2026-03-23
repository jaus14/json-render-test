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

    // Charts section
    "matrix-section": {
      type: "Stack",
      props: { direction: "vertical", gap: "md", align: "stretch" },
      children: ["charts-title", "charts-desc", "charts-row"],
    },
    "charts-title": {
      type: "Heading",
      props: { level: "h3", text: "四半期売上レポート" },
      children: [],
    },
    "charts-desc": {
      type: "Text",
      props: { text: "地域別・四半期別の売上データ（万円）", variant: "muted" },
      children: [],
    },
    "charts-row": {
      type: "Grid",
      props: { columns: 2, gap: "md" },
      children: ["line-chart-sales", "pie-chart-region"],
    },
    "line-chart-sales": {
      type: "LineChart",
      props: {
        xLabels: ["Q1", "Q2", "Q3", "Q4"],
        series: [
          { name: "東京", values: [1250, 1380, 1420, 1510] },
          { name: "大阪", values: [890, 920, 980, 1050] },
          { name: "名古屋", values: [650, 700, 680, 720] },
          { name: "福岡", values: [420, 450, 480, 510] },
          { name: "札幌", values: [310, 280, 320, 350] },
        ],
        caption: "地域別 四半期売上推移",
        xAxisLabel: "四半期",
        yAxisLabel: "売上（万円）",
      },
      children: [],
    },
    "pie-chart-region": {
      type: "PieChart",
      props: {
        labels: ["東京", "大阪", "名古屋", "福岡", "札幌"],
        values: [5560, 3840, 2750, 1860, 1260],
        caption: "地域別 年間売上構成（万円）",
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
