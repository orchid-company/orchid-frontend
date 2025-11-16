"use client";

import React, { useEffect, useState } from "react";
import { backendUrl } from "@/utils/axios";
import Link from "next/link";
import Image from "next/image";
import { Pagination } from "@mui/material";
import toast from "react-hot-toast";
import axios from "axios";
import moment from "moment";

type Blog = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  publishedAt?: string;
  blogCategory?: {
    name?: string;
  };
};

const PAGE_SIZE = 8;

const BlogsList = () => {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  const getAllBlogs = async () => {
    try {
      setLoading(true);
      const { data } = await axios.get(
        `${backendUrl}/blog/getBlogs?page=${page}&limit=${PAGE_SIZE}`
      );
      setBlogs(data?.blogs || []);
      setTotalPages(data?.totalPages || 1);
    } catch (error: any) {
      console.log(error);
      toast.error(error?.response?.data?.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getAllBlogs();
  }, [page]);

  return (
    <section className="flex items-center py-16 bg-white lg:py-20 font-poppins dark:bg-gray-900 ">
      <div className="justify-center flex-1 max-w-7xl px-4 py-4 mx-auto text-left lg:py-10 ">
        <div className="mb-10 text-center">
          <span className="block mb-4 text-xs font-semibold leading-4 tracking-widest text-center text-orange-500 uppercase dark:text-gray-400">
            Our blog
          </span>
          <h1 className="text-3xl font-bold capitalize dark:text-white">
            Blog List
          </h1>
        </div>
        {loading && blogs.length === 0 ? (
          <div className="w-full flex justify-center py-10">
            <p className="text-gray-500 inter">Loading blogs...</p>
          </div>
        ) : (
          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8">
            {blogs?.map((blog) => (
              <Link
                key={blog._id}
                href={`/blog/${blog?.slug}`}
                className="grid grid-cols-1 mb-6 md:grid-cols-[40%,1fr] border-gray-200 rounded-md border dark:border-gray-800 gap-2 hover:shadow-lg transition-shadow"
              >
                <div className="relative h-64 md:h-full">
                  <Image
                    src={blog?.coverImage}
                    alt={blog?.title}
                    className="object-cover w-full h-full rounded-md"
                    width={600}
                    height={600}
                  />
                </div>
                <div className="px-4 py-6 lg:px-6 flex flex-col gap-4">
                  <div className="flex flex-col gap-2">
                    <span className="text-sm font-medium text-blue-600 uppercase tracking-wide">
                      {blog?.blogCategory?.name || "Blog"}
                    </span>
                    <span className="text-xs font-medium text-gray-500">
                      {blog?.publishedAt
                        ? moment(blog?.publishedAt).format("D MMMM, YYYY")
                        : "Coming soon"}
                    </span>
                  </div>
                  <div className="w-8 pb-1 border-b border-gray-200 dark:border-gray-700" />
                  <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 line-clamp-2">
                    {blog?.title}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-3">
                    {blog?.excerpt}
                  </p>
                  <span className="text-sm text-primary font-medium">
                    Read more →
                  </span>
                </div>
              </Link>
            ))}
            {!loading && blogs.length === 0 ? (
              <div className="col-span-full flex justify-center py-10">
                <p className="text-gray-500 inter">
                  No blogs found. Please check back later.
                </p>
              </div>
            ) : null}
          </div>
        )}
        {totalPages > 1 ? (
          <div className="w-full flex justify-end mt-8">
            <Pagination
              count={totalPages}
              variant="outlined"
              shape="rounded"
              color="primary"
              sx={{
                "& .MuiPaginationItem-root": { color: "#f97215" },
                "& .Mui-selected": {
                  backgroundColor: "#f97215",
                  color: "#fff",
                },
                "& .MuiPaginationItem-root:hover": {
                  backgroundColor: "#f97215",
                  color: "#fff",
                  border: "none",
                },
              }}
              onChange={(_event, value) => setPage(value)}
            />
          </div>
        ) : null}
      </div>
    </section>
  );
};

export default BlogsList;
