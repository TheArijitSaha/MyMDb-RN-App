import React, { useContext } from "react";

import {
  //   Alert,
  //   Button,
  //   Image,
  //   SafeAreaView,
  //   ScrollView,
  StyleSheet,
  //   Text,
  View,
} from "react-native";
import {
  createDrawerNavigator,
  DrawerContentComponentProps,
  DrawerContentScrollView,
  DrawerItem,
  DrawerItemList,
  //   DrawerView,
} from "@react-navigation/drawer";

import MoviesStack from "./moviesStack";
import { AuthContext } from "../contexts/AuthContext";

type CustomDrawerProps = DrawerContentComponentProps<DrawerContentOptions> & {
  signOutHandler: () => Promise<void>;
};

const CustomDrawer = (props: CustomDrawerProps) => {
  return (
    <React.Fragment>
      <DrawerContentScrollView {...props}>
        {
          //         <SafeAreaView style={styles.drawerProfileView}>
          //           <Image
          //             source={require("../../assets/avatar-placeholder.jpg")}
          //             style={styles.drawerProfileImage}
          //           ></Image>
          //           <View style={styles.drawerProfileText}>
          //             <Text style={styles.drawerProfileName}>
          //               {props.user ? props.user.name : ""}
          //             </Text>
          //             <Text style={styles.drawerProfileRating}>rating</Text>
          //           </View>
          //         </SafeAreaView>
        }
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
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  drawer: {
    backgroundColor: "black",
    width: 300,
  },
  drawerProfileImage: {
    borderRadius: 50,
    height: 60,
    marginLeft: 18,
    marginTop: 30,
    width: 60,
  },
  drawerProfileText: {
    marginLeft: 8,
    justifyContent: "center",
  },
  drawerProfileView: {
    backgroundColor: "black",
    borderBottomWidth: 1,
    flexDirection: "row",
    height: 120,
  },
  drawerProfileName: {
    color: "white",
    fontSize: 20,
    height: 35,
    paddingLeft: 8,
  },
  drawerProfileRating: {
    color: "gray",
    fontSize: 15,
    paddingLeft: 8,
  },
  drawerLogoutItem: {
    color: "white",
  },
});
