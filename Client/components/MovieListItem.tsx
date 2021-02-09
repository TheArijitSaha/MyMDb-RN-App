import React, { PureComponent } from "react";

import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";

interface MovieListItemProps {
  movie: Movie;
  navigation: any;
}

export default class MovieListItem extends PureComponent<MovieListItemProps> {
  constructor(props: MovieListItemProps) {
    super(props);
  }

  render() {
    const { movie, navigation } = this.props;

    const styles = StyleSheet.create({
      container: {
        width: "50%",
        height: 280,
        display: "flex",
        justifyContent: "center",
      },
      poster: {
        flex: 1,
        resizeMode: "cover",
        backgroundColor: "#aaaaaa",
        borderStyle: "solid",
        borderWidth: 3,
      },
      label: {
        position: "absolute",
        bottom: 0,
        justifyContent: "center",
        width: "100%",
        backgroundColor: movie.seen
          ? "rgba(94, 154, 115, 0.85)"
          : "rgba(164, 104, 115, 0.85)",
        padding: 5,
      },
      title: {
        textAlign: "center",
        flex: 1,
        color: "white",
      },
      releaseYear: {
        textAlign: "center",
        flex: 1,
        color: "white",
      },
    });

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.poster}
          onPress={() => navigation.navigate("MovieDetail", { movie: movie })}
        >
          <ImageBackground source={{ uri: movie.poster }} style={styles.poster}>
            <View style={styles.label}>
              <Text style={styles.title}>
                {movie.title} ({movie.releaseYear})
              </Text>
            </View>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  }
}
