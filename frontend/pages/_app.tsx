import "styles/globals.scss";
import type { AppProps } from "next/app";
import { Layout } from "components";
import initAuth from "util/firebase";

export default function App({ Component, pageProps }: AppProps): JSX.Element {
  initAuth();
  return (
    <>
      <Layout>
        <Component {...pageProps} />
      </Layout>
    </>
  );
}
