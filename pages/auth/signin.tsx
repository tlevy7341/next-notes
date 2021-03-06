import type { NextPage, NextPageContext } from "next";
import { getProviders, signIn, useSession } from "next-auth/react";
import Head from "next/head";
import React, { useEffect } from "react";
import { useRouter } from "next/router";

const SignIn: NextPage = ({ providers }: any) => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session?.user) {
      router.push("/");
    }
  }, [session]);

  return (
    <div>
      <Head>
        <title>Login</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {session ? (
        <main className="w-screen h-screen bg-blue-gray-800 text-cool-gray-100 flex  justify-center items-center">
          <h1 className="font-bold sm:text-3xl mb-20">Redirecting...</h1>
        </main>
      ) : (
        <main className="w-screen h-screen bg-blue-gray-800 text-cool-gray-100 flex flex-col justify-evenly items-center">
          <h1 className="font-bold sm:text-3xl mb-20">Notes</h1>

          <div>
            {Object.values(providers).map((provider: any) => (
              <div className="my-6" key={provider.name}>
                <button
                  className="px-3 py-1 bg-sky-400 ring"
                  onClick={() => signIn(provider.id)}
                >
                  Sign in with {provider.name}
                </button>
              </div>
            ))}
          </div>
        </main>
      )}
    </div>
  );
};

export default SignIn;

export const getServerSideProps = async (context: NextPageContext) => {
  const providers = await getProviders();
  return {
    props: { providers },
  };
};
