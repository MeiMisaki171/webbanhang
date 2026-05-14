"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { AdminCategoryNode } from "@repo/shared";
import {
  createAdminCategory,
  deleteAdminCategory,
  fetchAdminCategories,
  updateAdminCategory,
} from "@/lib/admin-client";

function CategoryTree({
  nodes,
  depth,
  onEdit,
  onDelete,
}: {
  nodes: AdminCategoryNode[];
  depth: number;
  onEdit: (node: AdminCategoryNode) => void;
  onDelete: (id: string) => void;
}) {
  return (
    <ul className={depth === 0 ? "space-y-2" : "mt-2 space-y-2 border-l border-slate-200 pl-4"}>
      {nodes.map((node) => (
        <li key={node.id} className="rounded-xl border border-slate-200 bg-white p-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="font-medium text-slate-900">{node.name}</p>
              <p className="text-xs text-slate-500">
                {node.slug} · {node.isActive ? "Đang hiển thị" : "Ẩn"}
              </p>
            </div>
            <div className="flex gap-2 text-sm">
              <button
                type="button"
                onClick={() => onEdit(node)}
                className="rounded-lg border border-slate-200 px-3 py-1 hover:border-sky-300"
              >
                Sửa
              </button>
              <button
                type="button"
                onClick={() => onDelete(node.id)}
                className="rounded-lg border border-red-200 px-3 py-1 text-red-700 hover:bg-red-50"
              >
                Xóa
              </button>
            </div>
          </div>
          {node.children.length > 0 ? (
            <CategoryTree
              nodes={node.children}
              depth={depth + 1}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ) : null}
        </li>
      ))}
    </ul>
  );
}

export function AdminCategoriesClient() {
  const [categories, setCategories] = useState<AdminCategoryNode[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  async function loadCategories() {
    const data = await fetchAdminCategories();
    setCategories(data);
  }

  useEffect(() => {
    loadCategories().catch((fetchError) => {
      setError(fetchError instanceof Error ? fetchError.message : "Không tải được danh mục.");
    });
  }, []);

  const flatCategories = flattenCategories(categories);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const payload = {
      name,
      parentId: parentId || null,
      sortOrder: 0,
      isActive: true,
    };

    try {
      if (editingId) {
        await updateAdminCategory(editingId, payload);
      } else {
        await createAdminCategory(payload);
      }

      setName("");
      setParentId("");
      setEditingId(null);
      await loadCategories();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không lưu được danh mục.");
    }
  }

  async function handleDelete(id: string) {
    setError(null);
    try {
      await deleteAdminCategory(id);
      await loadCategories();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Không xóa được danh mục.");
    }
  }

  if (error && categories.length === 0) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700">
        <p>{error}</p>
        <Link href="/admin/login" className="mt-3 inline-block text-sm font-medium underline">
          Đăng nhập admin
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5">
        <h2 className="text-lg font-semibold text-slate-900">
          {editingId ? "Cập nhật danh mục" : "Thêm danh mục"}
        </h2>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Tên
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <label className="mt-4 block text-sm font-medium text-slate-700">
          Danh mục cha
          <select
            value={parentId}
            onChange={(event) => setParentId(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
          >
            <option value="">Không có</option>
            {flatCategories
              .filter((category) => category.id !== editingId)
              .map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
          </select>
        </label>
        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          className="mt-5 w-full rounded-xl bg-sky-700 px-4 py-2 text-sm font-medium text-white"
        >
          {editingId ? "Lưu thay đổi" : "Tạo danh mục"}
        </button>
      </form>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-slate-900">Cây danh mục</h2>
        <CategoryTree
          nodes={categories}
          depth={0}
          onEdit={(node) => {
            setEditingId(node.id);
            setName(node.name);
            setParentId(node.parentId ?? "");
          }}
          onDelete={handleDelete}
        />
      </section>
    </div>
  );
}

function flattenCategories(nodes: AdminCategoryNode[]): AdminCategoryNode[] {
  return nodes.flatMap((node) => [node, ...flattenCategories(node.children)]);
}
