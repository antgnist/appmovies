import APIkey from './APIkey';
// import guestId from './guestId';

class FilmsService {
  #apiBase = 'https://api.themoviedb.org/3';

  #apiKey = APIkey;

  #qureyAuth = `api_key=${this.#apiKey}`;

  headers = {
    'Content-Type': 'application/json;charset=utf-8',
  };

  fetchOptions = {
    method: 'GET',
    headers: this.headers,
    redirect: 'follow',
  };

  static formatMovies = (data) => {
    const films = data.results.reduce((acc, film) => {
      const elem = {
        id: film.id,
        title: film.original_title,
        date: film.release_date,
        overview: film.overview,
        img: film.poster_path,
        genreIds: film.genre_ids,
        rank: +film.vote_average.toFixed(1),
        rating: +film.rating,
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

  getResource = async (url, query = '', headers = this.fetchOptions, apiBase = this.#apiBase) => {
    const res = await fetch(`${apiBase}${url}?${this.#qureyAuth}${query}`, headers);
    if (!res.ok) throw new Error(`Could not fetch ${url}, recieved ${res.status}`);
    const body = await res.json();
    return body;
  };

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

  getPremiers = async (page = 1) => {
    const body = await this.getResource('/movie/now_playing', `&page=${page}`);
    return FilmsService.formatMovies(body);
  };

  getAllRattedFilms = async (guestSessionId, page = 1) => {
    const body = await this.getResource(`/guest_session/${guestSessionId}/rated/movies`, `&page=${page}`);
    return FilmsService.formatMovies(body);
  };

  getIdsRattedFilms = async (guestSessionId) => {
    const formatRatingId = (arr) => {
      const result = {};
      arr.forEach((element) => {
        result[element.id] = element.rating;
      });
      return result;
    };

    let resultFromServ = await this.getAllRattedFilms(guestSessionId);
    let resultArr = resultFromServ.films;
    for (let i = 2; i <= resultFromServ.totalPages; i++) {
      // eslint-disable-next-line no-await-in-loop
      resultFromServ = await this.getAllRattedFilms(guestSessionId, i);
      resultArr = [...resultArr, ...resultFromServ.films];
    }
    console.log('Оценённые фильмы от сервера: ', resultArr);
    return formatRatingId(resultArr);
  };

  createGuestSession = async () => {
    const body = await this.getResource('/authentication/guest_session/new');
    console.log('in FilmService -  createGuestSession: ', body.guest_session_id, 'закончится:', body.expires_at);
    return body;
  };

  rateMovie = async (guestSessionId, filmId, value) => {
    const options = {
      method: value === 0 ? 'DELETE' : 'POST',
      headers: this.headers,
      redirect: 'follow',
      body: JSON.stringify({ value }),
    };
    const body = await this.getResource(`/movie/${filmId}/rating`, `&guest_session_id=${guestSessionId}`, options);
    return body;
  };
}

export default FilmsService;
