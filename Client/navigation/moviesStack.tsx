import React from "react";

// import Icon from "react-native-vector-icons/Octicons";
import { createStackNavigator } from "@react-navigation/stack";

import MovieListScreen from "../screens/MovieListScreen";
import MovieDetailScreen from "../screens/MovieDetailScreen";

export type MoviesStackParamList = {
  Movies: { singleUpdate: { movie: Movie } } | undefined;
  MovieDetail: { movie: Movie };
};

const Stack = createStackNavigator<MoviesStackParamList>();

export default function MoviesStack() {
  return (
    <Stack.Navigator mode="modal">
      <Stack.Screen
        name="Movies"
        component={MovieListScreen}
        options={{
          headerShown: true,
          // headerTransparent: true,
          headerTitle: "Movies",
          // headerLeft: () => (
          //   <Icon
          //     name="three-bars"
          //     size={28}
          //     style={{ padding: 10, paddingLeft: 18 }}
          //     onPress={() => navigation.openDrawer()}
          //   />
          // )
        }}
      />
      <Stack.Screen
        name="MovieDetail"
        component={MovieDetailScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
