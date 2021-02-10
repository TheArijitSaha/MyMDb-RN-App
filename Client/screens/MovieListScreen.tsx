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

import { StackScreenProps } from "@react-navigation/stack";

import { API_URL } from "../constants";
import { AuthContext } from "../contexts/AuthContext";
import MovieListItem from "../components/MovieListItem";
import { MoviesStackParamList } from "../navigation/moviesStack";

type SearchCriteria = "title" | "releaseYear" | "genre" | "director" | "cast";
type SortCriteria =
  | "title"
  | "releaseYear"
  | "rottenTomatoesRating"
  | "IMDBRating"
  | "runtime";
type SortOrder = "asc" | "desc";

type State = {
  readonly movies: Movie[];
  readonly isLoading: boolean;
  readonly searchString: string;
  readonly unseenFilter: boolean;
  readonly searchCriteria: SearchCriteria;
  readonly isSelectingSearchCriteria: boolean;
  readonly sortOrder: SortOrder;
  readonly sortCriteria: SortCriteria;
  readonly isSelectingSortCriteria: boolean;
};

type Props = StackScreenProps<MoviesStackParamList, "Movies">;

type Action =
  | { type: "LOAD_MORE"; data: { additionalMovies: Movie[] } }
  | { type: "WAIT_TO_LOAD" }
  | { type: "CLEAR_LIST" }
  | { type: "TOGGLE_UNSEEN_FILTER" }
  | { type: "UPDATE_SEARCH_STRING"; data: { searchString: string } }
  | {
      type: "CHANGE_SEARCH_CRITERIA";
      data: {
        criteria: SearchCriteria;
      };
    }
  | { type: "TOGGLE_IS_SELECTING_SEARCH_CRITERIA" }
  | {
      type: "CHANGE_SORT_CRITERIA";
      data: {
        criteria: SortCriteria;
      };
    }
  | {
      type: "TOGGLE_SORT_ORDER";
    }
  | { type: "TOGGLE_IS_SELECTING_SORT_CRITERIA" }
  | { type: "SINGLE_UPDATE"; data: { movies: Movie[] } };

const initialState: State = {
  movies: [],
  isLoading: false,
  searchString: "",
  unseenFilter: false,
  searchCriteria: "title",
  isSelectingSearchCriteria: false,
  sortOrder: "desc",
  sortCriteria: "releaseYear",
  isSelectingSortCriteria: false,
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
      return {
        ...prevState,
        searchString: action.data.searchString,
        isSelectingSearchCriteria: false,
        isSelectingSortCriteria: false,
      };
    case "CLEAR_LIST":
      return { ...prevState, movies: [] };
    case "SINGLE_UPDATE":
      return {
        ...prevState,
        movies: action.data.movies,
        isSelectingSearchCriteria: false,
        isSelectingSortCriteria: false,
      };
    case "TOGGLE_UNSEEN_FILTER":
      return {
        ...prevState,
        unseenFilter: !prevState.unseenFilter,
        isSelectingSearchCriteria: false,
        isSelectingSortCriteria: false,
      };
    case "CHANGE_SEARCH_CRITERIA":
      return {
        ...prevState,
        searchCriteria: action.data.criteria,
        isSelectingSearchCriteria: false,
        isSelectingSortCriteria: false,
      };
    case "TOGGLE_IS_SELECTING_SEARCH_CRITERIA":
      return {
        ...prevState,
        isSelectingSearchCriteria: !prevState.isSelectingSearchCriteria,
        isSelectingSortCriteria: false,
      };
    case "CHANGE_SORT_CRITERIA":
      return {
        ...prevState,
        sortCriteria: action.data.criteria,
        isSelectingSearchCriteria: false,
        isSelectingSortCriteria: false,
      };
    case "TOGGLE_SORT_ORDER":
      return {
        ...prevState,
        sortOrder: prevState.sortOrder === "desc" ? "asc" : "desc",
        isSelectingSortCriteria: false,
        isSelectingSearchCriteria: false,
      };
    case "TOGGLE_IS_SELECTING_SORT_CRITERIA":
      return {
        ...prevState,
        isSelectingSortCriteria: !prevState.isSelectingSortCriteria,
        isSelectingSearchCriteria: false,
      };
    default:
      throw new Error();
  }
}

export default function MovieListScreen({ navigation, route }: Props) {
  const [
    {
      movies,
      isLoading,
      isSelectingSearchCriteria,
      searchCriteria,
      searchString,
      isSelectingSortCriteria,
      sortOrder,
      sortCriteria,
      unseenFilter,
    },
    dispatch,
  ] = useReducer(reducer, initialState);
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
    searchCriteria: SearchCriteria,
    queryString = "",
    sortCriteria: SortCriteria,
    sortOrder: SortOrder,
    offset: number | null = null
  ) => {
    dispatch({
      type: "WAIT_TO_LOAD",
    });

    if (offset === null) offset = movies.length;

    let urlFilterQueryString = "";

    if (queryString.length > 0) {
      urlFilterQueryString += `&${searchCriteria}=${queryString}`;
    }

    if (unseenFilter) {
      urlFilterQueryString += "&status=unseen";
    }

    const urlSortQueryString = `&sort=${sortCriteria}&order=${sortOrder}`;

    try {
      const jsonResponse = await fetch(
        API_URL +
          `movies?offset=${offset}&limit=${limit}${urlFilterQueryString}${urlSortQueryString}`,
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
    loadMovies(
      unseenFilter,
      searchCriteria,
      searchString,
      sortCriteria,
      sortOrder
    );
  }, []);

  const debouncedSearch = useCallback(
    debounce((queryString, offset) => {
      dispatch({ type: "CLEAR_LIST" });
      loadMovies(
        unseenFilter,
        searchCriteria,
        queryString,
        sortCriteria,
        sortOrder,
        offset
      );
    }, 900),
    [unseenFilter, searchCriteria, sortOrder, sortCriteria]
  );

  const handleSearchStringChange = (searchString: string) => {
    dispatch({
      type: "UPDATE_SEARCH_STRING",
      data: { searchString: searchString },
    });
    debouncedSearch(searchString, 0);
  };

  const handleUnseenFilterToggle = () => {
    dispatch({ type: "TOGGLE_UNSEEN_FILTER" });
    dispatch({ type: "CLEAR_LIST" });
    // Here, !unseenFilter is being called as stale value of unseenFilter is
    // being used by this function as it will only change in the next render.
    // Also, debounced search is not required here.
    loadMovies(
      !unseenFilter,
      searchCriteria,
      searchString,
      sortCriteria,
      sortOrder,
      0
    );
  };

  const handleIsSelectingSearchCriteriaToggle = () => {
    dispatch({ type: "TOGGLE_IS_SELECTING_SEARCH_CRITERIA" });
  };

  const handleIsSelectingSortCriteriaToggle = () => {
    dispatch({ type: "TOGGLE_IS_SELECTING_SORT_CRITERIA" });
  };

  const changeSearchCriteria = (newCriteria: SearchCriteria) => {
    // If the criteria changes
    if (newCriteria !== searchCriteria) {
      dispatch({
        type: "CHANGE_SEARCH_CRITERIA",
        data: { criteria: newCriteria },
      });
      dispatch({ type: "CLEAR_LIST" });
      // Debounced search is not required here.
      loadMovies(
        unseenFilter,
        newCriteria,
        searchString,
        sortCriteria,
        sortOrder,
        0
      );
    }
  };

  const changeSortCriteria = (newCriteria: SortCriteria) => {
    // If the criteria changes
    if (newCriteria !== searchCriteria) {
      dispatch({
        type: "CHANGE_SORT_CRITERIA",
        data: { criteria: newCriteria },
      });
      dispatch({ type: "CLEAR_LIST" });
      // Debounced search is not required here.
      loadMovies(
        unseenFilter,
        searchCriteria,
        searchString,
        newCriteria,
        sortOrder,
        0
      );
    }
  };

  const changeSortOrder = (newOrder: SortOrder) => {
    // If the order changes
    if (newOrder !== sortOrder) {
      dispatch({
        type: "TOGGLE_SORT_ORDER",
      });
      dispatch({ type: "CLEAR_LIST" });
      // Debounced search is not required here.
      loadMovies(
        unseenFilter,
        searchCriteria,
        searchString,
        sortCriteria,
        newOrder,
        0
      );
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      <View style={styles.banner}>
        <Text style={styles.bannerText}>Movies</Text>
      </View>

      <View style={styles.searchBar}>
        <View>
          <TouchableOpacity onPress={handleIsSelectingSearchCriteriaToggle}>
            <Icon
              name="search"
              size={25}
              color={isSelectingSearchCriteria ? "#3698d6" : "gray"}
              style={styles.searchIcon}
            />
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.searchString}
          placeholderTextColor="gray"
          placeholder={
            searchCriteria === "title"
              ? "Enter movie name"
              : searchCriteria === "cast"
              ? "Enter actor's name"
              : searchCriteria === "director"
              ? "Enter director's name"
              : searchCriteria === "genre"
              ? "Enter genre"
              : "Enter release year"
          }
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
        <TouchableOpacity onPress={handleIsSelectingSortCriteriaToggle}>
          <Icon
            name="cellular"
            size={25}
            color={isSelectingSortCriteria ? "#3698d6" : "gray"}
            style={
              sortOrder === "asc" ? styles.ascOrderIcon : styles.descOrderIcon
            }
          />
        </TouchableOpacity>
      </View>

      {isSelectingSearchCriteria && (
        <View style={styles.selectionSearchCriteria}>
          <TouchableOpacity onPress={() => changeSearchCriteria("title")}>
            <Text
              style={
                searchCriteria === "title"
                  ? [
                      styles.searchCriteriaOption,
                      styles.searchCriteriaSelectedOption,
                    ]
                  : styles.searchCriteriaOption
              }
            >
              by Movie
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeSearchCriteria("cast")}>
            <Text
              style={
                searchCriteria === "cast"
                  ? [
                      styles.searchCriteriaOption,
                      styles.searchCriteriaSelectedOption,
                    ]
                  : styles.searchCriteriaOption
              }
            >
              by Cast
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeSearchCriteria("director")}>
            <Text
              style={
                searchCriteria === "director"
                  ? [
                      styles.searchCriteriaOption,
                      styles.searchCriteriaSelectedOption,
                    ]
                  : styles.searchCriteriaOption
              }
            >
              by Director
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeSearchCriteria("genre")}>
            <Text
              style={
                searchCriteria === "genre"
                  ? [
                      styles.searchCriteriaOption,
                      styles.searchCriteriaSelectedOption,
                    ]
                  : styles.searchCriteriaOption
              }
            >
              by Genre
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeSearchCriteria("releaseYear")}>
            <Text
              style={
                searchCriteria === "releaseYear"
                  ? [
                      styles.searchCriteriaOption,
                      styles.searchCriteriaSelectedOption,
                    ]
                  : styles.searchCriteriaOption
              }
            >
              by Release year
            </Text>
          </TouchableOpacity>
        </View>
      )}

      {isSelectingSortCriteria && (
        <View style={styles.selectionSortCriteria}>
          <TouchableOpacity onPress={() => changeSortOrder("asc")}>
            <Text
              style={
                sortOrder === "asc"
                  ? [
                      styles.sortCriteriaOption,
                      styles.sortCriteriaSelectedOption,
                    ]
                  : styles.sortCriteriaOption
              }
            >
              Ascending
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeSortOrder("desc")}>
            <Text
              style={
                sortOrder === "desc"
                  ? [
                      styles.sortCriteriaOption,
                      styles.sortCriteriaSelectedOption,
                    ]
                  : styles.sortCriteriaOption
              }
            >
              Descending
            </Text>
          </TouchableOpacity>
          <View style={styles.horizontalSeparator} />
          <TouchableOpacity onPress={() => changeSortCriteria("releaseYear")}>
            <Text
              style={
                sortCriteria === "releaseYear"
                  ? [
                      styles.sortCriteriaOption,
                      styles.sortCriteriaSelectedOption,
                    ]
                  : styles.sortCriteriaOption
              }
            >
              by Release Year
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => changeSortCriteria("rottenTomatoesRating")}
          >
            <Text
              style={
                sortCriteria === "rottenTomatoesRating"
                  ? [
                      styles.sortCriteriaOption,
                      styles.sortCriteriaSelectedOption,
                    ]
                  : styles.sortCriteriaOption
              }
            >
              by Tomatometer
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeSortCriteria("IMDBRating")}>
            <Text
              style={
                sortCriteria === "IMDBRating"
                  ? [
                      styles.sortCriteriaOption,
                      styles.sortCriteriaSelectedOption,
                    ]
                  : styles.sortCriteriaOption
              }
            >
              by IMDB Rating
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeSortCriteria("title")}>
            <Text
              style={
                sortCriteria === "title"
                  ? [
                      styles.sortCriteriaOption,
                      styles.sortCriteriaSelectedOption,
                    ]
                  : styles.sortCriteriaOption
              }
            >
              by Title
            </Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => changeSortCriteria("runtime")}>
            <Text
              style={
                sortCriteria === "runtime"
                  ? [
                      styles.sortCriteriaOption,
                      styles.sortCriteriaSelectedOption,
                    ]
                  : styles.sortCriteriaOption
              }
            >
              by Runtime
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.moviesContainer}>
        {movies.length == 0 ? (
          !isLoading && <Text style={styles.noMoviesBanner}>No results</Text>
        ) : (
          <FlatList
            data={movies}
            renderItem={renderMovie}
            keyExtractor={(movie: Movie) => movie._id}
            onEndReached={() =>
              loadMovies(
                unseenFilter,
                searchCriteria,
                searchString,
                sortCriteria,
                sortOrder
              )
            }
            onEndReachedThreshold={0.1}
            numColumns={2}
            ListFooterComponent={() => (
              <Text
                style={{ color: "lightgray", fontFamily: "sans-serif-thin" }}
              >
                {movies.length} result{movies.length > 1 ? "s" : ""}
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

const dropdownTopLength = 100;

const styles = StyleSheet.create({
  container: {
    backgroundColor: "black",
    minHeight: "100%",
    flex: 1,
    paddingTop: 30,
  },
  banner: {
    alignItems: "center",
  },
  bannerText: {
    color: "white",
    fontSize: 20,
    fontFamily: "sans-serif-thin",
  },
  moviesContainer: {
    backgroundColor: "black",
    flex: 1,
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
  selectionSearchCriteria: {
    position: "absolute",
    top: dropdownTopLength,
    left: 0,
    zIndex: 1,
    marginVertical: 2,
    marginHorizontal: 5,
    paddingHorizontal: 5,
    paddingVertical: 7,
    backgroundColor: "black",
    borderRadius: 6,
  },
  searchCriteriaOption: {
    color: "#3698d6",
    fontSize: 15,
    marginVertical: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 3,
  },
  searchCriteriaSelectedOption: {
    backgroundColor: "rgba(69, 182, 254, 0.3)",
  },
  sortFilterIcon: {
    alignSelf: "center",
    padding: 7,
  },
  ascOrderIcon: {
    alignSelf: "center",
    padding: 7,
    transform: [{ rotateY: "180deg" }, { rotate: "90deg" }],
  },
  descOrderIcon: {
    alignSelf: "center",
    padding: 7,
    transform: [{ rotate: "-90deg" }],
  },
  selectionSortCriteria: {
    position: "absolute",
    top: dropdownTopLength,
    right: 0,
    zIndex: 1,
    marginVertical: 2,
    marginHorizontal: 5,
    paddingHorizontal: 5,
    paddingVertical: 7,
    backgroundColor: "black",
    borderRadius: 6,
  },
  sortCriteriaOption: {
    color: "#3698d6",
    fontSize: 15,
    marginVertical: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 3,
  },
  sortCriteriaSelectedOption: {
    backgroundColor: "rgba(69, 182, 254, 0.3)",
  },
  horizontalSeparator: {
    borderBottomColor: "gray",
    borderWidth: 1,
    margin: 4,
  },
});
