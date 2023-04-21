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
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen
        name="Home"
        component={Home}
      />
      <Stack.Screen
        name="MovieSuggestionDetail"
        component={MovieDetailScreen}
      />
      <Stack.Screen
        name="SeriesSuggestionDetail"
        component={SeriesDetailScreen}
      />
    </Stack.Navigator>
  );
}
