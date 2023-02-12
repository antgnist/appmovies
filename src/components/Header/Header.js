import { Tabs, Input } from 'antd';
import { useState } from 'react';
import './Header.css';

function Header({ searchQuery, changeSearchQuery, activeTab, changeActiveTab, pageNumber, changePagination }) {
  const [prevPage, setPrevPage] = useState(1);

  const inputHandler = (value) => {
    changeSearchQuery(value);
  };

  const tabChange = (activeKey) => {
    changeActiveTab(activeKey);
    changePagination(prevPage);
    setPrevPage(pageNumber.page);
  };

  return (
    <header className="header">
      <Tabs
        activeKey={activeTab}
        defaultActiveKey="search"
        centered
        onChange={(activeKey) => {
          tabChange(activeKey);
        }}
        items={[
          {
            label: 'Search',
            key: 'search',
            children: (
              <Input
                className="header__search"
                value={searchQuery}
                placeholder="Type to search..."
                onChange={(e) => {
                  inputHandler(e.target.value);
                }}
              />
            ),
          },
          {
            label: 'Rated',
            key: 'rated',
          },
        ]}
      />
    </header>
  );
}

export default Header;
