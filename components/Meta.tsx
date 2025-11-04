"use client";

import Head from "next/head";

interface MetaProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  author?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogType?: string;
  ogUrl?: string;
  ogImage?: string;
  ogAvailability?: string;
  priceAmount?: string;
  priceCurrency?: string;
  structuredData?: Record<string, any>;
}

const Meta: React.FC<MetaProps> = ({
  title,
  description,
  keywords,
  canonicalUrl,
  author = "Plan-it Rentals",
  ogTitle,
  ogDescription,
  ogType = "website",
  ogUrl,
  ogImage,
  ogAvailability,
  priceAmount,
  priceCurrency,
  structuredData,
}) => {
  return (
    <Head>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}

      {/* Open Graph / Facebook */}
      <meta property="og:title" content={ogTitle || title} />
      <meta property="og:description" content={ogDescription || description} />
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={ogUrl} />
      <meta property="og:site_name" content="Planitrentals" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:availability" content={ogAvailability} />
      <meta property="product:price:amount" content={priceAmount} />
      <meta property="product:price:currency" content={priceCurrency} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={ogTitle || title} />
      <meta name="twitter:description" content={ogDescription || description} />
      <meta name="twitter:image" content={ogImage} />

      {/* Site Verification */}
      <meta
        name="google-site-verification"
        content="KUvuyO8kdNpsrxjhNRvLB6hmP9aoOqp1FKXfl_Ffqcc"
      />
      <meta name="p:domain_verify" content="b1c6ed718de9c43ea5c79d9be463d7d9" />
      <meta name="p:domain_verify" content="431e3128501cd5c5f2222d2bfe5c5588" />

      {/* JSON-LD Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData, null, 2),
          }}
        />
      )}
    </Head>
  );
};

export default Meta;
