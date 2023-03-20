import "styles/globals.scss";
import React from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import type { AppProps } from "next/app";
import { StyledEngineProvider, ThemeProvider, createTheme } from "@mui/material/styles";
import { AuthAction, useAuthUser, withAuthUser } from "next-firebase-auth";
import * as forgetPasswordSSR from "pages/forgetPassword";
import * as loginAuthSSR from "pages/login";
import * as signupAuthSSR from "pages/signup";
import { Layout } from "components";
import styles from "components/Layout/Layout.module.scss";
import { UserProvider, useUser } from "util/UserContext";
import { getUserDetails } from "util/api/userApi";
import initAuth from "util/firebase";
import Custom404 from "./404";

const theme = createTheme({
  palette: {
    primary: {
      main: "#26a69a",
    },
    error: {
      main: "#e57373",
    },
  },
});

const App = ({ Component, pageProps }: AppProps): JSX.Element => {
  initAuth();

  // Add the page components that don't need the sidebars here
  const specialComponents = [
    Custom404,
    loginAuthSSR.default,
    signupAuthSSR.default,
    forgetPasswordSSR.default,
  ];

  const renderWithoutBars = specialComponents.some((component) => component === Component);

  return (
    <>
      <StyledEngineProvider injectFirst>
        <ThemeProvider theme={theme}>
          <UserProvider>
            <Layout className={renderWithoutBars ? styles.loginLayout : styles.mainContent}>
              <Component {...pageProps} />
            </Layout>
          </UserProvider>
        </ThemeProvider>
      </StyledEngineProvider>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={true}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        limit={3}
      />
    </>
  );
};

export default withAuthUser<AppProps>({
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
})(App);
