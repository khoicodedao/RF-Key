// utils/api.ts
import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // gửi cookie HttpOnly tới Next API
  headers: { "Content-Type": "application/json" },
});
