import React from 'react';
import { Button, Rate, Image } from 'antd';
import { format } from 'date-fns';

import noImage from './no-image.webp';
import './CardFilm.css';

const rankColor = (rank) => {
  let color = '#2BE900';
  if (rank > 5.5 && rank < 7) color = '#E9D100';
  else if (rank > 3 && rank <= 5.5) color = '#E98C00';
  else if (rank <= 3) color = '#FF2400';
  return {
    borderColor: color,
  };
};

const reductionText = (text) => `${text.split(' ').slice(0, 15).join(' ')} ...`;

// function trimDescription(overview, cardRef, headerRef, overviewRef) {
//   const cardHeight = cardRef.current.offsetHeight;
//   const headerHeight = headerRef.current.offsetHeight;
//   const descriptionWidth = overviewRef.current.offsetWidth;

//   const maxHeight = cardHeight - (headerHeight + 90);

//   const k = descriptionWidth > 300 ? 4 : 5.5;

//   const letersPerLine = Math.floor(descriptionWidth / k);

//   const trimLength = Math.floor(letersPerLine * (maxHeight / 22));

//   if (trimLength < 0) return null;
//   if (overview.length < trimLength) return overview;
//   const trimed = overview.slice(0, trimLength).split(' ');
//   trimed.pop();
//   return [...trimed, '...'].join(' ');
// }

function CardFilm({ img, title, rank, date, overview }) {
  const cardRef = React.createRef();
  const headerRef = React.createRef();
  const overviewRef = React.createRef();

  const imgBase = 'https://image.tmdb.org/t/p/original';
  const formatedDate = date ? <div className="cardFilm__date">{format(new Date(date), 'MMMM d, yyyy')}</div> : null;

  return (
    <div className="cardFilm" ref={cardRef}>
      <div className="cardFilm__img">
        <Image src={img ? imgBase + img : noImage} alt={title} width="100%" preview={Boolean(img)} />
      </div>
      <div className="cardFilm__content">
        <header className="cardFilm__header" ref={headerRef}>
          <div className="cardFilm__headerWrapper">
            <h5 className="cardFilm__title">{title}</h5>
            <div className="cardFilm__rank" style={rankColor(rank)}>
              {rank}
            </div>
          </div>

          {formatedDate}
          <div className="cardFilm__buttons">
            <Button
              size="small"
              className="cardFilm__button"
              style={{ padding: '0 4px', borderRadius: '2px', fontSize: '12px', height: '20px' }}
            >
              Action
            </Button>
            <Button
              size="small"
              className="cardFilm__button"
              style={{ padding: '0 4px', borderRadius: '2px', fontSize: '12px', height: '20px' }}
            >
              Drama
            </Button>
          </div>
        </header>

        <p className="cardFilm__overview" ref={overviewRef}>
          {reductionText(overview)}
          {/* {trimDescription(overview)} */}
        </p>

        <Rate allowHalf count={10} defaultValue={5} className="cardFilm__stars" />
      </div>
    </div>
  );
}

CardFilm.propTypes = {};
CardFilm.defaultProps = {
  title: 'Tittle not found',
  rank: 0,
  date: 'Date not found',
  overview: 'Default Text',
};

export default CardFilm;
