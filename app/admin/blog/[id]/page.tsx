import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db, schema } from "@/lib/db";
import { BlogForm } from "@/components/admin/BlogForm";

export default async function EditPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post] = await db.select().from(schema.blogPosts).where(eq(schema.blogPosts.id, id));
  if (!post) notFound();
  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-semibold tracking-tight">Edit · {post.titleI18n.en}</h1>
      <div className="mt-8">
        <BlogForm
          initial={{
            id: post.id,
            slug: post.slug,
            titleI18n: post.titleI18n,
            excerptI18n: post.excerptI18n,
            bodyI18n: post.bodyI18n,
            coverUrl: post.coverUrl,
            coverAlt: post.coverAlt,
            tags: post.tags,
            published: !!post.publishedAt,
          }}
        />
      </div>
    </div>
  );
}
