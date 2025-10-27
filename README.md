# 動画紹介Webアプリケーション

管理者のみが動画を投稿でき、誰でも閲覧できる動画紹介Webアプリケーションです。

## 技術スタック

- **フロントエンド**: Next.js (TypeScript)
- **バックエンド**: Ruby on Rails (API mode)
- **データベース**: PostgreSQL

## プロジェクト構成

```
video_introduction_app/
├── backend/        # Rails API
├── frontend/       # Next.js アプリケーション
└── README.md
```

## 主な機能

### 管理者機能
- ログイン/ログアウト
- 動画の投稿
- 動画の編集
- 動画の削除

### 一般ユーザー機能
- 動画の閲覧
- 動画の検索

## セットアップ手順

### 前提条件

- Ruby 3.0以上
- Rails 7.2以上
- Node.js 18以上
- PostgreSQL
- npm

### バックエンド（Rails API）のセットアップ

```bash
cd backend
bundle install
rails db:create
rails db:migrate
rails db:seed  # 管理者アカウントの作成
rails server
```

バックエンドは `http://localhost:3000` で起動します。

**デフォルトの管理者アカウント**
- Email: admin@example.com
- Password: password123

### フロントエンド（Next.js）のセットアップ

```bash
cd frontend
npm install

# 環境変数ファイルを作成
# Windows: echo NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1 > .env.local
# macOS/Linux: echo "NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1" > .env.local

npm run dev
```

フロントエンドは `http://localhost:3001` で起動します（設定済み）。

**注意:** `.env.local`ファイルが作成されていない場合は、`frontend`ディレクトリに手動で作成し、以下の内容を記述してください：
```
NEXT_PUBLIC_API_URL=http://localhost:3000/api/v1
```

## 使用方法

### 1. バックエンドとフロントエンドの起動

**ターミナル1（バックエンド）:**
```bash
cd backend
rails server
```

**ターミナル2（フロントエンド）:**
```bash
cd frontend
npm run dev
```

### 2. アクセス

- フロントエンド: http://localhost:3001
- バックエンドAPI: http://localhost:3000

### 3. ログイン

1. 「管理者ログイン」ボタンをクリック
2. デフォルトの管理者アカウントでログイン
   - Email: `admin@example.com`
   - Password: `password123`

### 4. 動画の管理

- 管理画面（`http://localhost:3001/admin`）で動画の投稿・編集・削除が可能です
- 一般ユーザーは動画の閲覧のみが可能です

## データベース設計

### Users (管理者テーブル)
- id
- email
- password_digest (bcrypt)
- role (enum: admin)
- created_at
- updated_at

### Videos (動画テーブル)
- id
- title
- description
- video_url
- thumbnail_url
- user_id (references)
- created_at
- updated_at

## API エンドポイント

### 認証
- POST /api/auth/login
- POST /api/auth/logout

### 動画
- GET /api/videos (一覧取得)
- GET /api/videos/:id (詳細取得)
- POST /api/videos (作成 - 管理者のみ)
- PATCH /api/videos/:id (更新 - 管理者のみ)
- DELETE /api/videos/:id (削除 - 管理者のみ)

## 注意事項

- 動画ファイルは直接URLとして保存することを想定しています
- 実際のプロダクション環境では、動画ファイルのアップロード機能を実装することを推奨します
- CORS設定を適切に行ってください

