import React from "react";

import {
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import Icon from "react-native-vector-icons/Ionicons";

type Props = {
  editMode: boolean;
  label: string;
  value: string[];
  keyboardType?: "default" | "number-pad" | "decimal-pad";
  infoAddHandler: () => void;
  infoChangeHandlerMaker: (index: number) => (text: string) => void;
  infoDeleteHandlerMaker: (index: number) => () => void;
};

export default function ArrayInformation({
  editMode,
  infoAddHandler,
  infoChangeHandlerMaker,
  infoDeleteHandlerMaker,
  label,
  value,
  keyboardType = "default",
}: Props) {
  const info = editMode
    ? value.map((val, index) => (
        <View key={index} style={styles.infoRow}>
          <TextInput
            value={val}
            style={styles.infoText}
            onChangeText={infoChangeHandlerMaker(index)}
            keyboardType={keyboardType}
          />
          <TouchableOpacity
            style={styles.deleteInfoIcon}
            onPress={infoDeleteHandlerMaker(index)}
          >
            <Icon name="close-sharp" size={18} color="lightgray" />
          </TouchableOpacity>
        </View>
      ))
    : value.map((val, index) => (
        <View key={index} style={styles.infoRow}>
          <Text style={styles.infoText}>{val}</Text>
        </View>
      ));

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.infoView}>
        {info}
        {editMode && (
          <View style={styles.infoRow}>
            <TouchableOpacity
              style={styles.deleteInfoIcon}
              onPress={infoAddHandler}
            >
              <Icon name="add" size={18} color="lightgray" />
            </TouchableOpacity>
          </View>
        )}
      </View>
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
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    padding: 2,
    fontSize: 18,
    color: "#eeeeee",
    fontFamily: "monospace",
  },
  deleteInfoIcon: {
    paddingLeft: 5,
  },
});
