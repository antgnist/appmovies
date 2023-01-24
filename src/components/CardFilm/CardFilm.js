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

  const maxHeight = cardHeight - (headerHeight + 90);

  // const z = overviewWidth > 300 ? 4 : 5.5;

  const letersPerLine = Math.floor(overviewWidth / 5.5);

  const cropLength = Math.floor(letersPerLine * (maxHeight / 25));

  if (cropLength < 0) return null;
  if (overview.length < cropLength) return overview;
  const cropped = overview.slice(0, cropLength).split(' ');
  cropped.pop();
  return [...cropped, '...'].join(' ');
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

// const mapGenres = (genreList, genreIds) => {
//   if (!genreList || !genreIds || !(genreList instanceof Array)) return null;

//   const genreTextArr = genreIds.map((id) => {
//     const currentGenre = genreList.find((item) => +item.id === +id);
//     return currentGenre ? currentGenre.name : null;
//   });
//   return genreTextArr.map((genre) =>
//     genre ? (
//       <Button
//         key={genre}
//         size="small"
//         className="cardFilm__button"
//         style={{ padding: '0 4px', borderRadius: '2px', fontSize: '12px', height: '20px' }}
//       >
//         {genre}
//       </Button>
//     ) : null
//   );
// };

export default class CardFilm extends Component {
  imgBase = 'https://image.tmdb.org/t/p/original';

  constructor(props) {
    super(props);
    this.cardRef = React.createRef();
    this.headerRef = React.createRef();
    this.overviewRef = React.createRef();
    this.overview = props.overview;
    this.state = { cropedText: null };
  }

  componentDidMount() {
    this.setState({
      cropedText: null,
      antiloop: true,
    });
  }

  componentDidUpdate() {
    const { antiloop } = this.state;
    if (antiloop) {
      this.setState({
        cropedText: cropOverview(this.overview, this.cardRef, this.headerRef, this.overviewRef),
        antiloop: false,
      });
    }
  }

  render() {
    const { img, title, rank, date, genreIds } = this.props;
    const { cropedText } = this.state;
    const formatedDate = date ? <div className="movie_card__date">{format(new Date(date), 'PP')}</div> : null;

    return (
      <GenreConsumer>
        {(genres) => (
          <div className="cardFilm" ref={this.cardRef}>
            <div className="cardFilm__img">
              <Image src={img ? this.imgBase + img : noImage} alt={title} width="100%" preview={Boolean(img)} />
            </div>
            <div className="cardFilm__content">
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

              <Rate allowHalf count={10} defaultValue={5} className="cardFilm__stars" />
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
