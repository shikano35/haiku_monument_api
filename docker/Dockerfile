# docker/Dockerfile
# ※公式の Bun イメージが公開されている場合を想定しています。
FROM oven/bun:1.2.2

# 作業ディレクトリを設定
WORKDIR /app

# 依存ファイルのみを先にコピーし、依存関係をインストール
COPY package.json bun.lockb ./
RUN bun install

# アプリケーション全体をコピー
COPY . .

# 起動用シェルスクリプトに実行権限を付与
RUN chmod +x docker/run.sh

# コンテナ内で利用するポート（development.ts では 3000 を使用）
EXPOSE 3000

# コンテナ起動時にシェルスクリプトを実行
CMD ["sh", "docker/run.sh"]
