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
  Tree,
  Spin,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import type { DataNode } from "antd/es/tree";
import {
  EyeOutlined,
  CopyOutlined,
  ReloadOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button } from "@/components/ui/button";
import { fetchUnits } from "../units/features/api";
import type { Unit } from "../units/features/types";

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

// ====== LEVEL COLOR HELPER ======
const getLevelColor = (level: number): { bg: string; text: string; border: string } => {
  const colors: Record<number, { bg: string; text: string; border: string }> = {
    1: { bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-300" },
    2: { bg: "bg-pink-100", text: "text-pink-700", border: "border-pink-300" },
    3: { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
    4: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-300" },
    5: { bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-300" },
    6: { bg: "bg-lime-100", text: "text-lime-700", border: "border-lime-300" },
    7: { bg: "bg-green-100", text: "text-green-700", border: "border-green-300" },
    8: { bg: "bg-cyan-100", text: "text-cyan-700", border: "border-cyan-300" },
  };
  return colors[level] || { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-300" };
};

// ====== BUILD TREE DATA TỪ DANH SÁCH UNIT ======
interface UnitTreeNode extends DataNode {
  key: string; // unit_code
  title: React.ReactNode;
  children?: UnitTreeNode[];
  unit: Unit;
}

function buildUnitTree(units: Unit[]): UnitTreeNode[] {
  const nodeMap = new Map<string, UnitTreeNode>();

  // Tạo node rời rạc ban đầu
  units.forEach((u) => {
    const c = getLevelColor(u.level);
    nodeMap.set(u.unit_code, {
      key: u.unit_code,
      title: (
        <div className="flex flex-col gap-[2px]">
          {/* Dòng 1: tên đơn vị + level */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-gray-800 dark:text-gray-200">
              {u.unit_name}
            </span>
            {u.level && (
              <span
                className={`rounded-full border px-2 py-[1px] text-[11px] font-semibold ${c.bg} ${c.text} ${c.border}`}
              >
                Level {u.level}
              </span>
            )}
          </div>

          {/* Dòng 2: mã + vùng */}
          <div className="text-[11px] text-gray-500">
            <span className="font-mono">{u.unit_code}</span>
            {u.region != null && <span className="ml-1">• Vùng {u.region}</span>}
          </div>

          {/* Dòng 3: tên đầy đủ (nếu có) */}
          {u.full_name && (
            <div className="text-[11px] text-gray-400">{u.full_name}</div>
          )}
        </div>
      ),
      unit: u,
      children: [],
    });
  });

  const roots: UnitTreeNode[] = [];

  units.forEach((u) => {
    const node = nodeMap.get(u.unit_code)!;

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

  return roots;
}

export default function IdentsPage() {
  const [data, setData] = React.useState<Ident[]>([]);
  const [total, setTotal] = React.useState<number>(0);
  const [loading, setLoading] = React.useState(false);

  // bộ lọc cơ bản
  const [q, setQ] = React.useState<string>(""); // ô tìm kiếm nhanh
  const [status, setStatus] = React.useState<string | undefined>("act"); // mặc định act
  const [page, setPage] = React.useState<number>(1);
  const [pageSize, setPageSize] = React.useState<number>(10);

  // 🆕 Lọc theo đơn vị
  const [selectedUnitCode, setSelectedUnitCode] = React.useState<string | null>(null);
  const [selectedUnitName, setSelectedUnitName] = React.useState<string | undefined>(undefined);

  // dữ liệu tree đơn vị
  const [unitTree, setUnitTree] = React.useState<UnitTreeNode[]>([]);
  const [unitLoading, setUnitLoading] = React.useState(false);

  // 🆕 Search trong tree
  const [searchTreeQuery, setSearchTreeQuery] = React.useState<string>("");

  // xem chi tiết
  const [viewOpen, setViewOpen] = React.useState(false);
  const [viewItem, setViewItem] = React.useState<Ident | null>(null);

  // ====== LOAD UNITS (once) ======
  React.useEffect(() => {
    const loadUnits = async () => {
      setUnitLoading(true);
      try {
        const units = await fetchUnits();
        const treeData = buildUnitTree(units || []);
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

  // ====== FILTER TREE BY SEARCH ======
  const filteredTree = React.useMemo(() => {
    if (!searchTreeQuery.trim()) return unitTree;

    const query = searchTreeQuery.toLowerCase();

    // Helper để check node hoặc children có match
    const matchNode = (node: UnitTreeNode): boolean => {
      const u = node.unit;
      const nameMatch = u.unit_name?.toLowerCase().includes(query);
      const codeMatch = u.unit_code?.toLowerCase().includes(query);
      const fullNameMatch = u.full_name?.toLowerCase().includes(query);

      return !!(nameMatch || codeMatch || fullNameMatch);
    };

    // Recursive filter giữ lại nodes match và parents của chúng
    const filterTree = (nodes: UnitTreeNode[]): UnitTreeNode[] => {
      const result: UnitTreeNode[] = [];

      nodes.forEach((node) => {
        const children = node.children ? filterTree(node.children) : [];
        const nodeMatches = matchNode(node);

        // Giữ node nếu: chính nó match HOẶC có children match
        if (nodeMatches || children.length > 0) {
          result.push({
            ...node,
            children: children.length > 0 ? children : undefined,
          });
        }
      });

      return result;
    };

    return filterTree(unitTree);
  }, [unitTree, searchTreeQuery]);

  // Auto expand keys khi search
  const expandedKeys = React.useMemo(() => {
    if (!searchTreeQuery.trim()) return [];

    const keys: string[] = [];
    const collectKeys = (nodes: UnitTreeNode[]) => {
      nodes.forEach((node) => {
        keys.push(node.key);
        if (node.children) collectKeys(node.children);
      });
    };
    collectKeys(filteredTree);
    return keys;
  }, [filteredTree, searchTreeQuery]);

  const buildFilter = React.useCallback(() => {
    const parts: string[] = [];

    // Filter by status
    if (status) {
      if (status === "act") parts.push(`status like 'act'`);
      else if (status === "deact") parts.push(`status like 'deact'`);
      else parts.push(`status like '${status}'`);
    }

    // 🆕 Filter by unit_code
    if (selectedUnitCode) {
      parts.push(`unit_code = '${selectedUnitCode}'`);
    }

    // Search query
    if (q?.trim()) {
      // đơn giản: tìm trong license | device_name | ip | mac | unit_code
      const safe = q.replace(/'/g, "''");
      parts.push(
        `(license like '%${safe}%' or device_name like '%${safe}%' or ip like '%${safe}%' or mac like '%${safe}%' or unit_code like '%${safe}%')`,
      );
    }
    return parts.length ? parts.join(" and ") : undefined;
  }, [q, status, selectedUnitCode]);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const filter = buildFilter() ?? "status like 'act'";
      const computedOffset = (page - 1) * pageSize;
      const res: IdentPaginateResponse = await fetchIdents({
        filter,
        page,
        limit: pageSize,
        offset: computedOffset,
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
      title: "#",
      key: "index",
      width: 64,
      render: (_: any, __: any, idx: number) => {
        const computedOffset = (page - 1) * pageSize;
        return computedOffset + idx + 1;
      },
    },
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
    // {
    //   title: "Hoạt hóa / Tái hoạt",
    //   key: "act",
    //   width: 220,
    //   render: (_, r) => (
    //     <div style={{ fontSize: 12 }}>
    //       <div>Actived: {fmt(r.actived_at)}</div>
    //       <div>Reactived: {fmt(r.reactived_at)}</div>
    //     </div>
    //   ),
    //   responsive: ["lg"],
    // },
    // {
    //   title: "Tạo / Cập nhật",
    //   key: "dates",
    //   width: 220,
    //   render: (_, r) => (
    //     <div style={{ fontSize: 12 }}>
    //       <div>Tạo: {fmt(r.created_at)}</div>
    //       <div>Cập nhật: {fmt(r.updated_at)}</div>
    //     </div>
    //   ),
    //   responsive: ["lg"],
    // },
    // {
    //   title: "Token / UID",
    //   key: "token",
    //   width: 220,
    //   ellipsis: true,
    //   render: (_, r) => {
    //     const tokenBox = (label: string, val?: string | null) => (
    //       <Popover
    //         placement="topLeft"
    //         overlayStyle={{ maxWidth: 520 }}
    //         content={
    //           <div style={{ maxWidth: 500 }}>
    //             <div className="mb-1 font-medium">{label}</div>
    //             <Paragraph
    //               className="!mb-2"
    //               style={{ wordBreak: "break-word" }}
    //               ellipsis={{ rows: 4, expandable: true, symbol: "Xem thêm" }}
    //               copyable={
    //                 !!val ? { text: val, tooltips: ["Copy", "Đã copy"] } : false
    //               }
    //             >
    //               {val || "-"}
    //             </Paragraph>
    //           </div>
    //         }
    //         trigger="click"
    //       >
    //         <a>{label}</a>
    //       </Popover>
    //     );

    //     return (
    //       <Space size={8} wrap>
    //         {r.uid && (
    //           <Tooltip title="Copy UID">
    //             <a onClick={() => copy(r.uid, "Đã copy UID")}>
    //               <CopyOutlined /> UID
    //             </a>
    //           </Tooltip>
    //         )}
    //         {tokenBox("token_info", r.token_info)}
    //         {tokenBox("token_domain", r.token_domain)}
    //       </Space>
    //     );
    //   },
    //   responsive: ["xl"],
    // },
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
      {/* Layout 2 cột: trái = cây đơn vị, phải = bảng ident */}
      <div className="flex flex-col gap-4 md:flex-row">

        {/* ====== CÂY ĐƠN VỊ ====== */}
        <div className="w-full md:w-[30%]">
          <div className="h-full rounded-2xl border bg-white p-4 shadow-sm dark:bg-[#0b1e2d]">
            <div className="mb-2 flex items-center justify-between gap-2">
              <h2 className="m-0 text-base font-semibold">Cây đơn vị</h2>
              <Button
                className="h-8 border-blue-500 px-3 text-xs text-blue-600 hover:bg-blue-50"
                onClick={() => {
                  setSelectedUnitCode(null);
                  setSelectedUnitName(undefined);
                  setPage(1);
                }}
              >
                Xóa lọc
              </Button>
            </div>
            {selectedUnitName && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                {selectedUnitName}
              </Text>
            )}

            {/* Search input */}
            <div className="mt-2">
              <Input
                allowClear
                prefix={<SearchOutlined />}
                placeholder="Tìm đơn vị..."
                value={searchTreeQuery}
                onChange={(e) => setSearchTreeQuery(e.target.value)}
                size="small"
              />
            </div>

            <div className="mt-2">
              {unitLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Spin />
                </div>
              ) : (
                <Tree
                  className="unit-tree"
                  treeData={filteredTree}
                  expandedKeys={searchTreeQuery.trim() ? expandedKeys : undefined}
                  autoExpandParent={!!searchTreeQuery.trim()}
                  blockNode
                  showLine={{ showLeafIcon: false }}
                  onSelect={(keys, info) => {
                    const key = (keys[0] as string) || undefined;
                    setSelectedUnitCode(key || null);
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

        {/* ====== BẢNG IDENT ====== */}
        <div className="w-full md:w-[70%]">
          {/* Header + bộ lọc */}
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-xl font-semibold">
                Định danh thiết bị
                {selectedUnitCode && (
                  <span className="ml-2 text-sm font-normal text-gray-500">
                    (Đơn vị: {selectedUnitCode})
                  </span>
                )}
              </h1>
            </div>
            <Space wrap>
              {selectedUnitCode && (
                <Button
                  onClick={() => {
                    setSelectedUnitCode(null);
                    setPage(1);
                  }}
                  className="border-gray-300 bg-white text-sm hover:bg-gray-50"
                >
                  ✕ Bỏ lọc đơn vị
                </Button>
              )}
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
          overflow: "auto",
        }}
      >
        {viewItem && (
          <Table
            size="small"
            bordered
            pagination={false}
            rowKey="key"
            columns={[
              {
                title: "Trường",
                dataIndex: "label",
                key: "label",
                width: 220,
              },
              {
                title: "Giá trị",
                dataIndex: "value",
                key: "value",
              },
            ]}
            dataSource={[
              {
                key: "id",
                label: "ID",
                value: viewItem.id || "-",
              },
              {
                key: "status",
                label: "Trạng thái",
                value: statusTag(viewItem.status),
              },
              {
                key: "device",
                label: "Thiết bị",
                value: viewItem.device_name || "-",
              },
              {
                key: "unit_code",
                label: "Đơn vị",
                value: viewItem.unit_code || "-",
              },
              {
                key: "license",
                label: "License",
                value: viewItem.license ? (
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
                ),
              },
              {
                key: "uid",
                label: "UID",
                value: viewItem.uid ? (
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
                ),
              },
              {
                key: "ip",
                label: "IP",
                value: viewItem.ip || "-",
              },
              {
                key: "mac",
                label: "MAC",
                value: viewItem.mac || "-",
              },
              {
                key: "actived_at",
                label: "Actived at",
                value: fmt(viewItem.actived_at),
              },
              {
                key: "reactived_at",
                label: "Reactived at",
                value: fmt(viewItem.reactived_at),
              },
              {
                key: "created_at",
                label: "Tạo lúc",
                value: fmt(viewItem.created_at),
              },
              {
                key: "updated_at",
                label: "Cập nhật lúc",
                value: fmt(viewItem.updated_at),
              },
              {
                key: "token_info",
                label: "Token Info",
                value: viewItem.token_info ? (
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
                ),
              },
              {
                key: "token_domain",
                label: "Token Domain",
                value: viewItem.token_domain ? (
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
                ),
              },
              {
                key: "manager_name",
                label: "Manager",
                value: viewItem.manager_name || "-",
              },
              {
                key: "unit",
                label: "Unit alias",
                value: viewItem.unit || "-",
              },
              {
                key: "isSend",
                label: "isSend",
                value: String(viewItem.isSend ?? 0),
              },
              {
                key: "sent_at",
                label: "sent_at",
                value: fmt(viewItem.sent_at),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
}
