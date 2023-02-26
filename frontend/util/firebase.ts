import { GoogleAuthProvider, getAuth } from "firebase/auth";
import { collection, getDocs, getFirestore, limit, query, where } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { init } from "next-firebase-auth";

// Auth exports
// export const auth = getAuth(firebaseApp);
// export const googleAuthProvider = new GoogleAuthProvider();

// Firestore exports
// export const firestore = getFirestore(firebaseApp);

// Storage exports
// export const storage = getStorage(firebaseApp);
// export const STATE_CHANGED = "state_changed";

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
        projectId: "githappens-34657",
        clientEmail: "firebase-adminsdk-xwbry@githappens-34657.iam.gserviceaccount.com",
        // The private key must not be accessible on the client side.
        privateKey: process.env.FIREBASE_PRIVATE_KEY
          ? JSON.parse(process.env.FIREBASE_PRIVATE_KEY)
          : undefined,
      },
      databaseURL: "",
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
      secure: false, // set this to false in local (non-HTTPS) development
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
