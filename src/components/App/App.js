import { Component } from 'react';
import { Layout, Alert, Pagination } from 'antd';
import { Offline } from 'react-detect-offline';

import { GenreProvider } from '../GenreContext';
import FilmsService from '../../services/FilmsService';
import Header from '../Header/Header';
import CardsList from '../CardsList';
import './App.css';

export default class App extends Component {
  state = {
    pageNumber: 1,
    totalResults: 0,
    searchQuery: 'the way',
    genres: 777,
    activeTab: 'search',
    isError: false,
  };

  filmsService = new FilmsService();

  componentDidMount() {
    this.setGenres();
  }

  componentDidCatch() {
    this.setState({ isError: true });
  }

  setGenres = () => {
    this.filmsService.getGenres().then((genres) => {
      this.setState({ genres });
      console.log('в Арр setgenres: ', genres);
    });
  };

  changeInState = (entery, value) => {
    this.setState({
      [entery]: value,
    });
  };

  changePagination = (num) => this.changeInState('pageNumber', num);

  changeTotalResults = (num) => this.changeInState('totalResults', num);

  changeSearchQuery = (value) => this.changeInState('searchQuery', value);

  changeActiveTab = (tab) => this.changeInState('activeTab', tab);

  render() {
    const { pageNumber, totalResults, searchQuery, genres, activeTab, isError } = this.state;

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
      <Layout className="">
        <div className="app">
          <div style={{ display: 'flex' }}>
            <button type="button">Удалить текущую сессию</button>
            <span> Сессия сейчас</span>
          </div>
          <Header
            searchQuery={searchQuery}
            changeSearchQuery={this.changeSearchQuery}
            activeTab={activeTab}
            changeActiveTab={this.changeActiveTab}
          />
          <Offline>
            <Alert
              type="warning"
              message="Uh.. "
              description="Problems with your internet connection."
              showIcon
              className="warning"
            />
          </Offline>
          <GenreProvider value={genres}>
            <CardsList
              pageNumber={pageNumber}
              changeTotalResults={this.changeTotalResults}
              searchQuery={searchQuery}
              activeTab={activeTab}
            />
          </GenreProvider>
          <Pagination
            className="pagination"
            current={pageNumber}
            onChange={(num) => this.changePagination(num)}
            total={Math.min(totalResults, 100 * 20)}
            pageSize={20}
            hideOnSinglePage
            showQuickJumper={false}
          />
        </div>
      </Layout>
    );
  }
}
