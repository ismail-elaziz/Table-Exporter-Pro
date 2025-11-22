import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { google } from 'googleapis';
import * as fs from 'fs';
import * as path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Interface for table data
interface TableCell {
  text: string;
  bold?: boolean;
  fontSize?: number;
  backgroundColor?: string;
}

interface TableRow {
  cells: TableCell[];
}

interface TableData {
  rows: TableRow[];
}

// Initialize Google Docs API
const getGoogleDocsClient = () => {
  const keyPath = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_PATH || './service-account-key.json';
  const keyFile = path.resolve(keyPath);

  if (!fs.existsSync(keyFile)) {
    throw new Error(`Service account key file not found at: ${keyFile}`);
  }

  const auth = new google.auth.GoogleAuth({
    keyFile: keyFile,
    scopes: ['https://www.googleapis.com/auth/documents'],
  });

  return google.docs({ version: 'v1', auth });
};

// Create a Google Doc with a table
const createDocWithTable = async (tableData: TableData) => {
  const docs = getGoogleDocsClient();

  // Create a new document
  const createResponse = await docs.documents.create({
    requestBody: {
      title: `Exported Table - ${new Date().toLocaleString()}`,
    },
  });

  const documentId = createResponse.data.documentId!;

  // Build table content
  const rows = tableData.rows.length;
  const cols = tableData.rows[0]?.cells.length || 0;

  // Create table insert request
  const requests: any[] = [
    {
      insertTable: {
        rows: rows,
        columns: cols,
        location: {
          index: 1,
        },
      },
    },
  ];

  // Add content and formatting to cells
  let currentIndex = 3; // Starting index after table insertion

  for (let rowIndex = 0; rowIndex < tableData.rows.length; rowIndex++) {
    const row = tableData.rows[rowIndex];
    
    for (let colIndex = 0; colIndex < row.cells.length; colIndex++) {
      const cell = row.cells[colIndex];
      
      // Insert text into cell
      requests.push({
        insertText: {
          location: {
            index: currentIndex,
          },
          text: cell.text,
        },
      });

      // Apply formatting
      const textLength = cell.text.length;
      
      if (cell.bold) {
        requests.push({
          updateTextStyle: {
            range: {
              startIndex: currentIndex,
              endIndex: currentIndex + textLength,
            },
            textStyle: {
              bold: true,
            },
            fields: 'bold',
          },
        });
      }

      if (cell.fontSize) {
        requests.push({
          updateTextStyle: {
            range: {
              startIndex: currentIndex,
              endIndex: currentIndex + textLength,
            },
            textStyle: {
              fontSize: {
                magnitude: cell.fontSize,
                unit: 'PT',
              },
            },
            fields: 'fontSize',
          },
        });
      }

      if (cell.backgroundColor) {
        // Find the table cell and apply background color
        const tableCellIndex = Math.floor(currentIndex / 2);
        requests.push({
          updateTableCellStyle: {
            tableCellLocation: {
              tableStartLocation: {
                index: 1,
              },
              rowIndex: rowIndex,
              columnIndex: colIndex,
            },
            tableCellStyle: {
              backgroundColor: {
                color: {
                  rgbColor: hexToRgb(cell.backgroundColor),
                },
              },
            },
            fields: 'backgroundColor',
          },
        });
      }

      // Move to next cell (account for text + cell ending)
      currentIndex += textLength + 2;
    }
  }

  // Execute all requests
  await docs.documents.batchUpdate({
    documentId: documentId,
    requestBody: {
      requests: requests,
    },
  });

  return {
    documentId,
    documentUrl: `https://docs.google.com/document/d/${documentId}/edit`,
  };
};

// Helper function to convert hex color to RGB
const hexToRgb = (hex: string) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        red: parseInt(result[1], 16) / 255,
        green: parseInt(result[2], 16) / 255,
        blue: parseInt(result[3], 16) / 255,
      }
    : { red: 1, green: 1, blue: 1 };
};

// API Routes
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.post('/api/export-to-docs', async (req: Request, res: Response) => {
  try {
    const tableData: TableData = req.body;

    if (!tableData || !tableData.rows || tableData.rows.length === 0) {
      return res.status(400).json({ error: 'Invalid table data' });
    }

    const result = await createDocWithTable(tableData);

    res.json({
      success: true,
      message: 'Document created successfully',
      documentId: result.documentId,
      documentUrl: result.documentUrl,
    });
  } catch (error: any) {
    console.error('Error creating document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create document',
      details: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
