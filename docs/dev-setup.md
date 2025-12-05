## 🛠 Developer Setup - 開発環境セットアップ

DocuFlow をローカルで立ち上げるための手順を、**5〜10分で終わるレベル** まで具体的にまとめます。

---

## 1. 必要なもの

```text
Node.js   : 22.x 以上
npm       : 10.x 以上
Supabase  : 無料プロジェクト1つ
OpenAI    : APIキー（無料枠 or 有料プラン）
```

- 推奨 OS: macOS / Linux / WSL2
- エディタ: VS Code / Cursor

---

## 2. リポジトリの取得

```bash
git clone https://github.com/tanasho/dooai.git
cd dooai

# 依存関係のインストール
npm install
```

---

## 3. Supabase プロジェクトの準備

1. [Supabase](https://supabase.com/) にログインし、新規プロジェクトを作成
2. プロジェクトの **API 設定** から以下を取得:
   - `PROJECT_URL`（例: `https://xxx.supabase.co`）
   - `anon public key`
   - `service_role key`（任意、アカウント削除など管理系で使用）
3. プロジェクトの **Database** 画面から接続情報を確認（CI 用に使う場合は後述）

---

## 4. 環境変数の設定

### 4.1 `.env.example` から `.env.local` を作成

```bash
cp .env.example .env.local
```

`./.env.example` には、必要な環境変数がコメント付きで定義されています。  
最低限、以下を埋めてください:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `OPENAI_API_KEY`
- `NEXT_PUBLIC_SITE_URL`（例: `http://localhost:3000`）

Sentry / Resend などは **未設定でも動作** します（モニタリング系のみ無効）。

---

## 5. DB マイグレーションの適用（ローカル or 本番）

### 5.1 Supabase Dashboard から手動適用（シンプルな方法）

1. Supabase ダッシュボード → **SQL Editor**
2. `supabase/migrations/*.sql` を順番に開き、中身をコピペして **Run**
3. `Table editor` で以下のテーブルが存在することを確認:
   - `documents`, `document_versions`, `activity_logs`, `document_comments`
   - `organizations`, `organization_members`, `organization_invitations`
   - `notifications`

### 5.2 GitHub Actions から自動適用（運用フェーズ）

- `.github/workflows/supabase-migrations.yml` が用意されています。
- GitHub Secrets に以下を設定することで、`main` へのマージ時に自動適用されます:

```text
SUPABASE_DB_URL=postgres://postgres:YOUR_PASSWORD@YOUR_PROJECT.supabase.co:5432/postgres
```

---

## 6. 開発サーバーの起動

```bash
npm run dev
```

ブラウザで `http://localhost:3000` を開きます。

- `/` : ランディングページ
- `/auth/signup` : サインアップ
- `/auth/login` : ログイン
- `/app` : ダッシュボード（要ログイン）

---

## 7. テストの実行

### 7.1 ユニットテスト（Vitest）

```bash
npm test

# カバレッジレポート付き
npm run test:coverage
```

### 7.2 E2E テスト（Playwright）

```bash
# 初回のみブラウザをインストール
npx playwright install

# ヘッドレス実行
npm run test:e2e

# UI 付き（デバッグ用）
npm run test:e2e:ui
```

E2E テストではログイン状態やデモデータの有無に依存するケースがあるため、  

