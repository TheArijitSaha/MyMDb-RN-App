import { createContext } from "react";

type AuthContextProps = {
  signIn: (data: SignInData) => Promise<true | { error: string }>;
  signOut: () => Promise<void>;
  userToken: string | null;
};

export const AuthContext = createContext<AuthContextProps>({
  signIn: async (_data: SignInData) => false,
  signOut: async () => {},
  userToken: "",
});
