"use client";
import { EmailIcon, PasswordIcon } from "@/assets/icons";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import InputGroup from "../FormElements/InputGroup";
import { Checkbox } from "../FormElements/checkbox";
// @ts-ignore
import speakeasy from "speakeasy";
//@ts-ignore
import QRCode from "qrcode";
// @ts-ignore
import base32 from "base32.js";
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
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Sau khi pass bước user/pass -> yêu cầu OTP
  const [qrCode, setQrCode] = useState<string>("");
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [userSecret, setUserSecret] = useState<string>("");

  // Lấy secret đã lưu (nếu có)
  useEffect(() => {
    const storedSecret = localStorage.getItem("userSecret");
    if (storedSecret) setUserSecret(storedSecret);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Tạo secret cho 2FA nếu chưa có
  const generateUserSecret = () => {
    const secret = speakeasy.generateSecret({ length: 20 });
    setUserSecret(secret.base32);
    localStorage.setItem("userSecret", secret.base32);
    return secret.base32;
  };

  // ✅ Sửa tại đây: call API /api/login với body { user_name, password }
  const handleLoginSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_name: data.email,
          password: data.password,
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

      // Lấy token & user
      const user = json?.data?.[0];
      const token = user?.token;

      // 👉 Lưu token vào localStorage
      // Có thể lưu kèm user & time để tiện kiểm soát
      if (token) {
        const payload = {
          token,
          user: {
            user_name: user?.user_name,
            role: user?.role,
          },
          // optional: lưu thời điểm để tự refresh/đăng xuất
          savedAt: Date.now(),
        };

        // Nhớ đăng nhập lâu hơn nếu "Remember me"
        // localStorage: lưu bền (qua reload/đóng tab); sessionStorage: chỉ trong tab
        if (data.remember) {
          localStorage.setItem("auth", JSON.stringify(payload));
        } else {
          sessionStorage.setItem("auth", JSON.stringify(payload));
        }
      }

      // Tạo secret 2FA nếu chưa có và chuyển sang OTP
      let secretToUse = userSecret || generateUserSecret();
      const authUrl = `otpauth://totp/YourApp:${data.email}?secret=${secretToUse}&issuer=YourApp`;
      // @ts-ignore
      const url = await QRCode.toDataURL(authUrl);
      setQrCode(url);
      setIsAuthenticated(true);
    } catch (err: any) {
      setError(err?.message || "Login error.");
    } finally {
      setLoading(false);
    }
  };

  const handleOtpSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!userSecret) {
      setError("Invalid secret key.");
      return;
    }
    if (!otp || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    const base32Decoder = new base32.Decoder();
    const secretBuffer = base32Decoder.write(userSecret).finalize();

    const verified = speakeasy.totp.verify({
      secret: secretBuffer,
      encoding: "buffer",
      token: otp,
      window: 1, // nới một tí nếu cần
    });

    if (verified) {
      // TODO: chuyển hướng dashboard, v.v.
      router.push("/");
    } else {
      setError("Invalid OTP.");
    }
  };

  return (
    <form onSubmit={isAuthenticated ? handleOtpSubmit : handleLoginSubmit}>
      {!isAuthenticated ? (
        <>
          <InputGroup
            type=""
            label="Email"
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
            className="mb-5 [&_input]:py-[15px]"
            placeholder="Enter your password"
            name="password"
            handleChange={handleChange}
            value={data.password}
            icon={<PasswordIcon />}
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
        </>
      ) : (
        <>
          <div className="mb-4">
            <p className="font-medium">
              Please scan the QR code below with your Authenticator app.
            </p>
            {qrCode && (
              <img src={qrCode} alt="QR Code" width={200} height={200} />
            )}
          </div>

          <InputGroup
            type="text"
            label="Enter OTP"
            className="mb-5 [&_input]:py-[15px]"
            placeholder="Enter the OTP from your Authenticator app"
            name="otp"
            handleChange={(e) => setOtp(e.target.value)}
            value={otp}
          />

          {error && <div className="mb-3 text-sm text-red-500">{error}</div>}

          <div className="mb-4.5">
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
              disabled={loading}
            >
              Verify OTP
              {loading && (
                <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-solid border-white border-t-transparent dark:border-primary dark:border-t-transparent" />
              )}
            </button>
          </div>
        </>
      )}
    </form>
  );
}
