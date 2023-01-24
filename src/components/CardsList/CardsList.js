import { Component } from 'react';
import { Row, Col, Spin, Alert } from 'antd';
import _ from 'lodash';

import CardFilm from '../CardFilm';
import FilmsService from '../../services/FilmsService';

import './CardsList.css';

export default class CardsList extends Component {
  state = { listFilms: [], status: 'loading' };

  filmsService = new FilmsService();

  debounedSearchFilms = _.debounce(() => {
    this.searchFilms();
  }, 1500);

  componentDidMount() {
    this.searchFilms();
  }

  componentDidUpdate(prevProps) {
    const { pageNumber, searchQuery } = this.props;
    if (prevProps.pageNumber !== pageNumber) {
      this.searchFilms();
    }

    if (prevProps.searchQuery !== searchQuery) {
      this.debounedSearchFilms();
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

  searchFilms = () => {
    const { activeTab, pageNumber, changeTotalResults, searchQuery } = this.props;
    this.onLoading();
    this.filmsService
      .getMovies(searchQuery, pageNumber)
      .then((result) => {
        console.log('в CardList - searchFilms: ', result);
        if (result.totalResults === 0) {
          this.setState({
            listFilms: null,
            status: activeTab === 'search' ? 'notfound' : 'norated',
          });
        } else {
          this.setState({ listFilms: result.films, status: 'ok' });
        }
        changeTotalResults(result.totalResults);
      })
      .catch(this.onError);
  };

  render() {
    const { listFilms, status } = this.state;
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
        content = <ShowFilms listFilms={listFilms} />;
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

function ShowFilms({ listFilms }) {
  return listFilms.map((film) => (
    <Col span={12} key={film.id}>
      <CardFilm
        title={film.title}
        rank={film.rank}
        date={film.date}
        overview={film.overview}
        img={film.img}
        genreIds={film.genreIds}
      />
    </Col>
  ));
}
