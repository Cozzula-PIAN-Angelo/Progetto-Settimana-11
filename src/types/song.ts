export interface Artist {
  id: number;
  name: string;
  picture_medium: string;
}

export interface Album {
  title: string;
  cover_medium: string;
  cover_big: string;
}

export interface Song {
  id: number;
  title: string;
  duration: number;
  preview: string;
  artist: Artist;
  album: Album;
  release_date?: string;
  rank?: number;
}
