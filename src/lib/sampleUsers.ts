export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive";
  createdAt: string;
}

export const sampleUsers: User[] = [
  {
    id: "1",
    name: "田中太郎",
    email: "tanaka@example.com",
    role: "admin",
    status: "active",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "佐藤花子",
    email: "sato@example.com",
    role: "editor",
    status: "active",
    createdAt: "2024-02-20",
  },
  {
    id: "3",
    name: "鈴木一郎",
    email: "suzuki@example.com",
    role: "viewer",
    status: "inactive",
    createdAt: "2024-03-10",
  },
  {
    id: "4",
    name: "高橋美咲",
    email: "takahashi@example.com",
    role: "editor",
    status: "active",
    createdAt: "2024-04-05",
  },
  {
    id: "5",
    name: "伊藤健太",
    email: "ito@example.com",
    role: "viewer",
    status: "active",
    createdAt: "2024-05-12",
  },
  {
    id: "6",
    name: "渡辺裕子",
    email: "watanabe@example.com",
    role: "admin",
    status: "active",
    createdAt: "2024-06-01",
  },
  {
    id: "7",
    name: "山本大輔",
    email: "yamamoto@example.com",
    role: "editor",
    status: "inactive",
    createdAt: "2024-06-18",
  },
  {
    id: "8",
    name: "中村さくら",
    email: "nakamura@example.com",
    role: "viewer",
    status: "active",
    createdAt: "2024-07-22",
  },
  {
    id: "9",
    name: "小林誠",
    email: "kobayashi@example.com",
    role: "editor",
    status: "active",
    createdAt: "2024-08-10",
  },
  {
    id: "10",
    name: "加藤めぐみ",
    email: "kato@example.com",
    role: "viewer",
    status: "inactive",
    createdAt: "2024-09-03",
  },
];
