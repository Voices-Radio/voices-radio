import Image from "next/image";
import { getBlogs } from "@/sanity.client";
import { urlForImage } from "@/sanity.image";
import { PortableText } from "@portabletext/react";

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
      <article className="mx-auto max-w-5xl px-6 py-12">
        <h1 className="mb-4 text-3xl font-bold">{blog.title}</h1>
        <p className="text-sm text-gray-500">
          By {blog.author} | {new Date(blog.publishedAt).toLocaleDateString()}
        </p>
        <Image
          src={urlForImage(blog.mainImage).url()}
          alt={blog.title}
          width={1200}
          height={630}
          className="my-6 rounded-lg"
        />
        <div className="prose">
          <PortableText value={blog.content} />
        </div>
      </article>
    </main>
  );
}
