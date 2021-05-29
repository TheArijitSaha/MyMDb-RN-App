import React from "react";

import { createStackNavigator } from "@react-navigation/stack";

import Home from "../screens/Home";
import MovieDetailScreen from "../screens/MovieDetailScreen";
import SeriesDetailScreen from "../screens/SeriesDetailScreen";

export type HomeStackParamList = {
  Home: {};
  MovieSuggestionDetail: { movie: Movie };
  SeriesSuggestionDetail: { series: Movie };
};

const Stack = createStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator mode="modal">
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="MovieSuggestionDetail"
        component={MovieDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SeriesSuggestionDetail"
        component={SeriesDetailScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
