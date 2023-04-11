import Head from "next/head";
import styles from "@/styles/Home.module.css";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ReadMoreSection from "@/components/ReadMoreSection";

const Home = () => {
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
        <HeroSection />
        <ReadMoreSection />
      </main>
    </>
  );
};

export default Home;
