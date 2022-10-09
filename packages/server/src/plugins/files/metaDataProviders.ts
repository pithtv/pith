import {MetaDataProvider} from "./MetaDataProvider";
import movie_nfo from "./movie-nfo";
import tvshow_nfo from "./tvshow-nfo";
import thumbnails from "./thumbnails";
import fanart from "./fanart";
import {Subtitles} from "./subtitles";

export const metaDataProviders: MetaDataProvider[] = [new movie_nfo(), new tvshow_nfo(), new thumbnails(), new fanart(), new Subtitles()];
