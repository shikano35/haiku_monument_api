-- Poetsテーブルのデータ追加
INSERT INTO poets (name, biography, links, image_url) VALUES
('松尾芭蕉', '江戸時代の俳人。奥の細道の著者。', 'https://example.com/basho', 'https://example.com/basho.jpg'),
('小林一茶', '江戸時代後期の俳人。自然や日常を詠んだ。', 'https://example.com/issa', 'https://example.com/issa.jpg'),
('与謝蕪村', '江戸時代中期の俳人、画家。', 'https://example.com/buson', 'https://example.com/buson.jpg'),
('正岡子規', '明治時代の俳人。俳句改革を行った。', 'https://example.com/shiki', 'https://example.com/shiki.jpg'),
('高浜虚子', '正岡子規の弟子で俳壇の指導者。', 'https://example.com/kyooshi', 'https://example.com/kyooshi.jpg');

-- Sourcesテーブルのデータ追加
INSERT INTO sources (title, author, year, url, publisher) VALUES
('奥の細道', '松尾芭蕉', 1702, 'https://example.com/okuno-hosomichi', '江戸出版'),
('おらが春', '小林一茶', 1819, 'https://example.com/oraga-haru', '江戸出版'),
('蕪村句集', '与謝蕪村', 1775, 'https://example.com/buson-kushu', '江戸出版'),
('俳句革新', '正岡子規', 1893, 'https://example.com/haiku-kakushin', '明治出版社'),
('ホトトギス', '高浜虚子', 1897, 'https://example.com/hototogisu', '明治出版社');

-- Locationsテーブルのデータ追加
INSERT INTO locations (prefecture, region, address, latitude, longitude, name) VALUES
('東京都', '関東', '東京都台東区上野公園', 35.715298, 139.773037, '上野恩賜公園'),
('長野県', '中部', '長野県長野市', 36.648583, 138.194953, '一茶記念館'),
('京都府', '近畿', '京都府京都市中京区', 35.011564, 135.768149, '与謝蕪村の句碑'),
('愛媛県', '四国', '愛媛県松山市', 33.839157, 132.765575, '子規記念館'),
('兵庫県', '近畿', '兵庫県神戸市', 34.690084, 135.195510, '高浜虚子の句碑');

-- Haiku Monumentsテーブルのデータ追加
INSERT INTO haiku_monuments (text, poet_id, source_id, established_date, location_id, commentary, image_url) VALUES
('夏草や 兵どもが 夢の跡', 1, 1, '1712-05-15', 1, '奥の細道に記された有名な句。', 'https://example.com/basho-haiku.jpg'),
('雀の子 そこのけそこのけ お馬が通る', 2, 2, '1821-06-10', 2, '一茶の優しい俳句の代表作。', 'https://example.com/issa-haiku.jpg'),
('春の海 ひねもすのたり のたりかな', 3, 3, '1780-04-08', 3, '穏やかな海を詠んだ句。', 'https://example.com/buson-haiku.jpg'),
('柿くへば 鐘が鳴るなり 法隆寺', 4, 4, '1895-10-12', 4, '秋の味覚と歴史的建造物を結びつけた句。', 'https://example.com/shiki-haiku.jpg'),
('遠山に 日の当たりたる 枯野かな', 5, 5, '1901-11-20', 5, '枯野に光が当たる美しい情景を描く句。', 'https://example.com/kyooshi-haiku.jpg');
