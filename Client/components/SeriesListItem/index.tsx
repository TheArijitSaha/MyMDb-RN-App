import React, { PureComponent } from "react";

import {
  ImageBackground,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import SeriesProgress from "./SeriesProgress";

interface SeriesListItemProps {
  series: Series;
  navigation: any;
}

export default class SeriesListItem extends PureComponent<SeriesListItemProps> {
  constructor(props: SeriesListItemProps) {
    super(props);
  }

  render() {
    const { series, navigation } = this.props;

    const styles = StyleSheet.create({
      container: {
        flex: 1,
        width: "50%",
        height: 280,
        display: "flex",
        justifyContent: "center",
      },
      poster: {
        flex: 1,
        resizeMode: "cover",
        backgroundColor: "#aaaaaa",
        borderStyle: "solid",
        borderWidth: 3,
      },
      label: {
        position: "absolute",
        bottom: 0,
        justifyContent: "center",
        width: "100%",
        //         backgroundColor: series.seen
        //           ? "rgba(94, 154, 115, 0.85)"
        //           : "rgba(164, 104, 115, 0.85)",
        padding: 5,
      },
      linearGradient: {
        width: "100%",
        height: "100%",
      },
      title: {
        textAlign: "center",
        flex: 1,
        color: "white",
      },
      releaseYear: {
        textAlign: "center",
        flex: 1,
        color: "white",
      },
    });

    return (
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.poster}
          onPress={() =>
            navigation.navigate("SeriesDetail", { series: series })
          }
        >
          <ImageBackground
            source={{ uri: series.poster }}
            style={styles.poster}
          >
            <LinearGradient
              // Background Linear Gradient
              colors={["transparent", "transparent", "rgba(0,0,0,0.9)"]}
              style={styles.linearGradient}
            >
              <View style={styles.label}>
                <SeriesProgress
                  seasons={series.seasons}
                  seenEpisodes={series.seenEpisodes}
                />
                <Text style={styles.title}>{series.title}</Text>
              </View>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
      </View>
    );
  }
}
