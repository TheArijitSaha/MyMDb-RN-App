import React, { useState, useContext } from "react";

import { StatusBar } from "expo-status-bar";
import { Button, Image, Text, TextInput, StyleSheet, View } from "react-native";

import { AuthContext } from "../contexts/AuthContext";

export default function SignInScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [error, setError] = useState("");

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
          onPress={async () => {
            setError("");
            setIsSigningIn(true);
            const response = await signIn({ email: email, password: password });
            if (response !== true) {
              setError(response.error);
              setIsSigningIn(false);
            }
          }}
          title="Sign In"
          color="#8f1106"
          disabled={isSigningIn}
        />
      </View>

      <View>
        <Text style={styles.error}>{error}</Text>
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
  error: {
    textAlign: "center",
    color: "pink",
    padding: 10,
  },
});
