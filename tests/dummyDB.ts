const locations = [
  {
    id: 1,
    prefecture: "東京都",
    region: "関東",
    address: "東京都台東区上野公園",
    latitude: 35.715298,
    longitude: 139.773037,
    name: "上野恩賜公園",
  },
  {
    id: 2,
    prefecture: "長野県",
    region: "中部",
    address: "長野県長野市",
    latitude: 36.648583,
    longitude: 138.194953,
    name: "一茶記念館",
  },
  {
    id: 3,
    prefecture: "京都府",
    region: "近畿",
    address: "京都府京都市中京区",
    latitude: 35.011564,
    longitude: 135.768149,
    name: "与謝蕪村の句碑",
  },
  {
    id: 4,
    prefecture: "愛媛県",
    region: "四国",
    address: "愛媛県松山市",
    latitude: 33.839157,
    longitude: 132.765575,
    name: "子規記念館",
  },
  {
    id: 5,
    prefecture: "兵庫県",
    region: "近畿",
    address: "兵庫県神戸市",
    latitude: 34.690084,
    longitude: 135.195510,
    name: "高浜虚子の句碑",
  }
];

export const dummyDB = {
  prepare(query: string) {
    return {
      all: async () => {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes("from locations")) {
          return locations;
        }
        return [];
      },
      run: async () => ({}),
      first: async () => {
        const lowerQuery = query.toLowerCase();
        if (lowerQuery.includes("from locations") && lowerQuery.includes("where")) {
          return locations[0];
        }
        return null;
      },
    };
  },
};