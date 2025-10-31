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
import base32 from "base32.js"; // Thư viện để chuyển từ base32 sang buffer

export default function SigninWithPassword() {
  const [data, setData] = useState({
    email: process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "",
    password: process.env.NEXT_PUBLIC_DEMO_USER_PASS || "",
    remember: false,
  });

  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false); // Trạng thái xác thực
  const [qrCode, setQrCode] = useState<string>(""); // Mã QR
  const [otp, setOtp] = useState(""); // Mã OTP người dùng nhập
  const [error, setError] = useState(""); // Lỗi nếu có
  const [userSecret, setUserSecret] = useState<string>(""); // Lưu trữ userSecret vào state

  // Mật khẩu hardcoded
  const hardcodedEmail =
    process.env.NEXT_PUBLIC_DEMO_USER_MAIL || "dangkhoi29mta@gmail.com";
  const hardcodedPassword = process.env.NEXT_PUBLIC_DEMO_USER_PASS || "123456";

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({
      ...data,
      [e.target.name]: e.target.value,
    });
  };

  // Kiểm tra xem userSecret đã tồn tại trong cơ sở dữ liệu chưa
  useEffect(() => {
    // Giả sử bạn lấy userSecret từ cơ sở dữ liệu sau khi người dùng đã kích hoạt 2FA
    const storedSecret = localStorage.getItem("userSecret"); // Lấy userSecret từ localStorage hoặc cơ sở dữ liệu
    if (storedSecret) {
      setUserSecret(storedSecret); // Nếu có, gán lại vào state
    }
  }, []);

  // Tạo userSecret mới khi người dùng đăng nhập lần đầu
  const generateUserSecret = () => {
    const secret = speakeasy.generateSecret({ length: 20 });
    setUserSecret(secret.base32); // Lưu userSecret vào state
    localStorage.setItem("userSecret", secret.base32); // Lưu userSecret vào localStorage (hoặc cơ sở dữ liệu)
    return secret.base32; // Trả về secret base32 để sử dụng cho OTP
  };

  const handleLoginSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setLoading(true);

    // Kiểm tra email và mật khẩu
    if (data.email === hardcodedEmail && data.password === hardcodedPassword) {
      if (!userSecret) {
        // Nếu userSecret chưa có trong state (chưa được tạo), tạo mới
        const secret = generateUserSecret();

        // Tạo mã QR sau khi đăng nhập thành công
        const authUrl = `otpauth://totp/YourApp:${data.email}?secret=${secret}&issuer=YourApp`;

        // Tạo mã QR
        // @ts-ignore
        QRCode.toDataURL(authUrl, function (err, url) {
          if (err) throw err;
          setQrCode(url); // Cập nhật mã QR
        });
      }

      // Đánh dấu là đã đăng nhập, yêu cầu OTP
      setIsAuthenticated(true);
    } else {
      setError("Invalid email or password.");
    }

    setLoading(false);
  };

  const handleOtpSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Kiểm tra xem userSecret có phải là chuỗi base32 hợp lệ không
    if (!userSecret || userSecret.length === 0) {
      setError("Invalid secret key.");
      return;
    }

    // Kiểm tra xem OTP có phải là chuỗi ký tự hợp lệ không
    if (!otp || otp.length === 0 || otp.length !== 6) {
      setError("Please enter a valid 6-digit OTP.");
      return;
    }

    // Chuyển userSecret từ base32 sang buffer bằng base32.js
    const base32Decoder = new base32.Decoder();
    const secretBuffer = base32Decoder.write(userSecret).finalize(); // Chuyển base32 thành buffer

    // Xác thực mã OTP bằng speakeasy
    const verified = speakeasy.totp.verify({
      secret: secretBuffer, // Sử dụng buffer thay vì chuỗi base32
      encoding: "buffer", // Sử dụng encoding là buffer
      token: otp, // Mã OTP người dùng nhập vào
    });

    if (verified) {
      alert("Login successful!");
      // Tiến hành các bước sau khi đăng nhập thành công
    } else {
      setError("Invalid OTP.");
    }
  };

  return (
    <form onSubmit={isAuthenticated ? handleOtpSubmit : handleLoginSubmit}>
      {!isAuthenticated ? (
        <>
          <InputGroup
            type="email"
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
                setData({
                  ...data,
                  remember: e.target.checked,
                })
              }
            />

            <Link
              href="/auth/forgot-password"
              className="hover:text-primary dark:text-white dark:hover:text-primary"
            >
              Forgot Password?
            </Link>
          </div>

          <div className="mb-4.5">
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
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

          {error && <div style={{ color: "red" }}>{error}</div>}

          <div className="mb-4.5">
            <button
              type="submit"
              className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-lg bg-primary p-4 font-medium text-white transition hover:bg-opacity-90"
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
