import { init } from "next-firebase-auth";

const initAuth = () => {
  init({
    debug: false,
    authPageURL: "/login",
    appPageURL: "/",
    loginAPIEndpoint: "/api/login", // required
    logoutAPIEndpoint: "/api/logout", // required
    // onLoginRequestError: (err) => {
    //   console.error(err);
    // },
    // onLogoutRequestError: (err) => {
    //   console.error(err);
    // },
    // firebaseAuthEmulatorHost: "localhost:9099",
    firebaseAdminInitConfig: {
      credential: {
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? "",
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL ?? "",
        // The private key must not be accessible on the client side.
        privateKey:
          process.env.FIREBASE_PRIVATE_KEY != null
            ? JSON.parse(process.env.FIREBASE_PRIVATE_KEY)
            : undefined,
      },
      databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL ?? "",
    },
    // Use application default crauthPageURLedentials (takes precedence over firebaseAdminInitConfig if set)
    // useFirebaseAdminDefaultCredential: true,
    firebaseClientInitConfig: {
      apiKey: "AIzaSyDpTirBWYSF0_9AgVlyw0HQFbIZutuS-V0",
      authDomain: "githappens-34657.firebaseapp.com",
      projectId: "githappens-34657",
      storageBucket: "githappens-34657.appspot.com",
      messagingSenderId: "351812384855",
      appId: "1:351812384855:web:30572239785c0a61044b12",
      measurementId: "G-Q9FQN5B9NY",
    },
    cookies: {
      name: "githappens", // required
      // Keys are required unless you set `signed` to `false`.
      // The keys cannot be accessible on the client side.
      keys: [process.env.COOKIE_SECRET_CURRENT, process.env.COOKIE_SECRET_PREVIOUS],
      httpOnly: true,
      maxAge: 12 * 60 * 60 * 24 * 1000, // twelve days
      overwrite: true,
      path: "/",
      sameSite: "strict",
      // set this to false in local (non-HTTPS) development
      secure:
        process.env.NODE_ENV === "development"
          ? true
          : process.env.NEXT_PUBLIC_COOKIE_SECURE ?? false,
      signed: true,
    },
    // onVerifyTokenError: (err) => {
    //   console.error(err);
    // },
    // onTokenRefreshError: (err) => {
    //   console.error(err);
    // },
  });
};

export default initAuth;
