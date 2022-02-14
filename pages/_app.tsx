import type { AppProps } from "next/app";
import { Hydrate, QueryClient, QueryClientProvider } from "react-query";
import { SessionProvider } from "next-auth/react";
import "windi.css";
import "../styles/global.css";

function MyApp({ Component, pageProps }: AppProps) {
  const queryClient: QueryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <Hydrate state={pageProps.dehydratedState}>
        <SessionProvider session={pageProps.session}>
          <Component {...pageProps} />
        </SessionProvider>
      </Hydrate>
    </QueryClientProvider>
  );
}

export default MyApp;
