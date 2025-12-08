"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import Link from "next/link";
import React, { useState } from "react";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";
import { useRouter } from "next/navigation";

type LoginApiResponse = {
  code: number;
  message: string;
  count: number;
  data: Array<{
    user_name: string;
    role: string;
    token: string;
    password?: string;
  }>;
};

export default function SigninWithPassword() {
  const router = useRouter();
  const [data, setData] = useState({
    email: process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "",
    password: process.env.NEXT_PUBLIC_DEMO_USER_PASS || "",
    otp: "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Có thể check sơ input trước khi call API
    if (!data.email || !data.password || !data.otp) {
      setError("Please enter email, password and OTP.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: data.email,
          password: data.password,
          otp: data.otp,
        }),
      });

      const json: LoginApiResponse = await res.json();

      if (!res.ok || json.code !== 200) {
        throw new Error(
          (json as any)?.error?.message ||
            json?.message ||
            "Login failed. Please check your credentials.",
        );
      }

      const user = json?.data?.[0];
      const token = user?.token;

      if (token) {
        const payload = {
          token,
          user: {
            user_name: user?.user_name,
            role: user?.role,
          },
          savedAt: Date.now(),
        };

        if (data.remember) {
          localStorage.setItem("auth", JSON.stringify(payload));
        } else {
          sessionStorage.setItem("auth", JSON.stringify(payload));
        }
      }

      // Đăng nhập thành công -> chuyển sang dashboard/home
      router.push("/");
    } catch (err: any) {
      setError(err?.message || "Login error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLoginSubmit}>
      <InputGroup
        type=""
        label="Username"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your email"
        name="email"
        handleChange={handleChange}
        value={data.email}
        icon={<EmailIcon />}
      />

      <InputGroup
        type="password"
        label="Password"
        className="mb-4 [&_input]:py-[15px]"
        placeholder="Enter your password"
        name="password"
        handleChange={handleChange}
        value={data.password}
        icon={<PasswordIcon />}
      />

      <InputGroup
        type="text"
        label="OTP"
        className="mb-5 [&_input]:py-[15px]"
        placeholder="Enter your OTP"
        name="otp"
        handleChange={handleChange}
        value={data.otp}
      />

      <div className="mb-6 flex items-center justify-between gap-2 py-2 font-medium">
        <Checkbox
          label="Remember me"
          name="remember"
          withIcon="check"
          minimal
          radius="md"
          onChange={(e) =>
            setData((prev) => ({ ...prev, remember: e.target.checked }))
          }
        />

        <Link
          href="/auth/forgot-password"
          className="hover:text-primary dark:text-white dark:hover:text-primary"
        >
          Forgot Password?
        </Link>
      </div>

      {error && <div className="mb-3 text-sm text-red-500">{error}</div>}

      <div className="mb-4.5">
        <button
          type="submit"
          className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
          disabled={loading}
        >
          Sign In
          {loading && (
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
          )}
        </button>
      </div>
    </form>
  );
}
