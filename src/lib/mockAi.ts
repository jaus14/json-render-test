import type { Spec } from "@json-render/core";

/**
 * Mock AI responses for when no API key is configured.
 * Maps keywords to alternative spec presets.
 */
const presets: Record<string, Spec> = {
  card: {
    root: "page",
    elements: {
      page: {
        type: "Stack",
        props: { direction: "vertical", gap: "lg" },
        children: ["header", "toolbar", "user-table"],
      },
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
        props: { level: "h2", text: "ユーザー管理" },
        children: [],
      },
      "page-desc": {
        type: "Text",
        props: { text: "カードビューでユーザーを管理", variant: "muted" },
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
      toolbar: {
        type: "Stack",
        props: { direction: "horizontal", gap: "md", align: "center" },
        children: ["search-input", "bulk-delete-btn"],
      },
      "search-input": {
        type: "Input",
        props: {
          placeholder: "検索...",
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
        props: { label: "選択を削除", variant: "destructive", size: "sm" },
        children: [],
        on: { press: { action: "deleteSelectedUsers" } },
      },
      "user-table": {
        type: "Table",
        props: {
          columns: ["名前", "メール", "ロール", "ステータス", "作成日"],
          rows: { $state: "/userRows" },
        },
        children: [],
      },
    },
  },
  compact: {
    root: "page",
    elements: {
      page: {
        type: "Card",
        props: { title: "ユーザー管理", description: "コンパクトビュー" },
        children: ["inner"],
      },
      inner: {
        type: "Stack",
        props: { direction: "vertical", gap: "md" },
        children: ["toolbar", "user-table"],
      },
      toolbar: {
        type: "Stack",
        props: { direction: "horizontal", gap: "sm", align: "center", justify: "between" },
        children: ["search-input", "actions-row"],
      },
      "search-input": {
        type: "Input",
        props: {
          placeholder: "検索...",
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
      "actions-row": {
        type: "Stack",
        props: { direction: "horizontal", gap: "sm" },
        children: ["add-btn", "bulk-delete-btn"],
      },
      "add-btn": {
        type: "Button",
        props: { label: "追加", variant: "default", size: "sm" },
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
      "bulk-delete-btn": {
        type: "Button",
        props: { label: "削除", variant: "destructive", size: "sm" },
        children: [],
        on: { press: { action: "deleteSelectedUsers" } },
      },
      "user-table": {
        type: "Table",
        props: {
          columns: ["名前", "メール", "ロール", "ステータス"],
          rows: { $state: "/userRows" },
        },
        children: [],
      },
    },
  },
  dark: {
    root: "page",
    elements: {
      page: {
        type: "Stack",
        props: { direction: "vertical", gap: "lg" },
        children: ["alert-header", "toolbar", "user-table"],
      },
      "alert-header": {
        type: "Alert",
        props: { title: "ユーザー管理ダッシュボード", description: "システムユーザーの管理を行います。追加・編集・削除が可能です。" },
        children: [],
      },
      toolbar: {
        type: "Stack",
        props: { direction: "horizontal", gap: "md", align: "center", justify: "between" },
        children: ["search-input", "btn-group"],
      },
      "search-input": {
        type: "Input",
        props: {
          placeholder: "ユーザーを検索...",
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
      "btn-group": {
        type: "Stack",
        props: { direction: "horizontal", gap: "sm" },
        children: ["add-btn", "delete-btn"],
      },
      "add-btn": {
        type: "Button",
        props: { label: "新規ユーザー", variant: "default" },
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
      "delete-btn": {
        type: "Button",
        props: { label: "一括削除", variant: "destructive" },
        children: [],
        on: { press: { action: "deleteSelectedUsers" } },
      },
      "user-table": {
        type: "Table",
        props: {
          columns: ["ユーザー名", "メールアドレス", "権限", "状態", "登録日"],
          rows: { $state: "/userRows" },
        },
        children: [],
      },
    },
  },
};

/**
 * Mock AI: match user input to a preset or return default.
 */
export function generateMockResponse(userMessage: string): {
  message: string;
  spec: Spec | null;
} {
  const lower = userMessage.toLowerCase();

  if (lower.includes("カード") || lower.includes("card") || lower.includes("グリッド") || lower.includes("grid")) {
    return {
      message: "カードレイアウトに変更しました！ユーザーがグリッド表示されます。",
      spec: presets.card,
    };
  }

  if (lower.includes("コンパクト") || lower.includes("compact") || lower.includes("シンプル") || lower.includes("simple")) {
    return {
      message: "コンパクトなレイアウトに変更しました！カード内にすべてまとめています。",
      spec: presets.compact,
    };
  }

  if (lower.includes("ダッシュボード") || lower.includes("dashboard") || lower.includes("アラート") || lower.includes("alert")) {
    return {
      message: "ダッシュボード風のレイアウトに変更しました！ヘッダーにアラートを使用しています。",
      spec: presets.dark,
    };
  }

  return {
    message: `申し訳ありませんが、その要望に対応するプリセットがありません。以下のキーワードを試してください：
- 「カード」「グリッド」: カードレイアウト
- 「コンパクト」「シンプル」: コンパクトビュー
- 「ダッシュボード」「アラート」: ダッシュボード風

APIキーを設定すると、AIが自由にUIを生成できます。`,
    spec: null,
  };
}
