import { Component } from 'react';
import { Row, Alert } from 'antd';
import _ from 'lodash';
import PropTypes from 'prop-types';

import FilmsService from '../../services/FilmsService';

import CardListContent from './CardListContent';

import './CardsList.css';

export default class CardsList extends Component {
  state = { listFilms: [], status: 'loading', ratedFilms: {} };

  filmsService = new FilmsService();

  debounedSearchFilms = _.debounce(() => {
    const { changePagination } = this.props;
    changePagination(1); // изменяем пагинацию и автоматом вызовется поиск фильмов с новой строкой поиска
  }, 700);

  componentDidMount() {
    this.searchFilms();
  }

  componentDidUpdate(prevProps) {
    const { pageNumber, searchQuery, guestSessionId, activeTab } = this.props;

    if (
      (prevProps.pageNumber !== pageNumber && activeTab === prevProps.activeTab) ||
      prevProps.activeTab !== activeTab
    ) {
      if (activeTab === 'search') this.searchFilms();
      if (activeTab === 'rated') this.ratedFilmsPanel();
    }

    if (prevProps.searchQuery !== searchQuery && activeTab === 'search') {
      this.debounedSearchFilms();
    }

    if (prevProps.guestSessionId !== guestSessionId) {
      this.updateIdsRattedFilms();
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

  onRatingError = () => {
    this.setState({ status: 'ratingerror' });
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

  searchFilms = () => {
    const { searchQuery } = this.props;
    const { pageNumber } = this.props;
    this.onLoading();
    if (searchQuery) {
      this.filmsService.getMovies(searchQuery, pageNumber.page).then(this.filmsLoaded).catch(this.onError);
    } else {
      this.filmsService.getPremiers(pageNumber.page).then(this.filmsLoaded).catch(this.onError);
    }
  };

  ratedFilmsPanel = () => {
    const { guestSessionId } = this.props;
    const { pageNumber } = this.props;
    this.onLoading();
    this.filmsService.getAllRattedFilms(guestSessionId, pageNumber.page).then(this.filmsLoaded).catch(this.onError);
  };

  render() {
    const { listFilms, status, ratedFilms } = this.state;
    const { pageNumber, totalResults, changePagination, resizeWidth } = this.props;

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

        <Row gutter={[35, 35]} justify="center">
          <CardListContent
            listFilms={listFilms}
            status={status}
            ratedFilms={ratedFilms}
            pageNumber={pageNumber}
            totalResults={totalResults}
            changePagination={changePagination}
            resizeWidth={resizeWidth}
            changeRate={this.changeRate}
          />
        </Row>
      </div>
    );
  }
}

CardsList.defaultProps = { searchQuery: '', pageNumber: { page: 1 }, totalResults: 0, changePagination: () => {} };

CardsList.propTypes = {
  searchQuery: PropTypes.string,
  pageNumber: PropTypes.shape({
    page: PropTypes.number,
  }),
  totalResults: PropTypes.number,
  changePagination: PropTypes.func,
};
