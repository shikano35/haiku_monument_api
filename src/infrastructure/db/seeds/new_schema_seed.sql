-- 既存データ削除
DELETE FROM inscription_poems;
DELETE FROM poem_attributions;
DELETE FROM monument_locations;
DELETE FROM measurements;
DELETE FROM media;
DELETE FROM events;
DELETE FROM inscriptions;
DELETE FROM poems;
DELETE FROM monuments;
DELETE FROM locations;
DELETE FROM poets;
DELETE FROM sources;

-- IDリセット
DELETE FROM sqlite_sequence WHERE name IN (
  'inscription_poems', 'poem_attributions', 'monument_locations', 
  'measurements', 'media', 'events', 'inscriptions', 'poems', 
  'monuments', 'locations', 'poets', 'sources'
);

-- Poets テーブルのデータ
INSERT INTO poets (name, name_kana, biography, birth_year, death_year, link_url, image_url)
VALUES
  ('松尾芭蕉', 'まつお ばしょう', '江戸時代の俳人。奥の細道の著者。滑稽や諧謔を主としていた俳諧を、蕉風と呼ばれる芸術性の極めて高い句風として確立し、後世では俳聖として世界的にも知られる、日本史上最高の俳諧師の一人', 1644, 1694, 'https://ja.wikipedia.org/wiki/松尾芭蕉', 'https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Basho_by_Morikawa_Kyoriku_%281656-1715%29.jpg/500px-Basho_by_Morikawa_Kyoriku_%281656-1715%29.jpg'),
  ('小林一茶', 'こばやし いっさ', '江戸時代後期の俳人。自然や日常を詠んだ。', 1763, 1828, 'https://ja.wikipedia.org/wiki/小林一茶', 'https://example.com/issa.jpg'),
  ('与謝蕪村', 'よさ ぶそん', '江戸時代中期の俳人、画家。', 1716, 1784, 'https://ja.wikipedia.org/wiki/与謝蕪村', 'https://example.com/buson.jpg'),
  ('正岡子規', 'まさおか しき', '明治時代の俳人。俳句改革を行った。', 1867, 1902, 'https://ja.wikipedia.org/wiki/正岡子規', 'https://example.com/shiki.jpg'),
  ('高浜虚子', 'たかはま きょし', '正岡子規の弟子で俳壇の指導者。', 1874, 1959, 'https://ja.wikipedia.org/wiki/高浜虚子', 'https://example.com/kyooshi.jpg');

-- Sources テーブルのデータ
INSERT INTO sources (citation, title, author, publisher, source_year, url)
VALUES
  ('俳句のくに・三重（三重県庁、2011年）', '俳句のくに・三重', '三重県庁', '三重県庁', 2011, 'https://www.bunka.pref.mie.lg.jp/haiku/'),
  ('奥の細道（岩波文庫、1957年）', '奥の細道', '松尾芭蕉', '岩波書店', 1957, 'https://example.com/okuno-hosomichi'),
  ('おらが春（岩波文庫、1960年）', 'おらが春', '小林一茶', '岩波書店', 1960, 'https://example.com/oraga-haru'),
  ('蕪村句集（岩波文庫、1963年）', '蕪村句集', '与謝蕪村', '岩波書店', 1963, 'https://example.com/buson-kushu'),
  ('子規全集（講談社、1975年）', '子規全集', '正岡子規', '講談社', 1975, 'https://example.com/shiki-zenshu');

-- Locations テーブルのデータ
INSERT INTO locations (imi_pref_code, region, prefecture, municipality, address, place_name, latitude, longitude)
VALUES
  ('24', '東海', '三重県', '桑名市', '桑名市北寺町47', '本統寺', 35.065502, 136.692193),
  ('13', '関東', '東京都', '台東区', '東京都台東区上野公園', '上野恩賜公園', 35.715298, 139.773037),
  ('20', '中部', '長野県', '長野市', '長野県長野市一茶記念館前', '一茶記念館', 36.648583, 138.194953),
  ('26', '近畿', '京都府', '京都市', '京都府京都市中京区', '与謝蕪村の句碑', 35.011564, 135.768149),
  ('38', '四国', '愛媛県', '松山市', '愛媛県松山市', '子規記念館', 33.839157, 132.765575);

-- Monuments テーブルのデータ
INSERT INTO monuments (canonical_name, monument_type, monument_type_uri, material, material_uri)
VALUES
  ('本統寺 句碑（松尾芭蕉）', '句碑', 'http://vocab.getty.edu/aat/300264936', '石', 'http://vocab.getty.edu/aat/300264919'),
  ('上野公園 芭蕉句碑', '句碑', 'http://vocab.getty.edu/aat/300264936', '石', 'http://vocab.getty.edu/aat/300264919'),
  ('一茶記念館 句碑', '句碑', 'http://vocab.getty.edu/aat/300264936', '石', 'http://vocab.getty.edu/aat/300264919'),
  ('京都 蕪村句碑', '句碑', 'http://vocab.getty.edu/aat/300264936', '銅', 'http://vocab.getty.edu/aat/300264920'),
  ('松山 子規句碑', '句碑', 'http://vocab.getty.edu/aat/300264936', '石', 'http://vocab.getty.edu/aat/300264919');

-- Poems テーブルのデータ
INSERT INTO poems (text, normalized_text, text_hash, kigo, season)
VALUES
  ('冬牡丹千鳥よ雪のほととぎす', 'ふゆぼたんちどりよゆきのほととぎす', 'hash1', '冬牡丹,千鳥,雪,ほととぎす', '冬'),
  ('夏草や兵どもが夢の跡', 'なつくさやつわものどもがゆめのあと', 'hash2', '夏草', '夏'),
  ('雀の子そこのけそこのけお馬が通る', 'すずめのこそこのけそこのけおうまがとおる', 'hash3', '雀', '春'),
  ('春の海ひねもすのたりのたりかな', 'はるのうみひねもすのたりのたりかな', 'hash4', '海', '春'),
  ('柿くへば鐘が鳴るなり法隆寺', 'かきくえばかねがなるなりほうりゅうじ', 'hash5', '柿', '秋');

-- Poem Attributions（俳句の帰属）
INSERT INTO poem_attributions (poem_id, poet_id, confidence, confidence_score, source_id)
VALUES
  (1, 1, 'certain', 1.0, 1),
  (2, 1, 'certain', 1.0, 2),
  (3, 2, 'certain', 1.0, 3),
  (4, 3, 'certain', 1.0, 4),
  (5, 4, 'certain', 1.0, 5);

-- Inscriptions（碑文）
INSERT INTO inscriptions (monument_id, side, original_text, language, notes, source_id)
VALUES
  (1, 'front', '冬牡丹千鳥よ雪のほととぎす', 'ja', 'この句は、「野ざらし紀行」の旅の折、貞亨元年の晩秋に大垣の俳人木因と共に本統寺第三世大谷琢恵（俳号古益）に招かれた際、一夜を過ごして詠んだといわれている', 1),
  (2, 'front', '夏草や兵どもが夢の跡', 'ja', '奥の細道に記された有名な句。', 2),
  (3, 'front', '雀の子そこのけそこのけお馬が通る', 'ja', '一茶の優しい俳句の代表作。', 3),
  (4, 'front', '春の海ひねもすのたりのたりかな', 'ja', '穏やかな海を詠んだ句。', 4),
  (5, 'front', '柿くへば鐘が鳴るなり法隆寺', 'ja', '秋の味覚と歴史的建造物を結びつけた句。', 5);

-- Inscription Poems（碑文と句の関連）
INSERT INTO inscription_poems (inscription_id, poem_id, position)
VALUES
  (1, 1, 1),
  (2, 2, 1),
  (3, 3, 1),
  (4, 4, 1),
  (5, 5, 1);

-- Monument Locations（句碑と場所の関連）
INSERT INTO monument_locations (monument_id, location_id, is_primary)
VALUES
  (1, 1, 1),
  (2, 2, 1),
  (3, 3, 1),
  (4, 4, 1),
  (5, 5, 1);

-- Events（建立等のイベント）
INSERT INTO events (monument_id, event_type, hu_time_normalized, interval_start, interval_end, uncertainty_note, actor, source_id)
VALUES
  (1, 'erected', 'HT:interval/1937-04-01/1937-04-30', '1937-04-01', '1937-04-30', '月は特定だが日不明', '小林雨月', 1),
  (2, 'erected', 'HT:year/1712', '1712-01-01', '1712-12-31', '年のみ確定', '松尾芭蕉', 2),
  (3, 'erected', 'HT:year/1819', '1819-01-01', '1819-12-31', '年のみ確定', '小林一茶', 3),
  (4, 'erected', 'HT:year/1780', '1780-01-01', '1780-12-31', '年のみ確定', '与謝蕪村', 4),
  (5, 'erected', 'HT:year/1895', '1895-01-01', '1895-12-31', '年のみ確定', '正岡子規', 5);

-- Media（写真等のメディア）
INSERT INTO media (monument_id, media_type, url, captured_at, photographer, license)
VALUES
  (1, 'photo', 'https://example.com/basho-monument.jpg', '2023-04-01T10:00:00+09:00', '田中一郎', 'CC-BY-4.0'),
  (2, 'photo', 'https://example.com/basho-haiku.jpg', '2023-04-01T11:00:00+09:00', '田中一郎', 'CC-BY-4.0'),
  (3, 'photo', 'https://example.com/issa-haiku.jpg', '2023-05-10T09:00:00+09:00', '鈴木花子', 'CC-BY-4.0'),
  (4, 'photo', 'https://example.com/buson-haiku.jpg', '2023-06-15T14:00:00+09:00', '佐藤次郎', 'CC-BY-4.0'),
  (5, 'photo', 'https://example.com/shiki-haiku.jpg', '2023-07-20T16:00:00+09:00', '高橋一郎', 'CC-BY-4.0');

-- Measurements（寸法データ）
INSERT INTO measurements (monument_id, measurement_type, value, unit, measured_at, measured_by, source_id)
VALUES
  (1, 'height', 150.0, 'cm', '2023-04-01T10:00:00+09:00', '測量チーム', 1),
  (1, 'width', 50.0, 'cm', '2023-04-01T10:00:00+09:00', '測量チーム', 1),
  (1, 'depth', 30.0, 'cm', '2023-04-01T10:00:00+09:00', '測量チーム', 1),
  (2, 'height', 140.0, 'cm', '2023-04-01T11:00:00+09:00', '測量チーム', 2),
  (2, 'width', 45.0, 'cm', '2023-04-01T11:00:00+09:00', '測量チーム', 2);
