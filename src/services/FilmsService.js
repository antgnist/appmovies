class FilmsService {
  #apiBase = 'https://api.themoviedb.org/3';

  #apiKey = '457c51f291a1f0ff541d3f1c6a2c6657';

  async getResource(url, query) {
    const res = await fetch(`${this.#apiBase}${url}?api_key=${this.#apiKey}&include_adult=true&query=${query}`, {
      method: 'GET',
    });
    if (!res.ok) {
      throw new Error(`Could not fetch ${url}, recieved ${res.status}`);
    }
    const body = await res.json();
    return body;
  }

  getMovies(query) {
    return this.getResource('/search/movie', query).then((body) => body.results);
  }
}

export default FilmsService;
