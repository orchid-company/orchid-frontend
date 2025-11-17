import { MetadataRoute } from "next";
import { backendUrl, frontendUrl } from "@/utils/axios";
import { safeFetchJson } from "@/lib/safeFetch";

type SitemapEntry = MetadataRoute.Sitemap[number];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries: SitemapEntry[] = [
    {
      url: `${frontendUrl}/`,
      lastModified: new Date().toISOString(),
      changeFrequency: "never" as const,
      priority: 1,
    },
    {
      url: `${frontendUrl}/about-us`,
      lastModified: new Date().toISOString(),
      changeFrequency: "never" as const,
      priority: 0.9,
    },
    // {
    //   loc: `${frontendUrl}/privacy-policy`,
    //   lastmod: new Date().toISOString(),
    //   changefreq: "never",
    //   priority: 0.9,
    // },
    // {
    //   loc: `${frontendUrl}/terms-and-conditions`,
    //   lastmod: new Date().toISOString(),
    //   changefreq: "never",
    //   priority: 0.9,
    // },
    // {
    //   loc: `${frontendUrl}/faq`,
    //   lastmod: new Date().toISOString(),
    //   changefreq: "never",
    //   priority: 0.9,
    // },
  ];

  const dynamicEntries = await generateSitemapObjects();

  return [...staticEntries, ...dynamicEntries];
}

const generateSitemapObjects = async (): Promise<SitemapEntry[]> => {
  try {
    const { data: categoryData, response: categoryResponse } =
      await safeFetchJson<{ categories?: Array<{ slug: string }> }>(
        `${backendUrl}/category/getAllCategories`,
        {
          next: { revalidate: 60 * 60 },
        }
      );

    const { data: serviceData, response: serviceResponse } = await safeFetchJson<{
      services?: Array<{ slug: string }>;
    }>(`${backendUrl}/service/getAllServicesId`, {
      next: { revalidate: 60 * 60 },
    });

    if (!categoryResponse.ok || !serviceResponse.ok) {
      console.warn(
        `[sitemap] Upstream responded with errors. categoryStatus=${categoryResponse.status} serviceStatus=${serviceResponse.status}`
      );
    }

    const categories = categoryData?.categories ?? [];
    const services = serviceData?.services ?? [];

    const categorySitemap: SitemapEntry[] = categories
      .filter((category) => category?.slug)
      .map((category) => ({
        url: `${frontendUrl}/category/${category.slug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));

    const serviceSitemap: SitemapEntry[] = services
      .filter((service) => service?.slug)
      .map((service) => ({
        url: `${frontendUrl}/service/${service.slug}`,
        lastModified: new Date().toISOString(),
        changeFrequency: "daily" as const,
        priority: 0.8,
      }));

    // console.log(categorySitemap, serviceSitemap);

    return [...categorySitemap, ...serviceSitemap];
  } catch (error) {
    console.error("Error fetching data:", error);
    // Handle the error appropriately, e.g., return an empty array or rethrow the error.
    return [];
  }
};
