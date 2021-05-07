import React, { useEffect, useMemo, useReducer } from "react";

import AppLoading from "expo-app-loading";
import { StatusBar } from "expo-status-bar";
import { Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { NavigationContainer } from "@react-navigation/native";

import { AuthContext } from "./contexts/AuthContext";
import { API_URL, USER_TOKEN } from "./constants";
import Stack from "./navigation/authStack";

type State = {
  readonly isLoading: boolean;
  readonly isSignout: boolean;
  readonly user: null;
  readonly userToken: string | null;
};

type Action =
  | { type: "RESTORE_TOKEN"; data: { user: null; token: string | null } }
  | { type: "SIGN_IN"; data: { user: null; token: string } }
  | { type: "SIGN_OUT" };

const initialState: State = {
  isLoading: true,
  isSignout: false,
  user: null,
  userToken: null,
};

function reducer(prevState: State, action: Action): State {
  switch (action.type) {
    case "RESTORE_TOKEN":
      return {
        ...prevState,
        isLoading: false,
        user: action.data.user,
        userToken: action.data.token,
      };
    case "SIGN_IN":
      return {
        ...prevState,
        isSignout: false,
        user: action.data.user,
        userToken: action.data.token,
      };
    case "SIGN_OUT":
      return {
        ...prevState,
        isSignout: true,
        user: null,
        userToken: null,
      };
    default:
      throw new Error();
  }
}

export default function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    // Fetch the token from storage then navigate to our appropriate place
    const bootstrapAsync = async () => {
      let userToken: string | null = null;

      try {
        userToken = await AsyncStorage.getItem(USER_TOKEN);
      } catch (e) {
        // The token is not stored in Async storage, this is
        // a first time login for this user, so we restore the
        // token with null
        dispatch({ type: "RESTORE_TOKEN", data: { token: null, user: null } });
        return;
      }

      fetch(API_URL + "users/me", {
        method: "GET",
        headers: userToken
          ? {
              Accept: "application/json",
              "Content-Type": "application/json",
              Authorization: "Bearer " + userToken,
            }
          : {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
      })
        .then((jsonResponse) => jsonResponse.json())
        .then((response) => {
          if (response.error) {
            // jwt has expired or corrupt token
            AsyncStorage.removeItem(USER_TOKEN).then(() => {
              dispatch({
                type: "RESTORE_TOKEN",
                data: { token: null, user: null },
              });
            });
            return;
          }

          // Persist refreshed token in AsyncStorage and then dispatch SIGN_IN action
          AsyncStorage.setItem(USER_TOKEN, response.user.token).then(() => {
            dispatch({
              type: "RESTORE_TOKEN",
              data: { token: response.user.token, user: response.user },
            });
          });
        })
        .catch((error) => {
          console.error(error);
        });
    };

    bootstrapAsync();
  }, []);

  const authContextValue = useMemo(
    () => ({
      signIn: async (data: SignInData) => {
        if (data.email.length < 1) {
          return { error: "Enter email!" };
        }

        if (data.password.length < 1) {
          return { error: "Enter password!" };
        }

        try {
          const jsonResponse = await fetch(API_URL + "users/login", {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              user: {
                email: data.email,
                password: data.password,
              },
            }),
          });

          const response = await jsonResponse.json();

          if (response.message) {
            return { error: response.message };
          }

          // Persist token in AsyncStorage
          await AsyncStorage.setItem(USER_TOKEN, response.user.token);

          // dispatch SIGN_IN action
          dispatch({
            type: "SIGN_IN",
            data: { token: response.user.token, user: response.user },
          });
          return true;
        } catch (error) {
          console.error(error);
          return { error: "Some Error Occured" };
        }
      },
      signOut: async () => {
        // Remove token in AsyncStorage and then dispatch SIGN_OUT action
        AsyncStorage.removeItem(USER_TOKEN).then(() => {
          dispatch({ type: "SIGN_OUT" });
        });
      },
      userToken: state.userToken,
    }),
    [state.userToken]
  );

  if (state.isLoading) {
    return <AppLoading />;
  }

  return (
    <AuthContext.Provider value={authContextValue}>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack isSignout={state.isSignout} userToken={state.userToken} />
      </NavigationContainer>
    </AuthContext.Provider>
  );
}
