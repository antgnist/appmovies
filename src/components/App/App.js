import { Layout, Alert } from 'antd';
import { Offline } from 'react-detect-offline';

import CardsList from '../CardsList';
import './App.css';

function App() {
  return (
    <Layout className="">
      <Offline>
        <Alert
          type="warning"
          message="Uh.. "
          description="Problems with your internet connection."
          showIcon
          className="warning"
        />
      </Offline>
      <div style={{ background: '#ffff', width: '1010px', padding: '50px 32px', margin: '0 auto' }}>
        <CardsList />
      </div>
    </Layout>
  );
}

export default App;
