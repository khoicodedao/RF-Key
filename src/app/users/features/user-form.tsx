"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  username: z.string().min(1, "Bắt buộc"),
  password: z.string().min(8, "Tối thiểu 8 ký tự").optional(),
  role: z.enum(["admin", "user", "superadmin"]),
  unit_code: z.string().min(1, "Bắt buộc"),
});
type FormData = z.infer<typeof schema>;

export function UserFormDialog({
  open,
  onOpenChange,
  defaultValues,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  defaultValues?: Partial<FormData>;
  onSubmit: (v: FormData) => Promise<void> | void;
}) {
  const isEdit = !!defaultValues?.username;
  const { register, handleSubmit, formState } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { ...defaultValues },
  });
  const { errors } = formState;

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] dark:bg-black/60"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-lg border border-gray-200 bg-white p-6 text-gray-900 shadow-lg dark:border-gray-800 dark:bg-[#0b1524] dark:text-gray-100">
        <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-2 dark:border-gray-800">
          <h2 className="text-xl font-semibold">
            {isEdit ? "Chỉnh sửa người dùng" : "Tạo người dùng"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-gray-400 dark:hover:bg-white/5 dark:hover:text-gray-200"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        <form
          className="grid gap-3"
          onSubmit={handleSubmit(async (v) => {
            await onSubmit(v);
            onOpenChange(false);
          })}
        >
          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Username
            </label>
            <input
              {...register("username")}
              disabled={isEdit}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#0e1b2d] dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-gray-600"
              placeholder="vd: admin01"
            />
            {errors.username && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.username.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {isEdit ? "Mật khẩu mới (tuỳ chọn)" : "Mật khẩu"}
            </label>
            <input
              type="password"
              placeholder={isEdit ? "Bỏ trống nếu không đổi" : ""}
              {...register("password")}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#0e1b2d] dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-gray-600"
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Role + Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Role
              </label>
              <select
                {...register("role")}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#0e1b2d] dark:text-gray-100 dark:focus:border-gray-600"
              >
                <option>admin</option>
                <option>editor</option>
                <option>viewer</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Unit code
              </label>
              <input
                {...register("unit_code")}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#0e1b2d] dark:text-gray-100 dark:focus:border-gray-600"
                placeholder="vd: U001"
              />
              {errors.unit_code && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.unit_code.message}
                </p>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="mt-5 flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-gray-800">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-700 dark:bg-[#0e1b2d] dark:text-gray-100 dark:hover:bg-white/5"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              Lưu
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
