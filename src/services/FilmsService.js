import APIkey from './APIkey';

class FilmsService {
  #apiBase = 'https://api.themoviedb.org/3';

  #apiKey = APIkey;

  #qureyAuth = `api_key=${this.#apiKey}`;

  static formatMovies = (data) => {
    const films = data.results.reduce((acc, film) => {
      const elem = {
        id: film.id,
        title: film.original_title,
        date: film.release_date,
        overview: film.overview,
        img: film.poster_path,
        genreIds: film.genre_ids,
        rank: +film.vote_average,
      };
      acc.push(elem);
      return acc;
    }, []);
    return {
      films,
      totalResults: +data.total_results,
      totalPages: +data.total_pages,
    };
  };

  async getResource(url, query = '', apiBase = this.#apiBase) {
    const res = await fetch(`${apiBase}${url}?${this.#qureyAuth}${query}`, {
      method: 'GET',
    });
    if (!res.ok) throw new Error(`Could not fetch ${url}, recieved ${res.status}`);
    const body = await res.json();
    return body;
  }

  getGenres = async () => {
    const body = await this.getResource('/genre/movie/list');
    return body.genres.reduce((acc, genre) => {
      acc[genre.id] = genre.name;
      return acc;
    }, {});
  };

  getMovies = async (query, page = 1) => {
    const body = await this.getResource('/search/movie', `&include_adult=true&query=${query}&page=${page}`);
    return FilmsService.formatMovies(body);
  };
}

export default FilmsService;
