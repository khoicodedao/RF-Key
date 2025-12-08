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
  Table,
  Tag,
  Tooltip,
  ConfigProvider,
  theme,
  Modal,
  Descriptions,
  Popconfirm,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import {
  EyeOutlined,
  EditOutlined,
  DeleteOutlined,
  PlusOutlined,
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

  const treeData = React.useMemo<UnitTreeNode[]>(
    () => buildTree(items),
    [items],
  );

  const columns: ColumnsType<UnitTreeNode> = [
    {
      title: "#",
      key: "index",
      width: 64,
      render: (_: any, __: any, idx: number) => idx + 1,
    },
    {
      title: "Đơn vị",
      dataIndex: "unit_name",
      key: "unit_name",
      render: (_, record) => (
        <div className="flex flex-col">
          <span className="font-medium">{record.unit_name}</span>
          <span className="text-xs opacity-70">Code: {record.unit_code}</span>
        </div>
      ),
    },
    {
      title: "Tên đầy đủ",
      dataIndex: "full_name",
      key: "full_name",
      ellipsis: true,
    },
    {
      title: "Miền",
      dataIndex: "region",
      key: "region",
      width: 90,
      render: (r) => <Tag>{regionLabel(r)}</Tag>,
    },
    {
      title: "Level",
      dataIndex: "level",
      key: "level",
      width: 80,
      sorter: (a, b) => a.level - b.level,
    },
    {
      title: "Domains",
      key: "domains",
      width: 180,
      render: (_, r) => {
        const log = r.domains_log?.length ?? 0;
        const upd = r.domains_update?.length ?? 0;
        const ctl = r.domains_control?.length ?? 0;
        const hasAny =
          (r.domains_log?.length || 0) +
            (r.domains_update?.length || 0) +
            (r.domains_control?.length || 0) >
          0;

        const content = (
          <div className="space-y-1">
            {(r.domains_log || []).map((d) => (
              <div key={`log-${d}`}>log: {d}</div>
            ))}
            {(r.domains_update || []).map((d) => (
              <div key={`upd-${d}`}>update: {d}</div>
            ))}
            {(r.domains_control || []).map((d) => (
              <div key={`ctl-${d}`}>control: {d}</div>
            ))}
          </div>
        );

        const tags = (
          <div className="flex flex-wrap items-center gap-1">
            <Tag>log: {log}</Tag>
            <Tag>update: {upd}</Tag>
            <Tag>control: {ctl}</Tag>
          </div>
        );

        return hasAny ? <Tooltip title={content}>{tags}</Tooltip> : tags;
      },
    },
    {
      title: "Tạo / Cập nhật",
      key: "dates",
      width: 220,
      render: (_, r) => (
        <div className="text-xs">
          <div>Tạo: {dayjs(r.created_at).format("YYYY-MM-DD HH:mm")}</div>
          <div>Cập nhật: {dayjs(r.updated_at).format("YYYY-MM-DD HH:mm")}</div>
        </div>
      ),
    },
    {
      title: "Thao tác",
      key: "actions",
      fixed: "right",
      width: 220,
      render: (_, u) => (
        <div className="flex items-center gap-2">
          {/* Xem chi tiết */}
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

          {/* Sửa */}
          <Tooltip title="Sửa đơn vị">
            <Tag
              color="orange"
              icon={<EditOutlined />}
              className="cursor-pointer"
              onClick={() => {
                setCreateDefaultValues(undefined);
                setEditItem(u);
                setOpen(true);
              }}
            >
              Sửa
            </Tag>
          </Tooltip>

          {/* Thêm con */}
          <Tooltip title="Thêm đơn vị con">
            <Tag
              color="green"
              icon={<PlusOutlined />}
              className="cursor-pointer"
              onClick={() => {
                setEditItem(null);
                setCreateDefaultValues({
                  parent_unit_code: u.unit_code,
                  region:
                    typeof u.region === "number"
                      ? u.region === 1
                        ? "bac"
                        : u.region === 2
                          ? "trung"
                          : "nam"
                      : (u.region as any),
                  level: typeof u.level === "number" ? u.level + 1 : u.level,
                });
                setOpen(true);
              }}
            >
              Thêm con
            </Tag>
          </Tooltip>

          {/* Xóa với xác nhận */}
          <Popconfirm
            title="Xóa đơn vị"
            description={`Bạn có chắc muốn xóa "${u.unit_name}"?`}
            okText="Xóa"
            cancelText="Hủy"
            onConfirm={async () => {
              await deleteUnit(u.unit_code);
              load();
            }}
          >
            <Tooltip title="Xóa đơn vị">
              <Tag
                color="red"
                icon={<DeleteOutlined />}
                className="cursor-pointer"
              >
                Xóa
              </Tag>
            </Tooltip>
          </Popconfirm>
        </div>
      ),
    },
  ];

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

      {/* AntD Table (tree) + Dark mode */}
      <ConfigProvider>
        <Table<UnitTreeNode>
          columns={columns}
          dataSource={treeData}
          rowKey="unit_code"
          pagination={false}
          size="middle"
          expandable={{
            defaultExpandedRowKeys: ["U3F7X9B2L1KD"], // ✅ expand đúng node này
          }}
          scroll={{ x: 980 }}
        />
      </ConfigProvider>

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
                width: 200,
              },
              {
                title: "Giá trị",
                dataIndex: "value",
                key: "value",
              },
            ]}
            dataSource={[
              {
                key: "unit_code",
                label: "Mã đơn vị",
                value: viewItem.unit_code || "-",
              },
              {
                key: "unit_name",
                label: "Tên đơn vị",
                value: viewItem.unit_name || "-",
              },
              {
                key: "full_name",
                label: "Tên đầy đủ",
                value: viewItem.full_name || "-",
              },
              {
                key: "region",
                label: "Miền",
                value: regionLabel(viewItem.region),
              },
              {
                key: "level",
                label: "Level",
                value: viewItem.level ?? "-",
              },
              {
                key: "parent_unit_code",
                label: "Đơn vị cha",
                value: viewItem.parent_unit_code || "-",
              },
              {
                key: "domains_log",
                label: "Domains (log)",
                value:
                  Array.isArray(viewItem.domains_log) &&
                  viewItem.domains_log.length > 0
                    ? viewItem.domains_log.join(", ")
                    : "0",
              },
              {
                key: "domains_update",
                label: "Domains (update)",
                value:
                  Array.isArray(viewItem.domains_update) &&
                  viewItem.domains_update.length > 0
                    ? viewItem.domains_update.join(", ")
                    : "0",
              },
              {
                key: "domains_control",
                label: "Domains (control)",
                value:
                  Array.isArray(viewItem.domains_control) &&
                  viewItem.domains_control.length > 0
                    ? viewItem.domains_control.join(", ")
                    : "0",
              },
              {
                key: "created_at",
                label: "Tạo lúc",
                value: dayjs(viewItem.created_at).format("YYYY-MM-DD HH:mm"),
              },
              {
                key: "updated_at",
                label: "Cập nhật lúc",
                value: dayjs(viewItem.updated_at).format("YYYY-MM-DD HH:mm"),
              },
            ]}
            // Nếu muốn zebra row:
            // rowClassName={(_, index) => (index % 2 === 0 ? "bg-gray-50" : "")}
          />
        )}
      </Modal>
    </div>
  );
}
