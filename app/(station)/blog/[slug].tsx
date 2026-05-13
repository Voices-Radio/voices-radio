import { getBlogs } from '@/sanity.client';
import { PortableText } from '@portabletext/react';

export async function getStaticPaths() {
  const blogs = await getBlogs();
  const paths = blogs.map((blog) => ({
    params: { slug: blog.slug.current },
  }));
  return { paths, fallback: false };
}

export async function getStaticProps({ params }) {
  const blogs = await getBlogs();
  const blog = blogs.find((b) => b.slug.current === params.slug);
  return { props: { blog } };
}

export default function BlogDetails({ blog }) {
  return (
    <main className="bg-voices-beige">
      <article className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="text-3xl font-bold mb-4">{blog.title}</h1>
        <p className="text-sm text-gray-500">
          By {blog.author} | {new Date(blog.publishedAt).toLocaleDateString()}
        </p>
        <img src={urlForImage(blog.mainImage).url()} alt={blog.title} className="my-6 rounded-lg" />
        <div className="prose">
          <PortableText value={blog.content} />
        </div>
      </article>
    </main>
  );
}
