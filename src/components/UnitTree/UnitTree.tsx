// src/components/UnitTree/UnitTree.tsx
"use client";
import * as React from "react";

/** ===== Types khớp API /api/units ===== */
export type Unit = {
  unit_code: string;
  parent_unit_code: string | null;
  unit_name: string;
  full_name: string;
  region: "bac" | "trung" | "nam";
  level: number;
  created_at: string;
  updated_at: string;
};

export type UnitNode = Unit & { children?: UnitNode[] };

export type UnitTreeProps = {
  items?: Unit[]; // nếu truyền thì KHÔNG fetch
  fetchUrl?: string; // mặc định /api/units
  fetchOnMount?: boolean; // true = tự fetch khi mount (nếu không có items)
  renderLabel?: (anyUnit: Unit) => React.ReactNode;
  onSelect?: (unit: Unit) => void;
  onToggle?: (unit: Unit, isOpen: boolean) => void;
  selectedUnitCode?: string;
  className?: string;
  collapsible?: boolean; // cho phép thu gọn node
  defaultOpenAll?: boolean; // mở tất cả lúc khởi tạo
  searchable?: boolean; // có ô tìm kiếm
  searchPlaceholder?: string; // placeholder ô tìm kiếm
  sortBy?: "unit_name" | "unit_code" | "level" | null;
};

/** ===== Helper: classnames đơn giản ===== */
function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

/** ===== Helper: build tree từ mảng phẳng ===== */
function buildTree(
  flat: Unit[],
  sortBy: UnitTreeProps["sortBy"] = "unit_name",
): UnitNode[] {
  const map = new Map<string, UnitNode>();
  flat.forEach((u) => map.set(u.unit_code, { ...u, children: [] }));

  const roots: UnitNode[] = [];
  for (const node of map.values()) {
    if (node.parent_unit_code && map.has(node.parent_unit_code)) {
      map.get(node.parent_unit_code)!.children!.push(node);
    } else {
      roots.push(node);
    }
  }

  const sortFn =
    sortBy === "unit_name"
      ? (a: UnitNode, b: UnitNode) =>
          a.unit_name.localeCompare(b.unit_name, "vi")
      : sortBy === "unit_code"
        ? (a: UnitNode, b: UnitNode) =>
            a.unit_code.localeCompare(b.unit_code, "vi")
        : sortBy === "level"
          ? (a: UnitNode, b: UnitNode) => a.level - b.level
          : null;

  const sortDeep = (nodes?: UnitNode[]) => {
    if (!nodes || nodes.length === 0) return;
    if (sortFn) nodes.sort(sortFn);
    nodes.forEach((n) => sortDeep(n.children));
  };
  sortDeep(roots);

  return roots;
}

/** ===== UI: 1 item trong tree ===== */
function TreeItem({
  node,
  depth,
  openState,
  setOpenState,
  onSelect,
  onToggle,
  collapsible,
  selectedUnitCode,
}: {
  node: UnitNode;
  depth: number;
  openState: Record<string, boolean>;
  setOpenState: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  onSelect?: (u: Unit) => void;
  onToggle?: (u: Unit, isOpen: boolean) => void;
  collapsible: boolean;
  selectedUnitCode?: string;
}) {
  const hasChildren = !!node.children?.length;
  const isOpen = openState[node.unit_code] ?? true;
  const isSelected = selectedUnitCode === node.unit_code;

  const toggle = (next?: boolean) => {
    const v = typeof next === "boolean" ? next : !isOpen;
    setOpenState((s) => ({ ...s, [node.unit_code]: v }));
    onToggle?.(node, v);
  };

  return (
    <div className="select-none">
      <div
        className={cn(
          "text-foreground flex items-center gap-2 rounded-md px-2 py-1 text-sm",
          isSelected
            ? "bg-primary/10 ring-1 ring-primary/30"
            : "hover:bg-muted",
        )}
        style={{ paddingLeft: depth * 12 + 8 }}
      >
        {hasChildren && collapsible ? (
          <button
            type="button"
            className={cn(
              "inline-flex h-5 w-5 shrink-0 items-center justify-center",
              "border-border bg-background text-muted-foreground rounded border",
            )}
            onClick={(e) => {
              e.stopPropagation();
              toggle();
            }}
            title={isOpen ? "Collapse" : "Expand"}
          >
            {isOpen ? "−" : "+"}
          </button>
        ) : (
          <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center opacity-60">
            •
          </span>
        )}

        <button
          type="button"
          className={cn(
            "truncate text-left hover:underline",
            isSelected && "font-medium",
          )}
          title={node.full_name || node.unit_name}
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(node);
          }}
        >
          {node.unit_name}{" "}
          <span className="opacity-60">({node.unit_code})</span>
        </button>
      </div>

      {hasChildren && (!collapsible || isOpen) && (
        <div className="mt-1">
          {node.children!.map((child) => (
            <TreeItem
              key={child.unit_code}
              node={child}
              depth={depth + 1}
              openState={openState}
              setOpenState={setOpenState}
              onSelect={onSelect}
              onToggle={onToggle}
              collapsible={collapsible}
              selectedUnitCode={selectedUnitCode}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/** ===== Component chính: UnitTree (dùng chung) ===== */
export function UnitTree({
  items,
  fetchUrl = "/api/units",
  fetchOnMount = true,
  renderLabel,
  onSelect,
  onToggle,
  selectedUnitCode,
  className,
  collapsible = true,
  defaultOpenAll = true,
  searchable = true,
  searchPlaceholder = "Tìm đơn vị…",
  sortBy = "unit_name",
}: UnitTreeProps) {
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [units, setUnits] = React.useState<Unit[] | null>(items ?? null);
  const [query, setQuery] = React.useState("");
  const [openState, setOpenState] = React.useState<Record<string, boolean>>({});
  const initOpenRef = React.useRef(false); // tránh init open nhiều lần

  // Fetch nếu không truyền items
  React.useEffect(() => {
    if (items) {
      setUnits(items);
      return;
    }
    if (!fetchOnMount) return;

    let mounted = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(fetchUrl, { cache: "no-store" });
        if (!res.ok)
          throw new Error(`Fetch ${fetchUrl} failed (${res.status})`);
        const data = await res.json();
        if (mounted) setUnits(Array.isArray(data.items) ? data.items : []);
      } catch (e: any) {
        if (mounted) setError(e?.message ?? "Unknown error");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [items, fetchOnMount, fetchUrl]);

  // Tính tree thuần
  const tree = React.useMemo(() => {
    const list = units ?? [];
    const filtered =
      query.trim().length === 0
        ? list
        : list.filter((u) => {
            const q = query.toLowerCase();
            return (
              u.unit_name.toLowerCase().includes(q) ||
              u.full_name.toLowerCase().includes(q) ||
              u.unit_code.toLowerCase().includes(q)
            );
          });

    return buildTree(filtered, sortBy);
  }, [units, query, sortBy]);

  // Khởi tạo openState: mở tất cả lần đầu
  React.useEffect(() => {
    if (!defaultOpenAll) return;
    if (!tree.length) return;
    if (initOpenRef.current) return;

    const next: Record<string, boolean> = {};
    const walk = (nodes: UnitNode[]) => {
      nodes.forEach((n) => {
        next[n.unit_code] = true;
        if (n.children?.length) walk(n.children);
      });
    };
    walk(tree);
    setOpenState(next);
    initOpenRef.current = true;
  }, [defaultOpenAll, tree]);

  return (
    <div
      className={cn(
        "border-border text-foreground rounded-lg border bg-white p-2 dark:border-dark-3 dark:bg-gray-dark dark:shadow-card",
        className,
      )}
      role="tree"
      aria-label="Unit tree"
    >
      <div className="mb-2 flex items-center justify-between px-2">
        <div className="text-sm font-medium opacity-80">
          {renderLabel ? renderLabel({} as Unit) : "Cây đơn vị"}
        </div>
        {collapsible && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="border-border hover:bg-muted rounded border px-2 py-1 text-xs"
              onClick={() => {
                const next: Record<string, boolean> = {};
                const markAll = (nodes: UnitNode[]) => {
                  nodes.forEach((n) => {
                    next[n.unit_code] = true;
                    if (n.children?.length) markAll(n.children);
                  });
                };
                markAll(tree);
                setOpenState(next);
              }}
            >
              Mở tất cả
            </button>
            <button
              type="button"
              className="border-border hover:bg-muted rounded border px-2 py-1 text-xs"
              onClick={() => {
                const next: Record<string, boolean> = {};
                const markAll = (nodes: UnitNode[]) => {
                  nodes.forEach((n) => {
                    next[n.unit_code] = false;
                    if (n.children?.length) markAll(n.children);
                  });
                };
                markAll(tree);
                setOpenState(next);
              }}
            >
              Đóng tất cả
            </button>
          </div>
        )}
      </div>

      {searchable && (
        <div className="mb-2 px-2">
          <input
            className={cn(
              "border-border bg-background w-full rounded-md border px-3 py-2 text-sm outline-none",
              "placeholder:text-muted-foreground focus:ring-ring focus:ring-2",
            )}
            placeholder={searchPlaceholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      )}

      {loading ? (
        <div className="text-muted-foreground p-3 text-sm">
          Đang tải dữ liệu…
        </div>
      ) : error ? (
        <div className="p-3 text-sm text-red-500">Lỗi: {error}</div>
      ) : tree.length === 0 ? (
        <div className="text-muted-foreground p-3 text-sm">
          Không có dữ liệu
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-auto pr-1">
          {tree.map((n) => (
            <TreeItem
              key={n.unit_code}
              node={n}
              depth={0}
              openState={openState}
              setOpenState={setOpenState}
              onSelect={onSelect}
              onToggle={onToggle}
              collapsible={collapsible}
              selectedUnitCode={selectedUnitCode}
            />
          ))}
        </div>
      )}
    </div>
  );
}
