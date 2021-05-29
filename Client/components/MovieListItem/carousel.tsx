import React, { PureComponent } from "react";

import { Image, Pressable, StyleSheet, Text, View } from "react-native";

interface MovieCarouselListItemProps {
  movie: Movie;
  navigation: any;
}

export default class MovieCarouselListItem extends PureComponent<
  MovieCarouselListItemProps
> {
  constructor(props: MovieCarouselListItemProps) {
    super(props);
  }

  render() {
    const { movie, navigation } = this.props;

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
            navigation.navigate("MovieSuggestionDetail", { movie: movie })
          }
        >
          <Image source={{ uri: movie.poster }} style={styles.poster} />
          <View style={styles.info}>
            <Text style={styles.title}>{movie.title}</Text>
          </View>
        </Pressable>
      </View>
    );
  }
}
