// app/admin/units/page.tsx
"use client";

import * as React from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { UnitFormDialog } from "./features/unit-form";
import { fetchUnits, createUnit, updateUnit, deleteUnit } from "./features/api";
import type { CreateUnitRequest } from "./features/api";
import type { Unit } from "./features/types";
// Ant Design
import {
  Tree,
  Tag,
  Tooltip,
  ConfigProvider,
  theme,
  Modal,
  Descriptions,
  Popconfirm,
} from "antd";
import type { DataNode } from "antd/es/tree";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
  FolderOutlined,
  FolderOpenOutlined,
} from "@ant-design/icons";

type UnitTreeNode = Unit & { children?: UnitTreeNode[] };

const regionLabel = (r: Unit["region"]) => {
  if (typeof r === "number") {
    return r === 1 ? "Bắc" : r === 2 ? "Trung" : r === 3 ? "Nam" : String(r);
  }
  switch (r) {
    case "bac":
      return "Bắc";
    case "trung":
      return "Trung";
    case "nam":
      return "Nam";
    default:
      return String(r);
  }
};

function buildTree(items: Unit[]): UnitTreeNode[] {
  const map = new Map<string, UnitTreeNode>();
  items.forEach((u) => map.set(u.unit_code, { ...u, children: [] }));

  const roots: UnitTreeNode[] = [];
  for (const node of map.values()) {
    const parentCode = node.parent_unit_code;

    // Root khi parent null / tự trỏ / parent không tồn tại
    if (!parentCode || parentCode === node.unit_code || !map.has(parentCode)) {
      roots.push(node);
    } else {
      map.get(parentCode)!.children!.push(node);
    }
  }

  // Sort theo level rồi theo tên
  const sortTree = (arr: UnitTreeNode[]) => {
    arr.sort(
      (a, b) =>
        a.level - b.level || a.unit_name.localeCompare(b.unit_name, "vi"),
    );
    arr.forEach((n) => n.children && sortTree(n.children));
  };
  sortTree(roots);
  return roots;
}

// Get color for level tag based on hierarchy
const getLevelColor = (level: number): string => {
  switch (level) {
    case 1:
      return "purple";   // Cấp cao nhất - màu tím đậm
    case 2:
      return "magenta";  // Cấp 2 - màu hồng tím
    case 3:
      return "volcano";  // Cấp 3 - màu đỏ cam
    case 4:
      return "orange";   // Cấp 4 - màu cam
    case 5:
      return "gold";     // Cấp 5 - màu vàng
    case 6:
      return "lime";     // Cấp 6 - màu vàng xanh
    case 7:
      return "green";    // Cấp 7 - màu xanh lá
    case 8:
      return "cyan";     // Cấp 8 - màu xanh dương nhạt
    default:
      return level < 1 ? "purple" : "cyan"; // < 1 = purple, > 8 = cyan
  }
};

// Convert UnitTreeNode to Ant Design Tree DataNode format
function convertToTreeData(nodes: UnitTreeNode[]): DataNode[] {
  return nodes.map((node) => ({
    key: node.unit_code,
    title: (
      <div className="flex items-center gap-3 py-1">
        {/* Level badge - hiển thị đầu tiên */}
        <Tag color={getLevelColor(node.level)}>L{node.level}</Tag>

        {/* Thông tin đơn vị */}
        <div className="flex-1">
          <div className="font-medium text-gray-900 dark:text-white">
            {node.unit_name}
          </div>
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Code: {node.unit_code}
          </div>
        </div>

        {/* Tags bổ sung */}
        <div className="flex items-center gap-2">
          <Tag color="blue">{regionLabel(node.region)}</Tag>
          {node.full_name && (
            <Tooltip title={node.full_name}>
              <Tag color="cyan" className=" truncate">
                {node.full_name}
              </Tag>
            </Tooltip>
          )}
        </div>
      </div>
    ),
    children: node.children?.length ? convertToTreeData(node.children) : undefined,
    // Store original data for actions
    data: node,
  }));
}

export default function UnitsPage() {
  const [items, setItems] = React.useState<Unit[]>([]);
  const [open, setOpen] = React.useState(false);
  const [editItem, setEditItem] = React.useState<Unit | null>(null);
  const [createDefaultValues, setCreateDefaultValues] = React.useState<
    Partial<Unit> | undefined
  >(undefined);

  // View modal state
  const [viewOpen, setViewOpen] = React.useState(false);
  const [viewItem, setViewItem] = React.useState<Unit | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = React.useState("");

  const load = React.useCallback(async () => {
    try {
      const res = await fetchUnits();
      setItems(res);
    } catch (err) {
      console.error("Lỗi tải dữ liệu đơn vị:", err);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  // Filter items based on search query
  const filteredItems = React.useMemo(() => {
    if (!searchQuery.trim()) return items;

    const query = searchQuery.toLowerCase();
    return items.filter((item) => {
      return (
        item.unit_name.toLowerCase().includes(query) ||
        item.unit_code.toLowerCase().includes(query) ||
        (item.full_name && item.full_name.toLowerCase().includes(query))
      );
    });
  }, [items, searchQuery]);

  const treeData = React.useMemo<UnitTreeNode[]>(
    () => buildTree(filteredItems),
    [filteredItems],
  );

  // Convert to Ant Design Tree format
  const treeDataNodes = React.useMemo<DataNode[]>(
    () => convertToTreeData(treeData),
    [treeData],
  );

  return (
    <div className="page-units grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Units</h1>
        <Button
          onClick={() => {
            setEditItem(null);
            setCreateDefaultValues(undefined);
            setOpen(true);
          }}
          className="inline-flex items-center gap-2"
        >
          <PlusOutlined />
          New Unit
        </Button>
      </div>

      {/* Search Bar */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
        <div className="relative">
          {/* Search Icon */}
          <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2">
            <svg
              className="h-4 w-4 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>

          <input
            className="w-full rounded-md border border-gray-300 bg-white pl-10 pr-10 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-primary/30 dark:border-dark-3 dark:bg-gray-900 dark:text-gray-100"
            placeholder="Tìm kiếm theo tên đơn vị, mã đơn vị hoặc tên đầy đủ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {/* Clear Button */}
          {searchQuery && (
            <button
              type="button"
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              onClick={() => setSearchQuery("")}
              title="Xóa tìm kiếm"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>

        {/* Result Count */}
        {searchQuery && (
          <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            {filteredItems.length > 0 ? (
              <>
                Tìm thấy <span className="font-medium">{filteredItems.length}</span> kết quả
              </>
            ) : (
              <span className="text-amber-600 dark:text-amber-400">
                Không tìm thấy kết quả
              </span>
            )}
          </div>
        )}
      </div>

      {/* Ant Design Tree */}
      <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-dark-3 dark:bg-gray-dark">
        <ConfigProvider>
          <Tree
            showLine
            showIcon={false}
            defaultExpandedKeys={["U3F7X9B2L1KD"]}
            treeData={treeDataNodes}
            className="units-tree"
          />
        </ConfigProvider>
      </div>

      {/* Form thêm/sửa */}
      <UnitFormDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setCreateDefaultValues(undefined);
        }}
        // @ts-ignore
        defaultValues={editItem ?? createDefaultValues ?? undefined}
        parentLocked={Boolean(
          !editItem && createDefaultValues?.parent_unit_code,
        )}
        onSubmit={async (v) => {
          if (editItem) {
            // @ts-ignore
            await updateUnit(editItem.unit_code, v);
          } else {
            // Only send the minimal payload expected by the backend
            const regionValue =
              typeof v.region === "number"
                ? v.region
                : v.region === "bac"
                  ? 1
                  : v.region === "trung"
                    ? 2
                    : 3;
            const payload: CreateUnitRequest = {
              parent_unit_code: v.parent_unit_code ?? undefined,
              region: regionValue,
              full_name: v.full_name ?? undefined,
              level: v.level ?? undefined,
              unit_name: v.unit_name,
            };
            await createUnit(payload);
          }
          load();
        }}
      />

      {/* Modal xem chi tiết */}
      <Modal
        className="unit-modal"
        open={viewOpen}
        onCancel={() => setViewOpen(false)}
        footer={null}
        title={viewItem ? `Chi tiết: ${viewItem.unit_name}` : "Chi tiết đơn vị"}
        centered
        width={720}
      >
        {viewItem && (
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="Mã đơn vị">
              {viewItem.unit_code || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên đơn vị">
              {viewItem.unit_name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Tên đầy đủ">
              {viewItem.full_name || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Miền">
              <Tag color="blue">{regionLabel(viewItem.region)}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Level">
              <Tag color={getLevelColor(viewItem.level ?? 1)}>
                Level {viewItem.level ?? "-"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Đơn vị cha">
              {viewItem.parent_unit_code || "-"}
            </Descriptions.Item>
            <Descriptions.Item label="Domains (log)">
              {Array.isArray(viewItem.domains_log) &&
                viewItem.domains_log.length > 0
                ? viewItem.domains_log.join(", ")
                : "0"}
            </Descriptions.Item>
            <Descriptions.Item label="Domains (update)">
              {Array.isArray(viewItem.domains_update) &&
                viewItem.domains_update.length > 0
                ? viewItem.domains_update.join(", ")
                : "0"}
            </Descriptions.Item>
            <Descriptions.Item label="Domains (control)">
              {Array.isArray(viewItem.domains_control) &&
                viewItem.domains_control.length > 0
                ? viewItem.domains_control.join(", ")
                : "0"}
            </Descriptions.Item>
            <Descriptions.Item label="Tạo lúc">
              {dayjs(viewItem.created_at).format("YYYY-MM-DD HH:mm")}
            </Descriptions.Item>
            <Descriptions.Item label="Cập nhật lúc">
              {dayjs(viewItem.updated_at).format("YYYY-MM-DD HH:mm")}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
}
