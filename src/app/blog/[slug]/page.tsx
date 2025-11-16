import React from "react";
import Image from "next/image";
import { Metadata } from "next";
import { backendUrl } from "@/utils/axios";
import moment from "moment";
import { notFound } from "next/navigation";

type BlogResponse = {
  blog: {
    title: string;
    slug: string;
    author?: string;
    excerpt?: string;
    content: string;
    coverImage: string;
    publishedAt?: string;
    metaTitle?: string;
    metaDescription?: string;
    blogCategory?: {
      name?: string;
    };
  };
};

const fetchBlog = async (slug: string) => {
  const res = await fetch(`${backendUrl}/blog/getBlogBySlug/${slug}`, {
    next: {
      revalidate: 120,
    },
  });

  if (res.status === 404) {
    return null;
  }

  if (!res.ok) {
    throw new Error("Failed to fetch blog");
  }

  const data: BlogResponse = await res.json();
  return data.blog;
};

export async function generateStaticParams() {
  try {
    const res = await fetch(`${backendUrl}/blog/getBlogs?limit=1000`, {
      next: { revalidate: 300 },
    });
    if (!res.ok) {
      return [];
    }
    const data = await res.json();
    return (data?.blogs || []).map((blog: any) => ({
      slug: blog?.slug,
    }));
  } catch (error) {
    console.log(error);
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  try {
    const blog = await fetchBlog(params.slug);
    if (!blog) {
      return {
        title: "Blog",
      };
    }
    return {
      title: blog.metaTitle || blog.title,
      description: blog.metaDescription || blog.excerpt,
      openGraph: {
        title: blog.metaTitle || blog.title,
        description: blog.metaDescription || blog.excerpt,
        images: blog.coverImage ? [blog.coverImage] : undefined,
      },
    };
  } catch (error) {
    console.log(error);
    return {
      title: "Blog",
    };
  }
}

export default async function Page({
  params,
}: {
  params: { slug: string };
}) {
  const blog = await fetchBlog(params.slug);

  if (!blog) {
    notFound();
  }

  return (
    <section className="pt-8 mt-16 spartan pb-16 lg:pt-16 lg:pb-24 bg-white dark:bg-gray-900 antialiased">
      <div className="flex justify-between px-4 mx-auto max-w-screen-xl ">
        <article className="mx-auto w-full max-w-2xl format format-sm sm:format-base lg:format-lg format-blue dark:format-invert">
          <header className="mb-4 lg:mb-6 not-format">
            <div className="flex flex-col gap-6">
              {blog.coverImage ? (
                <div className="relative w-full h-72 md:h-96 rounded-3xl overflow-hidden">
                  <Image
                    src={blog.coverImage}
                    alt={blog.title}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
              ) : null}
              <div className="flex flex-col gap-2">
                <span className="uppercase text-xs tracking-widest text-orange-500">
                  {blog.blogCategory?.name || "Blog"}
                </span>
                <h1 className="mb-2 spartan text-3xl font-extrabold leading-tight text-gray-900 lg:text-4xl dark:text-white">
                  {blog.title}
                </h1>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>By {blog.author || "Admin"}</span>
                  {blog.publishedAt ? (
                    <span>
                      {moment(blog.publishedAt).format("D MMMM, YYYY")}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>
          </header>
          <div
            className="prose spartan max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>
      </div>
    </section>
  );
}
