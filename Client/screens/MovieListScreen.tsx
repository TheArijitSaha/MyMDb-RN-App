import React, { useContext, useEffect, useReducer } from "react";

import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  Text,
  View,
} from "react-native";
// import { useNavigation } from "@react-navigation/native";
import { useIsDrawerOpen } from "@react-navigation/drawer";
import { StackScreenProps } from "@react-navigation/stack";

import { API_URL } from "../constants";
import { AuthContext } from "../contexts/AuthContext";
import MovieListItem from "../components/MovieListItem";
import { MoviesStackParamList } from "../navigation/moviesStack";

type State = {
  readonly movies: Movie[];
  readonly offset: number;
  readonly isLoading: boolean;
};

type Props = StackScreenProps<MoviesStackParamList, "Movies">;

type Action = { type: "LOAD_MORE"; data: { additionalMovies: Movie[] } };

const initialState: State = {
  movies: [],
  offset: 0,
  isLoading: true,
};

function reducer(prevState: State, action: Action): State {
  switch (action.type) {
    case "LOAD_MORE":
      return {
        ...prevState,
        isLoading: false,
        movies: [...prevState.movies, ...action.data.additionalMovies],
        offset: prevState.offset + action.data.additionalMovies.length,
      };
    default:
      throw new Error();
  }
}

export default function MovieListScreen({ navigation }: Props) {
  const [{ movies, isLoading, offset }, dispatch] = useReducer(
    reducer,
    initialState
  );
  const isDrawerOpen = useIsDrawerOpen();
  const { userToken } = useContext(AuthContext);

  const loadMovies = async () => {
    try {
      const jsonResponse = await fetch(API_URL + `movies?offset=${offset}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      const response = await jsonResponse.json();

      if (response.error) {
        console.log(response.error);
        return;
      }

      appendMovies(response);
    } catch (e) {
      console.error(e);
    }
  };

  const appendMovies = (additionalMovies: Movie[]) => {
    dispatch({
      type: "LOAD_MORE",
      data: { additionalMovies: additionalMovies },
    });
  };

  const renderMovie = ({ item }: ListRenderItemInfo<Movie>) => (
    <MovieListItem movie={item} navigation={navigation} />
  );

  useEffect(() => {
    loadMovies();
  }, []);

  return (
    <View>
      <StatusBar style={isDrawerOpen ? "light" : "dark"} />

      <View style={styles.moviesContainer}>
        {movies.length == 0 ? (
          <Text style={styles.noMoviesBanner}>No movies yet</Text>
        ) : (
          <FlatList
            data={movies}
            renderItem={renderMovie}
            keyExtractor={(movie: Movie) => movie._id}
            onEndReached={loadMovies}
            onEndReachedThreshold={0.1}
            numColumns={2}
          />
        )}
        {isLoading && <ActivityIndicator size="large" color="lightgray" />}
      </View>
    </View>
  );
}

import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  moviesContainer: {
    backgroundColor: "white",
  },
  noMoviesBanner: {
    textAlign: "center",
    color: "gray",
  },
});
