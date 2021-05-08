import React, { PureComponent } from "react";

import { StyleSheet, Text, View } from "react-native";

interface SeriesProgressProps {
  seasons: number[];
  seenEpisodes: number;
}

export default class SeriesProgress extends PureComponent<SeriesProgressProps> {
  constructor(props: SeriesProgressProps) {
    super(props);
  }

  getWidthClass(seasonCount: number) {
    switch (seasonCount) {
      case 1:
        return styles.width1;
      case 2:
        return styles.width2;
      case 3:
        return styles.width3;
      case 4:
        return styles.width4;
      case 5:
        return styles.width5;
      default:
        return {};
    }
  }

  getCompletionLineClass(seasons: number[], seenEpisodes: number) {
    if (seasons.length < 2) return {};

    let seasonsSeen = 0;
    for (const episodeCount of seasons) {
      if (seenEpisodes < episodeCount) break;
      seenEpisodes -= episodeCount;
      seasonsSeen++;
    }

    return {
      width: `${((seasonsSeen - 1) * 100) / (seasons.length - 1)}%`,
      borderColor: "#4361ee",
      left: 0,
    };
  }

  getRemainingLineClass(seasons: number[], seenEpisodes: number) {
    if (seasons.length < 2) return {};

    let seasonsSeen = 0;
    for (const episodeCount of seasons) {
      if (seenEpisodes < episodeCount) break;
      seenEpisodes -= episodeCount;
      seasonsSeen++;
    }

    return {
      width: `${
        ((seasons.length - Math.max(seasonsSeen, 1)) * 100) /
        (seasons.length - 1)
      }%`,
      borderColor: "#a4161a",
      right: 0,
    };
  }

  render() {
    const { seasons, seenEpisodes } = this.props;

    let currentCount: number;
    currentCount = 0;

    return (
      <View style={[styles.container, this.getWidthClass(seasons.length)]}>
        {seasons.length > 1 && (
          <>
            <View
              style={[
                styles.seasonLine,
                this.getCompletionLineClass(seasons, seenEpisodes),
              ]}
            ></View>
            <View
              style={[
                styles.seasonLine,
                this.getRemainingLineClass(seasons, seenEpisodes),
              ]}
            ></View>
          </>
        )}

        {seasons.map((episodeCount, index) => {
          currentCount += episodeCount;
          return (
            <View
              key={index}
              style={[
                styles.seasonBlob,
                currentCount <= seenEpisodes
                  ? styles.seasonSeenBlob
                  : styles.seasonUnseenBlob,
              ]}
            >
              <View style={styles.seasonBlobInnerBorder}></View>
            </View>
          );
        })}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  seasonBlob: {
    width: 11,
    height: 11,
    borderRadius: 50,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  seasonSeenBlob: { backgroundColor: "#4361ee" },
  seasonUnseenBlob: { backgroundColor: "#a4161a" },
  seasonBlobInnerBorder: {
    width: 9,
    height: 9,
    borderRadius: 50,
    borderColor: "black",
    borderStyle: "solid",
    borderWidth: 0.5,
  },
  width1: { justifyContent: "space-around" },
  width2: { marginHorizontal: 60 },
  width3: { marginHorizontal: 40 },
  width4: { marginHorizontal: 20 },
  width5: { marginHorizontal: 10 },
  seasonLine: {
    position: "absolute",
    height: 6,
    borderBottomWidth: 1,
    borderStyle: "solid",
  },
});
