import React from "react";
import { UserDetails } from "models/user.model";

type UserContextProps = {
  userDetails: UserDetails | null;
  setUserDetails: React.Dispatch<React.SetStateAction<UserDetails | null>>;
};

const UserContext = React.createContext<Partial<UserContextProps>>({});

type UserProviderProps = {
  children: React.ReactNode;
};

export const useUser = (): Partial<UserContextProps> => {
  return React.useContext(UserContext);
};

export const UserProvider = ({ children }: UserProviderProps): JSX.Element => {
  const [user, setUser] = React.useState<UserDetails | null>(null);

  const value = {
    userDetails: user,
    setUserDetails: setUser,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
