import React from "react";
import { toast } from "react-toastify";
import Head from "next/head";
import { LoadingButton } from "@mui/lab";
import { TextField } from "@mui/material";
import { createUserWithEmailAndPassword, getAuth } from "firebase/auth";
import { GetStaticProps } from "next";
import { AuthAction, withAuthUser } from "next-firebase-auth";
import { ContentContainer, Footer, LeftSideBar, SideNavbar } from "components";
import { HttpException } from "util/HttpExceptions";
import { FE_BACKEND_URL, apiPost } from "util/api";
import { isValidEmail, isValidPassword } from "util/authVerficiation";

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
  const getColour = (condition: boolean): string => (condition ? TAILWIND_ERROR_COLOUR : "");

  return (
    <>
      <ul className="list-disc pl-[1.25rem]">
        <li className={getColour(password.length !== 0 && !isPasswordLengthValid(password))}>
          At least 8 characters
        </li>
        <li className={getColour(password.length !== 0 && !isPasswordNumberValid(password))}>
          At least 1 number
        </li>
        <li className={getColour(password.length !== 0 && !isPasswordSpecialValid(password))}>
          At least 1 special character of the following: !@#$%^&*()~-
        </li>
      </ul>
    </>
  );
};

type SignUpPageProps = {
  CLIENT_BACKEND_URL: string;
};

type APIPayload = {
  firstName: string;
  lastName: string;
  email: string;
};

type APIResponse = {
  message: string;
};

const SignUpPage = ({ CLIENT_BACKEND_URL }: SignUpPageProps): JSX.Element => {
  const [email, setEmail] = React.useState("");
  const [emailError, setEmailError] = React.useState(false);

  const [firstName, setFirstName] = React.useState("");
  const [firstNameError, setFirstNameError] = React.useState(false);

  const [lastName, setLastName] = React.useState("");
  const [lastNameError, setLastNameError] = React.useState(false);

  const [password, setPassword] = React.useState("");
  const [passwordError, setPasswordError] = React.useState(false);

  const [confirmPassword, setConfirmPassword] = React.useState("");

  const [loading, setLoading] = React.useState(false);

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
    setLoading(true);
    let errorCreation = false;

    const authUser = await createUserWithEmailAndPassword(getAuth(), email, password)
      .then((res) => {
        console.log(res);
        return res;
      })
      .catch((err) => {
        // Error codes:
        // https://firebase.google.com/docs/reference/js/v8/firebase.auth.Auth#createuserwithemailandpassword
        if (err?.code === "auth/email-already-in-use") {
          toast.error("Email already in use!");
        } else if (err?.code === "auth/invalid-email") {
          toast.error("Email is invalid!");
        } else if (err?.code === "auth/operation-not-allowed") {
          toast.error("Operation not allowed!");
        } else if (err?.code === "auth/weak-password") {
          toast.error("Password is too weak!");
        } else {
          console.error(err);
          toast.error("Error Uncaught");
        }
        errorCreation = true;
      });

    if (errorCreation) {
      setLoading(false);
      return; // Don't continue, error
    }

    const payload: APIPayload = {
      firstName,
      lastName,
      email,
    };

    const [res, err] = await apiPost<APIPayload, APIResponse>(
      `${CLIENT_BACKEND_URL}/auth/register`,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (authUser as any).user?.accessToken,
      payload,
    );

    if (err !== null) {
      if (err instanceof HttpException) {
        toast.error(err.message);
      } else {
        toast.error(err);
      }
      setLoading(false);
      return;
    }

    if (res === null) throw new Error("Response and error are null"); // Actual error that should never happen
    toast.info(res.message);
    setLoading(false);
  };

  return (
    <>
      <Head>
        <title>Sign Up</title>
        <meta name="description" content="Sign Up" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <SideNavbar empty={true} list={[]} />
      <ContentContainer>
        <form
          className="w-full h-full flex flex-col items-center pt-[6rem]"
          onSubmit={handleOnSubmit}
        >
          <h1 className="text-6xl">Welcome to GitHappens!</h1>
          <div className="mt-10 w-[25rem]">
            <div className="flex flex-row justify-between">
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
            <div className="flex flex-col w-full items-center pt-4">
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
              <div className="mt-4 w-full">
                <p className="text-lg">Password Rules:</p>
                <ul className="list-disc pl-[1.25rem]">
                  <PasswordRequirements password={password} passwordError={passwordError} />
                </ul>
              </div>
              <div className="w-[25rem] mt-4">
                <LoadingButton
                  variant="contained"
                  id="submit-form-button"
                  className="w-[25rem]"
                  type="submit"
                  loading={loading}
                >
                  Sign Up
                </LoadingButton>
              </div>
            </div>
          </div>
        </form>
      </ContentContainer>
    </>
  );
};

export const getStaticProps: GetStaticProps<SignUpPageProps> = async () => {
  return {
    props: { CLIENT_BACKEND_URL: FE_BACKEND_URL },
  };
};

export default withAuthUser<SignUpPageProps>({
  whenAuthed: AuthAction.REDIRECT_TO_APP,
  whenUnauthedBeforeInit: AuthAction.SHOW_LOADER,
})(SignUpPage);
