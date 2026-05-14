"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import type { AdminCategoryNode, AdminProductDetail } from "@repo/shared";
import {
  createAdminProduct,
  fetchAdminCategories,
  fetchAdminProduct,
  presignAdminUpload,
  updateAdminProduct,
  uploadPresignedFile,
} from "@/lib/admin-client";

type ProductFormProps = {
  productId?: string;
};

export function AdminProductFormClient({ productId }: ProductFormProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<AdminCategoryNode[]>([]);
  const [product, setProduct] = useState<AdminProductDetail | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [categoryId, setCategoryId] = useState("");
  const [name, setName] = useState("");
  const [sku, setSku] = useState("");
  const [shortDescription, setShortDescription] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [brand, setBrand] = useState("");
  const [specsText, setSpecsText] = useState("{}");
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    fetchAdminCategories()
      .then((data) => setCategories(data))
      .catch((fetchError) => {
        setError(fetchError instanceof Error ? fetchError.message : "Không tải được danh mục.");
      });
  }, []);

  useEffect(() => {
    if (!productId) {
      return;
    }

    fetchAdminProduct(productId)
      .then((data) => {
        setProduct(data);
        setCategoryId(data.category.id);
        setName(data.name);
        setSku(data.sku);
        setShortDescription(data.shortDescription);
        setDescription(data.description);
        setPrice(data.price);
        setStock(data.stock);
        setBrand(data.brand);
        setSpecsText(JSON.stringify(data.specs, null, 2));
        setImageUrl(data.images[0]?.url ?? "");
      })
      .catch((fetchError) => {
        setError(fetchError instanceof Error ? fetchError.message : "Không tải được sản phẩm.");
      });
  }, [productId]);

  async function handleImageUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const presign = await presignAdminUpload({
        filename: file.name,
        contentType: file.type || "application/octet-stream",
        folder: "products",
      });
      await uploadPresignedFile(presign, file);
      setImageUrl(presign.publicUrl);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Không upload được ảnh.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);

    let specs: Record<string, string | number | boolean> = {};
    try {
      specs = JSON.parse(specsText) as Record<string, string | number | boolean>;
    } catch {
      setError("Specs JSON không hợp lệ.");
      setSaving(false);
      return;
    }

    const payload = {
      categoryId,
      name,
      sku,
      shortDescription,
      description,
      price,
      stock,
      brand,
      specs,
      isActive: true,
      images: imageUrl ? [{ url: imageUrl, sortOrder: 0, alt: name }] : [],
    };

    try {
      if (productId) {
        await updateAdminProduct(productId, payload);
      } else {
        await createAdminProduct(payload);
      }

      router.push("/admin/products");
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Không lưu được sản phẩm.");
    } finally {
      setSaving(false);
    }
  }

  const flatCategories = flattenCategories(categories);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">
          {productId ? `Sửa ${product?.name ?? "sản phẩm"}` : "Thêm sản phẩm"}
        </h2>
        <Link href="/admin/products" className="text-sm text-sky-700 hover:underline">
          Quay lại
        </Link>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Danh mục
        <select
          value={categoryId}
          onChange={(event) => setCategoryId(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
          required
        >
          <option value="">Chọn danh mục</option>
          {flatCategories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </select>
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Tên
        <input
          value={name}
          onChange={(event) => setName(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
          required
        />
      </label>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          SKU
          <input
            value={sku}
            onChange={(event) => setSku(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Thương hiệu
          <input
            value={brand}
            onChange={(event) => setBrand(event.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            required
          />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm font-medium text-slate-700">
          Giá (VND)
          <input
            type="number"
            value={price}
            onChange={(event) => setPrice(Number(event.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            min={0}
            required
          />
        </label>
        <label className="block text-sm font-medium text-slate-700">
          Tồn kho
          <input
            type="number"
            value={stock}
            onChange={(event) => setStock(Number(event.target.value))}
            className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
            min={0}
            required
          />
        </label>
      </div>

      <label className="block text-sm font-medium text-slate-700">
        Mô tả ngắn
        <textarea
          value={shortDescription}
          onChange={(event) => setShortDescription(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
          rows={2}
          required
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Mô tả chi tiết
        <textarea
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2"
          rows={5}
          required
        />
      </label>

      <label className="block text-sm font-medium text-slate-700">
        Specs JSON
        <textarea
          value={specsText}
          onChange={(event) => setSpecsText(event.target.value)}
          className="mt-1 w-full rounded-xl border border-slate-300 px-3 py-2 font-mono text-xs"
          rows={6}
        />
      </label>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-slate-700">
          Ảnh sản phẩm
          <input type="file" accept="image/*" onChange={handleImageUpload} className="mt-1 block" />
        </label>
        {uploading ? <p className="text-sm text-slate-500">Đang upload...</p> : null}
        {imageUrl ? <p className="break-all text-xs text-slate-500">{imageUrl}</p> : null}
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <button
        type="submit"
        disabled={saving}
        className="rounded-xl bg-sky-700 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
      >
        {saving ? "Đang lưu..." : "Lưu sản phẩm"}
      </button>
    </form>
  );
}

function flattenCategories(nodes: AdminCategoryNode[]): AdminCategoryNode[] {
  return nodes.flatMap((node) => [node, ...flattenCategories(node.children)]);
}