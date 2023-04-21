import React, { useContext } from "react";

import { Image, SafeAreaView, StyleSheet, View } from "react-native";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
} from "@react-navigation/drawer";

import HomeStack from "./homeStack";
import MoviesStack from "./moviesStack";
import SeriesStack from "./seriesStack";
import { AuthContext } from "../contexts/AuthContext";

type CustomDrawerProps = DrawerContentComponentProps<DrawerContentOptions> & {
  signOutHandler: () => Promise<void>;
};

const CustomDrawer = (props: CustomDrawerProps) => {
  return (
    <React.Fragment>
      <DrawerContentScrollView {...props}
          style={{
            backgroundColor: "black"
          }}>
        <SafeAreaView style={styles.drawerBannerView}>
          <Image
            source={require("../assets/icon.png")}
            style={styles.drawerAppImage}
          ></Image>
        </SafeAreaView>
        <DrawerItemList {...props}
          activeTintColor="#eb233a"
          inactiveTintColor="#eb233a"
          activeBackgroundColor="#300202"
          inactiveBackgroundColor="black"
        />
      </DrawerContentScrollView>
      <View
        style={{
          borderBottomColor: "gray",
          borderBottomWidth: 0.2,
        }}
      />
      <View style={{ backgroundColor: "black"}}>
        <DrawerItem
          label="Sign Out"
          inactiveTintColor="gray"
          activeBackgroundColor="black"
          inactiveBackgroundColor="black"
          onPress={props.signOutHandler}
        />
      </View>
    </React.Fragment>
  );
};

const Drawer = createDrawerNavigator();

export default function MyMDbDrawer() {
  const { signOut } = useContext(AuthContext);

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <CustomDrawer {...props} signOutHandler={signOut} />
      )}
      initialRouteName="HomeStack"
      screenOptions={{
        drawerActiveTintColor: "#eb233a",
        drawerInactiveTintColor: "#eb233a",
        drawerPosition: "right",
        drawerActiveBackgroundColor: "black",
        drawerInactiveBackgroundColor: "black",
        drawerType: "front",
      }}
    >
      <Drawer.Screen
        name="HomeStack"
        component={HomeStack}
        options={{ title: "Home" }}
      />
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
});
