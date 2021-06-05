import React, { useContext, useEffect, useReducer } from "react";

import { StatusBar } from "expo-status-bar";
import {
  Image,
  ListRenderItemInfo,
  TouchableOpacity,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
// import Icon from "react-native-vector-icons/Ionicons";
import Carousel from "react-native-snap-carousel";

import { StackNavigationProp } from "@react-navigation/stack";
import { useFocusEffect } from "@react-navigation/native";

import { API_URL } from "../constants";
import { AuthContext } from "../contexts/AuthContext";
import CarouselMovieItem from "../components/MovieListItem/carousel";
import CarouselSeriesItem from "../components/SeriesListItem/carousel";
import StatItem, { Statistic } from "../components/StatItem";

type Props = {
  navigation: StackNavigationProp<{ Home: undefined }, "Home">;
};

type State = {
  readonly seriesSugs: Series[];
  readonly movieSugs: Movie[];
  readonly seenFilmCount: string | number;
  readonly seenSeriesCount: string | number;
  readonly ongoingSeriesCount: string | number;
  readonly watchTime: string | number;
  readonly seenEpisodesCount: string | number;
  // readonly isLoading: boolean;
};

type Action =
  | { type: "LOAD_MOVIE_SUGGESTIONS"; data: { movies: Movie[] } }
  | { type: "LOAD_SERIES_SUGGESTIONS"; data: { series: Series[] } }
  | {
      type: "UPDATE_STATS";
      data: {
        stat:
          | "seenFilmCount"
          | "seenSeriesCount"
          | "ongoingSeriesCount"
          | "watchTime"
          | "seenEpisodesCount";
        value: number;
      };
    };

const statTints: string[] = [
  "darkmagenta",
  "darkviolet",
  "blueviolet",
  // "indigo",
  // "midnightblue",
];

const initialState: State = {
  movieSugs: [],
  seriesSugs: [],
  seenFilmCount: "#",
  seenSeriesCount: "#",
  ongoingSeriesCount: "#",
  watchTime: "#",
  seenEpisodesCount: "#",
  // isLoading: false,
};

function reducer(prevState: State, action: Action): State {
  switch (action.type) {
    case "LOAD_SERIES_SUGGESTIONS":
      return {
        ...prevState,
        seriesSugs: action.data.series,
      };
    case "LOAD_MOVIE_SUGGESTIONS":
      return {
        ...prevState,
        movieSugs: action.data.movies,
      };
    case "UPDATE_STATS":
      return {
        ...prevState,
        [action.data.stat]: action.data.value,
      };
    default:
      throw new Error();
  }
}

export default function Home({ navigation }: Props) {
  const [
    {
      movieSugs,
      seriesSugs,
      seenFilmCount,
      seenSeriesCount,
      ongoingSeriesCount,
      watchTime,
      seenEpisodesCount,
      // isLoading,
    },
    dispatch,
  ] = useReducer(reducer, initialState);
  const { userToken } = useContext(AuthContext);
  const suggestionLimit = 20;
  const { width: windowWidth } = useWindowDimensions();

  const statArray = [
    { text: "films watched", value: seenFilmCount },
    { text: "series completed", value: seenSeriesCount },
    { text: "series ongoing", value: ongoingSeriesCount },
    { text: "hours watched", value: watchTime },
    { text: "episodes watched", value: seenEpisodesCount },
  ];

  const loadSeriesSuggestions = async () => {
    try {
      const jsonResponse = await fetch(
        API_URL + `series/suggestions?count=${suggestionLimit}`,
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

      dispatch({
        type: "LOAD_SERIES_SUGGESTIONS",
        data: { series: response },
      });
    } catch (e) {
      console.error(e);
    }
  };
  const loadMovieSuggestions = async () => {
    try {
      const jsonResponse = await fetch(
        API_URL + `movies/suggestions?count=${suggestionLimit}`,
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

      dispatch({
        type: "LOAD_MOVIE_SUGGESTIONS",
        data: { movies: response },
      });
    } catch (e) {
      console.error(e);
    }
  };
  const loadSeenFilmCount = async () => {
    try {
      const jsonResponse = await fetch(
        API_URL + `movies/stats/count?filter=seen`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (jsonResponse.status >= 400) {
        console.log(jsonResponse);
        return;
      }

      const response = await jsonResponse.json();

      dispatch({
        type: "UPDATE_STATS",
        data: { stat: "seenFilmCount", value: response },
      });
    } catch (e) {
      console.error(e);
    }
  };
  const loadSeenSeriesCount = async () => {
    try {
      const jsonResponse = await fetch(
        API_URL + `series/stats/count?filter=seen`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (jsonResponse.status >= 400) {
        console.log(jsonResponse);
        return;
      }

      const response = await jsonResponse.json();

      dispatch({
        type: "UPDATE_STATS",
        data: { stat: "seenSeriesCount", value: response },
      });
    } catch (e) {
      console.error(e);
    }
  };
  const loadOngoingSeriesCount = async () => {
    try {
      const jsonResponse = await fetch(
        API_URL + `series/stats/count?filter=ongoing`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (jsonResponse.status >= 400) {
        console.log(jsonResponse);
        return;
      }

      const response = await jsonResponse.json();

      dispatch({
        type: "UPDATE_STATS",
        data: { stat: "ongoingSeriesCount", value: response },
      });
    } catch (e) {
      console.error(e);
    }
  };
  const loadWatchTime = async () => {
    try {
      const jsonResponseSeries = await fetch(API_URL + `series/stats/time`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });
      const jsonResponseMovies = await fetch(API_URL + `movies/stats/time`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
      });

      if (jsonResponseSeries.status >= 400) {
        console.log(jsonResponseSeries);
        return;
      }
      if (jsonResponseMovies.status >= 400) {
        console.log(jsonResponseSeries);
        return;
      }

      const seriesTime = await jsonResponseSeries.json();
      const moviesTime = await jsonResponseMovies.json();

      dispatch({
        type: "UPDATE_STATS",
        data: {
          stat: "watchTime",
          value: seriesTime + moviesTime,
        },
      });
    } catch (e) {
      console.error(e);
    }
  };
  const loadSeenEpisodesCount = async () => {
    try {
      const jsonResponse = await fetch(
        API_URL + `series/stats/episodes?filter=seen`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      if (jsonResponse.status >= 400) {
        console.log(jsonResponse);
        return;
      }

      const response = await jsonResponse.json();

      dispatch({
        type: "UPDATE_STATS",
        data: { stat: "seenEpisodesCount", value: response },
      });
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadMovieSuggestions();
    loadSeriesSuggestions();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadSeenFilmCount();
      loadSeenSeriesCount();
      loadOngoingSeriesCount();
      loadWatchTime();
      loadSeenEpisodesCount();
    }, [])
  );

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <View style={styles.banner}>
        <Text style={styles.bannerText}>My</Text>
        <Image
          source={require("../assets/icon.png")}
          style={styles.bannerLogo}
        />
        <Text style={styles.bannerText}>Db</Text>
      </View>

      <ScrollView>
        <Carousel
          data={statArray}
          renderItem={({ item, index }: ListRenderItemInfo<Statistic>) => (
            <StatItem
              navigation={navigation}
              stat={item}
              tint={statTints[index % statTints.length]}
            />
          )}
          sliderWidth={windowWidth}
          itemWidth={200}
          layout={"default"}
        />

        <View style={styles.suggestionHeading}>
          <TouchableOpacity onPress={() => loadMovieSuggestions()}>
            <Text style={styles.suggestionText}>Movies to Watch</Text>
          </TouchableOpacity>
        </View>

        {movieSugs.length > 0 ? (
          <Carousel
            data={movieSugs}
            renderItem={({ item }: ListRenderItemInfo<Movie>) => (
              <CarouselMovieItem navigation={navigation} movie={item} />
            )}
            sliderWidth={windowWidth}
            itemWidth={200}
            layout={"default"}
          />
        ) : (
          <Text style={styles.noSuggestionsText}>No movies in watchlist!</Text>
        )}

        <View style={styles.suggestionHeading}>
          <TouchableOpacity onPress={() => loadSeriesSuggestions()}>
            <Text style={styles.suggestionText}>Series to Binge</Text>
          </TouchableOpacity>
        </View>

        {seriesSugs.length > 0 ? (
          <Carousel
            data={seriesSugs}
            renderItem={({ item }: ListRenderItemInfo<Series>) => (
              <CarouselSeriesItem navigation={navigation} series={item} />
            )}
            sliderWidth={windowWidth}
            itemWidth={200}
            layout={"default"}
          />
        ) : (
          <Text style={styles.noSuggestionsText}>No series in watchlist!</Text>
        )}
      </ScrollView>
    </View>
  );
}

import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  banner: {
    flexDirection: "row",
    justifyContent: "center",
  },
  bannerLogo: {
    width: 60,
    height: 60,
    marginHorizontal: -10,
  },
  bannerText: {
    zIndex: 2,
    paddingTop: 14,
    color: "white",
    fontSize: 30,
    fontFamily: "sans-serif-thin",
  },
  container: {
    backgroundColor: "black",
    minHeight: "100%",
    height: "100%",
    paddingTop: 30,
  },
  suggestionHeading: {},
  noSuggestionsText: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    textAlign: "center",
    fontFamily: "sans-serif-thin",
    color: "#adb5bd",
    fontSize: 13,
  },
  suggestionText: {
    paddingTop: 14,
    paddingHorizontal: 20,
    textAlign: "center",
    fontFamily: "sans-serif",
    color: "#adb5bd",
    fontSize: 18,
  },
});
