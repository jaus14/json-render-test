import type { Spec } from "@json-render/core";

// Hardcode the component/action names to avoid type-casting issues with the catalog object
const COMPONENT_NAMES = [
  "Card", "Stack", "Grid", "Separator", "Tabs", "Dialog",
  "Table", "Heading", "Text", "Badge", "Alert", "Avatar",
  "Input", "Select", "Checkbox", "Button", "DropdownMenu",
];

const ACTION_NAMES = [
  "addUser", "deleteUser", "deleteSelectedUsers", "editUser",
  "saveUser", "toggleSelect", "toggleSelectAll", "searchUsers",
];

/**
 * Build a system prompt that teaches the AI about the available
 * json-render catalog and the spec format it must output.
 */
export function buildSystemPrompt(currentSpec: Spec): string {
  const componentNames = COMPONENT_NAMES;
  const actionNames = ACTION_NAMES;

  return `あなたはjson-renderのUIスペック生成AIです。
ユーザーの要望に応じて、json-render形式のUIスペック(JSON)を生成してください。

## 利用可能なコンポーネント
${componentNames.join(", ")}

## 利用可能なアクション
${actionNames.join(", ")}

## スペックの形式
スペックは以下の形式のJSONです:
{
  "root": "ルート要素のID",
  "elements": {
    "要素ID": {
      "type": "コンポーネント名",
      "props": { ... },
      "children": ["子要素ID", ...],
      "on": {
        "イベント名": {
          "action": "アクション名",
          "params": { ... }
        }
      }
    }
  }
}

## 状態パス（$stateで参照可能）
- /users: ユーザー配列 [{id, name, email, role, status, createdAt}]
- /filteredUsers: フィルタ済みユーザー配列
- /userRows: テーブル表示用の2次元文字列配列（filteredUsersから自動生成）
- /selectedIds: 選択中のユーザーID配列
- /searchQuery: 検索クエリ文字列
- /newUserName, /newUserEmail, /newUserRole: 新規ユーザー入力値
- /editingUser: 編集中のユーザーオブジェクト
- /showEditDialog: 編集ダイアログ表示フラグ

## コンポーネントのprops例
- Card: { title, description, maxWidth("sm"|"md"|"lg"|"full"), centered }
- Stack: { direction("horizontal"|"vertical"), gap("sm"|"md"|"lg"|"none"), align("start"|"center"|"end"|"stretch"), justify("start"|"center"|"end"|"between"|"around") }
- Grid: { columns, gap("sm"|"md"|"lg") }
- Heading: { level("h1"|"h2"|"h3"|"h4"), text }
- Text: { text, variant("default"|"muted"|"destructive") }
- Button: { label, variant("default"|"secondary"|"destructive"|"outline"|"ghost"|"link"), size("default"|"sm"|"lg"|"icon"), disabled }
- Input: { placeholder, value, label, disabled }
- Select: { options: [{label, value}], value, placeholder, label }
- Checkbox: { label, checked }
- Badge: { text, variant("default"|"secondary"|"destructive"|"outline") }
- Table: { columns: ["列名1", "列名2", ...], rows: { $state: "/userRows" }, caption? }
- Dialog: { title, description, open }
- Alert: { title, description, variant("default"|"destructive") }
- Avatar: { src, fallback, size("sm"|"md"|"lg") }
- Separator: { orientation("horizontal"|"vertical") }
- Tabs: { tabs: [{label, value}], defaultValue }

## 動的な値
- { $state: "/path" } で状態を参照
- { $bindState: "/path" } で双方向バインディング
- on プロパティでイベントとアクションを結びつける

## 現在のスペック
\`\`\`json
${JSON.stringify(currentSpec, null, 2)}
\`\`\`

## ルール
1. 必ず有効なJSONのみを返してください。説明文は不要です。
2. コードブロックで囲まないでください。JSONのみを返してください。
3. 利用可能なコンポーネントとアクションのみを使用してください。
4. ユーザー管理の機能（一覧・追加・削除・編集・一括選択・検索）を維持してください。
5. レイアウトやスタイルを変更する場合は、機能を損なわないようにしてください。`;
}
