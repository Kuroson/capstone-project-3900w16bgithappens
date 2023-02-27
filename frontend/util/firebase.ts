import { init } from "next-firebase-auth";

const PROJECT_ID = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const CLIENT_EMAIL = process.env.FIREBASE_CLIENT_EMAIL;
const FIREBASE_PRIVATE_KEY = process.env.FIREBASE_PRIVATE_KEY;
const FIREBASE_DATABASE_URL = process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL;
const COOKIE_SECRET_CURRENT = process.env.COOKIE_SECRET_CURRENT;
const COOKIE_SECRET_PREVIOUS = process.env.COOKIE_SECRET_PREVIOUS;

if (PROJECT_ID === undefined) {
  throw new Error("Missing NEXT_PUBLIC_FIREBASE_PROJECT_ID");
}

if (CLIENT_EMAIL === undefined) {
  throw new Error("Missing FIREBASE_CLIENT_EMAIL");
}

if (FIREBASE_DATABASE_URL === undefined) {
  throw new Error("Missing NEXT_PUBLIC_FIREBASE_DATABASE_URL");
}

if (COOKIE_SECRET_CURRENT === undefined || COOKIE_SECRET_PREVIOUS === undefined) {
  throw new Error("Firebase cookie values not set");
}

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
        projectId: PROJECT_ID,
        clientEmail: CLIENT_EMAIL,
        // The private key must not be accessible on the client side.
        privateKey:
          FIREBASE_PRIVATE_KEY !== undefined ? JSON.parse(FIREBASE_PRIVATE_KEY) : undefined,
      },
      databaseURL: FIREBASE_DATABASE_URL,
    },
    // Use application default crauthPageURLedentials (takes precedence over firebaseAdminInitConfig if set)
    // useFirebaseAdminDefaultCredential: true,
    firebaseClientInitConfig: {
      apiKey: "AIzaSyA8ZhV0JWeXho7yZ_y9D201BNsTB_VP-0g",
      authDomain: "capstone390023t1-githappens.firebaseapp.com",
      projectId: "capstone390023t1-githappens",
      storageBucket: "capstone390023t1-githappens.appspot.com",
      messagingSenderId: "913063051631",
      appId: "1:913063051631:web:62c9e782d7f12c7108689a",
      measurementId: "G-X0QF3LD741",
    },
    cookies: {
      name: "capstone390023t1-githappens", // required
      // Keys are required unless you set `signed` to `false`.
      // The keys cannot be accessible on the client side.
      keys: [COOKIE_SECRET_CURRENT, COOKIE_SECRET_PREVIOUS],
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
