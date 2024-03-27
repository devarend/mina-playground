import Head from "next/head";
import Header from "@/components/Header";
import Breadcrumb from "@/components/breadcrumb/Breadcrumb";
import type { GetStaticPaths, GetStaticProps, NextPage } from "next";
import { MDXRemote } from "next-mdx-remote";
import tutorials from "@/tutorials.json";
import { TutorialParams, TutorialResponse } from "@/types";
import { CH } from "@code-hike/mdx/components";
import tutorialsPath from "@/tutorialPaths.json";
import InteractiveTutorial from "@/components/tutorial-types/InteractiveTutorial";
const components = { CH };

export const getStaticPaths: GetStaticPaths = async () => {
  return tutorialsPath;
};

export const getStaticProps: GetStaticProps<
  IHomeProps,
  TutorialParams
> = async ({ params }) => {
  const { chapter: c, section: s } = params!;

  const tutorialResponse: TutorialResponse = (
    await import(`../../../json/${c}-${s}.json`)
  ).default;

  return {
    props: {
      c,
      s,
      item: tutorialResponse,
    },
  };
};

const Home: NextPage<IHomeProps> = ({ c, s, item }) => {
  const { tutorial } = item;
  const {
    files,
    focusedFiles,
    highlightedItem,
    filesArray,
    base,
    initTerminal,
    type,
  } = item;
  return (
    <>
      <Head>
        <title>
          Mina Playground {c} {s}
        </title>
        <meta name="description" content="Interactive tutorials" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/icon.svg" />
      </Head>
      <main>
        <Header />
        <div className="flex flex-1 grid lg:grid-cols-2">
          <div className="min-w-0">
            <Breadcrumb chapterIndex={c} sectionIndex={s} items={tutorials} />
            <div className="px-4 pb-4 lg:h-[calc(100vh-125px)] overflow-y-auto">
              <div id="tutorial">
                <MDXRemote {...tutorial} components={components} />
              </div>
            </div>
          </div>
          <div className="flex flex-col">
            <InteractiveTutorial
              type={type}
              highlightedItem={highlightedItem}
              files={files}
              filesArray={filesArray}
              focusedFiles={focusedFiles}
              base={base}
              initTerminal={initTerminal}
            />
          </div>
        </div>
      </main>
    </>
  );
};

interface IHomeProps {
  c: string;
  s: string;
  item: TutorialResponse;
}

export default Home;
