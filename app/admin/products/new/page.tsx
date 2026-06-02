import { ProductForm } from "@/components/admin/ProductForm";

export default function NewProductPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-semibold tracking-tight">Nuovo prodotto</h1>
      <p className="mt-1 text-sm text-neutral-500">
        Compila i campi in italiano e inglese. Lo SKU della variante predefinita è obbligatorio per rendere il prodotto subito acquistabile.
      </p>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
