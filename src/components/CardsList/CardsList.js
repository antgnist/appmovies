import { Component } from 'react';
import { Row, Col, Spin, Alert, Pagination } from 'antd';
import _ from 'lodash';

import CardFilm from '../CardFilm';
import FilmsService from '../../services/FilmsService';

import './CardsList.css';

export default class CardsList extends Component {
  state = { listFilms: [], status: 'loading', ratedFilms: {}, antiDblRequest: false };

  filmsService = new FilmsService();

  debounedSearchFilms = _.debounce(() => {
    const { changePagination } = this.props;
    this.changeAntiDblRequest();
    changePagination(1);
    this.searchFilms(1);
  }, 1500);

  componentDidMount() {
    this.searchFilms();
  }

  componentDidUpdate(prevProps, prevState) {
    const { antiDblRequest } = this.state;
    const { pageNumber, searchQuery, guestSessionId, activeTab } = this.props;
    if (
      prevProps.pageNumber !== pageNumber &&
      prevState.antiDblRequest === antiDblRequest &&
      activeTab === prevProps.activeTab
    ) {
      if (activeTab === 'search') this.searchFilms();
      if (activeTab === 'rated') this.ratedFilms();
    }

    if (prevProps.activeTab !== activeTab) {
      console.log('ЗАШЛИ В ВЕТКУ  prevProps.activeTab !== activeTab !!!!!!');
      if (activeTab === 'rated') {
        this.ratedFilms();
      }
      if (activeTab === 'search') {
        this.searchFilms();
      }
    }

    if (prevProps.searchQuery !== searchQuery && activeTab === 'search') {
      this.debounedSearchFilms();
    }

    if (prevProps.guestSessionId !== guestSessionId) {
      console.log('мы зашли в componentDidUpdate в ветку guestSessionId');
      this.updateIdsRattedFilms();
    }

    if (prevState.antiDblRequest !== antiDblRequest) {
      console.log('ЗАШЛИ В ВЕТКУ  prevState.antiDblRequest !== antiDblRequest !!!!!!');
    }
  }

  componentDidCatch() {
    this.onError();
  }

  onLoading = () => {
    this.setState({
      status: 'loading',
    });
  };

  onError = () => {
    this.setState({ status: 'error' });
  };

  // onNotFound = () => {
  //   this.setState({ status: 'notfound' });
  // };
  changeAntiDblRequest = () => {
    this.setState(({ antiDblRequest }) => ({
      antiDblRequest: !antiDblRequest,
    }));
  };

  changeRate = (id, rate) => {
    const { guestSessionId } = this.props;
    this.filmsService
      .rateMovie(guestSessionId, id, rate)
      .then((result) => console.log('результат установки оценки на сервере: ', result.status_message))
      .catch((err) => console.log('Не удалось установить оценку, ошибка: ', err));
    this.setState(({ ratedFilms }) => ({ ratedFilms: { ...ratedFilms, [id]: rate } }));
  };

  updateIdsRattedFilms = () => {
    const { guestSessionId } = this.props;
    this.filmsService.getIdsRattedFilms(guestSessionId).then((ratedFromServer) => {
      this.setState(({ ratedFilms }) => ({ ratedFilms: { ...ratedFilms, ...ratedFromServer } }));
    });
  };

  filmsLoaded = (result) => {
    const { activeTab, changeTotalResults } = this.props;
    console.log('в CardList - searchFilms или ratedFilms: ', result);
    if (result.totalResults === 0) {
      this.setState({
        listFilms: [],
        status: activeTab === 'search' ? 'notfound' : 'norated',
      });
    } else {
      this.setState({ listFilms: result.films, status: 'ok' });
    }
    changeTotalResults(result.totalResults);
  };

  searchFilms = (pageReset) => {
    const { searchQuery } = this.props;
    let { pageNumber } = this.props;
    this.onLoading();
    if (pageReset) pageNumber = pageReset;
    if (searchQuery) {
      this.filmsService.getMovies(searchQuery, pageNumber).then(this.filmsLoaded).catch(this.onError);
    } else {
      this.filmsService.getPremiers(pageNumber).then(this.filmsLoaded).catch(this.onError);
    }
  };

  ratedFilms = (pageReset) => {
    const { guestSessionId } = this.props;
    let { pageNumber } = this.props;
    this.onLoading();
    if (pageReset) pageNumber = pageReset;
    this.filmsService.getAllRattedFilms(guestSessionId, pageNumber).then(this.filmsLoaded).catch(this.onError);
  };

  render() {
    const { listFilms, status, ratedFilms } = this.state;
    const { pageNumber, totalResults, changePagination } = this.props;
    let content;
    switch (status) {
      case 'loading':
        content = <Spin size="large" />;
        break;
      case 'error':
        content = (
          <Alert
            message="Error... something went wrong"
            description="Unable to process request, please try again later. It is recommended to use a VPN for the application to work."
            type="error"
            showIcon
          />
        );
        break;
      case 'notfound':
        content = (
          <Alert
            message="Uhh... Not Found"
            description="
            Movies were not found. Try changing the request."
            type="warning"
            showIcon
          />
        );
        break;
      default:
        content = (
          <>
            <ShowFilms listFilms={listFilms} ratedFilms={ratedFilms} changeRate={this.changeRate} />
            <Pagination
              className="pagination"
              current={pageNumber}
              onChange={(num) => {
                changePagination(num);
              }}
              total={Math.min(totalResults, 100 * 20)}
              pageSize={20}
              hideOnSinglePage
              showQuickJumper={false}
            />
          </>
        );
        break;
    }

    return (
      <div className="cardlist-wrapper">
        <Row gutter={[35, 35]} justify="center">
          {content}
        </Row>
      </div>
    );
  }
}

CardsList.defaultProps = { searchQuery: 'the way back' };

CardsList.propTypes = {};

function ShowFilms({ listFilms, ratedFilms, changeRate }) {
  return listFilms.map((film) => (
    <Col span={12} key={film.id}>
      <CardFilm
        id={film.id}
        title={film.title}
        rank={film.rank}
        date={film.date}
        overview={film.overview}
        img={film.img}
        genreIds={film.genreIds}
        ratedFilms={ratedFilms}
        changeRate={changeRate}
      />
    </Col>
  ));
}
