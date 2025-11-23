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
# 必要な環境変数
# export FRONTEND_ORIGIN=http://localhost:3001
# export COOKIE_DOMAIN=localhost  # 本番では実際のドメインを指定
# export AWS_S3_BUCKET=your-bucket-name
# export AWS_REGION=ap-northeast-1
# export AWS_ACCESS_KEY_ID=xxxxxxxx
# export AWS_SECRET_ACCESS_KEY=xxxxxxxx
# export AWS_CLOUDFRONT_URL=https://cdn.example.com   # 任意（CloudFrontを利用する場合）
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

### 4. 動画の管理（S3アップロード）

- 管理画面（`http://localhost:3001/admin`）から動画ファイル（mp4 等）とサムネイル画像をアップロードします
- フロントエンド → Rails → AWS S3 の順で **プリサインドURL** を発行し、ブラウザから直接 S3 に PUT します
- アップロード後に得られた S3/CloudFront の URL を `Video` レコードの `video_url / thumbnail_url` として保存します
- 一般ユーザーは S3/CloudFront 上のファイルを参照して動画を閲覧します

## 認証とセッション管理

- 管理者ログイン成功時に、JWTが **HttpOnlyクッキー** としてブラウザに保存されます
- クッキーはフロントエンドから参照できないため、XSS耐性が向上します
- アプリ起動時に `GET /api/auth/me` を呼び出してログイン状態を復元します
- ログアウト時はクッキーを削除してセッションを破棄します
- CORSは `FRONTEND_ORIGIN` 環境変数（デフォルト: `http://localhost:3001`）で許可元を制御し、`credentials: true` でクッキー送信を許可しています

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
- GET /api/auth/me

### 動画
- GET /api/videos (一覧取得)
- GET /api/videos/:id (詳細取得)
- POST /api/videos (作成 - 管理者のみ)
- PATCH /api/videos/:id (更新 - 管理者のみ)
- DELETE /api/videos/:id (削除 - 管理者のみ)

### アップロード
- POST /api/uploads/presign (S3のプリサインドURLを発行 - 管理者のみ)

## 注意事項

- AWS IAM のキーは **必ず .env や資格情報ストア** に安全に保存してください
- `AWS_CLOUDFRONT_URL` を設定すると、返却されるファイルURLが CloudFront ドメインになります（未設定の場合は S3 の公開URL）
- S3 バケットポリシーで `s3:PutObject` と `s3:GetObject` を許可する必要があります
- CORS設定を適切に行ってください（`FRONTEND_ORIGIN` で制御）

