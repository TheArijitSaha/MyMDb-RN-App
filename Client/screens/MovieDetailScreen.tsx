import React, { useCallback, useContext, useReducer } from "react";

import { StatusBar } from "expo-status-bar";
import { ImageBackground, Text, TouchableOpacity, View } from "react-native";
import { useIsDrawerOpen } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import { BackHandler, StyleSheet } from "react-native";
import Icon from "react-native-vector-icons/Ionicons";
import { debounce } from "lodash";

import { API_URL } from "../constants";
import { AuthContext } from "../contexts/AuthContext";
import { MoviesStackParamList } from "../navigation/moviesStack";

type Props = StackScreenProps<MoviesStackParamList, "MovieDetail">;

type State = {
  movie: Movie;
};

type Action = { type: "TOGGLE_SEEN" };

function reducer(prevState: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_SEEN":
      return {
        ...prevState,
        movie: { ...prevState.movie, seen: !prevState.movie.seen },
      };
    default:
      throw new Error("Unknown Action type");
  }
}

export default function MovieDetailScreen({ navigation, route }: Props) {
  const initialState: State = {
    movie: { ...route.params.movie },
  };

  const [{ movie }, dispatch] = useReducer(reducer, initialState);

  const isDrawerOpen = useIsDrawerOpen();
  const { userToken } = useContext(AuthContext);

  const debouncedUpdate = useCallback(
    debounce(async (updatedMovie) => {
      try {
        const jsonResponse = await fetch(`${API_URL}movies/${movie._id}`, {
          method: "PATCH",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify({ movie: updatedMovie }),
        });

        const response = await jsonResponse.json();

        if (response.error) {
          console.error(response.error);
        }
      } catch (e) {
        console.error(e);
      }
    }, 700),
    []
  );

  const handleSeenToggle = () => {
    dispatch({
      type: "TOGGLE_SEEN",
    });
    debouncedUpdate({ ...movie, seen: !movie.seen });
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        navigation.navigate("Movies", { singleUpdate: { movie: movie } });
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [movie])
  );

  return (
    <View>
      <StatusBar style={isDrawerOpen ? "light" : "dark"} />

      <ImageBackground
        source={{ uri: movie.poster }}
        style={styles.container}
        blurRadius={3}
      >
        <View style={styles.movieInfo}>
          <View
            style={
              movie.subtitle ? [styles.nameView, styles.grow2] : styles.nameView
            }
          >
            <Text style={styles.title}>{movie.title}</Text>
            {movie.subtitle && (
              <Text style={styles.subtitle}>[{movie.subtitle}]</Text>
            )}
          </View>
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
          <View style={[styles.detailView, styles.grow2]}>
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
          <View style={styles.watchBanner}>
            <TouchableOpacity onPress={handleSeenToggle}>
              {movie.seen ? (
                <Icon
                  name="eye-sharp"
                  size={25}
                  color="white"
                  style={styles.watchedIcon}
                />
              ) : (
                <Icon
                  name="eye-off-sharp"
                  size={25}
                  color="white"
                  style={styles.watchedIcon}
                />
              )}
            </TouchableOpacity>
          </View>
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
    paddingTop: 33,
  },
  nameView: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    padding: 10,
  },
  detailView: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 3,
    paddingBottom: 3,
  },
  title: {
    flex: 1,
    textAlign: "center",
    fontSize: 23,
    color: "#eeeeee",
    fontFamily: "monospace",
  },
  subtitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 18,
    color: "#eeeeee",
    fontFamily: "monospace",
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
  grow2: {
    flexGrow: 2,
  },
  watchBanner: {
    flex: 1,
    display: "flex",
    alignItems: "center",
  },
  watchedIcon: {
    alignSelf: "center",
  },
});
