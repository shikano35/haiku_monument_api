# Stage 1: 依存関係のインストール
FROM oven/bun:1.2.2-alpine as builder

# 必要なパッケージをインストール
RUN apk add --no-cache python3 make g++ \
  && ln -sf python3 /usr/bin/python

WORKDIR /app

# package.jsonとlockファイルを先にコピー（キャッシュ利用）
COPY package.json bun.lockb ./

# 依存関係のインストール
RUN bun install --frozen-lockfile

# Stage 2: 本番/開発用イメージの作成
FROM oven/bun:1.2.2-alpine

RUN apk add --no-cache python3 make g++ \
  && ln -sf python3 /usr/bin/python

WORKDIR /app

# builder から node_modules と lockfile をコピー
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/bun.lockb ./bun.lockb

# アプリ全体をコピー
COPY . .

# SQLite 用のディレクトリ作成
RUN mkdir -p data

EXPOSE 3000

CMD ["bun", "run", "src/index.ts"]
