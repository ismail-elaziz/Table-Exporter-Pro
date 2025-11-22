import React, { useState } from 'react';
import './TableExporter.css';

interface TableCell {
  text: string;
  bold?: boolean;
  fontSize?: number;
  backgroundColor?: string;
}

interface TableRow {
  cells: TableCell[];
}

const TableExporter: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [documentUrl, setDocumentUrl] = useState('');

  // Sample table data with formatting
  const tableData: TableRow[] = [
    {
      cells: [
        { text: 'Product', bold: true, fontSize: 14, backgroundColor: '#4285f4' },
        { text: 'Price', bold: true, fontSize: 14, backgroundColor: '#4285f4' },
        { text: 'Quantity', bold: true, fontSize: 14, backgroundColor: '#4285f4' },
        { text: 'Total', bold: true, fontSize: 14, backgroundColor: '#4285f4' },
      ],
    },
    {
      cells: [
        { text: 'Laptop', fontSize: 12 },
        { text: '$999.99', fontSize: 12 },
        { text: '2', fontSize: 12 },
        { text: '$1,999.98', fontSize: 12, bold: true },
      ],
    },
    {
      cells: [
        { text: 'Mouse', fontSize: 12 },
        { text: '$29.99', fontSize: 12 },
        { text: '5', fontSize: 12 },
        { text: '$149.95', fontSize: 12, bold: true },
      ],
    },
    {
      cells: [
        { text: 'Keyboard', fontSize: 12 },
        { text: '$79.99', fontSize: 12 },
        { text: '3', fontSize: 12 },
        { text: '$239.97', fontSize: 12, bold: true },
      ],
    },
    {
      cells: [
        { text: 'Monitor', fontSize: 12 },
        { text: '$299.99', fontSize: 12 },
        { text: '1', fontSize: 12 },
        { text: '$299.99', fontSize: 12, bold: true },
      ],
    },
    {
      cells: [
        { text: 'Grand Total', bold: true, fontSize: 13, backgroundColor: '#fbbc04' },
        { text: '', backgroundColor: '#fbbc04' },
        { text: '11', bold: true, fontSize: 13, backgroundColor: '#fbbc04' },
        { text: '$2,689.89', bold: true, fontSize: 13, backgroundColor: '#fbbc04' },
      ],
    },
  ];

  const handleExport = async () => {
    setLoading(true);
    setMessage('');
    setDocumentUrl('');

    try {
      const response = await fetch('http://localhost:3001/api/export-to-docs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ rows: tableData }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage('Document created successfully!');
        setDocumentUrl(data.documentUrl);
      } else {
        setMessage(`Error: ${data.error || 'Failed to create document'}`);
      }
    } catch (error) {
      setMessage(`Error: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  const getCellStyle = (cell: TableCell): React.CSSProperties => {
    return {
      fontWeight: cell.bold ? 'bold' : 'normal',
      fontSize: cell.fontSize ? `${cell.fontSize}px` : '12px',
      backgroundColor: cell.backgroundColor || 'white',
      color: cell.backgroundColor === '#4285f4' || cell.backgroundColor === '#fbbc04' 
        ? 'white' 
        : 'black',
    };
  };

  return (
    <div className="table-exporter">
      <div className="table-container">
        <table className="data-table">
          <tbody>
            {tableData.map((row, rowIndex) => (
              <tr key={rowIndex}>
                {row.cells.map((cell, cellIndex) => (
                  <td key={cellIndex} style={getCellStyle(cell)}>
                    {cell.text}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="controls">
        <button
          onClick={handleExport}
          disabled={loading}
          className="export-button"
        >
          {loading ? 'Exporting...' : 'Export to Google Docs'}
        </button>

        {message && (
          <div className={`message ${documentUrl ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {documentUrl && (
          <a
            href={documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="document-link"
          >
            Open Document in Google Docs
          </a>
        )}
      </div>
    </div>
  );
};

export default TableExporter;
