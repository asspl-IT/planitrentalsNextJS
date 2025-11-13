"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Head from "next/head";
import { FaGreaterThan } from "react-icons/fa6";
import axios from "axios";
import DOMPurify from "dompurify";
import { ClipLoader } from "react-spinners";

export default function Blog() {
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const apiUrl = `${process.env.NEXT_PUBLIC_AWS_BLOG}posts`;
        console.log("Fetching from:", apiUrl);

        const res = await axios.get(apiUrl);
        console.log("Raw response data:", res.data);

        const filteredPosts = res.data.filter(
          (post: any) => post.location === "American Fork, UT"
        );

        console.log("Filtered posts:", filteredPosts);
        setPosts(filteredPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  return (
    <>
      {/* ✅ SEO Metadata */}
      <Head>
        <title>Blog | Planitrentals</title>
        <meta
          name="description"
          content="Plan-it Rentals is the top party and event rental company in the United States. With multiple locations, we provide bounce houses, concession machines, and yard games for any party or event. We rent cotton candy machines, shave ice machines, popcorn machines, corn hole, 9 square, water bounce houses, combo jumpy houses, and more! We supply waterslides, moonwalk bouncers, yard pong, inflatables, and more! Call us to reserve today!"
        />
        <meta
          name="keywords"
          content="Party Rentals, Equipment Rentals"
        />
        <meta property="og:title" content="Blog | Planitrentals" />
        <meta
          property="og:description"
          content="Plan-it Rentals is the top party and event rental company in the United States. With multiple locations, we provide bounce houses, concession machines, and yard games for any party or event."
        />
        <meta
          property="og:url"
          content="https://www.planitrentals.com/blog"
        />
        <link
          rel="canonical"
          href="https://www.planitrentals.com/blog"
        />
      </Head>

      {/* ✅ Breadcrumb Section */}
      <div className="page-header breadcrumb-wrap mb-7 md:mt-[100px]">
        <div className="flex flex-wrap gap-2 text-sm font-semibold pirBlue--text mt-2 md:mt-0">
          <Link href="/" className="pirGreen--text">
            Home
          </Link>
          <span>
            <FaGreaterThan className="mt-1" />
          </span>
          <span className="text-blue-900">Blog</span>
        </div>
      </div>

      {/* ✅ Blog Content */}
      <div className="p-4 bg-gray-100 min-h-screen flex flex-col gap-6">
        {loading ? (
          <div className="flex justify-center items-center min-h-[50vh]">
            <ClipLoader color="#10B981" size={50} />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center text-gray-600">
            No posts found for this location.
          </div>
        ) : (
          posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-2xl shadow-lg p-4 flex flex-col sm:flex-row gap-4 w-full max-w-4xl mx-auto"
            >
              <img
                src={post.image_url}
                alt="Blog"
                className="w-full sm:w-1/3 rounded-lg object-cover"
              />
              <div className="flex flex-col justify-between w-full">
                <h2 className="text-2xl font-bold pirBlue--text hover:underline">
                  <Link
                    href={`/blog/${post.title.replaceAll(" ", "-")}/${post.id}`}
                  >
                    {post.title}
                  </Link>
                </h2>

                <div
                  className="text-gray-600 text-sm mt-2 text-justify"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(
                      post.content.substring(0, 700) + "..."
                    ),
                  }}
                />

                <div className="flex justify-between items-center mt-4 text-sm text-gray-500">
                  <p className="text-sm font-bold pb-3 text-center pirBlue--text">
                    {new Date(post.created_at).toLocaleDateString("en-US", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                  <Link
                    href={`/blog/${post.title.replaceAll(" ", "-")}/${post.id}`}
                    className="text-green-500 font-semibold mt-2 hover:underline"
                  >
                    Read more
                  </Link>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}
