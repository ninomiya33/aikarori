# 🍳 AI献立アシスタント

冷蔵庫の食材を写真で撮影して、AIが献立を提案するWebアプリケーションです。

## ✨ 機能

- 📸 **画像アップロード**: 冷蔵庫や食材の写真をアップロード
- 🔍 **食材認識**: Google Cloud Vision APIで食材を自動検出
- 🤖 **献立提案**: OpenAI GPT-4で美味しいレシピを生成
- 🔥 **カロリー計算**: 料理のカロリーも自動計算
- 🎬 **YouTube動画**: 提案献立に関連する料理動画を表示
- 📱 **レスポンシブデザイン**: iPhoneでも使いやすいUI

## 🚀 デモ

APIキーを設定しなくても、デモモードで動作します！

```bash
npm run dev
```

## 🛠️ セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定

`.env.local`ファイルを作成し、以下の環境変数を設定してください：

```env
# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# Google Cloud Vision API
GOOGLE_CLOUD_PROJECT_ID=your_project_id_here
GOOGLE_CLOUD_PRIVATE_KEY=your_private_key_here
GOOGLE_CLOUD_CLIENT_EMAIL=your_client_email_here

# YouTube Data API
YOUTUBE_API_KEY=your_youtube_api_key_here
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

http://localhost:3000 でアプリケーションにアクセスできます。

## 🔧 API設定

### OpenAI API

1. [OpenAI](https://platform.openai.com/)でアカウントを作成
2. APIキーを取得
3. `.env.local`に設定

### Google Cloud Vision API

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. Vision APIを有効化
3. サービスアカウントキーを作成
4. `.env.local`に設定

### YouTube Data API

1. [Google Cloud Console](https://console.cloud.google.com/)でプロジェクトを作成
2. YouTube Data API v3を有効化
3. APIキーを作成
4. `.env.local`に設定

## 📱 使い方

1. **画像アップロード**: 冷蔵庫や食材の写真をドラッグ&ドロップ
2. **食材分析**: 「食材を分析する」ボタンをクリック
3. **献立提案**: 「献立を提案する」ボタンをクリック
4. **レシピ確認**: 料理名、材料、手順、カロリーを確認
5. **動画視聴**: 関連するYouTube料理動画をクリックして視聴

## 🎨 デザイン

- iOSネイティブアプリ風のデザイン
- 丸みを帯びたカードUI
- グラデーション背景
- タッチフレンドリーなボタン

## 🛡️ エラーハンドリング

- APIキーが設定されていない場合でもデモモードで動作
- 画像分析に失敗した場合でもサンプルデータを表示
- レシピ生成に失敗した場合でもデモレシピを表示

## 📦 技術スタック

- **フロントエンド**: Next.js 14, React, TypeScript
- **スタイリング**: Tailwind CSS
- **画像処理**: Google Cloud Vision API
- **AI**: OpenAI GPT-4
- **動画検索**: YouTube Data API
- **ファイルアップロード**: react-dropzone

## 🔄 開発フロー

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# 本番サーバー起動
npm start
```

## 📝 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します！
