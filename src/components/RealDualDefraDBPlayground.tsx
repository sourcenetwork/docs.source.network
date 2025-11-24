import React, { useState, useEffect, useRef } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

/**
 * Source Network Themed DefraDB WASM Playground
 * * visual-identity: Source Network (Black, Neon Green, Monospace, Grid)
 * * fix: Corrected regex logic for namespaced mutations (create_User -> create_Node1_User)
 */

// --- Theme Constants ---
const THEME = {
  bg: '#000000',
  surface: '#0A0A0A',
  surfaceHighlight: '#111111',
  border: '#333333',
  primary: '#00FF94', // The specific Source Network green
  primaryDim: 'rgba(0, 255, 148, 0.1)',
  text: '#FFFFFF',
  textDim: '#888888',
  error: '#FF3333',
  fontMono: '"Fira Code", "Courier New", monospace',
  fontSans: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
};

// --- Types ---
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

// --- Icons & Visual Elements ---
const DotGridBackground = () => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundImage: `radial-gradient(${THEME.border} 1px, transparent 1px)`,
    backgroundSize: '20px 20px',
    opacity: 0.3,
    pointerEvents: 'none',
    zIndex: 0
  }} />
);

const CubeIcon = ({ color }: { color: string }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
    <line x1="12" y1="22.08" x2="12" y2="12" />
  </svg>
);

const TerminalIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="4 17 10 11 4 5" />
    <line x1="12" y1="19" x2="20" y2="19" />
  </svg>
);

// --- Main Component ---
function RealDualDefraDBPlaygroundInner() {
  const [instance1, setInstance1] = useState<DefraDBInstance>({
    id: 'node1',
    name: 'EDGE_NODE_01',
    client: null,
    status: 'initializing',
    logs: [],
    namespace: 'Node1'
  });

  const [instance2, setInstance2] = useState<DefraDBInstance>({
    id: 'node2',
    name: 'EDGE_NODE_02',
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
    points
    verified
  }
}`);

  const [query2, setQuery2] = useState(`query {
  User {
    _docID
    name
    age
    points
    verified
  }
}`);

  const [result1, setResult1] = useState('');
  const [result2, setResult2] = useState('');
  const [globalError, setGlobalError] = useState<string | null>(null);
  const initializationStarted = useRef(false);

  // --- Logic ---
  const addLog = (instanceId: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    const formattedLog = `[${timestamp}] ${message}`;
    const setter = instanceId === 'node1' ? setInstance1 : setInstance2;
    setter(prev => ({ ...prev, logs: [...prev.logs, formattedLog] }));
  };

  /**
   * Creates a wrapper that automatically prefixes types and mutations
   * to simulate namespacing on a shared WASM client.
   */
  const createNamespacedClient = (namespace: string, dbClient: any) => {
    return {
      execRequest: async (query: string, variables?: any, context?: any) => {
        let namespacedQuery = query;

        // FIX: Handle standard CRUD operations specifically
        // create_User -> create_Node1_User
        // update_User -> update_Node1_User
        // delete_User -> delete_Node1_User
        namespacedQuery = namespacedQuery.replace(
          /\b(create|update|delete|get)_User\b/g, 
          `$1_${namespace}_User`
        );

        // FIX: Handle the Type name itself (for queries)
        // query { User { ... } } -> query { Node1_User { ... } }
        namespacedQuery = namespacedQuery.replace(
          /\bUser\b/g, 
          `${namespace}_User`
        );

        return await dbClient.execRequest(namespacedQuery, variables || {}, context || {});
      },
      addSchema: async (schema: string) => {
        // Prefix type definition: type User -> type Node1_User
        const namespacedSchema = schema.replace(/type\s+(\w+)/g, `type ${namespace}_$1`);
        return await dbClient.addSchema(namespacedSchema);
      },
      getNodeIdentity: async () => {
        return await dbClient.getNodeIdentity();
      }
    };
  };

  const initializeDefraDB = async () => {
    try {
      setGlobalError(null);
      addLog('node1', '>> INITIALIZING KERNEL...');
      addLog('node2', '>> INITIALIZING KERNEL...');
      
      window.globalACPConfig = {
        apiUrl: `${window.location.origin}/api`,
        rpcUrl: `${window.location.origin}/rpc`,
        grpcUrl: `${window.location.origin}/api`,
        chainId: 'sourcehub-dev',
        denom: 'uopen',
        useZeroFees: true,
      };

      const { instantiate } = await import('@sourcenetwork/acp-js');
      await instantiate('https://defradbwasm.source.network/defradb.wasm');
      
      let attempts = 0;
      while (!window.defradb && attempts < 100) {
        await new Promise(resolve => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.defradb) throw new Error(`Timeout waiting for window.defradb`);
      
      const dbClient = await window.defradb.open();
      if (!dbClient) throw new Error('Client open failed');
      window.defradbClient = dbClient;

      const client1 = createNamespacedClient('Node1', dbClient);
      const client2 = createNamespacedClient('Node2', dbClient);

      setInstance1(prev => ({ ...prev, client: client1, status: 'ready' }));
      addLog('node1', '>> SYSTEM ONLINE');

      setInstance2(prev => ({ ...prev, client: client2, status: 'ready' }));
      addLog('node2', '>> SYSTEM ONLINE');

    } catch (error) {
      const errorMsg = `CRITICAL FAILURE: ${error.message}`;
      setGlobalError(errorMsg);
      setInstance1(prev => ({ ...prev, status: 'error' }));
      setInstance2(prev => ({ ...prev, status: 'error' }));
    }
  };

  const executeQuery = async (instanceId: string) => {
    const instance = instanceId === 'node1' ? instance1 : instance2;
    const query = instanceId === 'node1' ? query1 : query2;
    const setResult = instanceId === 'node1' ? setResult1 : setResult2;

    if (!instance.client) return;

    try {
      addLog(instanceId, `> EXEC: ${query.replace(/\n/g, ' ').substring(0, 40)}...`);
      const result = await instance.client.execRequest(query);
      const resultStr = JSON.stringify(result, null, 2);
      setResult(resultStr);
      addLog(instanceId, `> SUCCESS (${resultStr.length} bytes)`);
    } catch (error) {
      const msg = error.message || String(error);
      addLog(instanceId, `> ERROR: ${msg}`);
      setResult(`Error: ${msg}`);
    }
  };

  const addSampleSchema = async (instanceId: string) => {
    const instance = instanceId === 'node1' ? instance1 : instance2;
    if (!instance.client) return;

    const schema = `type User { 
  name: String 
  age: Int 
  points: Int
  verified: Boolean
}`;
    try {
      addLog(instanceId, `> INJECTING SCHEMA...`);
      await instance.client.addSchema(schema);
      addLog(instanceId, `> SCHEMA REGISTERED`);
    } catch (error) {
      addLog(instanceId, `> ERROR: ${error.message}`);
    }
  };

  const addSampleDocument = async (instanceId: string) => {
    const instance = instanceId === 'node1' ? instance1 : instance2;
    const setResult = instanceId === 'node1' ? setResult1 : setResult2;
    if (!instance.client) return;

    // FIX: Updated to use the batch mutation format requested
    const mutation = `mutation {
  user1: create_User(input: {
    age: 31, 
    verified: true, 
    points: 90, 
    name: "Bob_${instance.namespace}"
  }) {
    _docID
    name
  }
  user2: create_User(input: {
    age: 28, 
    verified: false, 
    points: 15, 
    name: "Alice_${instance.namespace}"
  }) {
    _docID
    name
  }
  user3: create_User(input: {
    age: 35, 
    verified: true, 
    points: 100, 
    name: "Charlie_${instance.namespace}"
  }) {
    _docID
    name
  }
}`;
    try {
      addLog(instanceId, `> BATCH WRITING DATA...`);
      const result = await instance.client.execRequest(mutation);
      setResult(JSON.stringify(result, null, 2));
      addLog(instanceId, `> WRITE CONFIRMED`);
    } catch (error) {
      addLog(instanceId, `> ERROR: ${error.message}`);
      setResult(JSON.stringify(error, null, 2));
    }
  };

  useEffect(() => {
    if (initializationStarted.current) return;
    initializationStarted.current = true;
    initializeDefraDB();
  }, []);

  // --- Styled Components (Render Functions) ---

  const ActionButton = ({ onClick, disabled, label, primary = false }: any) => (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        padding: '8px 16px',
        background: primary ? THEME.primary : 'transparent',
        color: primary ? THEME.bg : THEME.primary,
        border: `1px solid ${THEME.primary}`,
        borderRadius: '2px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        fontFamily: THEME.fontMono,
        fontSize: '12px',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '6px'
      }}
      onMouseEnter={(e) => {
        if (!disabled && !primary) e.currentTarget.style.background = THEME.primaryDim;
      }}
      onMouseLeave={(e) => {
        if (!disabled && !primary) e.currentTarget.style.background = 'transparent';
      }}
    >
      {label}
    </button>
  );

  const renderInstance = (
    instance: DefraDBInstance,
    query: string,
    setQuery: (q: string) => void,
    result: string,
    onExecute: () => void,
    onSchema: () => void,
    onDoc: () => void,
    onClear: () => void
  ) => {
    const isReady = instance.status === 'ready';
    
    return (
      <div style={{
        backgroundColor: THEME.surface,
        border: `1px solid ${THEME.border}`,
        borderRadius: '4px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: isReady ? `0 0 20px ${THEME.primaryDim}` : 'none',
        transition: 'box-shadow 0.5s ease'
      }}>
        {/* Header Bar */}
        <div style={{
          padding: '12px 16px',
          borderBottom: `1px solid ${THEME.border}`,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: THEME.surfaceHighlight
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CubeIcon color={isReady ? THEME.primary : '#666'} />
            <span style={{ 
              fontFamily: THEME.fontMono, 
              fontWeight: 'bold', 
              color: THEME.text,
              letterSpacing: '0.05em' 
            }}>
              {instance.name}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: isReady ? THEME.primary : '#F59E0B',
              boxShadow: isReady ? `0 0 8px ${THEME.primary}` : 'none'
            }} />
            <span style={{ 
              fontSize: '11px', 
              fontFamily: THEME.fontMono,
              color: isReady ? THEME.primary : '#F59E0B'
            }}>
              {instance.status.toUpperCase()}
            </span>
          </div>
        </div>

        <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <ActionButton onClick={onSchema} disabled={!isReady} label="[ + Schema ]" />
            <ActionButton onClick={onDoc} disabled={!isReady} label="[ + Data ]" />
          </div>

          {/* Editor Area */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              fontFamily: THEME.fontMono, 
              fontSize: '11px', 
              color: THEME.textDim 
            }}>
              <span>// QUERY_INPUT</span>
            </div>
            <div style={{ position: 'relative' }}>
              <textarea
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '140px',
                  backgroundColor: '#000',
                  border: `1px solid ${THEME.border}`,
                  color: THEME.text,
                  fontFamily: THEME.fontMono,
                  fontSize: '13px',
                  padding: '12px',
                  borderRadius: '2px',
                  outline: 'none',
                  resize: 'vertical'
                }}
                spellCheck={false}
              />
              <div style={{ position: 'absolute', bottom: '12px', right: '12px', zIndex: 10 }}>
                 <ActionButton onClick={onExecute} disabled={!isReady} label="▶ EXECUTE" primary />
              </div>
            </div>
          </div>

          {/* Results Area */}
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '8px', 
            opacity: result ? 1 : 0.5 
          }}>
            <div style={{ fontFamily: THEME.fontMono, fontSize: '11px', color: THEME.textDim }}>
              <span>// RESPONSE_OUTPUT</span>
            </div>
            <pre style={{
              backgroundColor: '#000',
              border: `1px solid ${result.includes('Error') || result.includes('errors') ? THEME.error : THEME.border}`,
              padding: '12px',
              borderRadius: '2px',
              color: result.includes('Error') || result.includes('errors') ? THEME.error : THEME.text,
              fontFamily: THEME.fontMono,
              fontSize: '12px',
              overflowX: 'auto',
              minHeight: '100px',
              margin: 0
            }}>
              {result || 'Waiting for input...'}
            </pre>
          </div>

          {/* Logs Terminal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              backgroundColor: THEME.surfaceHighlight,
              padding: '4px 8px',
              border: `1px solid ${THEME.border}`,
              borderBottom: 'none'
            }}>
              <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                <TerminalIcon />
                <span style={{ fontFamily: THEME.fontMono, fontSize: '11px', color: THEME.textDim }}>SYSTEM_LOGS</span>
              </div>
              <button 
                onClick={onClear}
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  color: THEME.textDim, 
                  cursor: 'pointer', 
                  fontSize: '10px' 
                }}
              >
                CLEAR
              </button>
            </div>
            <div style={{
              height: '120px',
              overflowY: 'auto',
              backgroundColor: '#000',
              border: `1px solid ${THEME.border}`,
              padding: '8px',
              fontFamily: THEME.fontMono,
              fontSize: '11px',
              lineHeight: '1.4'
            }}>
              {instance.logs.length === 0 ? (
                <span style={{ color: '#333' }}>_cursor_awaiting_events</span>
              ) : (
                instance.logs.map((log, i) => (
                  <div key={i} style={{ 
                    color: log.includes('ERROR') ? THEME.error : THEME.primary,
                    opacity: 0.8 
                  }}>
                    {log}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ 
      backgroundColor: THEME.bg, 
      color: THEME.text, 
      fontFamily: THEME.fontSans,
      minHeight: '100vh',
      padding: '40px 20px',
      position: 'relative'
    }}>
      <DotGridBackground />
      
      <div style={{ position: 'relative', zIndex: 1, maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ 
            fontSize: '42px', 
            fontWeight: '700', 
            letterSpacing: '-0.02em', 
            marginBottom: '16px',
            background: `linear-gradient(180deg, #fff 0%, #aaa 100%)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            Edge Data Playground
          </h1>
          <p style={{ 
            color: THEME.textDim, 
            fontSize: '18px', 
            maxWidth: '600px', 
            margin: '0 auto',
            lineHeight: '1.6'
          }}>
            Harness the power of <span style={{ color: THEME.primary }}>DefraDB WASM</span>. 
            Two isolated nodes, one browser runtime.
          </p>
        </div>

        {/* Status Bar */}
        {globalError && (
          <div style={{ 
            border: `1px solid ${THEME.error}`, 
            backgroundColor: 'rgba(255, 51, 51, 0.1)',
            color: THEME.error,
            padding: '12px 20px',
            marginBottom: '30px',
            borderRadius: '4px',
            fontFamily: THEME.fontMono
          }}>
            ⚠ SYSTEM ALERT: {globalError}
          </div>
        )}

        {/* The Grid */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(480px, 1fr))', 
          gap: '40px' 
        }}>
          {renderInstance(
            instance1, query1, setQuery1, result1,
            () => executeQuery('node1'),
            () => addSampleSchema('node1'),
            () => addSampleDocument('node1'),
            () => setInstance1(p => ({...p, logs: []}))
          )}
          
          {renderInstance(
            instance2, query2, setQuery2, result2,
            () => executeQuery('node2'),
            () => addSampleSchema('node2'),
            () => addSampleDocument('node2'),
            () => setInstance2(p => ({...p, logs: []}))
          )}
        </div>

        {/* Documentation Footer */}
        <div style={{ 
          marginTop: '60px', 
          borderTop: `1px solid ${THEME.border}`, 
          paddingTop: '40px',
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '40px'
        }}>
          <div>
            <h4 style={{ color: THEME.primary, marginBottom: '16px', fontFamily: THEME.fontMono }}>
              // ARCHITECTURE
            </h4>
            <p style={{ color: THEME.textDim, fontSize: '14px', lineHeight: '1.6' }}>
              This environment demonstrates true data isolation within a single browser session. 
              By leveraging namespace prefixes (Node1_*, Node2_*), both virtual nodes share the 
              same WASM kernel while maintaining distinct data graphs.
            </p>
          </div>
          <div>
            <h4 style={{ color: THEME.primary, marginBottom: '16px', fontFamily: THEME.fontMono }}>
              // SETUP_INSTRUCTIONS
            </h4>
            <code style={{ 
              display: 'block', 
              backgroundColor: THEME.surface, 
              padding: '12px', 
              borderRadius: '4px',
              color: '#ccc',
              fontSize: '12px',
              fontFamily: THEME.fontMono,
              border: `1px solid ${THEME.border}`
            }}>
              npm install @sourcenetwork/acp-js @sourcenetwork/hublet<br/>
              GOOS=js GOARCH=wasm go build -tags=playground -o defradb.wasm
            </code>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RealDualDefraDBPlayground() {
  return (
    <BrowserOnly fallback={
      <div style={{ 
        padding: '20px', 
        backgroundColor: '#000', 
        color: '#00FF94', 
        fontFamily: 'monospace' 
      }}>
        > Loading Source Network Kernel...
      </div>
    }>
      {() => <RealDualDefraDBPlaygroundInner />}
    </BrowserOnly>
  );
}