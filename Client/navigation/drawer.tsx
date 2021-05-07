import React, { useContext } from "react";

import { Image, SafeAreaView, StyleSheet, View } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";

import MoviesStack from "./moviesStack";
import SeriesStack from "./seriesStack";
import { AuthContext } from "../contexts/AuthContext";

type CustomDrawerProps = DrawerContentComponentProps<DrawerContentOptions> & {
  signOutHandler: () => Promise<void>;
};

const CustomDrawer = (props: CustomDrawerProps) => {
  return (
    <React.Fragment>
      <DrawerContentScrollView {...props}>
        <SafeAreaView style={styles.drawerBannerView}>
          <Image
            source={require("../assets/icon.png")}
            style={styles.drawerAppImage}
          ></Image>
        </SafeAreaView>
        <DrawerItemList {...props} />
      </DrawerContentScrollView>
      <View
        style={{
          borderBottomColor: "gray",
          borderBottomWidth: 0.2,
        }}
      />
      <DrawerItem
        label="Sign Out"
        inactiveTintColor="gray"
        onPress={props.signOutHandler}
      />
    </React.Fragment>
  );
};

const Drawer = createDrawerNavigator();

export default function QnQDrawer() {
  const { signOut } = useContext(AuthContext);

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawer {...props} signOutHandler={signOut} />
      )}
      drawerContentOptions={{
        activeTintColor: "#eb233a",
        inactiveTintColor: "#eb233a",
      }}
      drawerPosition="left"
      drawerStyle={styles.drawer}
      drawerType="front"
      initialRouteName="MoviesStack"
    >
      <Drawer.Screen
        name="MoviesStack"
        component={MoviesStack}
        options={{ title: "Movies" }}
      />
      <Drawer.Screen
        name="SeriesStack"
        component={SeriesStack}
        options={{ title: "Series" }}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: "black",
    width: 300,
  },
  drawerBannerView: {
    backgroundColor: "black",
    flexDirection: "column",
    height: 120,
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 30,
  },
  drawerAppImage: {
    borderRadius: 50,
    height: 100,
    marginTop: 10,
    width: 100,
    marginBottom: -10,
  },
  drawerLogoutItem: {
    color: "white",
  },
});
