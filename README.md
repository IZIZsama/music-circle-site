# バンド練習時間割・予約管理システム

学内バンドサークル向けの練習予約管理Webシステムです。  
月間カレンダーで予約を確認し、練習量を個人・バンド単位のスコアで可視化できます。

## 機能概要

- **認証**: 学籍番号 + パスワード、パスワード忘れ時はメールで認証コード送信
- **予約**: 月間カレンダー表示、日別一覧、30分刻みで予約（802前方は重複不可）
- **バンド**: 複数所属可、予約時にバンド選択可能（個人練習も可）
- **スコア**: 30分=1pt、今月・過去30日・累計、個人TOP3/全件（管理者）、バンドランキング
- **管理者**: バンド作成・削除、ユーザー退会（単体・学籍番号上2桁一括）、管理者付与

## 技術構成

- **フロント**: React 18 + TypeScript + Vite + Tailwind CSS
- **バックエンド**: Node.js + Express
- **DB**: SQLite（Prisma）

## セットアップ

### 必要環境

- Node.js 18+
- npm

### 手順

1. リポジトリのルートで依存関係をインストール

```bash
npm install
cd server && npm install && cd ..
cd client && npm install && cd ..
```

2. サーバーで Prisma と DB 初期化

`server/.env` を用意し、次の1行を追加すると Prisma コマンドが使えます（未設定でもサーバー起動時は自動で DB パスを解決します）。

```env
DATABASE_URL=file:./prisma/dev.db
```

その後、**server フォルダで** 次を実行します。

```bash
cd server
npx prisma generate
npx prisma db push
npm run db:seed
```

3. 環境変数（任意）

`server/.env` に上記のほか、必要に応じて設定します。

```env
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
SESSION_SECRET=任意の秘密鍵
# パスワード再設定メール用（未設定時はメールは送られず、認証コードがターミナルに表示されます）
# Gmailで送る場合: 二段階認証を有効 → アプリパスワードを発行 → 下記の your-app-password を置き換え
# SMTP_URL=smtp://koiuzmi3751@gmail.com:your-app-password@smtp.gmail.com:587
# MAIL_FROM=koiuzmi3751@gmail.com
```

4. 開発サーバー起動

ルートで:

```bash
npm run dev
```

- フロント: http://localhost:5173  
- API: http://localhost:3001  

### 初回ログイン（シード後）

- 学籍番号: `00admin`  
- パスワード: `password`  
（管理者としてログインできます）

## 受け入れ条件の対応

- **802前方**: 重複予約は作成・更新時にサーバーでチェックし、重複時はエラー
- **メンバー**: 自分の未来の予約のみ編集・削除可能
- **アドミン**: 予約日が属する月の翌月末 23:59:59 まで編集・削除可能
- **ランキング**: メンバーは TOP3 のみ、アドミンは全件表示

## ライセンス

MIT
