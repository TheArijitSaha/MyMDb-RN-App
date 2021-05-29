import React from "react";

import { createStackNavigator } from "@react-navigation/stack";

import Drawer from "./drawer";
import SignInScreen from "../screens/SignInScreen";

const Stack = createStackNavigator();

interface Props {
  isSignout: boolean;
  userToken: string | null;
}

export default function authStack(props: Props) {
  return (
    <Stack.Navigator
      mode="modal"
      screenOptions={() => ({
        headerShown: false,
      })}
    >
      {props.userToken == null ? (
        <Stack.Screen name="SignInScreen" component={SignInScreen} />
      ) : (
        <Stack.Screen name="Drawer" component={Drawer} />
      )}
    </Stack.Navigator>
  );
}
