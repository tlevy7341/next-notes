import { useState, useRef, useEffect } from "react";
import { useSession, signOut, getSession } from "next-auth/react";
import type { NextPage, NextPageContext } from "next";
import { useRouter } from "next/router";
import Head from "next/head";
import useOnClickOutside from "use-onclickoutside";
import { useQuery, QueryClient, dehydrate } from "react-query";
import Masonry from "react-masonry-css";
import NoteForm from "../components/NoteForm";
import Note from "../components/Note";
import { motion } from "framer-motion";

type NoteType = {
  id: string;
  email: string;
  noteTitle: string;
  noteBody: string;
  createdAt: Date;
};
const getNotes = async () => {
  const response = await fetch("/api/notes");
  return response.json();
};

const Home: NextPage = () => {
  const { data: session } = useSession();

  const router = useRouter();
  const [showDropdown, setShowDropdown] = useState(false);
  const buttonRef = useRef(null);

  const handleLogOut = async () => {
    setShowDropdown(false);
    signOut();
  };

  useOnClickOutside(buttonRef, () => {
    setShowDropdown(false);
  });
  //Function to get all the Notes

  const { isLoading, data } = useQuery<NoteType[], Error>("notes", getNotes);

  useEffect(() => {
    if (!session?.user) {
      router.push("/auth/signin");
    }
  }, [session]);
  if (isLoading) return <p className="text-center">Loading...</p>;
  return (
    <>
      <Head>
        <title>Notes</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      {!session ? null : (
        <main className="min-h-screen w-screen flex flex-col bg-blue-gray-800 text-cool-gray-100">
          <div className="flex justify-end">
            <motion.button
              whileHover={{ scale: 1.1 }}
              onClick={() => setShowDropdown(true)}
              className="px-8 mr-5 mt-2 sm:(px-8 py-1 mr-20 mt-10) bg-teal-700 rounded font-bold text-2xl shadow-sm shadow-blue-gray-900"
            >
              {session!.user!.name![0]}
            </motion.button>
            <div className="origin-bottom absolute right-5 top-10 w-30 sm:(right-10 top-20 w-40) mt-1  rounded-md  bg-white focus:outline-none">
              {showDropdown && (
                <div className="py-1">
                  <button
                    ref={buttonRef}
                    onClick={handleLogOut}
                    className="text-gray-700 block w-full text-left hover:bg-gray-200 px-4 py-2 text-sm"
                  >
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>

          <NoteForm email={session!.user!.email!} />
          <Masonry
            breakpointCols={{ default: 5, 500: 1 }}
            className="my-masonry-grid container mx-auto mt-10"
            columnClassName="my-masonry-grid_column"
          >
            {data &&
              data.map(({ id, noteTitle, noteBody, email }) => {
                return (
                  <Note
                    key={id}
                    id={id}
                    email={email}
                    noteTitle={noteTitle}
                    noteBody={noteBody}
                  />
                );
              })}
          </Masonry>
        </main>
      )}
    </>
  );
};

export default Home;

export const getServerSideProps = async (context: NextPageContext) => {
  const queryClient = new QueryClient();
  await queryClient.prefetchQuery("notes", getNotes);
  return {
    props: {
      notes: { dehydratedState: dehydrate(queryClient) },
      session: await getSession(context),
    },
  };
};
