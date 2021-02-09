interface SignInData {
  readonly email: string;
  readonly password: string;
}

interface DrawerContentOptions {
  signOutHandler?: () => Promise<void>;
}

interface Movie {
  _id: string;
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
