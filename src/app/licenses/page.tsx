// app/admin/license/page.tsx
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
  InputNumber,
  Select,
  Space,
  message,
  Popover,
  Typography,
  Tree,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { DataNode } from "antd/es/tree";
import { EyeOutlined, ReloadOutlined, SearchOutlined } from "@ant-design/icons";
import { Button } from "@/components/ui/button";

import { fetchLicenses } from "./features/api";
import { fetchUnits } from "../units/features/api";
import { createIdents } from "../ident/features/api";
import type { Unit } from "../units/features/types";

import type { License, LicensePaginateResponse } from "./features/types";

const { Paragraph, Text } = Typography;

const statusTag = (s?: string | null) => {
  const v = (s || "").toLowerCase();
  if (v === "actived" || v === "active" || v === "act")
    return <Tag color="green">Actived</Tag>;
  if (v === "deactived" || v === "inactive" || v === "deact")
    return <Tag color="red">Deactived</Tag>;
  if (v === "new") return <Tag color="blue">New</Tag>;
  return <Tag>{s || "-"}</Tag>;
};

const fmt = (v?: string | null) =>
  v ? dayjs(v).format("YYYY-MM-DD HH:mm") : "-";

// ====== BUILD TREE DATA TỪ DANH SÁCH UNIT ======
interface UnitTreeNode extends DataNode {
  key: string; // unit_code
  title: React.ReactNode;
  children?: UnitTreeNode[];
  unit: Unit;
}

function buildUnitTree(units: Unit[]): {
  treeData: UnitTreeNode[];
  unitMap: Map<string, Unit>;
} {
  const unitMap = new Map<string, Unit>();
  units.forEach((u) => {
    unitMap.set(u.unit_code, u);
  });

  const nodeMap = new Map<string, UnitTreeNode>();

  // tạo node rời rạc ban đầu
  units.forEach((u) => {
    nodeMap.set(u.unit_code, {
      key: u.unit_code,
      title: (
        <span>
          {u.unit_name}
          {/*  */}
          {/* <Text type="secondary" style={{ marginLeft: 4, fontSize: 12 }}>
            ({u.level})
          </Text> */}
        </span>
      ),
      unit: u,
      children: [],
    });
  });

  const roots: UnitTreeNode[] = [];

  units.forEach((u) => {
    const node = nodeMap.get(u.unit_code)!;

    // root nếu:
    // - parent_unit_code không tồn tại trong map
    // - hoặc parent_unit_code === unit_code (trường hợp self-root như U3F7X9B2L1KD)
    if (
      !u.parent_unit_code ||
      u.parent_unit_code === u.unit_code ||
      !nodeMap.has(u.parent_unit_code)
    ) {
      roots.push(node);
    } else {
      const parent = nodeMap.get(u.parent_unit_code);
      if (parent) {
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    }
  });

  return { treeData: roots, unitMap };
}

export default function LicensesPage() {
  const [data, setData] = React.useState<License[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(false);

  // bộ lọc license
  const [q, setQ] = React.useState<string>("");
  const [status, setStatus] = React.useState<string | undefined>("new"); // default new
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);

  // filter theo đơn vị
  const [selectedUnitCode, setSelectedUnitCode] = React.useState<
    string | undefined
  >(undefined);
  const [selectedUnitName, setSelectedUnitName] = React.useState<
    string | undefined
  >(undefined);

  // dữ liệu tree đơn vị
  const [unitTree, setUnitTree] = React.useState<UnitTreeNode[]>([]);
  const [unitLoading, setUnitLoading] = React.useState(false);

  // xem chi tiết license
  const [viewOpen, setViewOpen] = React.useState(false);
  const [viewItem, setViewItem] = React.useState<License | null>(null);

  // tạo license (batch) cho đơn vị
  const [createOpen, setCreateOpen] = React.useState(false);
  const [createQuantity, setCreateQuantity] = React.useState<number>(1);
  const [createRegion, setCreateRegion] = React.useState<number | undefined>(1);
  const [createLoading, setCreateLoading] = React.useState(false);

  // ====== LOAD UNITS (once) ======
  React.useEffect(() => {
    const loadUnits = async () => {
      setUnitLoading(true);
      try {
        const units = await fetchUnits();
        const { treeData } = buildUnitTree(units || []);

        setUnitTree(treeData);
      } catch (e: any) {
        console.error(e);
        message.error(e?.message || "Không tải được cây đơn vị");
      } finally {
        setUnitLoading(false);
      }
    };
    loadUnits();
  }, []);

  // ====== BUILD FILTER ======
  const buildFilter = React.useCallback(() => {
    const parts: string[] = [];

    // filter status
    if (status) {
      parts.push(`status like '${status}'`);
    }

    // filter theo đơn vị
    if (selectedUnitCode) {
      // đơn giản: unit_code đúng đơn vị được chọn
      parts.push(`unit_code like '${selectedUnitCode}'`);
      // Nếu muốn sau này lọc luôn cả "con" thì có thể build thêm IN (...)
    }

    // search text
    if (q?.trim()) {
      const safe = q.replace(/'/g, "''");
      parts.push(
        `(license like '%${safe}%' 
          or unit_code like '%${safe}%'
          or device_name like '%${safe}%'
          or manager_name like '%${safe}%'
          or ip like '%${safe}%'
          or mac like '%${safe}%')`,
      );
    }

    return parts.length ? parts.join(" and ") : undefined;
  }, [q, status, selectedUnitCode]);

  // ====== LOAD LICENSES ======
  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const filter = buildFilter() ?? "status like 'new'";
      const computedOffset = (page - 1) * pageSize;
      const res: LicensePaginateResponse = await fetchLicenses({
        filter,
        page,
        limit: pageSize,
        offset: computedOffset,
      });
      setData(res.items || []);
      setTotal(res.countTotal || 0);
    } catch (e: any) {
      console.error(e);
      message.error(e?.message || "Không tải được dữ liệu license");
    } finally {
      setLoading(false);
    }
  }, [buildFilter, page, pageSize]);

  React.useEffect(() => {
    load();
  }, [load]);

  const copy = async (text?: string | null, label = "Đã copy") => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      message.success(label);
    } catch {
      message.warning("Không copy được");
    }
  };

  // ====== CỘT BẢNG ======
  const columns: ColumnsType<License> = [
    {
      title: "#",
      key: "index",
      width: 64,
      render: (_: any, __: any, idx: number) => {
        const computedOffset = (page - 1) * pageSize;
        return computedOffset + idx + 1;
      },
    },
    {
      title: "License",
      dataIndex: "license",
      key: "license",
      width: 320,
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
      title: "Đơn vị",
      dataIndex: "unit_code",
      key: "unit_code",
      width: 240,
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
            {r.unit || r.region
              ? `Alias: ${r.unit || "-"} • Vùng: ${r.region ?? "-"}`
              : ""}
          </Text>
        </div>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
      key: "status",
      width: 120,
      render: statusTag,
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
      title: "Re-issue / Send",
      key: "reissue",
      width: 160,
      render: (_, r) => (
        <div style={{ fontSize: 12 }}>
          <div>Đã cấp lại: {r.reissue_count ?? 0}</div>
          <div>Gửi mail: {String(r.isSend ?? 0)}</div>
        </div>
      ),
      responsive: ["lg"],
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
    <div className="page-license container mx-auto p-4">
      {/* Layout 2 cột: trái = cây đơn vị, phải = bảng license */}
      <div className="flex flex-col gap-4 md:flex-row">
        {/* ====== CÂY ĐƠN VỊ ====== */}
        <div className="w-full md:w-[30%]">
          <div className="h-full rounded-2xl border bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="m-0 text-base font-semibold">Cây đơn vị</h2>
              <div className="flex items-center gap-2">
                <Button
                  className="h-8 border-blue-500 px-3 text-xs text-blue-600 hover:bg-blue-50"
                  onClick={() => {
                    setSelectedUnitCode(undefined);
                    setSelectedUnitName(undefined);
                    setPage(1);
                  }}
                >
                  Xóa lọc
                </Button>
                <Button
                  className="h-8 border-transparent bg-blue-600 px-3 text-xs text-white hover:bg-blue-700"
                  onClick={() => setCreateOpen(true)}
                  disabled={!selectedUnitCode}
                >
                  Tạo license
                </Button>
              </div>
            </div>
            {selectedUnitName && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {selectedUnitName}
              </Text>
            )}
            <div className="mt-2 max-h-[70vh] overflow-auto">
              {unitLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spin />
                </div>
              ) : (
                <Tree
                  treeData={unitTree}
                  defaultExpandAll
                  height={500}
                  onSelect={(keys, info) => {
                    const key = (keys[0] as string) || undefined;
                    setSelectedUnitCode(key);
                    const node = info.node as UnitTreeNode;
                    const u = node.unit;
                    setSelectedUnitName(u?.full_name || u?.unit_name || key);
                    setPage(1);
                  }}
                />
              )}
            </div>
          </div>
        </div>

        {/* ====== BẢNG LICENSE ====== */}
        <div className="w-full md:w-[70%]">
          <div className="rounded-2xl border p-4 shadow-sm">
            {/* Header + bộ lọc */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <h1 className="text-xl font-semibold">Quản lý License</h1>
              <Space wrap>
                <Input
                  allowClear
                  prefix={<SearchOutlined />}
                  placeholder="Tìm license / đơn vị / IP / MAC / thiết bị"
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
                  style={{ width: 180 }}
                  options={[
                    { value: "new", label: "New" },
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

            {/* Bảng */}
            <div className="mt-4 w-full overflow-x-auto">
              <Table<License>
                columns={columns}
                dataSource={data}
                loading={loading}
                rowKey="id"
                size="middle"
                tableLayout="fixed"
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
                scroll={{ x: true }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Modal tạo license */}
      <Modal
        open={createOpen}
        title={`Tạo license cho: ${selectedUnitName ?? selectedUnitCode ?? "-"}`}
        onCancel={() => setCreateOpen(false)}
        okText="Tạo"
        cancelText="Hủy"
        centered
        confirmLoading={createLoading}
        onOk={async () => {
          if (!selectedUnitCode) return message.warning("Chưa chọn đơn vị");
          if (!createQuantity || createQuantity <= 0)
            return message.warning("Số lượng phải lớn hơn 0");

          try {
            setCreateLoading(true);
            await createIdents({
              unit_code: selectedUnitCode,
              quantity: createQuantity,
              region: createRegion as number,
            });
            message.success("Tạo license thành công");
            setCreateOpen(false);
            // reload list
            setPage(1);
            await load();
          } catch (e: any) {
            console.error(e);
            message.error(e?.message || "Không tạo được license");
          } finally {
            setCreateLoading(false);
          }
        }}
      >
        <div className="space-y-3">
          {/* <div>
            <label className="text-sm text-gray-600">Đơn vị</label>
            <div className="mt-1">
              {selectedUnitName ?? selectedUnitCode ?? "-"}
            </div>
          </div> */}

          <div>
            <label className="text-sm text-gray-600">Số lượng</label>
            <div className="mt-1">
              <InputNumber
                min={1}
                value={createQuantity}
                onChange={(v) => setCreateQuantity(Number(v) || 1)}
                style={{ width: 160 }}
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-gray-600">Vùng</label>
            <div className="mt-1">
              <Select
                value={createRegion}
                onChange={(v) => setCreateRegion(Number(v))}
                style={{ width: 160 }}
                options={[
                  { value: 1, label: "1" },
                  { value: 2, label: "2" },
                  { value: 3, label: "3" },
                ]}
              />
            </div>
          </div>
        </div>
      </Modal>

      {/* Modal chi tiết */}
      <Modal
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        title={
          viewItem
            ? `Chi tiết license: ${
                viewItem.license || viewItem.unit_code || viewItem.id
              }`
            : "Chi tiết"
        }
        centered
        width={900}
        bodyStyle={{
          maxHeight: "70vh",
          overflow: "auto",
        }}
      >
        {viewItem && (
          <Descriptions
            column={{ xs: 1, md: 2 }}
            bordered
            size="small"
            labelStyle={{ width: 200 }}
            contentStyle={{
              wordBreak: "break-word",
              whiteSpace: "normal",
            }}
          >
            <Descriptions.Item label="ID">{viewItem.id}</Descriptions.Item>
            <Descriptions.Item label="Trạng thái">
              {statusTag(viewItem.status)}
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

            <Descriptions.Item label="Đơn vị">
              {viewItem.unit_code || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Unit alias">
              {viewItem.unit || "-"}
            </Descriptions.Item>

            <Descriptions.Item label="Thiết bị">
              {viewItem.device_name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Người quản lý">
              {viewItem.manager_name || "-"}
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

            <Descriptions.Item label="Region">
              {viewItem.region ?? "-"}
            </Descriptions.Item>
            <Descriptions.Item label="UID">
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

            <Descriptions.Item label="isSend">
              {String(viewItem.isSend ?? 0)}
            </Descriptions.Item>
            <Descriptions.Item label="sent_at">
              {fmt(viewItem.sent_at)}
            </Descriptions.Item>

            <Descriptions.Item label="resent_at" span={2}>
              {fmt(viewItem.resent_at)}
            </Descriptions.Item>

            <Descriptions.Item label="reissue_count" span={2}>
              {viewItem.reissue_count ?? 0}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
