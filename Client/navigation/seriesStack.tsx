import React from "react";

// import Icon from "react-native-vector-icons/Octicons";
import { createStackNavigator } from "@react-navigation/stack";

import SeriesAddScreen from "../screens/SeriesAddScreen";
import SeriesListScreen from "../screens/SeriesListScreen";
import SeriesDetailScreen from "../screens/SeriesDetailScreen";

export type SeriesStackParamList = {
  Series: { singleUpdate: { series: Series } } | undefined;
  SeriesDetail: { series: Series };
  SeriesAdd: {};
};

const Stack = createStackNavigator<SeriesStackParamList>();

export default function MoviesStack() {
  return (
    <Stack.Navigator mode="modal">
      <Stack.Screen
        name="Series"
        component={SeriesListScreen}
        options={{
          // If header is shown in this screen, the flatlist cannot be scrolled
          // down to the very end, a marginBottom has to be added. If you do
          // decide to show the header, give necessary marginBottom (~90) to
          // the main container in SeriesListScreen.
          headerShown: false,
          // headerTransparent: true,
          // headerTitle: "Series",
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
        name="SeriesDetail"
        component={SeriesDetailScreen}
        options={{
          headerShown: false,
        }}
      />
      <Stack.Screen
        name="SeriesAdd"
        component={SeriesAddScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
