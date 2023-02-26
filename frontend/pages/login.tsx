import Head from "next/head";
import { AuthAction, withAuthUser } from "next-firebase-auth";
import { Footer, Header } from "components";

const LoginPage = (): JSX.Element => {
  return (
    <>
      <Head>
        <title>Login Page</title>
        <meta name="description" content="Login Page" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Header />
      <div className="w-full flex flex-col px-[5%]">
        <h1 className="text-center pt-4 text-4xl">Login Page</h1>
        <div className="flex flex-row justify justify-center py-10">Login details...</div>
      </div>
      <Footer />
    </>
  );
};

export default withAuthUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
})(LoginPage);
