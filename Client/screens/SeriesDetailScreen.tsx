import React, { useCallback, useContext, useReducer } from "react";

import { StatusBar } from "expo-status-bar";
import {
  BackHandler,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useIsDrawerOpen } from "@react-navigation/drawer";
import { useFocusEffect } from "@react-navigation/native";
import { StackScreenProps } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Ionicons";

import { API_URL } from "../constants";
import { AuthContext } from "../contexts/AuthContext";
import { SeriesStackParamList } from "../navigation/seriesStack";
import { HomeStackParamList } from "../navigation/homeStack";
import ArrayInformation from "../components/common/ArrayInformation";
import DictInformation from "../components/common/DictInformation";
import Information from "../components/common/Information";
import { getIntFromString, getFloatFromString } from "./MovieAddScreen";

type EditedSeries = {
  timeSpan: { end: string };
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

type EditableAtomicFields =
  | "timeSpan.end"
  | "period"
  | "meanRuntime"
  | "imdb.rating"
  | "imdb.link"
  | "rottenTomatoes.rating"
  | "poster"
  | "seenEpisodes";
type EditableArrayFields = "creators" | "cast" | "genres" | "seasons";

const getEditedSeries = (series: Series): EditedSeries => {
  return {
    timeSpan: {
      end: series.timeSpan.end === null ? "" : series.timeSpan.end.toString(),
    },

    creators: [...series.creators],
    cast: [...series.cast],
    genres: [...series.genres],
    seasons: series.seasons.map((episodeCount) => episodeCount.toString()),
    meanRuntime: series.meanRuntime.toString(),
    imdb: {
      rating: series.imdb.rating.toString(),
      link: series.imdb.link,
    },
    rottenTomatoes: {
      rating:
        series.rottenTomatoes.rating === null
          ? ""
          : series.rottenTomatoes.rating.toString(),
    },
    seenEpisodes: series.seenEpisodes.toString(),
    poster: series.poster,
  };
};

type Props =
  | StackScreenProps<SeriesStackParamList, "SeriesDetail">
  | StackScreenProps<HomeStackParamList, "SeriesSuggestionDetail">;

type State = {
  series: Series;
  isEditing: boolean;
  editedSeries: EditedSeries;
};

type Action =
  | { type: "TOGGLE_EDIT_MODE" }
  | { type: "EDIT_SERIES"; data: { editedSeries: EditedSeries } }
  | { type: "SAVE_EDIT"; data: { series: Series } };

function reducer(prevState: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_EDIT_MODE":
      return {
        ...prevState,
        isEditing: !prevState.isEditing,
        editedSeries: getEditedSeries(prevState.series),
      };
    case "EDIT_SERIES":
      return {
        ...prevState,
        editedSeries: action.data.editedSeries,
      };
    case "SAVE_EDIT":
      return {
        ...prevState,
        isEditing: false,
        series: action.data.series,
        editedSeries: getEditedSeries(action.data.series),
      };
    default:
      throw new Error("Unknown Action type");
  }
}

export default function MovieDetailScreen({ navigation, route }: Props) {
  const initialState: State = {
    series: { ...route.params.series },
    isEditing: false,
    editedSeries: getEditedSeries(route.params.series),
  };

  const [{ series, isEditing, editedSeries }, dispatch] = useReducer(
    reducer,
    initialState
  );

  const isDrawerOpen = useIsDrawerOpen();
  const { userToken } = useContext(AuthContext);

  const updateSeries = async (updatedSeries: Series) => {
    try {
      const jsonResponse = await fetch(`${API_URL}series/${series._id}`, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ series: updatedSeries }),
      });

      const response = await jsonResponse.json();

      if (response.error) {
        console.error(response.error);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const toggleEditMode = () => {
    dispatch({
      type: "TOGGLE_EDIT_MODE",
    });
  };

  const saveEdit = () => {
    let converted: Series = { ...series };

    converted.creators = editedSeries.creators;
    converted.cast = editedSeries.cast;
    converted.genres = editedSeries.genres;
    converted.timeSpan = {
      ...converted.timeSpan,
      end: getIntFromString(editedSeries.timeSpan.end, null),
    };
    converted.meanRuntime =
      getIntFromString(editedSeries.meanRuntime, converted.meanRuntime) ??
      converted.meanRuntime;
    converted.seasons = editedSeries.seasons.map(
      (val, _index) => getIntFromString(val, 0) ?? 0
    );
    converted.seenEpisodes =
      getIntFromString(editedSeries.seenEpisodes, converted.seenEpisodes) ??
      converted.seenEpisodes;
    converted.imdb = {
      rating: getFloatFromString(editedSeries.imdb.rating, series.imdb.rating),
      link: editedSeries.imdb.link,
    };
    converted.rottenTomatoes = {
      rating:
        editedSeries.rottenTomatoes.rating.length > 0
          ? getIntFromString(
              editedSeries.rottenTomatoes.rating,
              series.rottenTomatoes.rating
            )
          : null,
    };
    converted.poster = editedSeries.poster;

    updateSeries(converted);
    dispatch({ type: "SAVE_EDIT", data: { series: converted } });
  };

  useFocusEffect(
    useCallback(() => {
      const onBackPress = () => {
        if (route.name === "SeriesSuggestionDetail") {
          navigation.pop();
          return true;
        }

        // TODO: Correct this
        navigation.navigate("Series", { singleUpdate: { series: series } });
        return true;
      };

      BackHandler.addEventListener("hardwareBackPress", onBackPress);

      return () =>
        BackHandler.removeEventListener("hardwareBackPress", onBackPress);
    }, [series])
  );

  const getChangeHandler = (
    property: EditableAtomicFields
  ): ((text: string) => void) => {
    const changeHandler = (newValue: string) => {
      switch (property) {
        case "imdb.rating":
        case "imdb.link":
        case "rottenTomatoes.rating":
        case "timeSpan.end":
          dispatch({
            type: "EDIT_SERIES",
            data: {
              editedSeries: {
                ...editedSeries,
                [property.split(".")[0]]: {
                  // @ts-ignore
                  ...editedSeries[property.split(".")[0]],
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
              editedSeries: { ...editedSeries, [property]: newValue },
            },
          });
      }
    };

    return changeHandler;
  };

  const getArrayChangeHandler = (
    property: EditableArrayFields,
    index: number
  ): ((text: string) => void) => {
    let newArray = editedSeries[property];

    const changeHandler = (newValue: string) => {
      newArray[index] = newValue;

      dispatch({
        type: "EDIT_SERIES",
        data: {
          editedSeries: {
            ...editedSeries,
            [property]: newArray,
          },
        },
      });
    };

    return changeHandler;
  };

  const getArrayAddHandler = (property: EditableArrayFields) => {
    const addHandler = () => {
      const newArray = [...editedSeries[property], ""];

      dispatch({
        type: "EDIT_SERIES",
        data: {
          editedSeries: {
            ...editedSeries,
            [property]: newArray,
          },
        },
      });
    };
    return addHandler;
  };

  const getArrayDeleteHandler = (
    property: EditableArrayFields,
    index: number
  ): (() => void) => {
    let newArray = editedSeries[property];

    const deleteHandler = () => {
      newArray.splice(index, 1);

      dispatch({
        type: "EDIT_SERIES",
        data: {
          editedSeries: {
            ...editedSeries,
            [property]: newArray,
          },
        },
      });
    };

    return deleteHandler;
  };

  return (
    <View>
      <StatusBar style={isDrawerOpen ? "light" : "dark"} />

      <ImageBackground
        source={{ uri: series.poster }}
        style={styles.container}
        blurRadius={3}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.seriesInfo}>
            <View style={styles.nameView}>
              <Text style={styles.title}>{series.title}</Text>
              <View style={styles.titleFooterBanner}>
                <TouchableOpacity
                  onPress={toggleEditMode}
                  style={styles.editIcon}
                >
                  {!isEditing && <Icon name="pencil" size={20} color="white" />}
                </TouchableOpacity>
                {isEditing ? (
                  <>
                    <Text style={styles.period}>
                      {series.timeSpan.start} -{" "}
                    </Text>
                    <TextInput
                      style={styles.period}
                      value={editedSeries.timeSpan.end}
                      onChangeText={getChangeHandler("timeSpan.end")}
                      keyboardType="number-pad"
                      placeholder="End"
                      placeholderTextColor="#aaaaaa"
                    />
                  </>
                ) : (
                  <Text style={styles.period}>
                    (
                    {series.timeSpan.end
                      ? series.timeSpan.start === series.timeSpan.end
                        ? `${series.timeSpan.start}`
                        : `${series.timeSpan.start} - ${series.timeSpan.end}`
                      : `Since ${series.timeSpan.start}`}
                    )
                  </Text>
                )}
              </View>
            </View>

            <ArrayInformation
              value={isEditing ? editedSeries.creators : series.creators}
              label="Created By"
              editMode={isEditing}
              infoAddHandler={getArrayAddHandler("creators")}
              infoChangeHandlerMaker={(index) =>
                getArrayChangeHandler("creators", index)
              }
              infoDeleteHandlerMaker={(index) =>
                getArrayDeleteHandler("creators", index)
              }
            />
            <ArrayInformation
              value={isEditing ? editedSeries.cast : series.cast}
              label="Starring"
              editMode={isEditing}
              infoAddHandler={getArrayAddHandler("cast")}
              infoChangeHandlerMaker={(index) =>
                getArrayChangeHandler("cast", index)
              }
              infoDeleteHandlerMaker={(index) =>
                getArrayDeleteHandler("cast", index)
              }
            />
            {isEditing ? (
              <ArrayInformation
                value={editedSeries.seasons}
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
            ) : (
              <Information
                value={`${series.seasons.length.toString()} (${series.seasons.reduce(
                  (a, b) => a + b,
                  0
                )} Episodes)`}
                editMode={false}
                label="Seasons"
              />
            )}
            <Information
              value={
                isEditing
                  ? editedSeries.meanRuntime
                  : series.meanRuntime.toString()
              }
              editMode={isEditing}
              label="Episode Length"
              infoChangeHandler={getChangeHandler("meanRuntime")}
              placeholder="0"
              keyboardType="number-pad"
              followText=" mins"
            />
            <Information
              value={
                isEditing
                  ? editedSeries.seenEpisodes
                  : series.seenEpisodes.toString()
              }
              editMode={isEditing}
              label="Seen"
              infoChangeHandler={getChangeHandler("seenEpisodes")}
              placeholder="0"
              keyboardType="number-pad"
              followText=" episodes"
            />
            <ArrayInformation
              value={isEditing ? editedSeries.genres : series.genres}
              label="Genres"
              editMode={isEditing}
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
                  value: isEditing
                    ? editedSeries.imdb.rating
                    : series.imdb.rating.toString(),
                  placeholder: "rating",
                  keyboardType: "decimal-pad",
                  infoChangeHandler: getChangeHandler("imdb.rating"),
                },
                {
                  value: isEditing ? editedSeries.imdb.link : series.imdb.link,
                  placeholder: "link",
                  keyboardType: "default",
                  infoChangeHandler: getChangeHandler("imdb.link"),
                  excludeInViewMode: true,
                },
              ]}
              editMode={isEditing}
              label="IMDB"
            />
            {(isEditing || series.rottenTomatoes.rating !== null) && (
              <Information
                value={
                  isEditing
                    ? editedSeries.rottenTomatoes.rating
                    : // @ts-ignore // Object series.rottenTomatoes.rating cannot possibly be null
                      series.rottenTomatoes.rating.toString()
                }
                editMode={isEditing}
                label="Tomatometer"
                infoChangeHandler={getChangeHandler("rottenTomatoes.rating")}
                placeholder="rating"
                keyboardType="decimal-pad"
              />
            )}
            {isEditing && (
              <Information
                value={editedSeries.poster}
                editMode={true}
                label="Poster"
                infoChangeHandler={getChangeHandler("poster")}
                placeholder="link"
                keyboardType="default"
              />
            )}
            {isEditing && (
              <View style={styles.saveEditedBanner}>
                <TouchableOpacity onPress={toggleEditMode}>
                  <Text style={styles.discardButton}>Discard</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={saveEdit}>
                  <Text style={styles.saveButton}>Save</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: "100%",
    display: "flex",
  },
  editIcon: {
    position: "absolute",
    right: 0,
    paddingRight: 7,
    paddingTop: 2,
  },
  discardButton: {
    flex: 1,
    padding: 2,
    fontSize: 18,
    color: "#dddddd",
    fontFamily: "sans-serif-light",
  },
  nameView: {
    display: "flex",
    alignItems: "center",
    padding: 10,
  },
  period: {
    alignSelf: "center",
    textAlign: "center",
    fontSize: 18,
    color: "#eeeeee",
    fontFamily: "monospace",
    minWidth: 35,
  },
  scrollView: {
    minHeight: "100%",
  },
  saveButton: {
    flex: 1,
    padding: 2,
    fontSize: 18,
    color: "#dddddd",
    fontFamily: "sans-serif-light",
  },
  saveEditedBanner: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 30,
    paddingBottom: 20,
  },
  seriesInfo: {
    backgroundColor: "rgba( 120, 120, 120, 0.6 )",
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
    paddingTop: 33,
    paddingBottom: 15,
  },
  title: {
    textAlign: "center",
    fontSize: 23,
    color: "#eeeeee",
    fontFamily: "monospace",
  },
  titleFooterBanner: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    position: "relative",
  },
});
