import { NextPage } from "next";
import React from "react";
import Head from "next/head";
import Link from "next/link";

const Custom404: NextPage = () => {
  return (
    <>
      <Head>
        <title>The page you were looking for doesn't exist | 404</title>
      </Head>
      <div className="w-screen h-screen flex flex-col justify-center items-center bg-blue-gray-800 text-cool-gray-100">
        <h2 className="font-bold text-2xl pb-3">404 Page Not Found</h2>
        <Link href="/">
          <a className="underline">Go back home</a>
        </Link>
      </div>
    </>
  );
};

export default Custom404;
