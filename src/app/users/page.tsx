"use client";

import * as React from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import {
  Table,
  Tag,
  Tooltip,
  Modal,
  Descriptions,
  Popconfirm,
  Input,
  Select,
  Space,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { UserFormDialog } from "./features/user-form";
import { fetchUsers, createUser, updateUser, deleteUser } from "./features/api";
import type { AppUser } from "./features/types";

const fmt = (v?: string | null) =>
  v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "-";

const regionLabel = (r?: number | string) => {
  if (r === 1 || r === "1" || r === "bac") return "Miền Bắc";
  if (r === 2 || r === "2" || r === "trung") return "Miền Trung";
  if (r === 3 || r === "3" || r === "nam") return "Miền Nam";
  return "-";
};

const statusTag = (role?: string) => {
  if (!role) return <Tag>-</Tag>;
  if (role === "superadmin") return <Tag color="red">Super Admin</Tag>;
  if (role === "admin") return <Tag color="green">Admin</Tag>;
  return <Tag>{role}</Tag>;
};

export default function UsersPage() {
  const [data, setData] = React.useState<AppUser[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(false);
  const [q, setQ] = React.useState<string>("");
  const [region, setRegion] = React.useState<number | undefined>(undefined);
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);

  // Form
  const [open, setOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<AppUser | null>(null);

  // View modal
  const [viewOpen, setViewOpen] = React.useState(false);
  const [viewItem, setViewItem] = React.useState<AppUser | null>(null);

  const load = React.useCallback(async () => {
    try {
      setLoading(true);
      const res: any = await fetchUsers({
        page,
        limit: pageSize,
        q,
        region,
      });
      setData(res.items ?? []);
      setTotal(res.countTotal ?? res.items?.length ?? 0);
    } catch (e: any) {
      console.error(e);
      message.error("Không tải được danh sách người dùng");
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, q, region]);

  React.useEffect(() => {
    load();
  }, [load]);

  const columns: ColumnsType<AppUser> = [
    {
      title: "Tên đăng nhập",
      dataIndex: "user_name",
      key: "user_name",
      width: 200,
      render: (v) => <span className="font-medium">{v}</span>,
    },
    {
      title: "Vai trò",
      dataIndex: "role",
      key: "role",
      width: 140,
      render: statusTag,
    },
    {
      title: "Đơn vị",
      dataIndex: "unit_code",
      key: "unit_code",
      render: (val) => {
        if (!val || !Array.isArray(val)) return "-";
        // xử lý chuỗi lỗi kiểu ["['Z8M1K4T9QP2J']"]
        const clean = val.map((v: string) =>
          v.replace(/[\[\]"'`]/g, "").trim(),
        );
        return clean.join(", ") || "-";
      },
    },
    {
      title: "Miền",
      dataIndex: "region",
      key: "region",
      width: 110,
      render: regionLabel,
    },
    {
      title: "Tạo / Cập nhật",
      key: "dates",
      width: 210,
      render: (_, r) => (
        <div className="text-xs">
          <div>Tạo: {fmt(r.created_at)}</div>
          <div>Cập nhật: {fmt(r.updated_at)}</div>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 220,
      render: (_, u) => (
        <Space>
          <Tooltip title="Xem chi tiết">
            <Tag
              color="blue"
              icon={<EyeOutlined />}
              className="cursor-pointer"
              onClick={() => {
                setViewItem(u);
                setViewOpen(true);
              }}
            >
              Xem
            </Tag>
          </Tooltip>

          <Tooltip title="Sửa">
            <Tag
              color="orange"
              icon={<EditOutlined />}
              className="cursor-pointer"
              onClick={() => {
                setEditItem(u);
                setOpen(true);
              }}
            >
              Sửa
            </Tag>
          </Tooltip>

          <Popconfirm
            title="Xóa người dùng"
            description={`Bạn có chắc muốn xóa "${u.user_name}"?`}
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={async () => {
              await deleteUser(u.user_name);
              load();
            }}
          >
            <Tooltip title="Xóa người dùng">
              <Tag
                color="red"
                icon={<DeleteOutlined />}
                className="cursor-pointer"
              >
                Xóa
              </Tag>
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="grid gap-4">
      {/* Header + filter */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <h1 className="text-xl font-semibold">Người dùng</h1>
        <Space wrap>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Tìm username / role / unit"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onPressEnter={() => {
              setPage(1);
              load();
            }}
            style={{ width: 240 }}
          />
          <Select
            allowClear
            placeholder="Chọn miền"
            style={{ width: 160 }}
            value={region}
            onChange={(v) => {
              setRegion(v);
              setPage(1);
            }}
            options={[
              { label: "Bắc", value: 1 },
              { label: "Trung", value: 2 },
              { label: "Nam", value: 3 },
            ]}
          />
          <Button
            className="inline-flex items-center gap-2"
            onClick={() => {
              setPage(1);
              load();
            }}
          >
            <ReloadOutlined /> Làm mới
          </Button>
          <Button
            onClick={() => {
              setEditItem(null);
              setOpen(true);
            }}
            className="inline-flex items-center gap-2"
          >
            <PlusOutlined /> Thêm người dùng
          </Button>
        </Space>
      </div>

      {/* Bảng */}
      <div className="overflow-x-auto">
        <Table<AppUser>
          columns={columns}
          dataSource={data}
          rowKey="user_name"
          loading={loading}
          size="middle"
          tableLayout="fixed"
          pagination={{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
            pageSizeOptions: [10, 20, 50],
            onChange: (p, ps) => {
              setPage(p);
              setPageSize(ps);
            },
            showTotal: (t) => `Tổng: ${t}`,
          }}
          scroll={{ x: 900 }}
        />
      </div>

      {/* Form thêm/sửa */}
      <UserFormDialog
        open={open}
        onOpenChange={setOpen}
        defaultValues={editItem ?? undefined}
        onSubmit={async (v) => {
          if (editItem) {
            await updateUser(editItem.user_name, v);
          } else {
            await createUser(v as AppUser);
          }
          load();
        }}
      />

      {/* Modal xem chi tiết */}
      <Modal
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        title={
          viewItem ? `Chi tiết: ${viewItem.user_name}` : "Chi tiết người dùng"
        }
        centered
        width={720}
      >
        {viewItem && (
          <Descriptions
            column={{ xs: 1, md: 2 }}
            bordered
            size="small"
            labelStyle={{ width: 180 }}
          >
            <Descriptions.Item label="Tên đăng nhập">
              {viewItem.user_name}
            </Descriptions.Item>
            <Descriptions.Item label="Vai trò">
              {statusTag(viewItem.role)}
            </Descriptions.Item>
            <Descriptions.Item label="Miền">
              {regionLabel(viewItem.region)}
            </Descriptions.Item>
            <Descriptions.Item label="Đơn vị">
              {Array.isArray(viewItem.unit_code)
                ? viewItem.unit_code
                    .map((v) => v.replace(/[\[\]"'`]/g, "").trim())
                    .join(", ")
                : "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tạo lúc">
              {fmt(viewItem.created_at)}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lúc">
              {fmt(viewItem.updated_at)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
