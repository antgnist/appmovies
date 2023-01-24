import { Tabs, Input } from 'antd';
import './Header.css';

function Header({ searchQuery, changeSearchQuery, activeTab, changeActiveTab }) {
  const inputHandler = (value) => {
    changeSearchQuery(value);
  };

  return (
    <header className="header">
      <Tabs
        activeKey={activeTab}
        defaultActiveKey="search"
        centered
        onChange={(activeKey) => {
          changeActiveTab(activeKey);
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
            children: 'Content of Tab Pane rated',
          },
        ]}
      />
    </header>
  );
}

export default Header;
