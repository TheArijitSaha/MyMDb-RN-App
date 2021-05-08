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
import SeriesListItem from "../components/SeriesListItem";
import { SeriesStackParamList } from "../navigation/seriesStack";

type SearchCriteria = "title" | "genre" | "creator" | "cast";
type SortCriteria =
  | "title"
  | "rottenTomatoesRating"
  | "IMDBRating"
  | "firstAir"
  | "lastAir";
type SortOrder = "asc" | "desc";
type WatchFilter = false | "seen" | "unseen" | "ongoing";

const searchCriteriaKeys: SearchCriteria[] = [
  "title",
  "genre",
  "creator",
  "cast",
];
const searchCriteriaStrings: Record<SearchCriteria, string> = {
  title: "by Title",
  genre: "by Genre",
  creator: "by Creator",
  cast: "by Cast",
};
const sortCriteriaKeys: SortCriteria[] = [
  "title",
  "rottenTomatoesRating",
  "IMDBRating",
  "firstAir",
  "lastAir",
];
const sortCriteriaStrings: Record<SortCriteria, string> = {
  title: "by Title",
  rottenTomatoesRating: "by Tomatometer",
  firstAir: "by First Air",
  lastAir: "by Last Air",
  IMDBRating: "by IMDB Rating",
};
const sortOrderKeys: SortOrder[] = ["asc", "desc"];
const sortOrderStrings: Record<SortOrder, string> = {
  asc: "Ascending",
  desc: "Descending",
};
const watchFilterFlow: WatchFilter[] = [false, "ongoing", "unseen"];

type State = {
  readonly series: Series[];
  readonly isLoading: boolean;
  readonly hasMore: boolean;
  readonly watchFilter: WatchFilter;
  readonly searchString: string;
  readonly searchCriteria: SearchCriteria;
  readonly isSelectingSearchCriteria: boolean;
  readonly sortOrder: SortOrder;
  readonly sortCriteria: SortCriteria;
  readonly isSelectingSortCriteria: boolean;
};

type Props = StackScreenProps<SeriesStackParamList, "Series">;

type Action =
  | { type: "LOAD_MORE"; data: { additionalSeries: Series[] } }
  | { type: "WAIT_TO_LOAD" }
  | { type: "CLEAR_LIST" }
  | { type: "CHANGE_WATCH_FILTER"; data: { watchFilter: WatchFilter } }
  | { type: "UPDATE_SEARCH_STRING"; data: { searchString: string } }
  | { type: "CHANGE_SEARCH_CRITERIA"; data: { criteria: SearchCriteria } }
  | { type: "TOGGLE_IS_SELECTING_SEARCH_CRITERIA" }
  | { type: "CHANGE_SORT_CRITERIA"; data: { criteria: SortCriteria } }
  | { type: "TOGGLE_SORT_ORDER" }
  | { type: "TOGGLE_IS_SELECTING_SORT_CRITERIA" }
  | { type: "SINGLE_UPDATE"; data: { series: Series[] } };

const initialState: State = {
  series: [],
  isLoading: false,
  hasMore: true,
  searchString: "",
  watchFilter: false,
  searchCriteria: "title",
  isSelectingSearchCriteria: false,
  sortOrder: "desc",
  sortCriteria: "firstAir",
  isSelectingSortCriteria: false,
};

function reducer(prevState: State, action: Action): State {
  switch (action.type) {
    case "LOAD_MORE":
      return {
        ...prevState,
        isLoading: false,
        series: [...prevState.series, ...action.data.additionalSeries],
        hasMore: action.data.additionalSeries.length !== 0,
      };
    case "WAIT_TO_LOAD":
      return {
        ...prevState,
        isLoading: true,
      };
    case "CLEAR_LIST":
      return { ...prevState, series: [], hasMore: true };
    case "CHANGE_WATCH_FILTER":
      return {
        ...prevState,
        watchFilter: action.data.watchFilter,
        isSelectingSearchCriteria: false,
        isSelectingSortCriteria: false,
      };
    case "UPDATE_SEARCH_STRING":
      return {
        ...prevState,
        searchString: action.data.searchString,
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
    case "SINGLE_UPDATE":
      return {
        ...prevState,
        series: action.data.series,
        isSelectingSearchCriteria: false,
        isSelectingSortCriteria: false,
      };
    default:
      throw new Error();
  }
}

export default function MovieListScreen({ navigation, route }: Props) {
  const [
    {
      series,
      hasMore,
      isLoading,
      isSelectingSearchCriteria,
      searchCriteria,
      searchString,
      isSelectingSortCriteria,
      sortOrder,
      sortCriteria,
      watchFilter,
    },
    dispatch,
  ] = useReducer(reducer, initialState);
  const { userToken } = useContext(AuthContext);
  const limit = 26;

  useEffect(
    useCallback(() => {
      if (route.params && route.params.singleUpdate) {
        const updatedId = route.params.singleUpdate.series._id;
        const updatedSeriesIndex = series.findIndex(
          (ele) => ele._id == updatedId
        );
        let updatedSeries = [...series];
        updatedSeries[updatedSeriesIndex] = {
          ...route.params.singleUpdate.series,
        };
        dispatch({ type: "SINGLE_UPDATE", data: { series: updatedSeries } });
      }
    }, [route]),
    [route]
  );

  const loadSeries = async (
    watchFilter: WatchFilter,
    searchCriteria: SearchCriteria,
    queryString = "",
    sortCriteria: SortCriteria,
    sortOrder: SortOrder,
    offset?: number
  ) => {
    dispatch({
      type: "WAIT_TO_LOAD",
    });

    offset = offset ?? series.length;

    let urlFilterQueryString = "";

    if (queryString.length > 0) {
      urlFilterQueryString += `&${searchCriteria}=${queryString}`;
    }

    if (watchFilter) {
      urlFilterQueryString += `&status=${watchFilter}`;
    }

    const urlSortQueryString = `&sort=${sortCriteria}&order=${sortOrder}`;

    try {
      const jsonResponse = await fetch(
        API_URL +
          `series?offset=${offset}&limit=${limit}${urlFilterQueryString}${urlSortQueryString}`,
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

      appendSeries(response);
    } catch (e) {
      console.error(e);
    }
  };

  const appendSeries = (additionalSeries: Series[]) => {
    dispatch({
      type: "LOAD_MORE",
      data: { additionalSeries: additionalSeries },
    });
  };

  const renderSeries = ({ item }: ListRenderItemInfo<Series>) => (
    <SeriesListItem series={item} navigation={navigation} />
  );

  useEffect(() => {
    loadSeries(
      watchFilter,
      searchCriteria,
      searchString,
      sortCriteria,
      sortOrder
    );
  }, []);

  const debouncedSearch = useCallback(
    debounce((queryString, offset) => {
      dispatch({ type: "CLEAR_LIST" });
      loadSeries(
        watchFilter,
        searchCriteria,
        queryString,
        sortCriteria,
        sortOrder,
        offset
      );
    }, 900),
    [watchFilter, searchCriteria, sortOrder, sortCriteria]
  );

  const handleSearchStringChange = (searchString: string) => {
    dispatch({
      type: "UPDATE_SEARCH_STRING",
      data: { searchString: searchString },
    });
    debouncedSearch(searchString, 0);
  };

  const handleWatchFilterChange = () => {
    const newWatchFilter =
      watchFilterFlow[
        (watchFilterFlow.indexOf(watchFilter) + 1) % watchFilterFlow.length
      ];
    dispatch({
      type: "CHANGE_WATCH_FILTER",
      data: { watchFilter: newWatchFilter },
    });
    dispatch({ type: "CLEAR_LIST" });
    //   // Here, !watchFilter is being called as stale value of watchFilter is
    //   // being used by this function as it will only change in the next render.
    //   // Also, debounced search is not required here.
    loadSeries(
      newWatchFilter,
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
    // If the search criteria changes
    if (newCriteria !== searchCriteria) {
      dispatch({
        type: "CHANGE_SEARCH_CRITERIA",
        data: { criteria: newCriteria },
      });
      dispatch({ type: "CLEAR_LIST" });
      // Debounced search is not required here.
      loadSeries(
        watchFilter,
        newCriteria,
        searchString,
        sortCriteria,
        sortOrder,
        0
      );
    }
  };

  const changeSortCriteria = (newCriteria: SortCriteria) => {
    // If the sort criteria changes
    if (newCriteria !== sortCriteria) {
      dispatch({
        type: "CHANGE_SORT_CRITERIA",
        data: { criteria: newCriteria },
      });
      dispatch({ type: "CLEAR_LIST" });
      // Debounced search is not required here.
      loadSeries(
        watchFilter,
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
      loadSeries(
        watchFilter,
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
        <Text style={styles.bannerText}>Series</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate("SeriesAdd", {})}
          style={styles.bannerRight}
        >
          <Icon
            name="add"
            size={25}
            color={isSelectingSearchCriteria ? "#3698d6" : "gray"}
            style={styles.addSeriesIcon}
          />
        </TouchableOpacity>
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
              ? "Enter series name"
              : searchCriteria === "cast"
              ? "Enter actor's name"
              : searchCriteria === "creator"
              ? "Enter creator's name"
              : searchCriteria === "genre"
              ? "Enter genre"
              : ""
          }
          value={searchString}
          onChangeText={handleSearchStringChange}
          keyboardType="default"
        />
        <TouchableOpacity onPress={handleWatchFilterChange}>
          <Icon
            name="eye-off-sharp"
            size={25}
            color={
              watchFilter === "ongoing"
                ? "#f77f00"
                : watchFilter === "unseen"
                ? "#a1151a"
                : "gray"
            }
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
          {searchCriteriaKeys.map((searchCriterion, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => changeSearchCriteria(searchCriterion)}
            >
              <Text
                style={
                  searchCriteria === searchCriterion
                    ? [
                        styles.searchCriteriaOption,
                        styles.searchCriteriaSelectedOption,
                      ]
                    : styles.searchCriteriaOption
                }
              >
                {searchCriteriaStrings[searchCriterion]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      {isSelectingSortCriteria && (
        <View style={styles.selectionSortCriteria}>
          {sortOrderKeys.map((sortOrderKey, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => changeSortOrder(sortOrderKey)}
            >
              <Text
                style={
                  sortOrder === sortOrderKey
                    ? [
                        styles.sortCriteriaOption,
                        styles.sortCriteriaSelectedOption,
                      ]
                    : styles.sortCriteriaOption
                }
              >
                {sortOrderStrings[sortOrderKey]}
              </Text>
            </TouchableOpacity>
          ))}
          <View style={styles.horizontalSeparator} />
          {sortCriteriaKeys.map((sortCriterion, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => changeSortCriteria(sortCriterion)}
            >
              <Text
                style={
                  sortCriteria === sortCriterion
                    ? [
                        styles.sortCriteriaOption,
                        styles.sortCriteriaSelectedOption,
                      ]
                    : styles.sortCriteriaOption
                }
              >
                {sortCriteriaStrings[sortCriterion]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}
      <View style={styles.seriesContainer}>
        {series.length == 0 ? (
          !isLoading && <Text style={styles.noSeriesBanner}>No results</Text>
        ) : (
          <>
            {
              <FlatList
                data={series}
                renderItem={renderSeries}
                keyExtractor={(series: Series) => series._id}
                onEndReached={() => {
                  if (hasMore) {
                    loadSeries(
                      watchFilter,
                      searchCriteria,
                      searchString,
                      sortCriteria,
                      sortOrder
                    );
                  }
                }}
                onEndReachedThreshold={0.1}
                numColumns={2}
                onRefresh={() => {
                  dispatch({ type: "CLEAR_LIST" });
                  loadSeries(
                    watchFilter,
                    searchCriteria,
                    searchString,
                    sortCriteria,
                    sortOrder,
                    0
                  );
                }}
                refreshing={isLoading}
                ListFooterComponent={() => (
                  <Text
                    style={{
                      color: "lightgray",
                      fontFamily: "sans-serif-thin",
                    }}
                  >
                    {series.length} result{series.length > 1 ? "s" : ""}
                  </Text>
                )}
                ListFooterComponentStyle={{
                  display: "flex",
                  alignItems: "center",
                }}
              />
            }
          </>
        )}
        {isLoading && <ActivityIndicator size="large" color="lightgray" />}
      </View>
    </View>
  );
}

import { StyleSheet } from "react-native";

const dropdownTopLength = 100;

const styles = StyleSheet.create({
  addSeriesIcon: {
    paddingHorizontal: 12,
    paddingVertical: 3,
    fontFamily: "sans-serif-thin",
  },
  ascOrderIcon: {
    alignSelf: "center",
    padding: 7,
    transform: [{ rotateY: "180deg" }, { rotate: "90deg" }],
  },
  banner: {
    alignItems: "center",
  },
  bannerRight: {
    position: "absolute",
    right: 0,
  },
  bannerText: {
    color: "white",
    fontSize: 20,
    fontFamily: "sans-serif-thin",
  },
  container: {
    backgroundColor: "black",
    minHeight: "100%",
    flex: 1,
    paddingTop: 30,
  },
  descOrderIcon: {
    alignSelf: "center",
    padding: 7,
    transform: [{ rotate: "-90deg" }],
  },
  horizontalSeparator: {
    borderBottomColor: "gray",
    borderWidth: 1,
    margin: 4,
  },
  noSeriesBanner: {
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
  searchIcon: {
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
  seriesContainer: {
    backgroundColor: "black",
    flex: 1,
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
  unseenFilterIcon: {
    alignSelf: "center",
    padding: 7,
  },
});
