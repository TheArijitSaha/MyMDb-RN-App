import React, { useContext, useReducer } from "react";

import { StatusBar } from "expo-status-bar";
import {
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Ionicons";

import { API_URL } from "../constants";
import { AuthContext } from "../contexts/AuthContext";
import { SeriesStackParamList } from "../navigation/seriesStack";
import ArrayInformation from "../components/common/ArrayInformation";
import DictInformation from "../components/common/DictInformation";
import Information from "../components/common/Information";
import { getIntFromString, getFloatFromString } from "./MovieAddScreen";

type NewSeries = {
  title: string;
  timeSpan: { start: string; end: string };
  creators: string[];
  cast: string[];
  genres: string[];
  seasons: string[];
  meanRuntime: string;
  imdb: { rating: string; link: string };
  rottenTomatoes: { rating: string };
  seenEpisodes: string;
  poster: string;
};

const getNewSeries = (series: NewSeries): SeriesWithoutId => {
  return {
    title: series.title,
    timeSpan: {
      start: getIntFromString(series.timeSpan.start, 0) ?? 0,
      end:
        series.timeSpan.end.length > 0
          ? getIntFromString(series.timeSpan.end, 0)
          : null,
    },
    creators: [...series.creators],
    cast: [...series.cast],
    genres: [...series.genres],
    imdb: {
      rating: getFloatFromString(series.imdb.rating, 0),
      link: series.imdb.link,
    },
    rottenTomatoes: {
      rating:
        series.rottenTomatoes.rating.length > 0
          ? getIntFromString(series.rottenTomatoes.rating, 0)
          : null,
    },
    poster: series.poster,
    seenEpisodes: getIntFromString(series.seenEpisodes, 0) ?? 0,
    meanRuntime: getIntFromString(series.meanRuntime, 0) ?? 0,
    seasons: series.seasons.map((val, _index) => getIntFromString(val, 0) ?? 0),
  };
};

type AtomicFields =
  | "title"
  | "timeSpan.start"
  | "timeSpan.end"
  | "period"
  | "meanRuntime"
  | "imdb.rating"
  | "imdb.link"
  | "rottenTomatoes.rating"
  | "poster"
  | "seenEpisodes";
type ArrayFields = "creators" | "cast" | "genres" | "seasons";

type Props = StackScreenProps<SeriesStackParamList, "SeriesAdd">;

type State = {
  series: NewSeries;
  isSaving: boolean;
};

type Action =
  | { type: "TOGGLE_SAVE_MODE" }
  | { type: "EDIT_SERIES"; data: { series: NewSeries } };

function reducer(prevState: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_SAVE_MODE":
      return {
        ...prevState,
        isSaving: !prevState.isSaving,
      };
    case "EDIT_SERIES":
      return {
        ...prevState,
        series: action.data.series,
      };
    default:
      throw new Error("Unknown Action type");
  }
}

export default function MovieAddScreen({ navigation }: Props) {
  const initialState: State = {
    series: {
      title: "",
      timeSpan: { start: "", end: "" },
      creators: [],
      cast: [],
      genres: [],
      seasons: [],
      meanRuntime: "",
      seenEpisodes: "",
      imdb: {
        rating: "",
        link: "",
      },
      poster: "",
      rottenTomatoes: { rating: "" },
    },
    isSaving: false,
  };

  const [{ series, isSaving }, dispatch] = useReducer(reducer, initialState);

  const { userToken } = useContext(AuthContext);

  const saveSeries = async (newSeries: SeriesWithoutId) => {
    try {
      const jsonResponse = await fetch(`${API_URL}series`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ series: newSeries }),
      });

      if (jsonResponse.status == 409) {
        Alert.alert(
          `${newSeries.title} [${newSeries.timeSpan.start}] already in database.`
        );
        return false;
      }

      if (jsonResponse.status == 422) {
        Alert.alert(`Title and period start are required fields.`);
        return false;
      }

      const series = await jsonResponse.json();
      return series;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleScrape = async () => {
    if (series.imdb.link.length < 1) {
      return;
    }

    try {
      const jsonResponse = await fetch(
        `${API_URL}series/scrape/imdb?link=${series.imdb.link}`,
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      const response = await jsonResponse.json();

      if (response.error) {
        console.error(response.error);
        return;
      }

      dispatch({
        type: "EDIT_SERIES",
        data: {
          series: {
            ...series,
            ...response,
            timeSpan: {
              ...series.timeSpan,
              start: response.timeSpan.start.toString(),
            },
            imdb: {
              ...series.imdb,
              rating: response.imdb.rating.toString(),
            },
          },
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  const getChangeHandler = (
    property: AtomicFields
  ): ((text: string) => void) => {
    const changeHandler = (newValue: string) => {
      switch (property) {
        case "imdb.rating":
        case "imdb.link":
        case "rottenTomatoes.rating":
        case "timeSpan.start":
        case "timeSpan.end":
          dispatch({
            type: "EDIT_SERIES",
            data: {
              series: {
                ...series,
                [property.split(".")[0]]: {
                  // @ts-ignore
                  ...series[property.split(".")[0]],
                  [property.split(".")[1]]: newValue,
                },
              },
            },
          });
          break;
        default:
          dispatch({
            type: "EDIT_SERIES",
            data: {
              series: { ...series, [property]: newValue },
            },
          });
      }
    };

    return changeHandler;
  };

  const getArrayChangeHandler = (
    property: ArrayFields,
    index: number
  ): ((text: string) => void) => {
    let newArray = series[property];

    const changeHandler = (newValue: string) => {
      newArray[index] = newValue;

      dispatch({
        type: "EDIT_SERIES",
        data: {
          series: {
            ...series,
            [property]: newArray,
          },
        },
      });
    };

    return changeHandler;
  };

  const getArrayAddHandler = (property: ArrayFields) => {
    const addHandler = () => {
      const newArray = [...series[property], ""];

      dispatch({
        type: "EDIT_SERIES",
        data: {
          series: {
            ...series,
            [property]: newArray,
          },
        },
      });
    };
    return addHandler;
  };

  const getArrayDeleteHandler = (
    property: ArrayFields,
    index: number
  ): (() => void) => {
    let newArray = series[property];

    const deleteHandler = () => {
      newArray.splice(index, 1);

      dispatch({
        type: "EDIT_SERIES",
        data: {
          series: {
            ...series,
            [property]: newArray,
          },
        },
      });
    };

    return deleteHandler;
  };

  const handleSave = async () => {
    let newSeries = getNewSeries(series);

    dispatch({ type: "TOGGLE_SAVE_MODE" });
    const savedSeries = await saveSeries(newSeries);
    dispatch({ type: "TOGGLE_SAVE_MODE" });

    if (savedSeries) {
      navigation.pop();
      navigation.navigate("SeriesDetail", { series: savedSeries });
    }
  };

  return (
    <View>
      <StatusBar style="light" />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.movieInfo}>
            <Information
              value={series.title}
              editMode={true}
              label={false}
              infoChangeHandler={getChangeHandler("title")}
              placeholder="Title"
            />
            <View style={styles.periodView}>
              <TextInput
                style={styles.period}
                value={series.timeSpan.start}
                onChangeText={getChangeHandler("timeSpan.start")}
                keyboardType="number-pad"
                placeholder="Start"
                placeholderTextColor="#555555"
              />
              <Text style={styles.period}> - </Text>
              <TextInput
                style={styles.period}
                value={series.timeSpan.end}
                onChangeText={getChangeHandler("timeSpan.end")}
                keyboardType="number-pad"
                placeholder="End"
                placeholderTextColor="#555555"
              />
            </View>
            <View style={styles.scrapeBanner}>
              <TouchableOpacity onPress={handleScrape}>
                <Icon
                  name="aperture"
                  size={25}
                  color="gray"
                  style={styles.scrapeIcon}
                />
              </TouchableOpacity>
            </View>
            <ArrayInformation
              value={series.creators}
              label="Created By"
              editMode={true}
              infoAddHandler={getArrayAddHandler("creators")}
              infoChangeHandlerMaker={(index) =>
                getArrayChangeHandler("creators", index)
              }
              infoDeleteHandlerMaker={(index) =>
                getArrayDeleteHandler("creators", index)
              }
            />
            <ArrayInformation
              value={series.cast}
              label="Starring"
              editMode={true}
              infoAddHandler={getArrayAddHandler("cast")}
              infoChangeHandlerMaker={(index) =>
                getArrayChangeHandler("cast", index)
              }
              infoDeleteHandlerMaker={(index) =>
                getArrayDeleteHandler("cast", index)
              }
            />
            <ArrayInformation
              value={series.seasons}
              label="Seasons"
              editMode={true}
              infoAddHandler={getArrayAddHandler("seasons")}
              infoChangeHandlerMaker={(index) =>
                getArrayChangeHandler("seasons", index)
              }
              infoDeleteHandlerMaker={(index) =>
                getArrayDeleteHandler("seasons", index)
              }
              keyboardType="number-pad"
            />
            <Information
              value={series.meanRuntime}
              editMode={true}
              label="Episode Length"
              infoChangeHandler={getChangeHandler("meanRuntime")}
              placeholder="0"
              keyboardType="number-pad"
              followText=" mins"
            />
            <Information
              value={series.seenEpisodes}
              editMode={true}
              label="Seen"
              infoChangeHandler={getChangeHandler("seenEpisodes")}
              placeholder="0"
              keyboardType="number-pad"
              followText=" episodes"
            />
            <ArrayInformation
              value={series.genres}
              label="Genres"
              editMode={true}
              infoAddHandler={getArrayAddHandler("genres")}
              infoChangeHandlerMaker={(index) =>
                getArrayChangeHandler("genres", index)
              }
              infoDeleteHandlerMaker={(index) =>
                getArrayDeleteHandler("genres", index)
              }
            />
            <DictInformation
              info={[
                {
                  value: series.imdb.rating,
                  placeholder: "rating",
                  keyboardType: "decimal-pad",
                  infoChangeHandler: getChangeHandler("imdb.rating"),
                },
                {
                  value: series.imdb.link,
                  placeholder: "link",
                  keyboardType: "default",
                  infoChangeHandler: getChangeHandler("imdb.link"),
                  excludeInViewMode: true,
                },
              ]}
              editMode={true}
              label="IMDB"
            />
            <Information
              value={series.rottenTomatoes.rating}
              editMode={true}
              label="Tomatometer"
              infoChangeHandler={getChangeHandler("rottenTomatoes.rating")}
              placeholder="rating"
              keyboardType="decimal-pad"
            />
            <Information
              value={series.poster}
              editMode={true}
              label="Poster"
              infoChangeHandler={getChangeHandler("poster")}
              placeholder="link"
              keyboardType="default"
            />
            <View style={styles.saveEditedBanner}>
              <TouchableOpacity onPress={handleSave} disabled={isSaving}>
                <Text style={styles.saveButton}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    display: "flex",
  },
  movieInfo: {
    backgroundColor: "black",
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
    paddingTop: 33,
    paddingBottom: 15,
  },
  period: {
    alignSelf: "center",
    textAlign: "center",
    fontSize: 18,
    color: "#eeeeee",
    fontFamily: "monospace",
    minWidth: 60,
  },
  periodView: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    position: "relative",
  },
  saveEditedBanner: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-around",
  },
  saveButton: {
    flex: 1,
    padding: 2,
    fontSize: 18,
    color: "#dddddd",
    fontFamily: "sans-serif-light",
  },
  scrapeIcon: {},
  scrapeBanner: {
    display: "flex",
    alignItems: "center",
  },
  scrollView: {
    minHeight: "100%",
  },
});
