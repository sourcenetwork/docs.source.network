import React, { useState, useEffect, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

/**
 * Real Dual DefraDB WASM Playground with Proper ACP.js Integration
 * 
 * This implementation properly uses @sourcenetwork/acp-js to instantiate
 * DefraDB WASM and calls window.defradb.open() to get the actual client.
 * 
 * Prerequisites:
 * 1. Install dependencies:
 *    npm install @sourcenetwork/acp-js @sourcenetwork/hublet
 * 
 * 2. Build defradb.wasm:
 *    GOOS=js GOARCH=wasm go build -tags=playground -o defradb.wasm ./cmd/defradb
 * 
 * 3. Copy to static/:
 *    cp defradb.wasm /path/to/docs/static/
 */

// Extend Window interface
declare global {
  interface Window {
    defradb?: {
      open(acpType?: string): Promise<any>;
    };
    defradbClient?: any;
    globalACPConfig?: {
      apiUrl: string;
      rpcUrl: string;
      grpcUrl: string;
      chainId: string;
      denom: string;
      useZeroFees: boolean;
    };
  }
}

interface DefraDBInstance {
  id: string;
  name: string;
  client: any;
  status: 'initializing' | 'ready' | 'error';
  logs: string[];
  namespace: string;
}

function RealDualDefraDBPlaygroundInner() {
  const [instance1, setInstance1] = useState<DefraDBInstance>({
    id: 'node1',
    name: 'Node 1 (Namespace: Node1)',
    client: null,
    status: 'initializing',
    logs: [],
    namespace: 'Node1'
  });

  const [instance2, setInstance2] = useState<DefraDBInstance>({
    id: 'node2',
    name: 'Node 2 (Namespace: Node2)',
    client: null,
    status: 'initializing',
    logs: [],
    namespace: 'Node2'
  });

  const [query1, setQuery1] = useState(`query {
  User {
    _docID
    name
    age
  }
}`);

  const [query2, setQuery2] = useState(`query {
  User {
    _docID
    name
    age
  }
}`);

  const [result1, setResult1] = useState('');
  const [result2, setResult2] = useState('');
  const [globalError, setGlobalError] = useState<string | null>(null);

  const initializationStarted = useRef(false);

  // Add log entry with timestamp
  const addLog = (instanceId: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    const formattedLog = `[${timestamp}] ${message}`;

    if (instanceId === 'node1') {
      setInstance1(prev => ({
        ...prev,
        logs: [...prev.logs, formattedLog]
      }));
    } else {
      setInstance2(prev => ({
        ...prev,
        logs: [...prev.logs, formattedLog]
      }));
    }
  };

  // Create a namespaced wrapper around the DefraDB client
  const createNamespacedClient = (namespace: string, dbClient: any) => {
    return {
      execRequest: async (query: string, variables?: any, context?: any) => {
        // Prefix collection names in queries with namespace
        const namespacedQuery = query.replace(/\b(User|create_User)\b/g, `${namespace}_$1`);
        return await dbClient.execRequest(namespacedQuery, variables || {}, context || {});
      },
      addSchema: async (schema: string) => {
        // Prefix type names with namespace
        const namespacedSchema = schema.replace(/type\s+(\w+)/g, `type ${namespace}_$1`);
        return await dbClient.addSchema(namespacedSchema);
      },
      getNodeIdentity: async () => {
        return await dbClient.getNodeIdentity();
      }
    };
  };

  // Initialize DefraDB WASM with ACP.js
  const initializeDefraDB = async () => {
    try {
      setGlobalError(null);

      addLog('node1', '=== Starting DefraDB WASM Initialization ===');
      addLog('node2', '=== Starting DefraDB WASM Initialization ===');

      // Set up global ACP config before loading
      addLog('node1', 'Setting up global ACP config...');
      addLog('node2', 'Setting up global ACP config...');
      
      window.globalACPConfig = {
        apiUrl: `${window.location.origin}/api`,
        rpcUrl: `${window.location.origin}/rpc`,
        grpcUrl: `${window.location.origin}/api`,
        chainId: 'sourcehub-dev',
        denom: 'uopen',
        useZeroFees: true,
      };

      addLog('node1', '✓ ACP config set');
      addLog('node2', '✓ ACP config set');

      // Dynamically import ACP.js
      addLog('node1', 'Loading @sourcenetwork/acp-js...');
      addLog('node2', 'Loading @sourcenetwork/acp-js...');

      const { instantiate } = await import('@sourcenetwork/acp-js');
      
      addLog('node1', '✓ ACP.js module loaded');
      addLog('node2', '✓ ACP.js module loaded');

      // Instantiate DefraDB WASM
      addLog('node1', 'Calling instantiate("/defradb.wasm")...');
      addLog('node2', 'Calling instantiate("/defradb.wasm")...');

      await instantiate('/defradb.wasm');
      
      addLog('node1', '✓ WASM instantiated');
      addLog('node2', '✓ WASM instantiated');

      // Wait for window.defradb to be available
      addLog('node1', 'Waiting for window.defradb...');
      addLog('node2', 'Waiting for window.defradb...');
      
      let attempts = 0;
      const maxAttempts = 100;
      
      while (!window.defradb && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.defradb) {
        throw new Error(`window.defradb not available after ${attempts} attempts (${attempts/10} seconds)`);
      }

      addLog('node1', `✓ Found window.defradb after ${attempts} attempts`);
      addLog('node2', `✓ Found window.defradb after ${attempts} attempts`);

      // CRITICAL: Call window.defradb.open() to get the actual client
      addLog('node1', 'Calling window.defradb.open() to get client...');
      addLog('node2', 'Calling window.defradb.open() to get client...');

      const dbClient = await window.defradb.open();
      
      if (!dbClient) {
        throw new Error('window.defradb.open() returned null or undefined');
      }

      // Store the client globally for reference
      window.defradbClient = dbClient;

      addLog('node1', '✓ DefraDB client opened successfully');
      addLog('node2', '✓ DefraDB client opened successfully');

      // Log available methods
      const clientMethods = Object.keys(dbClient).filter(k => typeof dbClient[k] === 'function');
      addLog('node1', `Available methods: ${clientMethods.join(', ')}`);
      addLog('node2', `Available methods: ${clientMethods.join(', ')}`);

      // Verify required methods exist
      if (typeof dbClient.execRequest !== 'function') {
        throw new Error(`Client missing execRequest method. Available: ${clientMethods.join(', ')}`);
      }
      if (typeof dbClient.addSchema !== 'function') {
        throw new Error(`Client missing addSchema method. Available: ${clientMethods.join(', ')}`);
      }

      addLog('node1', '✓ Verified client has required methods');
      addLog('node2', '✓ Verified client has required methods');

      // Create namespaced clients
      addLog('node1', 'Creating namespaced client (Node1_*)...');
      addLog('node2', 'Creating namespaced client (Node2_*)...');
      
      const client1 = createNamespacedClient('Node1', dbClient);
      const client2 = createNamespacedClient('Node2', dbClient);

      setInstance1(prev => ({
        ...prev,
        client: client1,
        status: 'ready'
      }));
      addLog('node1', '✓✓✓ Node 1 is READY ✓✓✓');

      setInstance2(prev => ({
        ...prev,
        client: client2,
        status: 'ready'
      }));
      addLog('node2', '✓✓✓ Node 2 is READY ✓✓✓');

    } catch (error) {
      const errorMsg = `Failed to initialize: ${error.message}`;
      setGlobalError(errorMsg);
      addLog('node1', `✗✗✗ ${errorMsg} ✗✗✗`);
      addLog('node2', `✗✗✗ ${errorMsg} ✗✗✗`);
      setInstance1(prev => ({ ...prev, status: 'error' }));
      setInstance2(prev => ({ ...prev, status: 'error' }));
      
      console.error('Initialization error:', error);
      console.error('Stack:', error.stack);
    }
  };

  // Execute query on specific instance
  const executeQuery = async (instanceId: string) => {
    const instance = instanceId === 'node1' ? instance1 : instance2;
    const query = instanceId === 'node1' ? query1 : query2;
    const setResult = instanceId === 'node1' ? setResult1 : setResult2;

    if (!instance.client) {
      addLog(instanceId, '✗ Client not ready');
      return;
    }

    if (!query.trim()) {
      addLog(instanceId, '✗ Query is empty');
      return;
    }

    try {
      addLog(instanceId, 'Executing query...');
      addLog(instanceId, `Query: ${query.substring(0, 100)}...`);
      
      const result = await instance.client.execRequest(query);
      
      const resultStr = JSON.stringify(result, null, 2);
      setResult(resultStr);
      addLog(instanceId, `✓ Query executed successfully (${resultStr.length} chars)`);
    } catch (error) {
      const errorMsg = error.message || String(error);
      addLog(instanceId, `✗ Query error: ${errorMsg}`);
      setResult(`Error: ${errorMsg}`);
      console.error('Query execution error:', error);
    }
  };

  // Add sample schema to specific instance
  const addSampleSchema = async (instanceId: string) => {
    const instance = instanceId === 'node1' ? instance1 : instance2;

    if (!instance.client) {
      addLog(instanceId, '✗ Client not ready');
      return;
    }

    const schema = `
type User {
  name: String
  age: Int
  email: String
}`;

    try {
      addLog(instanceId, `Adding User schema (will be ${instance.namespace}_User)...`);
      const result = await instance.client.addSchema(schema);
      addLog(instanceId, `✓ Schema added successfully`);
      
      if (result) {
        const resultStr = JSON.stringify(result, null, 2);
        addLog(instanceId, `Response: ${resultStr}`);
      }
    } catch (error) {
      const errorMsg = error.message || String(error);
      addLog(instanceId, `✗ Schema error: ${errorMsg}`);
      console.error('Schema error:', error);
    }
  };

  // Add sample document to specific instance
  const addSampleDocument = async (instanceId: string) => {
    const instance = instanceId === 'node1' ? instance1 : instance2;
    const setResult = instanceId === 'node1' ? setResult1 : setResult2;

    if (!instance.client) {
      addLog(instanceId, '✗ Client not ready');
      return;
    }

    const mutation = `
mutation {
  create_User(input: {
    name: "Alice Johnson"
    age: 28
    email: "alice@example.com"
  }) {
    _docID
    name
    age
    email
  }
}`;

    try {
      addLog(instanceId, `Creating sample document in ${instance.namespace}_User...`);
      const result = await instance.client.execRequest(mutation);
      const resultStr = JSON.stringify(result, null, 2);
      setResult(resultStr);
      addLog(instanceId, '✓ Document created successfully');
    } catch (error) {
      const errorMsg = error.message || String(error);
      addLog(instanceId, `✗ Document creation error: ${errorMsg}`);
      setResult(`Error: ${errorMsg}`);
      console.error('Document creation error:', error);
    }
  };

  // Clear logs for an instance
  const clearLogs = (instanceId: string) => {
    if (instanceId === 'node1') {
      setInstance1(prev => ({ ...prev, logs: [] }));
    } else {
      setInstance2(prev => ({ ...prev, logs: [] }));
    }
  };

  // Initialize on mount
  useEffect(() => {
    if (initializationStarted.current) return;
    initializationStarted.current = true;

    initializeDefraDB();
  }, []);

  // Render a single instance panel
  const renderInstance = (
    instance: DefraDBInstance,
    query: string,
    setQuery: (q: string) => void,
    result: string,
    onExecuteQuery: () => void,
    onAddSchema: () => void,
    onAddDocument: () => void,
    onClearLogs: () => void
  ) => {
    const isNode1 = instance.id === 'node1';
    const emoji = isNode1 ? '🟦' : '🟩';
    const color = isNode1 ? '#3b82f6' : '#22c55e';

    return (
      <div style={{
        border: `2px solid ${color}`,
        borderRadius: '8px',
        padding: '20px',
        backgroundColor: 'var(--ifm-background-surface-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color }}>
            {emoji} {instance.name}
          </h3>
          <span style={{
            padding: '4px 12px',
            borderRadius: '12px',
            fontSize: '12px',
            fontWeight: 'bold',
            backgroundColor: 
              instance.status === 'ready' ? '#22c55e' :
              instance.status === 'error' ? '#ef4444' : '#f59e0b',
            color: 'white'
          }}>
            {instance.status.toUpperCase()}
          </span>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={onAddSchema}
            disabled={instance.status !== 'ready'}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: instance.status === 'ready' ? color : '#9ca3af',
              color: 'white',
              cursor: instance.status === 'ready' ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            📋 Add Schema
          </button>
          <button
            onClick={onAddDocument}
            disabled={instance.status !== 'ready'}
            style={{
              padding: '8px 16px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: instance.status === 'ready' ? color : '#9ca3af',
              color: 'white',
              cursor: instance.status === 'ready' ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '500'
            }}
          >
            ➕ Add Sample Doc
          </button>
        </div>

        {/* Query Editor */}
        <div>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
            GraphQL Query:
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter your GraphQL query or mutation..."
            style={{
              width: '100%',
              minHeight: '120px',
              padding: '12px',
              borderRadius: '6px',
              border: '1px solid var(--ifm-color-emphasis-300)',
              backgroundColor: 'var(--ifm-background-color)',
              color: 'var(--ifm-font-color-base)',
              fontFamily: 'monospace',
              fontSize: '13px',
              resize: 'vertical'
            }}
          />
          <button
            onClick={onExecuteQuery}
            disabled={instance.status !== 'ready' || !query.trim()}
            style={{
              marginTop: '8px',
              padding: '10px 20px',
              borderRadius: '6px',
              border: 'none',
              backgroundColor: instance.status === 'ready' && query.trim() ? color : '#9ca3af',
              color: 'white',
              cursor: instance.status === 'ready' && query.trim() ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '600',
              width: '100%'
            }}
          >
            ▶️ Execute Query
          </button>
        </div>

        {/* Results */}
        {result && (
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600' }}>
              Result:
            </label>
            <pre style={{
              padding: '12px',
              borderRadius: '6px',
              backgroundColor: 'var(--ifm-code-background)',
              overflow: 'auto',
              maxHeight: '200px',
              fontSize: '12px',
              margin: 0
            }}>
              {result}
            </pre>
          </div>
        )}

        {/* Logs */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <label style={{ fontWeight: '600' }}>Logs:</label>
            <button
              onClick={onClearLogs}
              style={{
                padding: '4px 8px',
                borderRadius: '4px',
                border: '1px solid var(--ifm-color-emphasis-300)',
                backgroundColor: 'transparent',
                color: 'var(--ifm-font-color-base)',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              Clear
            </button>
          </div>
          <div style={{
            maxHeight: '200px',
            overflowY: 'auto',
            padding: '12px',
            borderRadius: '6px',
            backgroundColor: '#1e1e1e',
            color: '#d4d4d4',
            fontFamily: 'monospace',
            fontSize: '12px',
            lineHeight: '1.5'
          }}>
            {instance.logs.length === 0 ? (
              <div style={{ color: '#888' }}>No logs yet...</div>
            ) : (
              instance.logs.map((log, idx) => (
                <div key={idx} style={{ 
                  marginBottom: '4px',
                  color: log.includes('✓') ? '#22c55e' : log.includes('✗') ? '#ef4444' : '#d4d4d4'
                }}>
                  {log}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* Title and Introduction */}
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '28px', marginBottom: '12px' }}>
          🚀 Dual DefraDB WASM Playground
        </h2>
        <p style={{ color: 'var(--ifm-color-emphasis-700)', maxWidth: '800px', margin: '0 auto' }}>
          This demonstrates two simulated DefraDB nodes using <strong>namespace prefixes</strong> to achieve data isolation. 
          Each "node" uses prefixed collection names (Node1_User, Node2_User) sharing the same WASM instance.
        </p>
      </div>

      {/* Implementation Note */}
      <div style={{
        marginBottom: '20px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#fff3cd',
        border: '1px solid #ffc107',
        fontSize: '14px'
      }}>
        <strong>ℹ️ Implementation Note:</strong> Uses @sourcenetwork/acp-js to properly instantiate DefraDB WASM with keyring support. 
        The client is obtained by calling <code>window.defradb.open()</code> after instantiation.
      </div>

      {/* Global Error Display */}
      {globalError && (
        <div style={{
          padding: '16px',
          marginBottom: '20px',
          borderRadius: '8px',
          backgroundColor: '#fee2e2',
          border: '2px solid #ef4444',
          color: '#991b1b'
        }}>
          <strong>⚠️ Error:</strong> {globalError}
        </div>
      )}

      {/* Instance Panels */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
        gap: '24px',
        marginBottom: '30px'
      }}>
        {renderInstance(
          instance1,
          query1,
          setQuery1,
          result1,
          () => executeQuery('node1'),
          () => addSampleSchema('node1'),
          () => addSampleDocument('node1'),
          () => clearLogs('node1')
        )}

        {renderInstance(
          instance2,
          query2,
          setQuery2,
          result2,
          () => executeQuery('node2'),
          () => addSampleSchema('node2'),
          () => addSampleDocument('node2'),
          () => clearLogs('node2')
        )}
      </div>

      {/* Instructions */}
      <div style={{
        padding: '20px',
        borderRadius: '8px',
        backgroundColor: 'var(--ifm-background-surface-color)',
        border: '1px solid var(--ifm-color-emphasis-300)'
      }}>
        <h4 style={{ marginTop: 0 }}>📝 How to Use:</h4>
        <ol style={{ marginBottom: 0, lineHeight: '1.8' }}>
          <li>Wait for both nodes to initialize (status shows "READY")</li>
          <li>Click <strong>"Add Schema"</strong> on each node - creates Node1_User and Node2_User types</li>
          <li>Click <strong>"Add Sample Doc"</strong> to create documents in each namespace</li>
          <li>Execute queries - they'll automatically target the correct namespace</li>
          <li>Notice that data created in Node1 doesn't appear in Node2 queries</li>
        </ol>
      </div>

      {/* Setup Instructions */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#dbeafe',
        border: '1px solid #3b82f6',
        fontSize: '14px'
      }}>
        <strong>🔧 Setup Required:</strong>
        <ol style={{ marginBottom: 0, marginTop: '8px' }}>
          <li>Install: <code>npm install @sourcenetwork/acp-js @sourcenetwork/hublet</code></li>
          <li>Build WASM: <code>GOOS=js GOARCH=wasm go build -tags=playground -o defradb.wasm ./cmd/defradb</code></li>
          <li>Copy to static: <code>cp defradb.wasm ./static/</code></li>
        </ol>
      </div>

      {/* Architecture Note */}
      <div style={{
        marginTop: '20px',
        padding: '16px',
        borderRadius: '8px',
        backgroundColor: '#f3e8ff',
        border: '1px solid #9333ea',
        fontSize: '14px'
      }}>
        <strong>🏗️ Key Fix:</strong> The critical step is calling <code>await window.defradb.open()</code> after 
        instantiation. This returns the actual DefraDB client with methods like <code>execRequest</code> and <code>addSchema</code>. 
        The previous version was trying to use <code>window.defradb</code> directly without opening the client first.
      </div>
    </div>
  );
}

// Export with BrowserOnly wrapper to ensure client-side rendering
export default function RealDualDefraDBPlayground() {
  return (
    <BrowserOnly fallback={<div>Loading DefraDB Playground...</div>}>
      {() => <RealDualDefraDBPlaygroundInner />}
    </BrowserOnly>
  );
}