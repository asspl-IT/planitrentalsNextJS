"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { FaGreaterThan } from "react-icons/fa6";
import DOMPurify from "dompurify";
import Link from "next/link";
import axios from "axios";
import Meta from "../../../../components/Meta";

const BlogDetail = () => {
  const { id } = useParams();
  const [post, setPost] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    const apiUrl = `${process.env.NEXT_PUBLIC_AWS_BLOG}posts/${id}`;

    axios
      .get(apiUrl)
      .then((res) => setPost(res.data))
      .catch((err) => console.error("Error fetching post:", err));
  }, [id]);

  if (!post) {
    return <div className="text-center py-10 text-xl">Loading...</div>;
  }

  const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  return (
    <>
      <Meta
        title={post.title || "Loading..."}
        description={
          post.content
            ? stripHtml(post.content).slice(0, 300) +
              (stripHtml(post.content).length > 300 ? "..." : "")
            : "Blog Details"
        }
        keywords="Party Rentals, Equipment Rentals"
        ogTitle={post.title}
        ogDescription={
          post.content
            ? stripHtml(post.content).slice(0, 300) +
              (stripHtml(post.content).length > 300 ? "..." : "")
            : "Blog Details"
        }
        ogUrl={`https://www.planitrentals.com/blog/${post.title
          ?.replaceAll(" ", "-")
          .toLowerCase()}/${post.id}`}
        canonicalUrl={`https://www.planitrentals.com/blog/${post.title
          ?.replaceAll(" ", "-")
          .toLowerCase()}/${post.id}`}
      />

      <div className="page-header breadcrumb-wrap md:mt-[100px] mb-7">
        <div className="flex flex-wrap gap-2 text-sm font-semibold pirBlue--text mt-2 md:mt-0">
          <Link href="/" className="pirGreen--text">
            Home
          </Link>
          <FaGreaterThan className="mt-1" />
          <Link href="/blog" className="text-blue-900">
            Blog
          </Link>
          <FaGreaterThan className="mt-1" />
          <span className="text-blue-900">
            {post.title
              ? post.title.slice(0, post.title.length / 2) + "..."
              : ""}
          </span>
        </div>
      </div>

      <div className="container px-4 md:px-8">
        <div className="flex flex-col">
          <p className="text-[28px] md:text-[30px] font-semibold pirBlue--text">
            {post.title}
          </p>
          <p className="pb-3 pirBlue--text uppercase">
            {post.created_at
              ? new Date(post.created_at).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "2-digit",
                })
              : "Unknown Date"}
          </p>

          <div className="flex justify-center items-center w-full mb-6">
            {post.image_url && (
              <img
                src={post.image_url}
                alt={post.title}
                className="rounded-lg w-[450px] md:w-[550px] h-auto"
              />
            )}
          </div>

          <div className="p-5 md:p-10">
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(post.content || ""),
              }}
              className="text-sm sm:text-base md:text-lg leading-relaxed text-justify p-5"
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default BlogDetail;
