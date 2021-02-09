import React, { useState, useContext } from "react";

import { StatusBar } from "expo-status-bar";
import { Button, Image, TextInput, StyleSheet, View } from "react-native";

import { AuthContext } from "../contexts/AuthContext";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signIn } = useContext(AuthContext);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Image
        style={styles.logo}
        source={require("../assets/adaptive-icon.png")}
      />

      <View style={styles.inputView}>
        <TextInput
          style={styles.textInput}
          placeholder="Email Id"
          placeholderTextColor="grey"
          onChangeText={setEmail}
        ></TextInput>
      </View>

      <View style={styles.inputView}>
        <TextInput
          style={styles.textInput}
          placeholder="Password"
          placeholderTextColor="grey"
          secureTextEntry={true}
          onChangeText={setPassword}
        ></TextInput>
      </View>

      <View>
        <Button
          onPress={() => signIn({ email: email, password: password })}
          title="Sign In"
          color="#8f1106"
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: "15%",
  },
  logo: {
    height: 120,
    width: 120,
    padding: 20,
  },
  inputView: {
    backgroundColor: "white",
    borderRadius: 5,
    width: "70%",
    height: 45,
    marginBottom: 20,
  },
  textInput: {
    height: 50,
    flex: 1,
    fontSize: 17,
    padding: 10,
  },
});
