import React from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { Button, TextField } from "@mui/material";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { AuthAction, withAuthUser } from "next-firebase-auth";
import { Footer, Header } from "components";

const isValidEmail = (email: string): boolean => {
  const emailRegex = new RegExp(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{1,}))$/,
  );
  return emailRegex.test(email);
};

const isValidPassword = (password: string): boolean => {
  const passwordRegex = new RegExp(
    /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&^()~-])[A-Za-z\d@$!%*#?&^()~-]{8,}$/,
  );
  return passwordRegex.test(password);
};

type PasswordRequirementsProps = {
  password: string;
  passwordError: boolean;
};

const PasswordRequirements = ({
  password,
  passwordError,
}: PasswordRequirementsProps): JSX.Element => {
  const isPasswordLengthValid = (p: string): boolean => {
    return p.length >= 8;
  };

  const isPasswordNumberValid = (p: string): boolean => {
    return new RegExp(/\d/).test(p);
  };

  const isPasswordSpecialValid = (p: string): boolean => {
    return new RegExp(/[@$!%*#?&^()~-]/).test(p);
  };

  const TAILWIND_ERROR_COLOUR = "text-red-500";

  return (
    <>
      <ul className="list-disc pl-[1.25rem]">
        <li
          className={
            password.length !== 0 && !isPasswordLengthValid(password) ? TAILWIND_ERROR_COLOUR : ""
          }
        >
          At least 8 characters
        </li>
        <li
          className={
            password.length !== 0 && !isPasswordNumberValid(password) ? TAILWIND_ERROR_COLOUR : ""
          }
        >
          At least 1 number
        </li>
        <li
          className={
            password.length !== 0 && !isPasswordSpecialValid(password) ? TAILWIND_ERROR_COLOUR : ""
          }
        >
          At least 1 special character of the following: !@#$%^&*()~-
        </li>
      </ul>
    </>
  );
};

const SignUpPage = (): JSX.Element => {
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState(false);

  const [firstName, setFirstName] = React.useState("");
  const [firstNameError, setFirstNameError] = React.useState(false);

  const [lastName, setLastName] = React.useState("");
  const [lastNameError, setLastNameError] = React.useState(false);

  const [password, setPassword] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);

  const [confirmPassword, setConfirmPassword] = React.useState("");

  const handleOnSubmit = async (event: React.FormEvent<HTMLFormElement>): Promise<void> => {
    event.preventDefault(); // Don't reload page

    // Check if email is valid
    const formDetails = [email, firstName, lastName, password, confirmPassword];
    if (!formDetails.every((x) => x.length !== 0)) {
      toast.error("Please fill in the form!");
      return;
    }

    if (!isValidEmail(email)) {
      setEmailError(true);
      toast.info("Email is not valid!");
      return;
    }

    if (!isValidPassword(password)) {
      setPasswordError(true);
      toast.info("Password is not valid!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match!");
      return;
    }
    // Everything should be valid after this

    createUserWithEmailAndPassword(getAuth(), email, password)
      .then((res) => {
        console.log(res);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err);
      });
  };

  return (
    <>
      <Head>
        <title>Sign Up</title>
        <meta name="description" content="Sign Up" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Header />
      <form className="w-full h-full flex flex-col items-center pt-10" onSubmit={handleOnSubmit}>
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
            error={email.length !== 0 && emailError}
            onBlur={() => setEmailError(!isValidEmail(email))}
            helperText={email.length !== 0 && emailError && "Please enter a valid email"}
          />
          <div className="flex flex-row w-[25rem] justify-between pt-4">
            <TextField
              id="first-name-input"
              label="First Name"
              type="text"
              variant="outlined"
              value={firstName}
              onChange={(e) => {
                setFirstName(e.target.value);
                setFirstNameError(false);
              }}
              className="w-[12rem]"
              autoComplete="given-name"
              error={firstNameError}
            />
            <TextField
              id="last-name-input"
              label="Last Name"
              type="text"
              variant="outlined"
              value={lastName}
              onChange={(e) => {
                setLastName(e.target.value);
                setLastNameError(false);
              }}
              className="w-[12rem]"
              autoComplete="family-name"
              error={lastNameError}
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
              error={password.length !== 0 && passwordError}
              onBlur={() => setPasswordError(!isValidPassword(password))}
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
              error={confirmPassword.length !== 0 && confirmPassword !== password}
            />
          </div>
          <div className="mt-4 w-[25rem]">
            <p className="text-lg">Password Rules:</p>
            <ul className="list-disc pl-[1.25rem]">
              <PasswordRequirements password={password} passwordError={passwordError} />
            </ul>
          </div>
          <div className="w-[25rem] mt-4">
            <Button variant="contained" className="w-[25rem]" type="submit">
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
