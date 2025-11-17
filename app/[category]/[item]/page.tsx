// app/[category]/[item]/page.tsx
import { notFound } from "next/navigation";
import { Metadata } from "next";
import { ItemDetailsService } from "@/services/ItemDetailsService";
import ClientItemDetail from "./ClientItemDetail";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; item: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;

  try {
    const staticItem = await ItemDetailsService.fetchItemDetailsMySql(resolvedParams.item);

    return {
      title: `${staticItem.Name__c} in Utah | $${staticItem.Weekday_Cost__c || 0} Weekday | Plan-it Rentals`,
      description: `${staticItem.Name__c} Rentals starting at $${staticItem.Weekday_Cost__c || 0}/day in American Fork and Salt Lake City, Utah.`,
      openGraph: {
        title: staticItem.Name__c,
        description: staticItem.Store_Description__c?.slice(0, 200) || "",
        images: [staticItem.Images__r?.records?.[0]?.Original_Image_URL__c || "/coming-soon.png"],
        url: `https://www.planitrentals.com/${resolvedParams.category}/${resolvedParams.item}`,
      },
    };
  } catch {
    return { title: "Item Not Found | Plan-it Rentals" };
  }
}

export default async function ItemDetailPage({
  params,
}: {
  params: Promise<{ category: string; item: string }>;
}) {
  const resolvedParams = await params;
  console.log("Resolved route params:", resolvedParams);

  let staticItemDetail;
  try {
    staticItemDetail = await ItemDetailsService.fetchItemDetailsMySql(resolvedParams.item);
  } catch (error: any) {
    if (error.message?.includes("not found")) {
      notFound();
    }
    throw error;
  }

  return <ClientItemDetail staticItemDetail={staticItemDetail} params={resolvedParams} />;
}