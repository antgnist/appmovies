import { Component } from 'react';
import { Row, Col, Spin, Alert } from 'antd';

import CardFilm from '../CardFilm';
import FilmsService from '../../services/FilmsService';

import './CardsList.css';

export default class CardsList extends Component {
  filmsService = new FilmsService();

  state = { listFilms: [], status: 'loading' };

  componentDidMount() {
    this.requestListFilms();
  }

  onError = () => {
    this.setState({ status: 'error' });
  };

  requestListFilms() {
    this.filmsService
      .getMovies('The way back')
      .then((films) => {
        console.log(films);
        this.setState({ listFilms: films, status: 'ok' });
      })
      .catch(this.onError);
  }

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
      default:
        content = <ShowFilms listFilms={listFilms} />;
        break;
    }

    return (
      <div className="site-card-wrapper">
        <Row gutter={[35, 35]} justify="center">
          {content}
        </Row>
      </div>
    );
  }
}

CardsList.propTypes = {};

function ShowFilms({ listFilms }) {
  return listFilms.map((film) => (
    <Col span={12} key={film.id}>
      <CardFilm
        title={film.title}
        rank={film.vote_average}
        date={film.release_date}
        overview={film.overview}
        img={film.poster_path}
      />
    </Col>
  ));
}
