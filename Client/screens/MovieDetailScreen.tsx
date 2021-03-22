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

  const handleRuntimeChange = (textRuntime: string) => {
    dispatch({
      type: "EDIT_MOVIE",
      data: {
        editedMovie: {
          ...editedMovie,
          runtime: textRuntime,
        },
      },
    });
  };

  const handleTomatometerChange = (textRating: string) => {
    dispatch({
      type: "EDIT_MOVIE",
      data: {
        editedMovie: {
          ...editedMovie,
          rottenTomatoes: { rating: textRating },
        },
      },
    });
  };

  const handleImdbRatingChange = (textRating: string) => {
    dispatch({
      type: "EDIT_MOVIE",
      data: {
        editedMovie: {
          ...editedMovie,
          imdb: { ...editedMovie.imdb, rating: textRating },
        },
      },
    });
  };

  const handleSubtitleChange = (newSubtitle: string) => {
    dispatch({
      type: "EDIT_MOVIE",
      data: {
        editedMovie: {
          ...editedMovie,
          subtitle: newSubtitle,
        },
      },
    });
  };

  const handlePosterChange = (newPoster: string) => {
    dispatch({
      type: "EDIT_MOVIE",
      data: {
        editedMovie: {
          ...editedMovie,
          poster: newPoster,
        },
      },
    });
  };

  const directorChangeHandlerMaker = (
    index: number
  ): ((text: string) => void) => {
    let newDirectors = editedMovie.directors;

    const directorChangeHandler = (newDirector: string) => {
      newDirectors[index] = newDirector;
      dispatch({
        type: "EDIT_MOVIE",
        data: {
          editedMovie: {
            ...editedMovie,
            directors: newDirectors,
          },
        },
      });
    };

    return directorChangeHandler;
  };

  const directorDeleteHandlerMaker = (index: number): (() => void) => {
    let newDirectors = editedMovie.directors;

    const directorDeleteHandler = () => {
      newDirectors.splice(index, 1);

      dispatch({
        type: "EDIT_MOVIE",
        data: {
          editedMovie: {
            ...editedMovie,
            directors: newDirectors,
          },
        },
      });
    };

    return directorDeleteHandler;
  };

  const directorAddHandler = () => {
    const newDirectors = [...editedMovie.directors, ""];

    dispatch({
      type: "EDIT_MOVIE",
      data: {
        editedMovie: {
          ...editedMovie,
          directors: newDirectors,
        },
      },
    });
  };

  const castChangeHandlerMaker = (index: number): ((text: string) => void) => {
    let newCast = editedMovie.cast;

    const castChangeHandler = (newActor: string) => {
      newCast[index] = newActor;
      dispatch({
        type: "EDIT_MOVIE",
        data: {
          editedMovie: {
            ...editedMovie,
            cast: newCast,
          },
        },
      });
    };

    return castChangeHandler;
  };

  const castDeleteHandlerMaker = (index: number): (() => void) => {
    let newCast = editedMovie.cast;

    const castDeleteHandler = () => {
      newCast.splice(index, 1);

      dispatch({
        type: "EDIT_MOVIE",
        data: {
          editedMovie: {
            ...editedMovie,
            cast: newCast,
          },
        },
      });
    };

    return castDeleteHandler;
  };

  const castAddHandler = () => {
    const newCast = [...editedMovie.cast, ""];

    dispatch({
      type: "EDIT_MOVIE",
      data: {
        editedMovie: {
          ...editedMovie,
          cast: newCast,
        },
      },
    });
  };

  const genreChangeHandlerMaker = (index: number): ((text: string) => void) => {
    let newGenres = editedMovie.genres;

    const genreChangeHandler = (newGenre: string) => {
      newGenres[index] = newGenre;
      dispatch({
        type: "EDIT_MOVIE",
        data: {
          editedMovie: {
            ...editedMovie,
            genres: newGenres,
          },
        },
      });
    };

    return genreChangeHandler;
  };

  const genreDeleteHandlerMaker = (index: number): (() => void) => {
    let newGenres = editedMovie.genres;

    const genresDeleteHandler = () => {
      newGenres.splice(index, 1);

      dispatch({
        type: "EDIT_MOVIE",
        data: {
          editedMovie: {
            ...editedMovie,
            genres: newGenres,
          },
        },
      });
    };

    return genresDeleteHandler;
  };

  const genreAddHandler = () => {
    const newGenres = [...editedMovie.genres, ""];

    dispatch({
      type: "EDIT_MOVIE",
      data: {
        editedMovie: {
          ...editedMovie,
          genres: newGenres,
        },
      },
    });
  };

  const getFloatFromString = (num: string, defaultRes: number) => {
    try {
      let parsedNum = parseFloat(num);

      if (isNaN(parsedNum)) return defaultRes;
      return parsedNum;
    } catch (e) {
      return defaultRes;
    }
  };

  const getIntFromString = (num: string, defaultRes: number | null) => {
    if (num.length === 0) return null;
    try {
      let parsedNum = parseInt(num, 10);

      if (isNaN(parsedNum)) return defaultRes;
      return parsedNum;
    } catch (e) {
      return defaultRes;
    }
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
                  onChangeText={handleSubtitleChange}
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
              infoAddHandler={directorAddHandler}
              infoChangeHandlerMaker={directorChangeHandlerMaker}
              infoDeleteHandlerMaker={directorDeleteHandlerMaker}
            />

            <ArrayInformation
              value={isEditing ? editedMovie.cast : movie.cast}
              label="Starring"
              editMode={isEditing}
              infoAddHandler={castAddHandler}
              infoChangeHandlerMaker={castChangeHandlerMaker}
              infoDeleteHandlerMaker={castDeleteHandlerMaker}
            />

            <View style={styles.detailView}>
              <Text style={styles.label}>Runtime</Text>
              <View style={styles.infoView}>
                {isEditing ? (
                  <View style={styles.runtimeEditView}>
                    <TextInput
                      style={styles.infoTextOpenWidth}
                      value={editedMovie.runtime}
                      onChangeText={handleRuntimeChange}
                      keyboardType="number-pad"
                      placeholder="0"
                      placeholderTextColor="#aaaaaa"
                    />
                    <Text style={styles.infoTextOpenWidth}> mins</Text>
                  </View>
                ) : (
                  <Text style={styles.infoText}>{movie.runtime} mins</Text>
                )}
              </View>
            </View>

            <ArrayInformation
              value={isEditing ? editedMovie.genres : movie.genres}
              label="Genres"
              editMode={isEditing}
              infoAddHandler={genreAddHandler}
              infoChangeHandlerMaker={genreChangeHandlerMaker}
              infoDeleteHandlerMaker={genreDeleteHandlerMaker}
            />

            <View style={styles.detailView}>
              <Text style={styles.label}>IMDB</Text>
              <View style={styles.infoView}>
                {isEditing ? (
                  <TextInput
                    style={styles.infoText}
                    value={editedMovie.imdb.rating}
                    onChangeText={handleImdbRatingChange}
                    keyboardType="decimal-pad"
                    placeholder="rating"
                    placeholderTextColor="#aaaaaa"
                  />
                ) : (
                  <Text style={styles.infoText}>{movie.imdb.rating}</Text>
                )}
              </View>
            </View>

            <View style={styles.detailView}>
              {(movie.rottenTomatoes.rating !== null || isEditing) && (
                <Text style={styles.label}>Tomatometer</Text>
              )}
              <View style={styles.infoView}>
                {isEditing ? (
                  <TextInput
                    style={styles.infoText}
                    value={editedMovie.rottenTomatoes.rating}
                    onChangeText={handleTomatometerChange}
                    keyboardType="number-pad"
                    placeholder="rating"
                    placeholderTextColor="#aaaaaa"
                  />
                ) : (
                  movie.rottenTomatoes.rating !== null && (
                    <Text style={styles.infoText}>
                      {movie.rottenTomatoes.rating}
                    </Text>
                  )
                )}
              </View>
            </View>

            {isEditing && (
              <View style={styles.detailView}>
                <Text style={styles.label}>Poster</Text>
                <View style={styles.infoView}>
                  <TextInput
                    style={styles.infoText}
                    value={editedMovie.poster}
                    onChangeText={handlePosterChange}
                    keyboardType="default"
                    placeholder="url"
                    placeholderTextColor="#aaaaaa"
                  />
                </View>
              </View>
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
  scrollView: {
    minHeight: "100%",
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
  detailView: {
    display: "flex",
    flexDirection: "row",
    alignItems: "flex-start",
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 3,
    paddingBottom: 3,
  },
  runtimeEditView: {
    display: "flex",
    flexDirection: "row",
  },
  title: {
    textAlign: "center",
    fontSize: 23,
    color: "#eeeeee",
    fontFamily: "monospace",
  },
  subtitle: {
    textAlign: "center",
    fontSize: 18,
    color: "#eeeeee",
    fontFamily: "monospace",
    minWidth: 100,
  },
  releaseYear: {
    alignSelf: "center",
    textAlign: "center",
    fontSize: 18,
    color: "#eeeeee",
    fontFamily: "monospace",
  },
  titleFooterBanner: {
    width: "100%",
    flexDirection: "row",
    justifyContent: "center",
    position: "relative",
  },
  label: {
    flex: 7,
    textAlign: "right",
    padding: 2,
    paddingRight: 10,
    color: "white",
    fontFamily: "sans-serif-thin",
    fontSize: 18,
  },
  infoView: {
    flex: 13,
    paddingRight: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  infoText: {
    // minWidth: "100%",
    padding: 2,
    fontSize: 18,
    color: "#eeeeee",
    fontFamily: "monospace",
  },
  infoTextOpenWidth: {
    padding: 2,
    fontSize: 18,
    color: "#eeeeee",
    fontFamily: "monospace",
  },
  watchBanner: {
    display: "flex",
    alignItems: "center",
  },
  watchedIcon: {},
  deleteInfoIcon: {
    paddingLeft: 5,
  },
  editIcon: {
    position: "absolute",
    right: 0,
    paddingRight: 7,
    paddingTop: 2,
  },
  saveEditedBanner: {
    display: "flex",
    flexDirection: "row",
    // alignItems: "center",
    justifyContent: "space-around",
  },
  saveButton: {
    flex: 1,
    padding: 2,
    fontSize: 18,
    color: "#dddddd",
    fontFamily: "sans-serif-light",
  },
  discardButton: {
    flex: 1,
    padding: 2,
    fontSize: 18,
    color: "#dddddd",
    fontFamily: "sans-serif-light",
  },
});
