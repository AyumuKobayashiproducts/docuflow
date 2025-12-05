# コントリビューションガイド

DocuFlow への貢献に興味を持っていただきありがとうございます！🎉

## 🚀 開発環境のセットアップ

### 前提条件

- Node.js 22.x 以上
- npm 10.x 以上
- Supabase アカウント
- OpenAI API キー

### ローカル環境の構築

1. リポジトリをフォーク & クローン

```bash
git clone https://github.com/YOUR_USERNAME/dooai.git
cd dooai
```

2. 依存関係をインストール

```bash
npm install
```

3. 環境変数を設定

```bash
cp .env.example .env.local
# .env.local を編集して必要な値を設定
```

4. 開発サーバーを起動

```bash
npm run dev
```

## 📝 コーディング規約

### コードスタイル

- **TypeScript**: 型安全性を重視し、`any` の使用は最小限に
- **ESLint**: `npm run lint` でエラーがないことを確認
- **Prettier**: コードフォーマットは Prettier に従う

### コミットメッセージ

[Conventional Commits](https://www.conventionalcommits.org/) に従ってください。

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type

- `feat`: 新機能
- `fix`: バグ修正
- `docs`: ドキュメントのみの変更
- `style`: コードの意味に影響しない変更（空白、フォーマットなど）
- `refactor`: バグ修正でも機能追加でもないコード変更
- `perf`: パフォーマンス改善
- `test`: テストの追加・修正
- `chore`: ビルドプロセスやツールの変更

#### 例

```
feat(auth): パスワードリセット機能を追加

- メール送信機能を実装
- リセットトークンの検証を追加
- UI を更新

closes #123
```

## 🔀 プルリクエストの流れ

1. **Issue を確認**: 作業前に関連 Issue があるか確認し、なければ作成
2. **ブランチを作成**: `feature/機能名` または `fix/バグ名` 形式で
3. **変更を実装**: 小さなコミットを心がける
4. **テストを実行**: `npm test` でテストがパスすることを確認
5. **PR を作成**: テンプレートに従って記載
6. **レビュー対応**: フィードバックに対応

### ブランチ命名規則

- `feature/` - 新機能
- `fix/` - バグ修正
- `docs/` - ドキュメント
- `refactor/` - リファクタリング
- `test/` - テスト追加

## 🧪 テスト

### テストの実行

```bash
# すべてのテストを実行
npm test

# ウォッチモードで実行
npm run test:watch

# カバレッジレポート付きで実行
npm run test:coverage
```

### テストの追加

新機能やバグ修正には、対応するテストを追加してください。

- ユニットテスト: `tests/` ディレクトリに追加
- テストファイル名: `*.test.ts` または `*.test.tsx`

## 📁 プロジェクト構成

```
dooai/
├── app/           # Next.js App Router ページ
├── components/    # 共有コンポーネント
├── lib/           # ユーティリティ、API クライアント
├── tests/         # テストファイル
├── types/         # TypeScript 型定義
└── docs/          # プロジェクトドキュメント
```

## ❓ 質問・サポート

- 質問は [Discussions](https://github.com/YOUR_USERNAME/dooai/discussions) へ
- バグ報告は [Issues](https://github.com/YOUR_USERNAME/dooai/issues) へ

ご協力ありがとうございます！🙏


