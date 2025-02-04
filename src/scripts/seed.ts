// src/scripts/seed.ts
import { db } from "../config/db";
import { authors } from "../models/schema";

async function seedAuthors() {
  const existing = await db.select().from(authors);
  if (existing.length > 0) {
    console.log("Authors テーブルには既にデータが存在します。");
    return;
  }

  await db.insert(authors).values({
    name: "松尾芭蕉",
    biography: "江戸時代の俳人",
    links: "https://ja.wikipedia.org/wiki/松尾芭蕉",
    imageUrl: "https://example.com/images/ba_sho.jpg",
  });

  console.log("Authors テーブルに初期データを投入しました。");
}

seedAuthors().catch((err) => {
  console.error("Seed エラー:", err);
});
