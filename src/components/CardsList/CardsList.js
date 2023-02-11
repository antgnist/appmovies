import { Component } from 'react';
import { Row, Col, Spin, Alert, Pagination } from 'antd';
import _ from 'lodash';
import PropTypes from 'prop-types';

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
  }, 700);

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
      if (activeTab === 'rated') this.ratedFilmsPanel();
    }

    if (prevProps.activeTab !== activeTab) {
      if (activeTab === 'rated') {
        this.ratedFilmsPanel();
      }
      if (activeTab === 'search') {
        this.searchFilms();
      }
    }

    if (prevProps.searchQuery !== searchQuery && activeTab === 'search') {
      this.debounedSearchFilms();
    }

    if (prevProps.guestSessionId !== guestSessionId) {
      this.updateIdsRattedFilms();
    }

    // if (prevState.antiDblRequest !== antiDblRequest) {
    //   console.log('ЗАШЛИ В ВЕТКУ  prevState.antiDblRequest !== antiDblRequest !!!!!!');
    // }
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

  onRatingError = () => {
    this.setState({ status: 'ratingerror' });
  };

  changeAntiDblRequest = () => {
    this.setState(({ antiDblRequest }) => ({
      antiDblRequest: !antiDblRequest,
    }));
  };

  changeRate = (id, rate) => {
    const { guestSessionId } = this.props;
    this.filmsService
      .rateMovie(guestSessionId, id, rate)
      .then((result) => result.status_message)
      .catch(this.onRatingError);
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

  filmsGenreLoaded = (result) => {
    const { changeTotalResults } = this.props;
    // if (result.totalResults === 0) {
    //   this.setState({
    //     listFilms: [],
    //     status: activeTab === 'search' ? 'notfound' : 'norated',
    //   });
    // } else {
    this.setState({ listFilms: result.films, status: 'ok' });
    // }
    changeTotalResults(20);
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

  ratedFilmsPanel = (pageReset) => {
    const { guestSessionId } = this.props;
    let { pageNumber } = this.props;
    this.onLoading();
    if (pageReset) pageNumber = pageReset;
    this.filmsService.getAllRattedFilms(guestSessionId, pageNumber).then(this.filmsLoaded).catch(this.onError);
  };

  pickGenre = (id) => {
    this.onLoading();
    this.filmsService.pickGenre(id).then(this.filmsGenreLoaded).catch(this.onError);
  };

  render() {
    const { listFilms, status, ratedFilms } = this.state;
    const { pageNumber, totalResults, changePagination, resizeWidth } = this.props;
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
      case 'norated':
        content = (
          <Alert
            message="There are no rated movies."
            description="
              Movies were not found. Set your rating on the Search tab."
            type="warning"
            showIcon
          />
        );
        break;
      default:
        content = (
          <>
            <ShowFilms
              listFilms={listFilms}
              ratedFilms={ratedFilms}
              changeRate={this.changeRate}
              resizeWidth={resizeWidth}
              pickGenre={this.pickGenre}
            />
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
        {status === 'ratingerror' && (
          <Alert
            type="error"
            message="Error "
            description="Failed to rate the movie. Try again later."
            onClose={() => {
              this.setState({ status: 'ok' });
            }}
            closable
            banner
            showIcon
            className="warning"
            style={{ width: '100%', marginBottom: '16px' }}
          />
        )}

        <Row gutter={[35, 35]} justify="center" className="testFlex">
          {content}
        </Row>
      </div>
    );
  }
}

CardsList.defaultProps = { searchQuery: '', pageNumber: 1, totalResults: 0, changePagination: () => {} };

CardsList.propTypes = {
  searchQuery: PropTypes.string,
  pageNumber: PropTypes.number,
  totalResults: PropTypes.number,
  changePagination: PropTypes.func,
};

function ShowFilms({ listFilms, ratedFilms, changeRate, resizeWidth, pickGenre }) {
  return listFilms.map((film) => (
    <Col md={12} xs={24} key={film.id}>
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
        resizeWidth={resizeWidth}
        pickGenre={pickGenre}
      />
    </Col>
  ));
}
