import Banner from "@/components/Banner";
import CategoriesComponent from "@/components/CategoriesComponent";
import AboutUs from "@/components/AboutUs";
import ContactUs from "@/components/ContactUs";
import Head from "next/head";

export default function Home() {
  const schemaData = {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
    name: "Plan-it Rentals",
    url: "https://www.planitrentals.com",
    logo: "https://www.planitrentals.com/logo.png",
    telephone: "+1-801-319-5524",
    address: {
      "@type": "PostalAddress",
      streetAddress: "American Fork",
      addressLocality: "American Fork",
      addressRegion: "UT",
      postalCode: "84003",
      addressCountry: "US",
    },
    description:
      "Utah's best source for party and equipment rentals. We rent bounce houses, photo booths, sound systems, and more.",
  };

  return (
    <>
      <Head>
        <title>Party Rentals and Equipment Rentals in Utah | Plan-it Rentals</title>
        <meta
          name="description"
          content="Trust Plan-it Rentals in Utah to supply your party with bounce houses, concession rentals, and more!"
        />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }} />
      </Head>
      <Banner />
      <CategoriesComponent />
      <AboutUs />
      <ContactUs />
    </>
  );
}
