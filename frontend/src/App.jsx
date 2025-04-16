import { useState } from 'react'
import './App.css'
import SourceSelection from './components/SourceSelection'
import ClickHouseConnection from './components/ClickHouseConnection'
import FlatFileUpload from './components/FlatFileUpload'
import TableSelection from './components/TableSelection'
import ColumnSelection from './components/ColumnSelection'
import FlatFileConfig from './components/FlatFileConfig'
import TableCreation from './components/TableCreation'
import JoinConfiguration from './components/JoinConfiguration'
import IngestionProgress from './components/IngestionProgress'
import IngestionResults from './components/IngestionResults'
import DataPreview from './components/DataPreview'

function App() {
  // Source selection state
  const [source, setSource] = useState('');
  const [target, setTarget] = useState('');

  // Connection state
  const [isConnected, setIsConnected] = useState(false);
  const [connectionConfig, setConnectionConfig] = useState({
    host: '....',
    port: '8443',
    protocol: 'https',
    database: 'default',
    username: 'default',
    password: '....',
    jwt: ''
  });

  // File state
  const [fileConfig, setFileConfig] = useState({
    filePath: '',
    delimiter: ','
  });

  // Table and column selection state
  const [tables, setTables] = useState([]);
  const [selectedTables, setSelectedTables] = useState([]);
  const [columns, setColumns] = useState([]);
  const [selectedColumns, setSelectedColumns] = useState([]);
  const [joinConditions, setJoinConditions] = useState(['']);

  // Table creation state (for flat file to ClickHouse)
  const [newTableName, setNewTableName] = useState('');
  const [createTable, setCreateTable] = useState(true);

  // Ingestion state
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStatus, setProcessingStatus] = useState('');
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);

  // Preview state
  const [previewData, setPreviewData] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  // Error state
  const [error, setError] = useState('');

  // Reset function for changing source
  const resetState = () => {
    setIsConnected(false);
    setTables([]);
    setSelectedTables([]);
    setColumns([]);
    setSelectedColumns([]);
    setJoinConditions(['']);
    setNewTableName('');
    setCreateTable(true);
    setIsProcessing(false);
    setProcessingStatus('');
    setProgress(0);
    setResults(null);
    setPreviewData(null);
    setShowPreview(false);
    setError('');
  };

  // Handle source change
  const handleSourceChange = (newSource) => {
    resetState();
    setSource(newSource);
    
    // Set default target based on source
    if (newSource === 'clickhouse') {
      setTarget('flatfile');
    } else if (newSource === 'flatfile') {
      setTarget('clickhouse');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <h1 className="text-3xl font-bold mb-6 text-center">
      Software Engineer Intern Assignment Zeotap
      </h1>

      {/* Error message display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 mb-4 rounded">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Source Selection */}
      <div className="bg-white shadow-md rounded-lg p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Select Data Source</h2>
        <SourceSelection 
          source={source} 
          onSourceChange={handleSourceChange} 
        />
      </div>

      {/* Source Configuration */}
      {source === 'clickhouse' && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">ClickHouse Connection</h2>
          <ClickHouseConnection 
            connectionConfig={connectionConfig}
            setConnectionConfig={setConnectionConfig}
            isConnected={isConnected}
            setIsConnected={setIsConnected}
            setError={setError}
            setTables={setTables}
          />
        </div>
      )}

      {source === 'flatfile' && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Flat File Upload</h2>
          <FlatFileUpload 
            setFileConfig={setFileConfig}
            setIsConnected={setIsConnected}
            setError={setError}
          />
          <FlatFileConfig
            fileConfig={fileConfig}
            setFileConfig={setFileConfig}
          />
        </div>
      )}

      {/* Table Selection (for ClickHouse source) */}
      {source === 'clickhouse' && isConnected && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Tables</h2>
          <TableSelection 
            tables={tables}
            selectedTables={selectedTables}
            setSelectedTables={setSelectedTables}
            setError={setError}
            connectionConfig={connectionConfig}
            setColumns={setColumns}
          />

          {/* Join Configuration (for multiple tables) */}
          {selectedTables.length > 1 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-2">Configure Joins</h3>
              <JoinConfiguration 
                selectedTables={selectedTables}
                joinConditions={joinConditions}
                setJoinConditions={setJoinConditions}
              />
            </div>
          )}
        </div>
      )}

      {/* Column Selection */}
      {((source === 'clickhouse' && selectedTables.length > 0) || 
         (source === 'flatfile' && isConnected)) && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Select Columns</h2>
          <ColumnSelection 
            columns={columns}
            selectedColumns={selectedColumns}
            setSelectedColumns={setSelectedColumns}
            source={source}
            fileConfig={fileConfig}
            connectionConfig={connectionConfig}
            selectedTables={selectedTables}
            setColumns={setColumns}
            setError={setError}
          />
        </div>
      )}

      {/* Table Creation (for flat file to ClickHouse) */}
      {source === 'flatfile' && target === 'clickhouse' && selectedColumns.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">ClickHouse Table Configuration</h2>
          <TableCreation 
            connectionConfig={connectionConfig}
            setConnectionConfig={setConnectionConfig}
            isConnected={isConnected}
            setIsConnected={setIsConnected}
            newTableName={newTableName}
            setNewTableName={setNewTableName}
            createTable={createTable}
            setCreateTable={setCreateTable}
            setError={setError}
          />
        </div>
      )}

      {/* Preview and Ingestion Controls */}
      {selectedColumns.length > 0 && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 focus:outline-none"
              onClick={() => setShowPreview(true)}
              disabled={isProcessing}
            >
              Preview Data
            </button>
            
            <button
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 focus:outline-none"
              onClick={() => setIsProcessing(true)}
              disabled={isProcessing}
            >
              Start Ingestion
            </button>
          </div>
        </div>
      )}

      {/* Data Preview Modal */}
      {showPreview && (
        <DataPreview 
          source={source}
          fileConfig={fileConfig}
          connectionConfig={connectionConfig}
          selectedTables={selectedTables}
          selectedColumns={selectedColumns}
          joinConditions={joinConditions}
          previewData={previewData}
          setPreviewData={setPreviewData}
          setShowPreview={setShowPreview}
          setError={setError}
        />
      )}

      {/* Ingestion Progress */}
      {isProcessing && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Ingestion Progress</h2>
          <IngestionProgress 
            source={source}
            target={target}
            fileConfig={fileConfig}
            connectionConfig={connectionConfig}
            selectedTables={selectedTables}
            selectedColumns={selectedColumns}
            joinConditions={joinConditions}
            newTableName={newTableName}
            createTable={createTable}
            progress={progress}
            setProgress={setProgress}
            processingStatus={processingStatus}
            setProcessingStatus={setProcessingStatus}
            setResults={setResults}
            setIsProcessing={setIsProcessing}
            setError={setError}
          />
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Ingestion Results</h2>
          <IngestionResults results={results} />
        </div>
      )}
    </div>
  )
}

export default App
