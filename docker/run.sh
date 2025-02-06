#!/bin/sh
set -e

echo ">> シードスクリプトを実行して初期データを投入中..."
bun run src/scripts/seed.ts

echo ">> API サーバーを起動します..."
bun run src/index.ts
