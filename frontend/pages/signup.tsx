import React from "react";
import Head from "next/head";
import { Button, TextField } from "@mui/material";
import { AuthAction, withAuthUser } from "next-firebase-auth";
import { Footer, Header } from "components";

const SignUpPage = (): JSX.Element => {
  const [email, setEmail] = React.useState("");
  const [firstName, setFirstName] = React.useState("");
  const [lastName, setLastName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");

  return (
    <>
      <Head>
        <title>Sign Up</title>
        <meta name="description" content="Sign Up" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Header />
      <form className="w-full h-full flex flex-col items-center pt-10">
        <h1 className="text-6xl">Welcome to GitHappens!</h1>
        <div className="flex flex-col w-full items-center pt-10">
          <TextField
            id="email-input"
            label="Email"
            type="text"
            variant="outlined"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-[25rem]"
            autoComplete="email"
          />
          <div className="flex flex-row w-[25rem] justify-between pt-4">
            <TextField
              id="first-name-input"
              label="First Name"
              type="text"
              variant="outlined"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              className="w-[12rem]"
              autoComplete="given-name"
            />
            <TextField
              id="last-name-input"
              label="Last Name"
              type="text"
              variant="outlined"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              className="w-[12rem]"
              autoComplete="family-name"
            />
          </div>
          <div className="pt-4">
            <TextField
              id="outlined-password-input"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-[25rem]"
              autoComplete="new-password"
            />
          </div>
          <div className="pt-4">
            <TextField
              id="outlined-confirm-password-input"
              label="Confirm Password"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-[25rem]"
            />
          </div>
          <div className="mt-4 w-[25rem]">
            <p className="text-lg">Password Rules:</p>
            <ul className="list-disc ml-[1rem]">
              <li>At least 8 characters</li>
              <li>At least 1 number</li>
              <li>At least 1 special character of the following: !@#$%^&*()~-</li>
              <li>Matching</li>
            </ul>
          </div>
          <div className="w-[25rem] mt-4">
            <Button variant="contained" className="w-[25rem]">
              Sign Up
            </Button>
          </div>
        </div>
      </form>
      <Footer />
    </>
  );
};

export default withAuthUser({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
})(SignUpPage);
