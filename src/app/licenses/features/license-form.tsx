"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Helpers
const trimOpt = (v: unknown) =>
  typeof v === "string" ? v.trim() : v === "" ? undefined : v;

// Regex đơn giản cho MAC & IPv4 (không bắt buộc nhập)
const MAC_RE =
  /^(?:[0-9A-Fa-f]{2}([-:]?))(?:[0-9A-Fa-f]{2}\1){4}[0-9A-Fa-f]{2}$/;
const IPV4_RE = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;

// Schema
const schema = z.object({
  license: z.string().trim().min(1, "Bắt buộc"),
  status: z.enum(["Active", "Inactive", "Revoked"]),
  unit_code: z.string().trim().min(1, "Bắt buộc"),
  uid: z.preprocess(trimOpt, z.string().optional().nullable()),
  mac: z
    .preprocess(trimOpt, z.string().optional().nullable())
    .refine((v) => !v || MAC_RE.test(v), { message: "MAC không hợp lệ" }),
  ip: z
    .preprocess(trimOpt, z.string().optional().nullable())
    .refine((v) => !v || IPV4_RE.test(v), {
      message: "IP không hợp lệ (IPv4)",
    }),
  device_name: z.preprocess(trimOpt, z.string().optional().nullable()),
  manager_name: z.preprocess(trimOpt, z.string().optional().nullable()),
  unit: z.preprocess(trimOpt, z.string().optional().nullable()),
  region: z.enum(["bac", "trung", "nam"]).optional().nullable(),
});

type FormData = z.infer<typeof schema>;

export function LicenseFormDialog({
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
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { status: "Active", ...defaultValues },
    mode: "onBlur",
  });

  // ESC để đóng
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) =>
      e.key === "Escape" && onOpenChange(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Reset khi đóng/mở
  React.useEffect(() => {
    if (!open) reset({ status: "Active", ...defaultValues });
  }, [open, defaultValues, reset]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] dark:bg-black/60"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-2xl rounded-[10px] border border-stroke bg-white p-6 text-gray-900 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:text-gray-100 dark:shadow-card">
        {/* Header */}
        <div className="mb-3 flex items-center justify-between border-b border-gray-200 pb-2 dark:border-dark-3">
          <h2 className="text-xl font-semibold">
            {defaultValues?.license ? "Chỉnh sửa License" : "Tạo License"}
          </h2>
          <button
            onClick={() => onOpenChange(false)}
            className="rounded-md p-1 text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5750F1]/30 dark:text-gray-300 dark:hover:bg-white/5 dark:hover:text-gray-100"
            aria-label="Đóng"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <form
          className="grid gap-3"
          onSubmit={handleSubmit(async (v) => {
            // chuẩn hoá trước khi gửi
            const payload: FormData = {
              ...v,
              uid: v.uid || undefined,
              mac: v.mac || undefined,
              ip: v.ip || undefined,
              device_name: v.device_name || undefined,
              manager_name: v.manager_name || undefined,
              unit: v.unit || undefined,
              region: v.region || undefined,
            };
            await onSubmit(payload);
            onOpenChange(false);
          })}
        >
          <div className="grid grid-cols-2 gap-3">
            {/* License */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                License
              </label>
              <input
                {...register("license")}
                disabled={!!defaultValues?.license || isSubmitting}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-[#5750F1]/30 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100"
                placeholder="vd: LIC-00123"
                autoFocus
              />
              {errors.license && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.license.message}
                </p>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Trạng thái
              </label>
              <select
                {...register("status")}
                disabled={isSubmitting}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-[#5750F1]/30 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100"
              >
                <option>Active</option>
                <option>Inactive</option>
                <option>Revoked</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Unit code */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Unit code
              </label>
              <input
                {...register("unit_code")}
                disabled={isSubmitting}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-[#5750F1]/30 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100"
                placeholder="vd: U001"
              />
              {errors.unit_code && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.unit_code.message}
                </p>
              )}
            </div>

            {/* Region */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Region
              </label>
              <select
                {...register("region")}
                disabled={isSubmitting}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-[#5750F1]/30 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="bac">Bắc</option>
                <option value="trung">Trung</option>
                <option value="nam">Nam</option>
              </select>
              {errors.region && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.region.message as string}
                </p>
              )}
            </div>
          </div>

          {/* UID / MAC / IP */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                UID
              </label>
              <input
                {...register("uid")}
                disabled={isSubmitting}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-[#5750F1]/30 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                MAC
              </label>
              <input
                {...register("mac")}
                placeholder="AA:BB:CC:DD:EE:FF"
                disabled={isSubmitting}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-[#5750F1]/30 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100"
              />
              {errors.mac && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.mac.message}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                IP
              </label>
              <input
                {...register("ip")}
                placeholder="192.168.1.1"
                disabled={isSubmitting}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-[#5750F1]/30 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100"
              />
              {errors.ip && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.ip.message}
                </p>
              )}
            </div>
          </div>

          {/* Device / Manager */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Device name
              </label>
              <input
                {...register("device_name")}
                disabled={isSubmitting}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-[#5750F1]/30 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Manager name
              </label>
              <input
                {...register("manager_name")}
                disabled={isSubmitting}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-[#5750F1]/30 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100"
              />
            </div>
          </div>

          {/* Unit (bổ sung) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tên đơn vị bổ sung
            </label>
            <input
              {...register("unit")}
              disabled={isSubmitting}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-[#5750F1]/30 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          {/* Footer */}
          <div className="mt-5 flex justify-end gap-2 border-t border-gray-200 pt-4 dark:border-dark-3">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm text-gray-800 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#5750F1]/30 disabled:cursor-not-allowed disabled:opacity-60 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-white/5"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-[#5750F1]/30 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              {isSubmitting ? "Đang lưu…" : "Lưu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
