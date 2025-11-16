import Image from "next/image";
import Link from "next/link";
import { backendUrl } from "@/utils/axios";
import { safeFetchJson } from "@/lib/safeFetch";

type BlogPreview = {
  _id: string;
  title: string;
  slug: string;
  excerpt: string;
  coverImage: string;
  author?: string;
  publishedAt?: string;
};

const formatDate = (date?: string) => {
  if (!date) return "Coming soon";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
};

const fetchRecentBlogs = async (): Promise<BlogPreview[]> => {
  try {
    const { data, response } = await safeFetchJson<{
      blogs?: BlogPreview[];
    }>(`${backendUrl}/blog/getBlogs?limit=3`, {
      next: { revalidate: 180 },
    });

    if (!response.ok || !data?.blogs) {
      console.warn(
        `[RecentBlogs] No blogs returned. status=${response.status}`
      );
      return [];
    }

    return data.blogs;
  } catch (error) {
    console.error("[RecentBlogs] Failed to fetch blogs", error);
    return [];
  }
};

const RecentBlogs = async () => {
  const blogs = await fetchRecentBlogs();

  return (
    <div className="w-full px-8 sm:px-12 md:px-20 lg:px-32 py-16 flex flex-col gap-12">
      <div className="w-full flex md:flex-row flex-col justify-between gap-2">
        <div className="flex flex-col gap-4 md:items-start items-center">
          <h6 className="spartan text-xl text-blue uppercase tracking-widest font-medium">
            Blogs
          </h6>
          <h4 className="font-bold text-4xl text-primary inter tracking-wide ">
            Recent Blogs
          </h4>
        </div>
        <p className="text-gray-400 inter break-words text-lg font-light md:text-start text-center md:w-1/2">
          Stay updated with our latest insights and stories. Our blog section
          brings you a fresh perspective on everyday challenges, offering tips,
          industry news, and in-depth articles to enrich your knowledge.
        </p>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        {blogs.length === 0 ? (
          <div className="col-span-full flex justify-center text-gray-500 inter">
            No blogs published yet. Check back soon!
          </div>
        ) : (
          blogs.map((blog) => (
            <Link
              key={blog._id}
              href={`/blog/${blog.slug}`}
              className="hover-effect bg-[#f8f5ff] border border-[#dddddd] w-full flex flex-col rounded-[35px] overflow-hidden transition-shadow hover:shadow-xl"
            >
              <div className="relative w-full h-56">
                <Image
                  src={blog.coverImage}
                  alt={blog.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 33vw"
                  priority
                />
              </div>
              <div className="flex flex-col gap-4 w-full py-8 px-6">
                <div className="flex justify-between w-full items-center ">
                  <p className="text-blue spartan text-lg">
                    {formatDate(blog.publishedAt)}
                  </p>
                  <p className="text-blue spartan text-lg">
                    By | {blog.author || "Admin"}
                  </p>
                </div>
                <hr className="border border-[#ddd]" />
                <div className="flex flex-col gap-4">
                  <h6 className="font-semibold inter text-xl text-blue line-clamp-2">
                    {blog.title}
                  </h6>
                  <p className="text-gray-500 inter text-md tracking-wide line-clamp-3">
                    {blog.excerpt}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default RecentBlogs;
