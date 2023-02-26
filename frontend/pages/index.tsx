import Head from "next/head";
import { AuthAction, withAuthUser } from "next-firebase-auth";
import { Footer, Header } from "components";

const HomePage = (): JSX.Element => {
  return (
    <>
      <Head>
        <title>Home page</title>
        <meta name="description" content="Home page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Header />
      <div className="w-full flex flex-col px-[5%]">
        <h1 className="text-center pt-4 text-4xl">stuff</h1>
        <div className="flex flex-row justify justify-center py-10">stuff</div>
      </div>
      <Footer />
    </>
  );
};

export default withAuthUser({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
  whenUnauthedAfterInit: AuthAction.REDIRECT_TO_LOGIN,
  // LoaderComponent: MyLoader,
})(HomePage);
