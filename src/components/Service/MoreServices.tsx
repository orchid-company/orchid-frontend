import React from "react";
import Image from "next/image";
import Link from "next/link";
import { backendUrl } from "@/utils/axios";
import { safeFetchJson } from "@/lib/safeFetch";

type Service = {
  _id: string;
  slug: string;
  name: string;
  images: string[];
  city?: string;
  price?: number | string;
  serviceType?: string;
};

const getAllServicesByCategory = async (categorySlug: string) => {
  const { data, response } = await safeFetchJson<{ services?: Service[] }>(
    `${backendUrl}/service/getServicesByCategory/${categorySlug}`,
    {
      next: { revalidate: 60 * 5 },
    }
  );

  if (!response.ok || !data?.services) {
    console.warn(
      `[MoreServices] No services returned for category=${categorySlug}. status=${response.status}`
    );
    return [];
  }

  return data.services;
};

const MoreServices = async ({
  category,
  id,
}: {
  category: string;
  id: string;
}) => {
  const allServices = await getAllServicesByCategory(category);
  const services = allServices.filter((service) => service._id !== id);

  if (!services.length) {
    return null;
  }

  return (
    <section className="w-full flex flex-col gap-8 rounded-xl ">
      <div className="w-full flex md:flex-row flex-col justify-between gap-2 ">
        <div className="flex flex-col md:items-start items-center gap-4">
          <h6 className="spartan text-lg md:text-xl text-blue uppercase tracking-widest font-medium">
            Services
          </h6>
          <h4 className="font-bold text-3xl md:text-4xl text-primary md:text-start text-center inter tracking-wide ">
            Similar Services
          </h4>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
        {services.map((service) => (
          <div
            className="cursor-pointer rounded-xl bg-white p-3 shadow-lg hover:shadow-xl"
            key={service._id}
          >
            <div className="relative flex items-end overflow-hidden rounded-xl">
              <Image
                src={service.images?.[0] ?? "/assets/images/blog/1.jpg"}
                width={400}
                height={300}
                alt={service.name}
                className="w-full h-72 object-cover"
              />
              <div className="absolute bottom-3 left-3 inline-flex items-center rounded-lg bg-white p-2 shadow-md">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                <span className="ml-1 text-sm text-slate-400">
                  {(Math.random() * (5 - 4) + 4).toFixed(1)}
                </span>
              </div>
            </div>
            <div className="mt-1 p-2">
              <h2 className="text-slate-700">{service.name}</h2>
              <p className="mt-1 text-sm text-slate-400">{service.city}</p>
              <div className="mt-3 flex items-end justify-between">
                <p>
                  <span className="text-lg font-bold text-orange-500">
                    {service.price ?? "NA"}
                  </span>
                  {service.serviceType ? (
                    <span className="text-sm text-slate-400">
                      /{service.serviceType}
                    </span>
                  ) : null}
                </p>
                <div className="group inline-flex rounded-xl bg-orange-100 p-2 px-3 hover:bg-orange-200">
                  <Link
                    href={`/service/${service.slug}`}
                    className="text-primary text-sm inter "
                  >
                    View
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default MoreServices;
