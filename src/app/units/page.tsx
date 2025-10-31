// app/admin/units/page.tsx
"use client";

import * as React from "react";
import dayjs from "dayjs";
import { Button } from "@/components/ui/button";
import { UnitFormDialog } from "./features/unit-form";
import { fetchUnits, createUnit, updateUnit, deleteUnit } from "./features/api";
import type { Unit } from "./features/types";

// Ant Design
import { Table, Tag, Tooltip, ConfigProvider, theme } from "antd";
import type { ColumnsType } from "antd/es/table";

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

    // Trường hợp root: parent null hoặc tự trỏ vào chính nó
    if (!parentCode || parentCode === node.unit_code || !map.has(parentCode)) {
      roots.push(node);
    } else {
      map.get(parentCode)!.children!.push(node);
    }
  }

  // Sắp xếp nhẹ theo level và tên
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

  const load = React.useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetchUnits(token || "");
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
      width: 160,
      render: (_, r) => {
        const log = r.domains_log?.length ?? 0;
        const upd = r.domains_update?.length ?? 0;
        const ctl = r.domains_control?.length ?? 0;
        const any =
          (r.domains_log || r.domains_update || r.domains_control || [])
            .length > 0;

        const content = (
          <div className="space-y-1">
            {(r.domains_log || []).map((d) => (
              <div key={`log-${d}`}>{d}</div>
            ))}
            {(r.domains_update || []).map((d) => (
              <div key={`upd-${d}`}>{d}</div>
            ))}
            {(r.domains_control || []).map((d) => (
              <div key={`ctl-${d}`}>{d}</div>
            ))}
          </div>
        );

        const tags = (
          <div className="flex flex-wrap gap-1">
            <Tag>log: {log}</Tag>
            <Tag>update: {upd}</Tag>
            <Tag>control: {ctl}</Tag>
          </div>
        );

        return any ? <Tooltip title={content}>{tags}</Tooltip> : tags;
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
      width: 160,
      render: (_, u) => (
        <div className="flex gap-2">
          <Button
            // @ts-ignore
            variant="outline"
            onClick={() => alert(JSON.stringify(u, null, 2))}
          >
            Xem
          </Button>
          <Button
            onClick={() => {
              setEditItem(u);
              setOpen(true);
            }}
          >
            Sửa
          </Button>
          <Button
            // @ts-ignore
            variant="destructive"
            onClick={async () => {
              await deleteUnit(u.unit_code);
              load();
            }}
          >
            Xóa
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="grid gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Units</h1>
        <Button
          onClick={() => {
            setEditItem(null);
            setOpen(true);
          }}
        >
          New Unit
        </Button>
      </div>

      {/* AntD Table (tree) + Dark mode */}
      <ConfigProvider
        theme={{
          algorithm: theme.darkAlgorithm, // tôn trọng dark mode
          token: {
            // để Table hòa hợp với nền Tailwind dark
            colorBgContainer: "transparent",
            colorText: "inherit",
            colorBorderSecondary: "rgba(255,255,255,0.12)",
          },
        }}
      >
        <Table<UnitTreeNode>
          columns={columns}
          dataSource={treeData}
          rowKey="unit_code"
          pagination={false}
          size="middle"
          expandable={{
            defaultExpandAllRows: true,
            indentSize: 16,
          }}
          scroll={{ x: 980 }}
        />
      </ConfigProvider>

      <UnitFormDialog
        open={open}
        onOpenChange={setOpen}
        // @ts-ignore
        defaultValues={editItem ?? undefined}
        onSubmit={async (v) => {
          if (editItem) {
            // @ts-ignore

            await updateUnit(editItem.unit_code, v);
          } else {
            await createUnit({
              ...v,
              created_at: dayjs().toISOString(),
            } as Unit);
          }
          load();
        }}
      />
    </div>
  );
}
