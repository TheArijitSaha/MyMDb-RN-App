import React, { useCallback, useContext, useEffect, useReducer } from "react";

import { StatusBar } from "expo-status-bar";
import {
  ActivityIndicator,
  FlatList,
  ListRenderItemInfo,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { debounce } from "lodash";
import Icon from "react-native-vector-icons/Ionicons";

// import { useNavigation } from "@react-navigation/native";
import { useIsDrawerOpen } from "@react-navigation/drawer";
import { StackScreenProps } from "@react-navigation/stack";

import { API_URL } from "../constants";
import { AuthContext } from "../contexts/AuthContext";
import MovieListItem from "../components/MovieListItem";
import { MoviesStackParamList } from "../navigation/moviesStack";

type State = {
  readonly movies: Movie[];
  readonly isLoading: boolean;
  readonly searchString: string;
  readonly unseenFilter: boolean;
};

type Props = StackScreenProps<MoviesStackParamList, "Movies">;

type Action =
  | { type: "LOAD_MORE"; data: { additionalMovies: Movie[] } }
  | { type: "WAIT_TO_LOAD" }
  | { type: "CLEAR_LIST" }
  | { type: "UPDATE_SEARCH_STRING"; data: { searchString: string } }
  | { type: "TOGGLE_UNSEEN_FILTER" }
  | { type: "SINGLE_UPDATE"; data: { movies: Movie[] } };

const initialState: State = {
  movies: [],
  isLoading: false,
  searchString: "",
  unseenFilter: false,
};

function reducer(prevState: State, action: Action): State {
  switch (action.type) {
    case "LOAD_MORE":
      return {
        ...prevState,
        isLoading: false,
        movies: [...prevState.movies, ...action.data.additionalMovies],
      };
    case "WAIT_TO_LOAD":
      return {
        ...prevState,
        isLoading: true,
      };
    case "UPDATE_SEARCH_STRING":
      return { ...prevState, searchString: action.data.searchString };
    case "CLEAR_LIST":
      return { ...prevState, movies: [] };
    case "SINGLE_UPDATE":
      return { ...prevState, movies: action.data.movies };
    case "TOGGLE_UNSEEN_FILTER":
      return { ...prevState, unseenFilter: !prevState.unseenFilter };
    default:
      throw new Error();
  }
}

export default function MovieListScreen({ navigation, route }: Props) {
  const [
    { movies, isLoading, searchString, unseenFilter },
    dispatch,
  ] = useReducer(reducer, initialState);
  const isDrawerOpen = useIsDrawerOpen();
  const { userToken } = useContext(AuthContext);
  const limit = 26;

  useEffect(
    useCallback(() => {
      if (route.params && route.params.singleUpdate) {
        const updatedId = route.params.singleUpdate.movie._id;
        const updatedMovieIndex = movies.findIndex(
          (ele) => ele._id == updatedId
        );
        let updatedMovies = [...movies];
        updatedMovies[updatedMovieIndex] = {
          ...route.params.singleUpdate.movie,
        };
        dispatch({ type: "SINGLE_UPDATE", data: { movies: updatedMovies } });
      }
    }, [route]),
    [route]
  );

  const loadMovies = async (
    unseenFilter: boolean,
    queryString = "",
    offset: number | null = null
  ) => {
    dispatch({
      type: "WAIT_TO_LOAD",
    });

    if (offset === null) offset = movies.length;

    let urlFilterQueryString = "";

    if (queryString.length > 0) {
      urlFilterQueryString += `&title=${queryString}`;
    }

    if (unseenFilter) {
      urlFilterQueryString += "&status=unseen";
    }

    try {
      const jsonResponse = await fetch(
        API_URL +
          `movies?offset=${offset}&limit=${limit}${urlFilterQueryString}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

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
    loadMovies(unseenFilter, searchString);
  }, []);

  const debouncedSearch = useCallback(
    debounce((unseenFilter, queryString, offset) => {
      dispatch({ type: "CLEAR_LIST" });
      loadMovies(unseenFilter, queryString, offset);
    }, 900),
    []
  );

  const handleSearchStringChange = (searchString: string) => {
    dispatch({
      type: "UPDATE_SEARCH_STRING",
      data: { searchString: searchString },
    });
    debouncedSearch(unseenFilter, searchString, 0);
  };

  const handleUnseenFilterToggle = () => {
    dispatch({ type: "TOGGLE_UNSEEN_FILTER" });
    dispatch({ type: "CLEAR_LIST" });
    // Here, !unseenFilter is being called as stale value of unseenFilter is
    // being used by this function as it will only change in the next render.
    // Also, debounced search is not required here.
    loadMovies(!unseenFilter, searchString, 0);
  };

  return (
    <View style={styles.container}>
      <StatusBar style={isDrawerOpen ? "light" : "dark"} />

      <View style={styles.searchBar}>
        <Icon name="search" size={25} color="white" style={styles.searchIcon} />
        <TextInput
          style={styles.searchString}
          placeholderTextColor="gray"
          placeholder="Enter movie name"
          value={searchString}
          onChangeText={handleSearchStringChange}
        />
        <TouchableOpacity onPress={handleUnseenFilterToggle}>
          <Icon
            name="eye-off-sharp"
            size={25}
            color={unseenFilter ? "#a1151a" : "gray"}
            style={styles.unseenFilterIcon}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.moviesContainer}>
        {movies.length == 0 ? (
          <Text style={styles.noMoviesBanner}>No movies yet</Text>
        ) : (
          <FlatList
            data={movies}
            renderItem={renderMovie}
            keyExtractor={(movie: Movie) => movie._id}
            onEndReached={() => loadMovies(unseenFilter, searchString)}
            onEndReachedThreshold={0.1}
            numColumns={2}
            ListFooterComponent={() => (
              <Text
                style={{ color: "lightgray", fontFamily: "sans-serif-thin" }}
              >
                {movies.length} results
              </Text>
            )}
            ListFooterComponentStyle={{
              display: "flex",
              alignItems: "center",
            }}
          />
        )}
        {isLoading && <ActivityIndicator size="large" color="lightgray" />}
      </View>
    </View>
  );
}

import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    minHeight: "100%",
    flex: 1,
  },
  moviesContainer: {
    backgroundColor: "black",
    flex: 1,
    marginBottom: 90, // TODO: fix this, this is due to the flatlist not scrolling all the way to the bottom.
  },
  noMoviesBanner: {
    textAlign: "center",
    color: "gray",
  },
  searchBar: {
    borderStyle: "solid",
    margin: 5,
    backgroundColor: "black",
    display: "flex",
    flexDirection: "row",
  },
  searchIcon: {
    alignSelf: "center",
    padding: 7,
    color: "gray",
  },
  unseenFilterIcon: {
    alignSelf: "center",
    padding: 7,
  },
  searchString: {
    alignSelf: "center",
    padding: 2,
    fontSize: 18,
    color: "lightgray",
    flexGrow: 1,
  },
});
