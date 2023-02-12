import { Col, Spin, Alert, Pagination } from 'antd';

import CardFilm from '../CardFilm';

export default function CardListContent({
  status,
  listFilms,
  ratedFilms,
  pageNumber,
  resizeWidth,
  changePagination,
  totalResults,
  changeRate,
}) {
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
          <ShowFilms listFilms={listFilms} ratedFilms={ratedFilms} changeRate={changeRate} resizeWidth={resizeWidth} />
          <Pagination
            className="pagination"
            current={pageNumber.page}
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

  return content;
}

CardListContent.defaultProps = {};

CardListContent.propTypes = {};

function ShowFilms({ listFilms, ratedFilms, changeRate, resizeWidth }) {
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
      />
    </Col>
  ));
}
