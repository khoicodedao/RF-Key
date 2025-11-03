"use client";
import { useEffect, useState } from "react";

export function useCookieToken() {
  const [token, setToken] = useState<string | null>(null);

  // Hàm lấy token từ cookie
  const getCookieToken = () => {
    if (typeof document === "undefined") return null;
    const cookies = document.cookie.split("; ");
    console.log("cookies", cookies);
    const tokenCookie = cookies.find((row) => row.startsWith("token="));
    return tokenCookie ? decodeURIComponent(tokenCookie.split("=")[1]) : null;
  };

  useEffect(() => {
    // Lấy token ban đầu
    setToken(getCookieToken());

    // Theo dõi cookie thay đổi (login/logout)
    const interval = setInterval(() => {
      const newToken = getCookieToken();
      setToken((prev) => (prev !== newToken ? newToken : prev));
    }, 1000); // kiểm tra mỗi giây (đủ nhẹ)

    return () => clearInterval(interval);
  }, []);

  return token;
}
