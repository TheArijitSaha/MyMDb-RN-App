interface SignInData {
  readonly email: string;
  readonly password: string;
}

interface DrawerContentOptions {
  signOutHandler?: () => Promise<void>;
}

interface MovieWithoutID {
  title: string;
  subtitle: string | null;
  releaseYear: number;
  directors: string[];
  cast: string[];
  genres: string[];
  imdb: { rating: number; link: string };
  rottenTomatoes: { rating: number | null };
  runtime: number;
  seen: boolean;
  poster: string;
}

interface Movie extends MovieWithoutID {
  _id: string;
}

interface Series {
  _id: string;
  title: string;
  timeSpan: { start: number; end: number | null };
  creators: string[];
  cast: string[];
  genres: string[];
  seasons: number[];
  meanRuntime: number;
  imdb: { rating: number; link: string };
  rottenTomatoes: { rating: number | null };
  seenEpisodes: number;
  poster: string;
}

type SeriesWithoutId = Omit<Series, "_id">;
