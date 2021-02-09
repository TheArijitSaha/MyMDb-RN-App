import React, { useContext, useEffect, useReducer } from "react";

import { StatusBar } from "expo-status-bar";
import { ActivityIndicator, ImageBackground, Text, View } from "react-native";
// import { useNavigation } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { useIsDrawerOpen } from "@react-navigation/drawer";
import { StyleSheet } from "react-native";

// import { API_URL } from "../constants";
// import { AuthContext } from "../contexts/AuthContext";
import { MoviesStackParamList } from "../navigation/moviesStack";

type Props = StackScreenProps<MoviesStackParamList, "MovieDetail">;

export default function MovieDetailScreen({ route }: Props) {
  const { movie } = route.params;
  const isDrawerOpen = useIsDrawerOpen();
  // const { userToken } = useContext(AuthContext);

  return (
    <View>
      <StatusBar style={isDrawerOpen ? "light" : "dark"} />

      <ImageBackground
        source={{ uri: movie.poster }}
        style={styles.container}
        blurRadius={3}
      >
        <View style={styles.movieInfo}>
          {movie.subtitle && (
            <View style={styles.detailView}>
              <Text style={styles.label}>aka</Text>
              <Text style={styles.info}>{movie.subtitle}</Text>
            </View>
          )}
          <View style={styles.detailView}>
            <Text style={styles.label}>Released in</Text>
            <Text style={styles.info}>{movie.releaseYear}</Text>
          </View>
          <View style={styles.detailView}>
            <Text style={styles.label}>Directed by</Text>
            <Text style={styles.info}>{movie.directors.join(", ")}</Text>
          </View>
          <View style={styles.detailView}>
            <Text style={styles.label}>Runtime</Text>
            <Text style={styles.info}>{movie.runtime} mins</Text>
          </View>
          <View style={styles.detailView}>
            <Text style={styles.label}>Starring</Text>
            <Text style={styles.info}>{movie.cast.join(", ")}</Text>
          </View>
          <View style={styles.detailView}>
            <Text style={styles.label}>Genres</Text>
            <Text style={styles.info}>{movie.genres.join(", ")}</Text>
          </View>
          <View style={styles.detailView}>
            <Text style={styles.label}>IMDB</Text>
            <Text style={styles.info}>{movie.imdb.rating}</Text>
          </View>
          {movie.rottenTomatoes.rating && (
            <View style={styles.detailView}>
              <Text style={styles.label}>Tomatometer</Text>
              <Text style={styles.info}>{movie.rottenTomatoes.rating}</Text>
            </View>
          )}
        </View>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    display: "flex",
  },
  movieInfo: {
    backgroundColor: "rgba( 120, 120, 120, 0.6 )",
    display: "flex",
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
  },
  detailView: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },
  label: {
    flex: 7,
    textAlign: "right",
    paddingRight: 10,
    color: "white",
    fontFamily: "sans-serif-thin",
    fontSize: 18,
  },
  info: {
    flex: 13,
    fontSize: 18,
    color: "#eeeeee",
    fontFamily: "monospace",
  },
});
