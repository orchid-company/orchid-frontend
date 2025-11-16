import Categories from "@/components/Category/Categories";
import Services from "@/components/Category/Services";
import Image from "next/image";
import { backendUrl } from "@/utils/axios";
import { Metadata } from "next";
import { safeFetchJson } from "@/lib/safeFetch";

export async function generateStaticParams() {
  try {
    const { data, response } = await safeFetchJson<{
      categories?: Array<{ slug: string }>;
    }>(`${backendUrl}/category/getAllCategories`, {
      next: { revalidate: 60 * 60 },
    });

    if (!data?.categories?.length) {
      console.warn(
        "[category/[id]/generateStaticParams] Falling back to empty list. " +
          `status=${response.status} content-type=${response.headers.get(
            "content-type"
          )}`
      );
      return [];
    }

    return data.categories
      .filter((category) => category?.slug)
      .map((category) => ({ id: category.slug }));
  } catch (error) {
    console.error(
      "[category/[id]/generateStaticParams] Failed to fetch category slugs",
      error
    );
    return [];
  }
}

async function getSingleCategory(id: string) {
  const url = `${backendUrl}/category/getCategoryBySlug/${id}`;
  const { data, response } = await safeFetchJson<{ category?: any }>(url, {
    next: { revalidate: 60 * 10 },
  });

  if (!data?.category) {
    console.error(
      `[getSingleCategory] Missing category for slug=${id}. status=${response.status}`
    );
    throw new Error(`Failed to fetch category for slug: ${id}`);
  }

  return data.category;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const slug = params.id;

  try {
    const { data } = await safeFetchJson<{ category?: any }>(
      `${backendUrl}/category/getCategoryBySlug/${slug}`,
      {
        next: { revalidate: 60 * 10 },
      }
    );
    const category = data?.category;

    if (!category) {
      throw new Error("Category not found");
    }

    return {
      title: category?.title ?? "Orchid Services",
      description:
        category?.metaDescription ??
        "Discover Orchid’s curated services tailored to your needs.",
    };
  } catch (error) {
    console.error(
      "[category/[id]/generateMetadata] Failed to build metadata",
      error
    );
    return {
      title: "Orchid Services",
      description: "Discover Orchid’s curated services tailored to your needs.",
    };
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const category = await getSingleCategory(params.id);

  return (
    <>
      <div className="w-full flex flex-col gap-16 md:py-28 ">
        <div className="w-full px-8 mt-20 sm:px-12 md:px-20 lg:px-32 py-16 flex flex-col gap-12 md:gap-20">
          <div className="w-full grid-cols-1  grid sm:grid-cols-2 gap-12 items-start">
            <Image
              src={category?.image}
              width={600}
              height={600}
              alt={category?.name}
              className="rounded-3xl cursor-pointer  "
            />
            <div className="w-full flex flex-col gap-8">
              <h1 className="inter text-3xl text-primary font-semibold">
                {category?.name}
              </h1>
              <div
                className="w-full text-gray-600 inter text-base "
                dangerouslySetInnerHTML={{
                  __html: category?.description || "",
                }}
              ></div>
            </div>
          </div>
        </div>
        <Categories id={params.id} />
        <Services id={params.id} />
      </div>
    </>
  );
}
