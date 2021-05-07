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
import { debounce } from "lodash";

import { API_URL } from "../constants";
import { AuthContext } from "../contexts/AuthContext";
import { MoviesStackParamList } from "../navigation/moviesStack";
import ArrayInformation from "../components/common/ArrayInformation";
import DictInformation from "../components/common/DictInformation";
import Information from "../components/common/Information";
import { getIntFromString, getFloatFromString } from "./MovieAddScreen";

type EditedMovie = {
  subtitle: string;
  runtime: string;
  directors: string[];
  cast: string[];
  genres: string[];
  imdb: {
    rating: string;
    link: string;
  };
  rottenTomatoes: {
    rating: string;
  };
  poster: string;
};

type EditableAtomicFields =
  | "subtitle"
  | "imdb.rating"
  | "imdb.link"
  | "rottenTomatoes.rating"
  | "poster"
  | "runtime";
type EditableArrayFields = "directors" | "cast" | "genres";

const getEditedMovie = (movie: Movie): EditedMovie => {
  return {
    subtitle: movie.subtitle === null ? "" : movie.subtitle,
    runtime: movie.runtime.toString(),
    directors: [...movie.directors],
    cast: [...movie.cast],
    genres: [...movie.genres],
    imdb: {
      rating: movie.imdb.rating.toString(),
      link: movie.imdb.link,
    },
    rottenTomatoes: {
      rating:
        movie.rottenTomatoes.rating === null
          ? ""
          : movie.rottenTomatoes.rating.toString(),
    },
    poster: movie.poster,
  };
};

type Props = StackScreenProps<MoviesStackParamList, "MovieDetail">;

type State = {
  movie: Movie;
  isEditing: boolean;
  editedMovie: EditedMovie;
};

type Action =
  | { type: "TOGGLE_SEEN" }
  | { type: "TOGGLE_EDIT_MODE" }
  | { type: "EDIT_MOVIE"; data: { editedMovie: EditedMovie } }
  | { type: "SAVE_EDIT"; data: { movie: Movie } };

function reducer(prevState: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_SEEN":
      return {
        ...prevState,
        movie: { ...prevState.movie, seen: !prevState.movie.seen },
      };
    case "TOGGLE_EDIT_MODE":
      return {
        ...prevState,
        isEditing: !prevState.isEditing,
        editedMovie: getEditedMovie(prevState.movie),
      };
    case "EDIT_MOVIE":
      return {
        ...prevState,
        editedMovie: action.data.editedMovie,
      };
    case "SAVE_EDIT":
      return {
        ...prevState,
        isEditing: false,
        movie: action.data.movie,
        editedMovie: getEditedMovie(action.data.movie),
      };
    default:
      throw new Error("Unknown Action type");
  }
}

export default function MovieDetailScreen({ navigation, route }: Props) {
  const initialState: State = {
    movie: { ...route.params.movie },
    isEditing: false,
    editedMovie: getEditedMovie(route.params.movie),
  };

  const [{ movie, isEditing, editedMovie }, dispatch] = useReducer(
    reducer,
    initialState
  );

  const isDrawerOpen = useIsDrawerOpen();
  const { userToken } = useContext(AuthContext);

  const updateMovie = async (updatedMovie: Movie) => {
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
  };

  const debouncedUpdate = useCallback(debounce(updateMovie, 700), []);

  const handleSeenToggle = () => {
    dispatch({
      type: "TOGGLE_SEEN",
    });
    debouncedUpdate({ ...movie, seen: !movie.seen });
  };

  const toggleEditMode = () => {
    dispatch({
      type: "TOGGLE_EDIT_MODE",
    });
  };

  const saveEdit = () => {
    let converted: Movie = { ...movie };

    converted.subtitle =
      editedMovie.subtitle.length === 0 ? null : editedMovie.subtitle;
    converted.runtime =
      getIntFromString(editedMovie.runtime, movie.runtime) ?? 0;
    converted.directors = editedMovie.directors;
    converted.cast = editedMovie.cast;
    converted.genres = editedMovie.genres;
    converted.imdb = {
      rating: getFloatFromString(editedMovie.imdb.rating, movie.imdb.rating),
      link: editedMovie.imdb.link,
    };
    converted.rottenTomatoes = {
      rating: getIntFromString(
        editedMovie.rottenTomatoes.rating,
        movie.rottenTomatoes.rating
      ),
    };
    converted.poster = editedMovie.poster;

    updateMovie(converted);
    dispatch({ type: "SAVE_EDIT", data: { movie: converted } });
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

  const getChangeHandler = (
    property: EditableAtomicFields
  ): ((text: string) => void) => {
    const changeHandler = (newValue: string) => {
      switch (property) {
        case "imdb.rating":
        case "imdb.link":
        case "rottenTomatoes.rating":
          dispatch({
            type: "EDIT_MOVIE",
            data: {
              editedMovie: {
                ...editedMovie,
                [property.split(".")[0]]: {
                  // @ts-ignore
                  ...editedMovie[property.split(".")[0]],
                  [property.split(".")[1]]: newValue,
                },
              },
            },
          });
          break;
        default:
          dispatch({
            type: "EDIT_MOVIE",
            data: {
              editedMovie: { ...editedMovie, [property]: newValue },
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
    let newArray = editedMovie[property];

    const changeHandler = (newValue: string) => {
      newArray[index] = newValue;

      dispatch({
        type: "EDIT_MOVIE",
        data: {
          editedMovie: {
            ...editedMovie,
            [property]: newArray,
          },
        },
      });
    };

    return changeHandler;
  };

  const getArrayAddHandler = (property: EditableArrayFields) => {
    const addHandler = () => {
      const newArray = [...editedMovie[property], ""];

      dispatch({
        type: "EDIT_MOVIE",
        data: {
          editedMovie: {
            ...editedMovie,
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
    let newArray = editedMovie[property];

    const deleteHandler = () => {
      newArray.splice(index, 1);

      dispatch({
        type: "EDIT_MOVIE",
        data: {
          editedMovie: {
            ...editedMovie,
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
        source={{ uri: movie.poster }}
        style={styles.container}
        blurRadius={3}
      >
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.movieInfo}>
            <View style={styles.nameView}>
              <Text style={styles.title}>{movie.title}</Text>
              {isEditing ? (
                <TextInput
                  style={styles.subtitle}
                  value={editedMovie.subtitle}
                  onChangeText={getChangeHandler("subtitle")}
                  keyboardType="default"
                  placeholder="subtitle"
                  placeholderTextColor="#aaaaaa"
                  multiline={true}
                />
              ) : (
                movie.subtitle && (
                  <Text style={styles.subtitle}>[{movie.subtitle}]</Text>
                )
              )}

              <View style={styles.titleFooterBanner}>
                <TouchableOpacity
                  onPress={toggleEditMode}
                  style={styles.editIcon}
                >
                  {!isEditing && <Icon name="pencil" size={20} color="white" />}
                </TouchableOpacity>
                <Text style={styles.releaseYear}>({movie.releaseYear})</Text>
              </View>
            </View>

            <ArrayInformation
              value={isEditing ? editedMovie.directors : movie.directors}
              label="Directed By"
              editMode={isEditing}
              infoAddHandler={getArrayAddHandler("directors")}
              infoChangeHandlerMaker={(index) =>
                getArrayChangeHandler("directors", index)
              }
              infoDeleteHandlerMaker={(index) =>
                getArrayDeleteHandler("directors", index)
              }
            />
            <ArrayInformation
              value={isEditing ? editedMovie.cast : movie.cast}
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
            <Information
              value={isEditing ? editedMovie.runtime : movie.runtime.toString()}
              editMode={isEditing}
              label="Runtime"
              infoChangeHandler={getChangeHandler("runtime")}
              placeholder="0"
              keyboardType="number-pad"
              followText=" mins"
            />
            <ArrayInformation
              value={isEditing ? editedMovie.genres : movie.genres}
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
                    ? editedMovie.imdb.rating
                    : movie.imdb.rating.toString(),
                  placeholder: "rating",
                  keyboardType: "decimal-pad",
                  infoChangeHandler: getChangeHandler("imdb.rating"),
                },
                {
                  value: movie.imdb.link,
                  placeholder: "link",
                  keyboardType: "default",
                  infoChangeHandler: getChangeHandler("imdb.link"),
                  excludeInViewMode: true,
                },
              ]}
              editMode={isEditing}
              label="IMDB"
            />
            {(isEditing || movie.rottenTomatoes.rating !== null) && (
              <Information
                value={
                  isEditing
                    ? editedMovie.rottenTomatoes.rating
                    : // @ts-ignore // Object movie.rottenTomatoes.rating cannot possibly be null
                      movie.rottenTomatoes.rating.toString()
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
                value={movie.poster}
                editMode={isEditing}
                label="Poster"
                infoChangeHandler={getChangeHandler("poster")}
                placeholder="link"
                keyboardType="default"
              />
            )}

            {!isEditing && (
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
  deleteInfoIcon: {
    paddingLeft: 5,
  },
  discardButton: {
    flex: 1,
    padding: 2,
    fontSize: 18,
    color: "#dddddd",
    fontFamily: "sans-serif-light",
  },
  editIcon: {
    position: "absolute",
    right: 0,
    paddingRight: 7,
    paddingTop: 2,
  },
  movieInfo: {
    backgroundColor: "rgba( 120, 120, 120, 0.6 )",
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
    paddingTop: 33,
    paddingBottom: 15,
  },
  nameView: {
    display: "flex",
    alignItems: "center",
    padding: 10,
  },
  releaseYear: {
    alignSelf: "center",
    textAlign: "center",
    fontSize: 18,
    color: "#eeeeee",
    fontFamily: "monospace",
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
    // alignItems: "center",
    justifyContent: "space-around",
    paddingTop: 30,
    paddingBottom: 20,
  },
  scrollView: {
    minHeight: "100%",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 18,
    color: "#eeeeee",
    fontFamily: "monospace",
    minWidth: 100,
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
  watchBanner: {
    display: "flex",
    alignItems: "center",
  },
  watchedIcon: {},
});
