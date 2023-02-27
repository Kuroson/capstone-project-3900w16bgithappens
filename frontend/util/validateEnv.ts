import { bool, cleanEnv, email, str } from "envalid";

const validateEnv = cleanEnv(process.env, {
  NODE_ENV: str({ choices: ["development", "test", "production", "staging"] }),
  NEXT_PUBLIC_FIREBASE_PROJECT_ID: str(),
  FIREBASE_CLIENT_EMAIL: email(),
  NEXT_PUBLIC_FIREBASE_DATABASE_URL: str({ default: "" }),
  FIREBASE_PRIVATE_KEY: str(),
  COOKIE_SECRET_CURRENT: str(),
  COOKIE_SECRET_PREVIOUS: str(),
  NEXT_PUBLIC_COOKIE_SECURE: bool(),
});

export default validateEnv;
