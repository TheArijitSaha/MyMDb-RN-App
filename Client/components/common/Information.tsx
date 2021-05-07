import React, { FC } from "react";

import { Text, StyleSheet, TextInput, View } from "react-native";

type Props = {
  editMode: boolean;
  label: string | false;
  value: string;
  infoChangeHandler?: (text: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "decimal-pad" | "number-pad";
  followText?: false | string;
};

const Information: FC<Props> = function ({
  editMode,
  infoChangeHandler = (_) => {},
  label,
  value,
  placeholder = "",
  keyboardType = "default",
  followText = false,
}) {
  const Input = () => (
    <TextInput
      style={
        followText
          ? styles.infoTextOpenWidth
          : [
              styles.infoText,
              label ? styles.leftAlignedText : styles.centerAlignedText,
            ]
      }
      value={value}
      onChangeText={infoChangeHandler}
      keyboardType={keyboardType ?? "default"}
      placeholder={placeholder}
      placeholderTextColor="#555555"
    />
  );

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.infoView}>
        {editMode ? (
          followText ? (
            <View style={styles.runtimeEditView}>
              {Input()}
              <Text style={styles.infoTextOpenWidth}>{followText}</Text>
            </View>
          ) : (
            Input()
          )
        ) : (
          <Text
            style={[
              styles.infoText,
              label ? styles.leftAlignedText : styles.centerAlignedText,
            ]}
          >
            {value}
            {followText}
          </Text>
        )}
      </View>
    </View>
  );
};

export default Information;

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
  infoText: {
    padding: 2,
    fontSize: 18,
    color: "#eeeeee",
    fontFamily: "monospace",
  },
  leftAlignedText: {
    textAlign: "left",
  },
  centerAlignedText: {
    textAlign: "center",
  },
  infoTextOpenWidth: {
    padding: 2,
    fontSize: 18,
    color: "#eeeeee",
    fontFamily: "monospace",
  },
  runtimeEditView: {
    display: "flex",
    flexDirection: "row",
  },
});
