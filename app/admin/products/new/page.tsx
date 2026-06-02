import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">New product</h1>
      <p className="mt-1 text-sm text-neutral-500">
        All fields edited in both Italian and English. Default variant SKU is required so the product is immediately purchasable.
      </p>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
