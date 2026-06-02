import { BlogForm } from "@/components/admin/BlogForm";

export default function NewPostPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-semibold tracking-tight">New blog post</h1>
      <div className="mt-8">
        <BlogForm />
      </div>
    </div>
  );
}
