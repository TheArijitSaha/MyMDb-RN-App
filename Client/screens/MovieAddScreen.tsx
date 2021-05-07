import React, { useContext, useReducer } from "react";

import { StatusBar } from "expo-status-bar";
import {
  Alert,
  //   BackHandler,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { StackScreenProps } from "@react-navigation/stack";
import Icon from "react-native-vector-icons/Ionicons";

import { API_URL } from "../constants";
import { AuthContext } from "../contexts/AuthContext";
import { MoviesStackParamList } from "../navigation/moviesStack";
import ArrayInformation from "../components/common/ArrayInformation";
import DictInformation from "../components/common/DictInformation";
import Information from "../components/common/Information";

type NewMovie = {
  title: string;
  releaseYear: string;
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
  seen: boolean;
};

export const getFloatFromString = (num: string, defaultRes: number) => {
  try {
    let parsedNum = parseFloat(num);

    if (isNaN(parsedNum)) return defaultRes;
    return parsedNum;
  } catch (e) {
    return defaultRes;
  }
};

export const getIntFromString = (num: string, defaultRes: number | null) => {
  try {
    let parsedNum = parseInt(num, 10);

    if (isNaN(parsedNum)) return defaultRes;
    return parsedNum;
  } catch (e) {
    return defaultRes;
  }
};

const getNewMovie = (movie: NewMovie): MovieWithoutID => {
  return {
    title: movie.title,
    subtitle: movie.subtitle.length > 0 ? movie.subtitle : null,
    releaseYear: getIntFromString(movie.releaseYear, 0) ?? 0,
    runtime: getIntFromString(movie.runtime, 0) ?? 0,
    directors: [...movie.directors],
    cast: [...movie.cast],
    genres: [...movie.genres],
    imdb: {
      rating: getFloatFromString(movie.imdb.rating, 0),
      link: movie.imdb.link,
    },
    rottenTomatoes: {
      rating:
        movie.rottenTomatoes.rating.length > 0
          ? getIntFromString(movie.rottenTomatoes.rating, 0)
          : null,
    },
    poster: movie.poster,
    seen: movie.seen,
  };
};

type Props = StackScreenProps<MoviesStackParamList, "MovieAdd">;

type State = {
  movie: NewMovie;
  isSaving: boolean;
};

type Action =
  | { type: "TOGGLE_SEEN" }
  | { type: "TOGGLE_SAVE_MODE" }
  | { type: "EDIT_MOVIE"; data: { movie: NewMovie } };

function reducer(prevState: State, action: Action): State {
  switch (action.type) {
    case "TOGGLE_SEEN":
      return {
        ...prevState,
        movie: { ...prevState.movie, seen: !prevState.movie.seen },
      };
    case "TOGGLE_SAVE_MODE":
      return {
        ...prevState,
        isSaving: !prevState.isSaving,
      };
    case "EDIT_MOVIE":
      return {
        ...prevState,
        movie: action.data.movie,
      };
    default:
      throw new Error("Unknown Action type");
  }
}

export default function MovieAddScreen({ navigation }: Props) {
  const initialState: State = {
    movie: {
      title: "",
      subtitle: "",
      directors: [],
      cast: [],
      genres: [],
      runtime: "",
      seen: false,
      releaseYear: "",
      imdb: {
        rating: "",
        link: "",
      },
      poster: "",
      rottenTomatoes: { rating: "" },
    },
    isSaving: false,
  };

  const [{ movie, isSaving }, dispatch] = useReducer(reducer, initialState);

  const { userToken } = useContext(AuthContext);

  const saveMovie = async (newMovie: MovieWithoutID) => {
    try {
      const jsonResponse = await fetch(`${API_URL}movies`, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ movie: newMovie }),
      });

      if (jsonResponse.status == 409) {
        Alert.alert(
          `${newMovie.title} [${newMovie.releaseYear}] already in database.`
        );
        return false;
      }

      if (jsonResponse.status == 422) {
        Alert.alert(`Title and release Year are required fields.`);
        return false;
      }

      const movie = await jsonResponse.json();
      return movie;
    } catch (e) {
      console.error(e);
      return false;
    }
  };

  const handleSeenToggle = () => {
    dispatch({
      type: "TOGGLE_SEEN",
    });
  };

  const handleScrape = async () => {
    if (movie.imdb.link.length < 1) {
      return;
    }

    try {
      const jsonResponse = await fetch(
        `${API_URL}movies/scrape/imdb?link=${movie.imdb.link}`,
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
        type: "EDIT_MOVIE",
        data: {
          movie: {
            ...movie,
            ...response,
            subtitle: response.subtitle ?? "",
            releaseYear: response.releaseYear.toString(),
            imdb: {
              ...movie.imdb,
              rating: response.imdb.rating.toString(),
            },
            runtime: response.runtime.toString(),
          },
        },
      });
    } catch (e) {
      console.error(e);
    }
  };

  type AtomFields =
    | "title"
    | "subtitle"
    | "releaseYear"
    | "imdb.rating"
    | "imdb.link"
    | "rottenTomatoes.rating"
    | "poster"
    | "runtime";

  const getChangeHandler = (property: AtomFields): ((text: string) => void) => {
    const changeHandler = (newValue: string) => {
      switch (property) {
        case "imdb.rating":
          dispatch({
            type: "EDIT_MOVIE",
            data: {
              movie: {
                ...movie,
                imdb: {
                  ...movie.imdb,
                  rating: newValue,
                },
              },
            },
          });
          break;
        case "imdb.link":
          dispatch({
            type: "EDIT_MOVIE",
            data: {
              movie: {
                ...movie,
                imdb: {
                  ...movie.imdb,
                  link: newValue,
                },
              },
            },
          });
          break;
        case "rottenTomatoes.rating":
          dispatch({
            type: "EDIT_MOVIE",
            data: {
              movie: {
                ...movie,
                rottenTomatoes: {
                  ...movie.rottenTomatoes,
                  rating: newValue,
                },
              },
            },
          });
          break;
        default:
          dispatch({
            type: "EDIT_MOVIE",
            data: {
              movie: { ...movie, [property]: newValue },
            },
          });
      }
    };

    return changeHandler;
  };

  type ArrayFields = "directors" | "cast" | "genres";

  const getArrayChangeHandler = (
    property: ArrayFields,
    index: number
  ): ((text: string) => void) => {
    let newArray = movie[property];

    const changeHandler = (newValue: string) => {
      newArray[index] = newValue;

      dispatch({
        type: "EDIT_MOVIE",
        data: {
          movie: {
            ...movie,
            [property]: newArray,
          },
        },
      });
    };

    return changeHandler;
  };

  const getArrayAddHandler = (property: ArrayFields) => {
    const addHandler = () => {
      const newArray = [...movie[property], ""];

      dispatch({
        type: "EDIT_MOVIE",
        data: {
          movie: {
            ...movie,
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
    let newArray = movie[property];

    const deleteHandler = () => {
      newArray.splice(index, 1);

      dispatch({
        type: "EDIT_MOVIE",
        data: {
          movie: {
            ...movie,
            [property]: newArray,
          },
        },
      });
    };

    return deleteHandler;
  };

  const handleSave = async () => {
    let newMovie = getNewMovie(movie);

    dispatch({ type: "TOGGLE_SAVE_MODE" });
    const savedMovie = await saveMovie(newMovie);
    dispatch({ type: "TOGGLE_SAVE_MODE" });

    if (savedMovie) {
      navigation.pop();
      navigation.navigate("MovieDetail", { movie: savedMovie });
    }
  };

  return (
    <View>
      <StatusBar style="light" />
      <View style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollView}>
          <View style={styles.movieInfo}>
            <Information
              value={movie.title}
              editMode={true}
              label={false}
              infoChangeHandler={getChangeHandler("title")}
              placeholder="Title"
            />
            <Information
              value={movie.subtitle}
              editMode={true}
              label={false}
              infoChangeHandler={getChangeHandler("subtitle")}
              placeholder="Subtitle"
            />
            <Information
              value={movie.releaseYear}
              editMode={true}
              label={false}
              infoChangeHandler={getChangeHandler("releaseYear")}
              placeholder="Release Year"
              keyboardType="number-pad"
            />
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
              value={movie.directors}
              label="Directed By"
              editMode={true}
              infoAddHandler={getArrayAddHandler("directors")}
              infoChangeHandlerMaker={(index) =>
                getArrayChangeHandler("directors", index)
              }
              infoDeleteHandlerMaker={(index) =>
                getArrayDeleteHandler("directors", index)
              }
            />
            <ArrayInformation
              value={movie.cast}
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
            <Information
              value={movie.runtime}
              editMode={true}
              label="Runtime"
              infoChangeHandler={getChangeHandler("runtime")}
              placeholder="0"
              keyboardType="number-pad"
              followText=" mins"
            />
            <ArrayInformation
              value={movie.genres}
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
                  value: movie.imdb.rating,
                  placeholder: "rating",
                  keyboardType: "decimal-pad",
                  infoChangeHandler: getChangeHandler("imdb.rating"),
                },
                {
                  value: movie.imdb.link,
                  placeholder: "link",
                  keyboardType: "default",
                  infoChangeHandler: getChangeHandler("imdb.link"),
                },
              ]}
              editMode={true}
              label="IMDB"
            />
            <Information
              value={movie.rottenTomatoes.rating}
              editMode={true}
              label="Tomatometer"
              infoChangeHandler={getChangeHandler("rottenTomatoes.rating")}
              placeholder="rating"
              keyboardType="decimal-pad"
            />
            <Information
              value={movie.poster}
              editMode={true}
              label="Poster"
              infoChangeHandler={getChangeHandler("poster")}
              placeholder="link"
              keyboardType="default"
            />
            <View style={styles.watchBanner}>
              <TouchableOpacity onPress={handleSeenToggle}>
                {movie.seen ? (
                  <Icon
                    name="eye-sharp"
                    size={25}
                    color="gray"
                    style={styles.watchedIcon}
                  />
                ) : (
                  <Icon
                    name="eye-off-sharp"
                    size={25}
                    color="gray"
                    style={styles.watchedIcon}
                  />
                )}
              </TouchableOpacity>
            </View>
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
  scrollView: {
    minHeight: "100%",
  },
  movieInfo: {
    backgroundColor: "black",
    flex: 1,
    flexDirection: "column",
    justifyContent: "space-around",
    paddingTop: 33,
    paddingBottom: 15,
  },
  watchBanner: {
    display: "flex",
    alignItems: "center",
  },
  watchedIcon: {},
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
});
