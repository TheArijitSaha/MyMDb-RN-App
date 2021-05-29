import React, { PureComponent } from "react";

import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface SeriesCarouselListItemProps {
  series: Series;
  navigation: any;
}

export default class SeriesCarouselListItem extends PureComponent<
  SeriesCarouselListItemProps
> {
  constructor(props: SeriesCarouselListItemProps) {
    super(props);
  }

  render() {
    const { series, navigation } = this.props;

    const styles = StyleSheet.create({
      container: {
        marginVertical: 20,
        borderRadius: 5,
        height: 300,
      },
      poster: {
        height: 280,
        borderRadius: 5,
      },
      info: {
        padding: 5,
      },
      title: {
        textAlign: "center",
        fontFamily: "sans-serif-thin",
        color: "white",
        fontWeight: "400",
        fontSize: 20,
      },
    });

    return (
      <View style={styles.container}>
        <Pressable
          onPress={() =>
            navigation.navigate("SeriesSuggestionDetail", { series: series })
          }
        >
          <Image source={{ uri: series.poster }} style={styles.poster} />
          <View style={styles.info}>
            <Text style={styles.title}>{series.title}</Text>
          </View>
        </Pressable>
      </View>
    );
  }
}
