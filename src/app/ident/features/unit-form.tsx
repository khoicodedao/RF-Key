"use client";
import React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

// Schema validation (parse số cho level, trim chuỗi)
const schema = z.object({
  unit_code: z.string().trim().min(1, "Bắt buộc"),
  unit_name: z.string().trim().min(1, "Bắt buộc"),
  parent_unit_code: z.string().trim().optional().or(z.literal("")),
  full_name: z.string().trim().optional().or(z.literal("")),
  // @ts-ignore
  region: z.enum(["bac", "trung", "nam"], { required_error: "Chọn vùng miền" }),
  level: z
    .preprocess(
      (v) =>
        v === "" || v === null || v === undefined ? undefined : Number(v),
      z.number().int().nonnegative().optional(),
    )
    .nullable()
    .optional(),
});

type FormData = z.infer<typeof schema>;

export function UnitFormDialog({
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
  const isEdit = !!defaultValues?.unit_code;

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<FormData>({
    // @ts-ignore
    resolver: zodResolver(schema),
    defaultValues: { region: "bac", ...defaultValues },
    mode: "onBlur",
  });

  // Đóng bằng phím ESC
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  // Reset form khi đóng
  React.useEffect(() => {
    if (!open) reset({ region: "bac", ...defaultValues });
  }, [open, defaultValues, reset]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] dark:bg-black/60"
      role="dialog"
      aria-modal="true"
    >
      <div className="w-full max-w-lg rounded-[10px] border border-stroke bg-white p-6 text-gray-900 shadow-1 dark:border-dark-3 dark:bg-gray-dark dark:text-gray-100 dark:shadow-card">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 pb-2 dark:border-dark-3">
          <h2 className="text-xl font-semibold">
            {isEdit ? "Chỉnh sửa đơn vị" : "Tạo đơn vị mới"}
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
          className="mt-4 grid gap-3"
          onSubmit={handleSubmit(async (v) => {
            // Chuẩn hoá dữ liệu trước khi gửi
            // @ts-ignore
            const payload: FormData = {
              ...v,
              parent_unit_code: v.parent_unit_code?.trim() || undefined,
              full_name: v.full_name?.trim() || undefined,
            };
            await onSubmit(payload);
            onOpenChange(false);
          })}
        >
          {/* unit_code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mã đơn vị
            </label>
            <input
              {...register("unit_code")}
              disabled={isEdit || isSubmitting}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-[#5750F1]/30 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100"
              placeholder="vd: U001"
              autoFocus
            />
            {errors.unit_code && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.unit_code.message}
              </p>
            )}
          </div>

          {/* unit_name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tên đơn vị
            </label>
            <input
              {...register("unit_name")}
              disabled={isSubmitting}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-[#5750F1]/30 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100"
              placeholder="vd: Phòng Kinh Doanh"
            />
            {errors.unit_name && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {errors.unit_name.message}
              </p>
            )}
          </div>

          {/* full_name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Tên đầy đủ
            </label>
            <input
              {...register("full_name")}
              disabled={isSubmitting}
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-[#5750F1]/30 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100"
              placeholder="vd: Phòng Kinh Doanh Trung Tâm"
            />
          </div>

          {/* parent_unit_code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Mã đơn vị cha
            </label>
            <input
              {...register("parent_unit_code")}
              disabled={isSubmitting}
              placeholder="(tuỳ chọn)"
              className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-[#5750F1]/30 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100"
            />
          </div>

          {/* region + level */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Vùng miền
              </label>
              <select
                {...register("region")}
                disabled={isSubmitting}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-[#5750F1]/30 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100"
              >
                <option value="bac">Miền Bắc</option>
                <option value="trung">Miền Trung</option>
                <option value="nam">Miền Nam</option>
              </select>
              {errors.region && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.region.message as string}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Cấp đơn vị
              </label>
              <input
                type="number"
                inputMode="numeric"
                {...register("level")}
                disabled={isSubmitting}
                className="mt-1 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-[#5750F1]/30 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100"
                placeholder="vd: 1"
              />
              {errors.level && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  Cấp đơn vị phải là số nguyên ≥ 0
                </p>
              )}
            </div>
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
