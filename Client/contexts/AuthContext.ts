import { createContext } from "react";

type AuthContextProps = {
  signIn: (data: SignInData) => Promise<void>;
  signOut: () => Promise<void>;
  userToken: string | null;
};

export const AuthContext = createContext<AuthContextProps>({
  signIn: async (data: SignInData) => {},
  signOut: async () => {},
  userToken: "",
});
