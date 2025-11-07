// app/admin/units/page.tsx
"use client";

import * as React from "react";
import dayjs from "dayjs";
import {
  Table,
  Tag,
  Tooltip,
  Modal,
  Descriptions,
  Input,
  Select,
  Space,
  message,
  Popover,
  Button as AntButton,
  Typography,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EyeOutlined,
  CopyOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button } from "@/components/ui/button";

// 👉 dùng API ident thay vì units
import { fetchIdents } from "../ident/features/api"; // hoặc "@/features/ident/api"
import type { Ident, IdentPaginateResponse } from "../ident/features/types";

const { Paragraph, Text } = Typography;

const statusTag = (s?: string | null) => {
  const v = (s || "").toLowerCase();
  if (v === "actived" || v === "active" || v === "act")
    return <Tag color="green">Actived</Tag>;
  if (v === "deactived" || v === "inactive" || v === "deact")
    return <Tag color="red">Deactived</Tag>;
  return <Tag>{s || "-"}</Tag>;
};

const fmt = (v?: string | null) =>
  v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "-";

export default function IdentsPage() {
  const [data, setData] = React.useState<Ident[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(false);

  // bộ lọc cơ bản
  const [q, setQ] = React.useState<string>(""); // ô tìm kiếm nhanh
  const [status, setStatus] = React.useState<string | undefined>("act"); // mặc định act
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);

  // xem chi tiết
  const [viewOpen, setViewOpen] = React.useState(false);
  const [viewItem, setViewItem] = React.useState<Ident | null>(null);

  const buildFilter = React.useCallback(() => {
    const parts: string[] = [];
    if (status) {
      if (status === "act") parts.push(`status like 'act'`);
      else if (status === "deact") parts.push(`status like 'deact'`);
      else parts.push(`status like '${status}'`);
    }
    if (q?.trim()) {
      // đơn giản: tìm trong license | device_name | ip | mac | unit_code
      const safe = q.replace(/'/g, "''");
      parts.push(
        `(license like '%${safe}%' or device_name like '%${safe}%' or ip like '%${safe}%' or mac like '%${safe}%' or unit_code like '%${safe}%')`,
      );
    }
    return parts.length ? parts.join(" and ") : undefined;
  }, [q, status]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const filter = buildFilter() ?? "status like 'act'";
      const res: IdentPaginateResponse = await fetchIdents({
        filter,
        page,
        limit: pageSize,
      });
      setData(res.items || []);
      setTotal(res.countTotal || 0);
    } catch (e: any) {
      message.error(e?.message || "Không tải được dữ liệu");
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [buildFilter, page, pageSize]);

  React.useEffect(() => {
    load();
  }, [load]);

  const copy = async (text?: string | null, label = "đã copy") => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      message.success(label);
    } catch {
      message.warning("Không copy được");
    }
  };

  // ====== CỘT BẢNG (tối ưu hiển thị, chống tràn) ======
  const columns: ColumnsType<Ident> = [
    {
      title: "Thiết bị",
      dataIndex: "device_name",
      key: "device_name",
      width: 220,
      ellipsis: true,
      render: (v, r) => (
        <div className="flex flex-col">
          <Paragraph
            className="!mb-0"
            ellipsis={{ rows: 1, tooltip: v || "-" }}
          >
            {v || "-"}
          </Paragraph>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Unit: {r.unit_code || "-"}
          </Text>
        </div>
      ),
    },
    {
      title: "Người quản lý",
      dataIndex: "manager_name",
      key: "manager_name",
      width: 220,
      ellipsis: true,
    },
    {
      title: "License",
      dataIndex: "license",
      key: "license",
      width: 360,
      ellipsis: true,
      render: (v: string | null | undefined) =>
        v ? (
          <Paragraph
            className="!mb-0"
            copyable={{ text: v, tooltips: ["Copy license", "Đã copy"] }}
            ellipsis={{ rows: 1, tooltip: v }}
          >
            {v}
          </Paragraph>
        ) : (
          "-"
        ),
    },
    {
      title: "IP / MAC",
      key: "ipmac",
      width: 200,
      ellipsis: true,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <Paragraph
            className="!mb-1"
            ellipsis={{ rows: 1, tooltip: r.ip || "-" }}
          >
            IP: {r.ip || "-"}
          </Paragraph>
          <Paragraph
            className="!mb-0"
            ellipsis={{ rows: 1, tooltip: r.mac || "-" }}
          >
            MAC: {r.mac || "-"}
          </Paragraph>
        </div>
      ),
      responsive: ["md"],
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: statusTag,
    },
    {
      title: "Hoạt hóa / Tái hoạt",
      key: "act",
      width: 220,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <div>Actived: {fmt(r.actived_at)}</div>
          <div>Reactived: {fmt(r.reactived_at)}</div>
        </div>
      ),
      responsive: ["lg"],
    },
    {
      title: "Tạo / Cập nhật",
      key: "dates",
      width: 220,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <div>Tạo: {fmt(r.created_at)}</div>
          <div>Cập nhật: {fmt(r.updated_at)}</div>
        </div>
      ),
      responsive: ["lg"],
    },
    {
      title: "Token / UID",
      key: "token",
      width: 220,
      ellipsis: true,
      render: (_, r) => {
        const tokenBox = (label: string, val?: string | null) => (
          <Popover
            placement="topLeft"
            overlayStyle={{ maxWidth: 520 }}
            content={
              <div style={{ maxWidth: 500 }}>
                <div className="mb-1 font-medium">{label}</div>
                <Paragraph
                  className="!mb-2"
                  style={{ wordBreak: "break-word" }}
                  ellipsis={{ rows: 4, expandable: true, symbol: "Xem thêm" }}
                  copyable={
                    !!val ? { text: val, tooltips: ["Copy", "Đã copy"] } : false
                  }
                >
                  {val || "-"}
                </Paragraph>
              </div>
            }
            trigger="click"
          >
            <a>{label}</a>
          </Popover>
        );

        return (
          <Space size={8} wrap>
            {r.uid && (
              <Tooltip title="Copy UID">
                <a onClick={() => copy(r.uid, "Đã copy UID")}>
                  <CopyOutlined /> UID
                </a>
              </Tooltip>
            )}
            {tokenBox("token_info", r.token_info)}
            {tokenBox("token_domain", r.token_domain)}
          </Space>
        );
      },
      responsive: ["xl"],
    },
    {
      title: "Xem",
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_, r) => (
        <Tooltip title="Xem chi tiết">
          <Tag
            color="blue"
            icon={<EyeOutlined />}
            className="cursor-pointer"
            onClick={() => {
              setViewItem(r);
              setViewOpen(true);
            }}
          >
            Xem
          </Tag>
        </Tooltip>
      ),
    },
  ];

  return (
    <div className="page-ident container mx-auto p-4">
      <div className="borderp-4 rounded-2xl shadow-sm">
        {/* Header + bộ lọc */}
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <h1 className="text-xl font-semibold">Định danh thiết bị</h1>
          <Space wrap>
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Tìm license / thiết bị / IP / MAC / Unit"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onPressEnter={() => {
                setPage(1);
                load();
              }}
              style={{ width: 280 }}
            />
            <Select
              value={status}
              onChange={(v) => {
                setStatus(v);
                setPage(1);
              }}
              style={{ width: 160 }}
              options={[
                { value: "act", label: "Actived" },
                { value: "deact", label: "Deactived" },
                { value: "", label: "Tất cả" },
              ]}
              placeholder="Trạng thái"
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
          </Space>
        </div>

        {/* Vùng cuộn ngang an toàn cho bảng */}
        <div className="mt-4 w-full overflow-x-auto">
          <Table<Ident>
            columns={columns}
            dataSource={data}
            loading={loading}
            rowKey="id"
            size="middle"
            tableLayout="fixed" // 👈 để ellipsis hoạt động ổn định
            sticky={{ offsetHeader: 0 }}
            pagination={{
              current: page,
              pageSize,
              total,
              showSizeChanger: true,
              pageSizeOptions: [10, 20, 50, 100],
              onChange: (p, ps) => {
                setPage(p);
                setPageSize(ps);
              },
              showTotal: (t) => `Tổng: ${t}`,
            }}
            scroll={{ x: true }} // 👈 linh hoạt theo tổng độ rộng cột
          />
        </div>
      </div>

      {/* Modal chi tiết (gọn, chống tràn) */}
      <Modal
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        title={
          viewItem
            ? `Chi tiết: ${viewItem.device_name || viewItem.license || viewItem.id}`
            : "Chi tiết"
        }
        centered
        width={900}
        bodyStyle={{
          maxHeight: "70vh",
          overflow: "auto", // 👈 chống tràn nội dung modal
        }}
      >
        {viewItem && (
          <Descriptions
            column={{ xs: 1, md: 2 }}
            bordered
            size="small"
            labelStyle={{ width: 200 }}
            contentStyle={{
              wordBreak: "break-word", // 👈 vỡ dòng tự nhiên với token dài
              whiteSpace: "normal",
            }}
          >
            <Descriptions.Item label="ID">{viewItem.id}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {statusTag(viewItem.status)}
            </Descriptions.Item>

            <Descriptions.Item label="Thiết bị">
              {viewItem.device_name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Đơn vị">
              {viewItem.unit_code || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="License" span={2}>
              {viewItem.license ? (
                <Paragraph
                  className="!mb-0"
                  copyable={{
                    text: viewItem.license,
                    tooltips: ["Copy", "Đã copy"],
                  }}
                  ellipsis={{ rows: 1, tooltip: viewItem.license }}
                >
                  {viewItem.license}
                </Paragraph>
              ) : (
                "-"
              )}
            </Descriptions.Item>

            <Descriptions.Item label="UID" span={2}>
              {viewItem.uid ? (
                <Paragraph
                  className="!mb-0"
                  copyable={{
                    text: viewItem.uid,
                    tooltips: ["Copy", "Đã copy"],
                  }}
                  ellipsis={{ rows: 1, tooltip: viewItem.uid }}
                >
                  {viewItem.uid}
                </Paragraph>
              ) : (
                "-"
              )}
            </Descriptions.Item>

            <Descriptions.Item label="IP">
              {viewItem.ip || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="MAC">
              {viewItem.mac || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Actived at">
              {fmt(viewItem.actived_at)}
            </Descriptions.Item>
            <Descriptions.Item label="Reactived at">
              {fmt(viewItem.reactived_at)}
            </Descriptions.Item>

            <Descriptions.Item label="Tạo lúc">
              {fmt(viewItem.created_at)}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lúc">
              {fmt(viewItem.updated_at)}
            </Descriptions.Item>

            <Descriptions.Item label="Token Info" span={2}>
              {viewItem.token_info ? (
                <Paragraph
                  className="!mb-0"
                  style={{ wordBreak: "break-word" }}
                  ellipsis={{ rows: 3, expandable: true, symbol: "Xem thêm" }}
                  copyable={{
                    text: viewItem.token_info,
                    tooltips: ["Copy", "Đã copy"],
                  }}
                >
                  {viewItem.token_info}
                </Paragraph>
              ) : (
                "-"
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Token Domain" span={2}>
              {viewItem.token_domain ? (
                <Paragraph
                  className="!mb-0"
                  style={{ wordBreak: "break-word" }}
                  ellipsis={{ rows: 3, expandable: true, symbol: "Xem thêm" }}
                  copyable={{
                    text: viewItem.token_domain,
                    tooltips: ["Copy", "Đã copy"],
                  }}
                >
                  {viewItem.token_domain}
                </Paragraph>
              ) : (
                "-"
              )}
            </Descriptions.Item>

            <Descriptions.Item label="Manager">
              {viewItem.manager_name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Unit alias">
              {viewItem.unit || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="isSend">
              {String(viewItem.isSend ?? 0)}
            </Descriptions.Item>
            <Descriptions.Item label="sent_at">
              {fmt(viewItem.sent_at)}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
