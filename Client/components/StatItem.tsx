import React, { PureComponent } from "react";

import { /*Pressable,*/ StyleSheet, Text, View } from "react-native";

export type Statistic = {
  value: string | number;
  text: string;
};

interface SeriesCarouselListItemProps {
  stat: Statistic;
  tint?: string;
  navigation: any;
}

export default class SeriesCarouselListItem extends PureComponent<
  SeriesCarouselListItemProps
> {
  constructor(props: SeriesCarouselListItemProps) {
    super(props);
  }

  render() {
    const { stat, tint = "blueviolet" } = this.props;

    const styles = StyleSheet.create({
      container: {
        marginVertical: 20,
        borderRadius: 10,
        height: 120,
        backgroundColor: tint,
        justifyContent: "center",
      },
      info: {
        paddingVertical: 10,
        paddingHorizontal: 5,
      },
      text: {
        textAlign: "center",
        fontFamily: "sans-serif-thin",
        color: "white",
        fontWeight: "400",
        fontSize: 20,
      },
      value: {
        textAlign: "center",
        fontFamily: "monospace",
        color: "white",
        fontWeight: "400",
        fontSize: 25,
      },
    });

    return (
      <View style={styles.container}>
        {/*
        <Pressable
          onPress={() =>
            navigation.navigate("SeriesSuggestionDetail", { stat: stat })
          }
        >
        <Image source={{ uri: stat.poster }} style={styles.poster} />
      */}
        <View style={styles.info}>
          <Text style={styles.value}>{stat.value}</Text>
          <Text style={styles.text}>{stat.text}</Text>
        </View>
        {/*</Pressable>*/}
      </View>
    );
  }
}
