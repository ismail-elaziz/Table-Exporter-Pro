# Export HTML Table to Google Docs

A full-stack TypeScript application that exports HTML tables to Google Docs with formatting (bold text, font size, and cell background colors).

## Project Structure

```

├── backend/               # Node.js + Express + TypeScript backend
│   ├── src/
│   │   └── server.ts     # Main server file with Google Docs API integration
│   ├── package.json
│   ├── tsconfig.json
│   └── .env.example
│
└── frontend/             # React + TypeScript + Vite frontend
    ├── src/
    │   ├── components/
    │   │   ├── TableExporter.tsx
    │   │   └── TableExporter.css
    │   ├── App.tsx
    │   ├── main.tsx
    │   └── index.css
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- A Google Cloud Platform account

## Setup Instructions

### 1. Set up Google Cloud Service Account

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the **Google Docs API**:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Docs API"
   - Click "Enable"
4. Create a Service Account:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "Service Account"
   - Fill in the details and click "Create"
   - Skip granting roles (click "Continue" and "Done")
5. Create and download the JSON key:
   - Click on the created service account
   - Go to the "Keys" tab
   - Click "Add Key" > "Create new key"
   - Select "JSON" format
   - Download the key file
6. Rename the downloaded file to `service-account-key.json` and place it in the `backend/` folder

### 2. Install Backend Dependencies

```bash
cd backend
npm install
```

### 3. Configure Backend Environment

Create a `.env` file in the `backend/` folder:

```bash
cp .env.example .env
```

Edit `.env` and verify the settings:

```env
PORT=3001
GOOGLE_SERVICE_ACCOUNT_KEY_PATH=./service-account-key.json
NODE_ENV=development
```

### 4. Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

## Running the Application

### Start the Backend Server

In the `backend/` folder:

```bash
npm run dev
```

The server will start on `http://localhost:3001`

### Start the Frontend Development Server

In the `frontend/` folder (in a new terminal):

```bash
npm run dev
```

The frontend will start on `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. You'll see a sample table with product data
3. Click the "Export to Google Docs" button
4. Wait for the export to complete
5. Click "Open Document in Google Docs" to view your document

The exported document will include:
- **Header row** with blue background and bold text
- **Data rows** with standard formatting
- **Footer row** with yellow background and bold text
- All text with appropriate font sizes

## Important Notes

### Service Account Permissions

The service account creates documents that are **only accessible to the service account itself** by default. To access the created documents:

**Option 1: Share the document (Recommended)**
- The backend returns the document URL
- Open the URL
- Google will show a permission error
- You can request access or have the document owner share it with you

**Option 2: Use Domain-Wide Delegation (for G Suite/Workspace)**
- Configure domain-wide delegation for the service account
- Set up appropriate scopes
- Documents will be created under a specific user

**Option 3: Modify the code to share the document**
Add this code in `backend/src/server.ts` after creating the document:

```typescript
// Add the Drive API client
const drive = google.drive({ version: 'v3', auth });

// Share with your email
await drive.permissions.create({
  fileId: documentId,
  requestBody: {
    type: 'user',
    role: 'writer',
    emailAddress: 'your-email@example.com',
  },
});
```

You'll also need to enable the Google Drive API in your Google Cloud project.

## Customization

### Modifying the Table Data

Edit `frontend/src/components/TableExporter.tsx` and update the `tableData` array:

```typescript
const tableData: TableRow[] = [
  {
    cells: [
      { text: 'Header 1', bold: true, fontSize: 14, backgroundColor: '#4285f4' },
      { text: 'Header 2', bold: true, fontSize: 14, backgroundColor: '#4285f4' },
    ],
  },
  {
    cells: [
      { text: 'Data 1', fontSize: 12 },
      { text: 'Data 2', fontSize: 12 },
    ],
  },
];
```

### Available Cell Properties

- `text`: string - Cell content
- `bold`: boolean - Bold text
- `fontSize`: number - Font size in points
- `backgroundColor`: string - Hex color code (e.g., '#4285f4')

## Building for Production

### Backend

```bash
cd backend
npm run build
npm start
```

### Frontend

```bash
cd frontend
npm run build
npm run preview
```

## Troubleshooting

### "Service account key file not found"
- Ensure `service-account-key.json` is in the `backend/` folder
- Check the path in your `.env` file

### "Cannot access the document"
- See the "Service Account Permissions" section above
- The service account needs to share documents or you need to configure permissions

### CORS errors
- Ensure the backend is running on port 3001
- Check that CORS is enabled in `backend/src/server.ts`

### Port already in use
- Change the port in `backend/.env` for the backend
- Change the port in `frontend/vite.config.ts` for the frontend

## Technologies Used

**Backend:**
- Node.js
- Express
- TypeScript
- Google APIs Node.js Client
- dotenv
- cors

**Frontend:**
- React 18
- TypeScript
- Vite
- CSS3

## License

MIT
