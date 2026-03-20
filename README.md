# json-render ユーザー管理サンプル

[json-render](https://github.com/vercel-labs/json-render) (Vercel) を使ったユーザー管理UIのサンプルプロジェクトです。

## 特徴

- **json-render + shadcn/ui**: UIがJSON仕様（spec）で定義され、`@json-render/shadcn` のコンポーネントでレンダリングされます
- **AIチャットでUI生成**: サイドバーのチャットでUIの変更を指示すると、新しいspecが生成されてUIが変わります
- **レイアウト保存**: 気に入ったUIレイアウトをlocalStorageに保存・復元できます
- **ユーザー管理機能**: 一覧表示、追加、編集、削除、一括選択、検索

## セットアップ

```bash
npm install
npm run dev
```

## AI機能の使い方

### プリセットモード（APIキー不要）
サイドバーのチャットで以下のキーワードを入力すると、プリセットのUIに切り替わります：
- 「カード」「グリッド」: カードレイアウト
- 「コンパクト」「シンプル」: コンパクトビュー
- 「ダッシュボード」: ダッシュボード風レイアウト

### AI生成モード（APIキー必要）
チャットの⚙ボタンからAnthropic APIキーを設定すると、AIが自由にUI specを生成します。

## 技術スタック

- React + TypeScript + Vite
- `@json-render/core` + `@json-render/react` + `@json-render/shadcn`
- Anthropic Claude API（オプション）

## プロジェクト構成

```
src/
├── lib/
│   ├── catalog.ts      # json-render カタログ定義（利用可能なコンポーネント・アクション）
│   ├── registry.tsx     # コンポーネント・アクションの実装をカタログに紐付け
│   ├── defaultSpec.ts   # デフォルトのUI spec
│   ├── mockAi.ts        # プリセットモード用のモックAI
│   ├── promptBuilder.ts # AI用のシステムプロンプト生成
│   ├── sampleUsers.ts   # サンプルユーザーデータ
│   └── specStorage.ts   # localStorage 保存・読み込み
├── components/
│   ├── UserManager.tsx   # メインのユーザー管理画面
│   └── ChatPanel.tsx     # AIチャットサイドバー
├── App.tsx
├── App.css
└── main.tsx
```
