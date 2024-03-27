import { FC } from "react";
import Link from "next/link";

const SectionItem: FC<SectionItemProps> = ({
  category,
  title,
  ctaText,
  description,
  href,
}) => {
  return (
    <div className="shadow-2xl bg-[#252728] rounded-lg p-8 md:p-12">
      <div className="bg-gradient-to-br from-pink-500 to-orange-400 text-white text-xs font-medium inline-flex items-center px-2.5 py-0.5 rounded-md mb-2">
        <svg
          className="w-3 h-3 mr-1"
          fill="currentColor"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <path
            clipRule="evenodd"
            fillRule="evenodd"
            d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z"
          />
        </svg>
        {category}
      </div>
      <h2 className="text-gray-200 text-3xl font-extrabold mb-2">{title}</h2>
      <p className="text-lg font-normal text-gray-400 mb-4">{description}</p>
      <Link href={href || "#"}>
        <div className="text-white font-medium text-lg inline-flex items-center">
          {ctaText}
          <svg
            aria-hidden="true"
            className="w-4 h-4 ml-2"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </div>
      </Link>
    </div>
  );
};

interface SectionItemProps {
  title: string;
  category: string;
  description: string;
  href?: string;
  ctaText: string;
}

export default SectionItem;
