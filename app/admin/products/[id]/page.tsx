import { notFound } from "next/navigation";
import { store } from "@/lib/store";
import { TABLES, type Product, type ProductVariant } from "@/lib/models";
import { ProductForm } from "@/components/admin/ProductForm";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await store.findOne<Product>(TABLES.products, (p) => p.id === id);
  if (!product) notFound();
  const variants = await store.findMany<ProductVariant>(TABLES.variants, (v) => v.productId === id);

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Edit · {product.nameI18n.en}</h1>
      <div className="mt-8">
        <ProductForm
          initial={{
            id: product.id,
            slug: product.slug,
            nameI18n: product.nameI18n,
            descriptionI18n: product.descriptionI18n,
            priceCents: product.priceCents,
            currency: product.currency,
            stock: product.stock,
            isActive: product.isActive,
            weightGrams: product.weightGrams ?? null,
            images: product.images,
            defaultVariantSku: variants[0]?.sku ?? "",
          }}
        />
      </div>
    </div>
  );
}
