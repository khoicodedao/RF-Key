// features/users/types.ts
export type AppUser = {
  username: string;
  password?: string; // chỉ dùng khi tạo/đổi
  role: "admin" | "editor" | "viewer";
  unit_code: string;
  created_at?: string;
  updated_at?: string;
};
