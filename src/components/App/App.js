import { Component } from 'react';
import { Layout, Alert } from 'antd';
import { Offline } from 'react-detect-offline';

import { GenreProvider } from '../GenreContext';
import FilmsService from '../../services/FilmsService';
import Header from '../Header/Header';
import CardsList from '../CardsList';
import './App.css';

const GUEST_SESSION = '4a6e36f0fcfd0bcfe4f4d3a7a2fb5ac4';

export default class App extends Component {
  state = {
    pageNumber: 1,
    totalResults: 0,
    searchQuery: 'the way',
    genres: null,
    activeTab: 'search',
    isError: false,
    guestSessionId: null,
  };

  filmsService = new FilmsService();

  componentDidMount() {
    this.setGenres();
    this.setState({ guestSessionId: GUEST_SESSION });
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

  changeGuestSessionId = (id) => this.changeInState('guestSessionId', id);

  render() {
    const { pageNumber, totalResults, searchQuery, genres, activeTab, isError, guestSessionId } = this.state;

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
            <button
              type="button"
              onClick={() => {
                this.filmsService.createGuestSession().then((body) => {
                  this.changeGuestSessionId(body.guest_session_id);
                });
              }}
            >
              Создать новую сессию
            </button>
            <span> Сессия сейчас: {guestSessionId}</span>
          </div>
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
              description="Problems with your internet connection."
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
            />
          </GenreProvider>
          {/* <Pagination
            className="pagination"
            current={pageNumber}
            onChange={(num) => this.changePagination(num)}
            total={Math.min(totalResults, 100 * 20)}
            pageSize={20}
            hideOnSinglePage
            showQuickJumper={false}
          /> */}
        </div>
      </Layout>
    );
  }
}
