import Head from "next/head";
import styles from "@/styles/Home.module.css";
import Header from "@/components/Header";
import { NextPage } from "next";
import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCreateProjectMutation } from "@/services/project";

const Project: NextPage = () => {
  const [name, setName] = useState("");
  const router = useRouter();
  const [createProject] = useCreateProjectMutation();
  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    const body = { name, type: 0, visibility: true, files_id: 1 };
    try {
      const response = await createProject({ body }).unwrap();
      // @ts-ignore
      router.push(`/project/${response.data.project_id}`);
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Mina Playground</title>
        <meta name="description" content="Generated by create next app" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <Header />
        <section className="">
          <div className="flex justify-center m-4 sm:m-8">
            <div className="w-full lg:max-w-xl p-6 space-y-8 sm:p-8 bg-[#252728] rounded-lg shadow-2xl">
              <h2 className="text-2xl font-bold text-gray-200">
                Create a new project
              </h2>
              <form onSubmit={onSubmit} className="mt-8 space-y-6">
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-2 text-sm font-medium text-gray-200"
                  >
                    Project name
                  </label>
                  <input
                    type="text"
                    name="name"
                    id="name"
                    value={name}
                    onChange={(evt) => setName(evt.target.value)}
                    className="bg-[#252728] border border-gray-500 text-gray-100 text-sm rounded-lg block w-full p-2.5"
                    placeholder="My project"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full px-5 py-3 text-base font-medium text-center text-white bg-gray-600 rounded-lg hover:bg-gray-700 focus:ring-4 focus:ring-blue-300 sm:w-auto"
                >
                  {isLoading ? "Loading..." : "Create project"}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};

export default Project;