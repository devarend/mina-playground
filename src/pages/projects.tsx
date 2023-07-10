import Head from "next/head";
import styles from "@/styles/Home.module.css";
import Header from "@/components/Header";
import Projects from "@/components/Projects";
import { GetServerSideProps, NextPage } from "next";
import axios from "axios";

export const getServerSideProps: GetServerSideProps = async ({}) => {
  try {
    const response = await axios.get("http://localhost:3000/project");
    const { data } = response;
    return {
      props: { data },
    };
  } catch {
    return {
      props: { data: null },
    };
  }
};

const Home: NextPage<HomeProps> = ({ data }) => {
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
        <Projects data={data} />
      </main>
    </>
  );
};

interface HomeProps {
  data: {
    _id: string;
    name: string;
    type: number;
    visibility: boolean;
    files_id: number;
  }[];
}

export default Home;
