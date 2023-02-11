import React, { Component } from 'react';
import { Button, Rate, Image } from 'antd';
import { format } from 'date-fns';

import { GenreConsumer } from '../GenreContext';

import noImage from './no-image.webp';

import './CardFilm.css';

const rankColor = (rank) => {
  let color = '#66E900';
  if (rank > 5 && rank < 7) color = '#E9D100';
  else if (rank > 3 && rank <= 5) color = '#E97E00';
  else if (rank <= 3) color = '#E90000';
  return {
    borderColor: color,
  };
};

// const reductionText = (text) => `${text.split(' ').slice(0, 15).join(' ')} ...`;

function cropOverview(overview, cardRef, headerRef, overviewRef) {
  const cardHeight = cardRef.current.offsetHeight;
  const headerHeight = headerRef.current.offsetHeight;
  const overviewWidth = overviewRef.current.offsetWidth;

  // console.log('Высота карточки: ', cardHeight);
  // console.log('Высота Хедера: ', headerHeight);
  // console.log('Ширина описания:: ', overviewWidth);

  const maxHeight = cardHeight - (headerHeight + 70);
  const letersPerLine = Math.floor(overviewWidth / 5.9); // делим на ширину одного символа
  const cropLength = Math.floor(letersPerLine * (maxHeight / 22 - 1)); // делим на высоту строки, получаем полную допустимую длину

  if (cropLength < 0) return null;
  if (overview.length < cropLength) return overview;
  const cropped = overview.slice(0, cropLength).split(' ');
  cropped.pop();
  return `${cropped.join(' ')}\u2026`;
}

const mapGenres = (genreList, genreIds) => {
  if (!genreIds || !genreList) return null;
  return genreIds.map((id) => {
    const genre = genreList[id];
    return genre ? (
      <Button
        key={genre}
        size="small"
        className="cardFilm__button"
        style={{ padding: '0 4px', borderRadius: '2px', fontSize: '12px', height: '20px' }}
      >
        {genre}
      </Button>
    ) : null;
  });
};

export default class CardFilm extends Component {
  imgBase = 'https://image.tmdb.org/t/p/original';

  state = { cropedText: null };

  cardRef = React.createRef();

  headerRef = React.createRef();

  overviewRef = React.createRef();

  componentDidMount() {
    const { overview } = this.props;
    this.setState({
      cropedText: cropOverview(overview, this.cardRef, this.headerRef, this.overviewRef),
    });
  }

  getSnapshotBeforeUpdate() {
    const headerHeight = this.headerRef.current.offsetHeight;
    return headerHeight || null;
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    const { overview, resizeWidth } = this.props;
    if (snapshot !== this.headerRef.current.offsetHeight && snapshot !== null) {
      const newCropedText = cropOverview(overview, this.cardRef, this.headerRef, this.overviewRef);
      this.setState({
        cropedText: newCropedText,
      });
    }
    if (resizeWidth !== prevProps.resizeWidth) {
      const newCropedText = cropOverview(overview, this.cardRef, this.headerRef, this.overviewRef);
      this.setState({
        cropedText: newCropedText,
      });
    }
  }

  render() {
    const { id, img, title, rank, date, genreIds, ratedFilms, changeRate } = this.props;
    const { cropedText } = this.state;
    const formatedDate = date ? <div className="cardFilm__date">{format(new Date(date), 'PP')}</div> : null;

    return (
      <GenreConsumer>
        {(genres) => (
          <div className="cardFilm" ref={this.cardRef}>
            <div className="cardFilm__img">
              <Image src={img ? this.imgBase + img : noImage} alt={title} width="100%" preview={Boolean(img)} />
            </div>
            <div className="cardFilm__content">
              <div className="cardFilm__content-wrap" style={{ display: 'flex', flexDirection: 'column', gap: '7px' }}>
                <header className="cardFilm__header" ref={this.headerRef}>
                  <div className="cardFilm__headerWrapper">
                    <h5 className="cardFilm__title">{title}</h5>
                    <div className="cardFilm__rank" style={rankColor(rank)}>
                      {rank}
                    </div>
                  </div>
                  {formatedDate}
                  <div className="cardFilm__buttons">{mapGenres(genres, genreIds)}</div>
                </header>

                <p className="cardFilm__overview" ref={this.overviewRef}>
                  {cropedText}
                </p>
              </div>

              <Rate
                allowHalf
                count={10}
                value={+ratedFilms[id]}
                onChange={(value) => {
                  changeRate(id, value);
                }}
                className="cardFilm__stars"
              />
            </div>
          </div>
        )}
      </GenreConsumer>
    );
  }
}

CardFilm.propTypes = {};
CardFilm.defaultProps = {
  title: 'Tittle not found',
  rank: 0,
  date: '',
  img: '',
  overview: 'Default Text',
};
