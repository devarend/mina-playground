import { FC } from "react";
import Link from "next/link";
import SectionItem from "@/components/section/SectionItem";

const ReadMoreSection: FC = () => {
  return (
    <section>
      <div className="px-4 mx-auto max-w-screen-xl mb-12">
        <div className="shadow-2xl bg-[#252728] rounded-lg p-8 md:p-12 mb-8">
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
            Tutorials
          </div>
          <h1 className="text-white text-3xl md:text-5xl font-extrabold mb-2">
            How to create a simple Smart Contract
          </h1>
          <p className="text-lg font-normal text-white mb-6">
            Follow the interactive tutorial and learn how to create your own
            Smart Contract on Mina Protocol with a step-to-step guide.
          </p>
          <Link
            href="/tutorial/01-introduction/01-o1js"
            className="inline-flex justify-center items-center py-2.5 px-5 text-base font-medium text-center rounded-lg bg-gradient-to-br from-pink-500 to-orange-400 text-white"
          >
            Read more
            <svg
              aria-hidden="true"
              className="ml-2 -mr-1 w-4 h-4"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          <SectionItem
            category="Playground"
            title="Run Smart Contract and zkApp examples"
            description="Using the playground page you can try out Smart Contract examples
              and zkApps."
            ctaText="Run examples"
            href="/playground/01-introduction/01-o1js"
          />
          <SectionItem
            category="Projects"
            title="Create your own project"
            description="Create, test and run Smart Contract projects online."
            ctaText="Create project"
            href="/project"
          />
          <SectionItem
            category="Snippets"
            title="Create and share a snippet"
            description="Create, share and run a Smart Contract code snippet."
            ctaText="Create snippet"
            href="/snippet/create"
          />
          <SectionItem
            category="Smart Contracts"
            title="Deploy Smart Contracts in seconds"
            description="Deploy Smart Contracts easily and directly using our web
              interface."
            ctaText="Coming soon!"
          />
        </div>
      </div>
    </section>
  );
};

export default ReadMoreSection;
