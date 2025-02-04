# Bun の公式イメージを使用（バージョン 1.2.2 を指定）
FROM oven/bun:1.2.2-alpine

# 作業ディレクトリの設定
WORKDIR /app

# package.json と bun.lockb を先にコピーして依存関係のインストールをキャッシュする
COPY package.json bun.lockb ./

# 依存関係のインストール
RUN bun install

# プロジェクト全体をコピー
COPY . .

# 必要に応じて SQLite のデータを格納するディレクトリを作成
RUN mkdir -p data

# コンテナ内で利用するポート（例: 3000）を公開
EXPOSE 3000

# コンテナ起動時のコマンド（Cloudflare Workers 環境ではwrangler やMiniflare経由のテストも可能ですが、今回は直接 Bun での起動例）
CMD ["bun", "run", "src/index.ts"]
