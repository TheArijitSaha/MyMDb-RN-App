import React from "react";

import { Text, StyleSheet, TextInput, View } from "react-native";

type Info = {
  value: string;
  placeholder: string;
  keyboardType: "default" | "number-pad" | "decimal-pad";
  infoChangeHandler: (text: string) => void;
};

type Props = {
  editMode: boolean;
  label: string;
  info: Info[];
};

export default function ArrayInformation({ editMode, label, info }: Props) {
  const rows = editMode
    ? info.map((val, index) => (
        <View key={index} style={styles.infoRow}>
          <TextInput
            value={val.value}
            placeholder={val.placeholder}
            keyboardType={val.keyboardType}
            style={styles.infoText}
            onChangeText={val.infoChangeHandler}
            placeholderTextColor="#555555"
          />
        </View>
      ))
    : info.map((val, index) => (
        <View key={index} style={styles.infoRow}>
          <Text style={styles.infoText}>{val.value}</Text>
        </View>
      ));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.infoView}>{rows}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 3,
    paddingBottom: 3,
  },
  label: {
    flex: 7,
    textAlign: "right",
    padding: 2,
    paddingRight: 10,
    color: "white",
    fontFamily: "sans-serif-thin",
    fontSize: 18,
  },
  infoView: {
    flex: 13,
    paddingRight: 20,
  },
  infoRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    flex: 1,
    padding: 2,
    fontSize: 18,
    color: "#eeeeee",
    fontFamily: "monospace",
  },
  deleteInfoIcon: {
    paddingLeft: 5,
  },
});
