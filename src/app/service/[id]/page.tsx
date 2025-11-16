import ImageGallery from "@/components/Service/ImageGallery";
import MoreServices from "@/components/Service/MoreServices";
import ServiceDetails from "@/components/Service/ServiceDetails";
import Image from "next/image";
import { Metadata } from "next";
import { backendUrl } from "@/utils/axios";
import Reviews from "@/components/Service/Reviews";
import Faqs from "@/components/Common/Faqs";
import { safeFetchJson } from "@/lib/safeFetch";

export async function generateStaticParams() {
  try {
    const { data, response } = await safeFetchJson<{
      services?: Array<{ slug: string }>;
    }>(`${backendUrl}/service/getAllServicesId`, {
      next: { revalidate: 60 * 60 },
    });

    if (!response.ok || !data?.services?.length) {
      console.warn(
        `[service/[id]/generateStaticParams] Falling back to empty list. status=${response.status}`
      );
      return [];
    }

    return data.services
      .filter((service) => service?.slug)
      .map((service) => ({
        id: service.slug,
      }));
  } catch (error) {
    console.error(
      "[service/[id]/generateStaticParams] Failed to fetch service slugs",
      error
    );
    return [];
  }
}

async function getSingleService(id: string) {
  const { data, response } = await safeFetchJson<{ service?: any }>(
    `${backendUrl}/service/getServiceBySlug/${id}`,
    {
      next: { revalidate: 60 * 10 },
    }
  );

  if (!data?.service) {
    console.error(
      `[getSingleService] Missing service for slug=${id}. status=${response.status}`
    );
    throw new Error("Failed to fetch data");
  }

  return data.service;
}

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const { data } = await safeFetchJson<{ service?: any }>(
      `${backendUrl}/service/getServiceBySlug/${params.id}`,
      {
        next: { revalidate: 60 * 10 },
      }
    );
    const service = data?.service;

    if (!service) {
      throw new Error("Service not found");
    }

    return {
      title: service?.title ?? "Orchid Services",
      description:
        service?.metaDescription ??
        "Discover detailed information about Orchid services.",
    };
  } catch (error) {
    console.error(
      "[service/[id]/generateMetadata] Failed to build metadata",
      error
    );
    return {
      title: "Orchid Services",
      description: "Discover detailed information about Orchid services.",
    };
  }
}

export default async function Page({ params }: { params: { id: string } }) {
  const service = await getSingleService(params.id);

  return (
    <div className="w-full flex flex-col gap-16 md:py-8 ">
      <div className="w-full px-8 mt-20 sm:px-12 md:px-20 lg:px-32 py-16 flex flex-col gap-12 md:gap-20">
        <div className="w-full grid-cols-1  grid sm:grid-cols-2 gap-12 items-start">
          <ImageGallery images={service?.images} />
          <ServiceDetails service={service} />
        </div>
        <Reviews service={service} />
        {service?.category?.slug && (
          <MoreServices category={service?.category?.slug} id={service?._id} />
        )}
        <Faqs faqs={service?.faqs} />
      </div>
    </div>
  );
}
