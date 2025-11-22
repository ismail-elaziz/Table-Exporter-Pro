import React from 'react';
import TableExporter from './components/TableExporter';

const App: React.FC = () => {
  return (
    <div>
      <h1 style={{ marginBottom: '20px', color: '#333' }}>
        Export HTML Table to Google Docs
      </h1>
      <TableExporter />
    </div>
  );
};

export default App;
