import { Component } from 'react';
import { Layout, Alert } from 'antd';
import { Offline } from 'react-detect-offline';
import _ from 'lodash';

import { GenreProvider } from '../GenreContext';
import FilmsService from '../../services/FilmsService';
import Header from '../Header/Header';
import CardsList from '../CardsList';

import './App.css';

export default class App extends Component {
  state = {
    pageNumber: { page: 1 },
    totalResults: 0,
    searchQuery: '',
    genres: null,
    activeTab: 'search',
    isError: false,
    guestSessionId: null,
    resizeWidth: null,
  };

  filmsService = new FilmsService();

  debounceResize = _.debounce((e) => {
    const { resizeWidth } = this.state;
    if (e.target.innerWidth < 1010 || resizeWidth < 1010) {
      this.changeResizeWidth(e.target.innerWidth);
    }
  }, 400);

  componentDidMount() {
    this.setGenres();
    this.filmsService.setGuestSession().then((id) => this.changeGuestSessionId(id));
    window.addEventListener('resize', this.resizeHandler);
  }

  componentDidCatch() {
    this.setState({ isError: true });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeHandler);
  }

  setGenres = () => {
    this.filmsService.getGenres().then((genres) => {
      this.setState({ genres });
    });
  };

  changeInState = (entery, value) => {
    this.setState({
      [entery]: value,
    });
  };

  resizeHandler = (e) => {
    this.debounceResize(e);
  };

  changePagination = (num) => this.changeInState('pageNumber', { page: num });

  changeTotalResults = (num) => this.changeInState('totalResults', num);

  changeSearchQuery = (value) => this.changeInState('searchQuery', value);

  changeActiveTab = (tab) => this.changeInState('activeTab', tab);

  changeGuestSessionId = (id) => this.changeInState('guestSessionId', id);

  changeResizeWidth = (num) => {
    this.changeInState('resizeWidth', num);
  };

  render() {
    const { pageNumber, totalResults, searchQuery, genres, activeTab, isError, guestSessionId, resizeWidth } =
      this.state;

    if (isError) {
      return (
        <Alert
          message="Error... something went wrong"
          description="Fatal Error, try again later"
          type="error"
          showIcon
        />
      );
    }
    return (
      <Layout className="" style={{ minHeight: '100vh' }}>
        <div className="app">
          <Header
            searchQuery={searchQuery}
            changeSearchQuery={this.changeSearchQuery}
            activeTab={activeTab}
            changeActiveTab={this.changeActiveTab}
            pageNumber={pageNumber}
            changePagination={this.changePagination}
          />
          <Offline>
            <Alert
              type="warning"
              message="Uh.. "
              description="Problems with your internet connection!"
              showIcon
              className="warning"
            />
          </Offline>
          <GenreProvider value={genres}>
            <CardsList
              pageNumber={pageNumber}
              totalResults={totalResults}
              changeTotalResults={this.changeTotalResults}
              changePagination={this.changePagination}
              searchQuery={searchQuery}
              activeTab={activeTab}
              guestSessionId={guestSessionId}
              resizeWidth={resizeWidth}
            />
          </GenreProvider>
        </div>
      </Layout>
    );
  }
}
