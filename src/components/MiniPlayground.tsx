import React, { useState, useEffect, useContext, createContext, useRef, useCallback } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

/**
 * Source Network Mini Playground
 * A persistent, floating terminal for live documentation interaction.
 * 
 * Based on the working RealDualDefraDBPlayground pattern.
 */

// --- Theme Constants ---
const THEME = {
  bg: '#050505',
  surface: '#0A0A0A',
  border: '#333333',
  primary: '#00FF94',
  error: '#FF3333',
  warning: '#FFaa00',
  fontMono: '"Fira Code", "Courier New", monospace',
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

// --- Context ---
interface PlaygroundContextType {
  client: any;
  status: 'initializing' | 'ready' | 'error';
  logs: LogEntry[];
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
  runCommand: (type: 'schema' | 'query', code: string, label?: string) => Promise<void>;
  clearLogs: () => void;
  resetDatabase: () => void;
}

interface LogEntry {
  id: string;
  type: 'input' | 'output' | 'error' | 'system';
  content: string;
  timestamp: string;
}

const PlaygroundContext = createContext<PlaygroundContextType | null>(null);

export const usePlayground = () => {
  const ctx = useContext(PlaygroundContext);
  if (!ctx) throw new Error('usePlayground must be used within DefraDBProvider');
  return ctx;
};

// --- Provider Component ---
export const DefraDBProvider = ({ children }: { children: React.ReactNode }) => {
  const [client, setClient] = useState<any>(null);
  const [status, setStatus] = useState<'initializing' | 'ready' | 'error'>('initializing');
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const initializationStarted = useRef(false);

  const addLog = useCallback((type: LogEntry['type'], content: string) => {
    setLogs(prev => [...prev, {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      timestamp: new Date().toLocaleTimeString([], { hour12: false })
    }]);
  }, []);

  const clearLogs = useCallback(() => setLogs([]), []);

  const resetDatabase = useCallback(() => {
    window.location.reload();
  }, []);

  useEffect(() => {
    // Prevent double initialization (same pattern as working component)
    if (initializationStarted.current) return;
    initializationStarted.current = true;

    const initializeDefraDB = async () => {
      try {
        addLog('system', '>> INITIALIZING KERNEL...');
        
        // Setup Global Config (exact same as working component)
        window.globalACPConfig = {
          apiUrl: `${window.location.origin}/api`,
          rpcUrl: `${window.location.origin}/rpc`,
          grpcUrl: `${window.location.origin}/api`,
          chainId: 'sourcehub-dev',
          denom: 'uopen',
          useZeroFees: true,
        };

        // Import and instantiate (exact same pattern as working component)
        addLog('system', '>> LOADING WASM MODULE...');
        const { instantiate } = await import('@sourcenetwork/acp-js');
        await instantiate('https://defradbwasm.source.network/defradb.wasm');
        
        // Wait for window.defradb (exact same pattern as working component)
        addLog('system', '>> WAITING FOR DEFRADB...');
        let attempts = 0;
        while (!window.defradb && attempts < 100) {
          await new Promise(resolve => setTimeout(resolve, 100));
          attempts++;
        }

        if (!window.defradb) {
          throw new Error('Timeout waiting for window.defradb');
        }
        
        // Open the database (exact same pattern as working component)
        addLog('system', '>> OPENING DATABASE...');
        const dbClient = await window.defradb.open();
        if (!dbClient) {
          throw new Error('Client open failed');
        }
        
        // Store globally for debugging
        window.defradbClient = dbClient;
        
        setClient(dbClient);
        setStatus('ready');
        addLog('system', '>> SYSTEM ONLINE. RUN COMMANDS FROM THE DOCS.');
        addLog('system', '>> TIP: Add schema first, then create documents, then query.');
        
      } catch (error: any) {
        console.error('DefraDB init error:', error);
        setStatus('error');
        addLog('error', `INIT FAILURE: ${error.message}`);
        addLog('system', '>> Click RESET to try again.');
      }
    };

    initializeDefraDB();
  }, [addLog]);

  const runCommand = useCallback(async (type: 'schema' | 'query', code: string, label?: string) => {
    if (!client) {
      addLog('error', 'Database not initialized. Please wait or click RESET.');
      setIsOpen(true);
      return;
    }
    
    setIsOpen(true);
    addLog('input', `> ${label || (type === 'schema' ? 'ADD SCHEMA' : 'EXECUTE QUERY')}`);

    try {
      let result;
      if (type === 'schema') {
        result = await client.addSchema(code);
        addLog('output', result ? JSON.stringify(result, null, 2) : 'Schema added successfully.');
      } else {
        // Use execRequest with empty objects for variables and context (same as working component)
        result = await client.execRequest(code, {}, {});
        addLog('output', JSON.stringify(result, null, 2));
      }
    } catch (err: any) {
      const errorMsg = err.message || String(err);
      addLog('error', errorMsg);
      
      // Detect if the Go runtime has crashed
      if (errorMsg.includes('Go program has already exited') || 
          errorMsg.includes('cannot resume') ||
          errorMsg.includes('exports')) {
        addLog('system', '>> WASM runtime error. Click RESET to restart.');
        setStatus('error');
      }
    }
  }, [client, addLog]);

  return (
    <PlaygroundContext.Provider value={{ 
      client, 
      status, 
      logs, 
      isOpen, 
      setIsOpen, 
      runCommand, 
      clearLogs,
      resetDatabase
    }}>
      {children}
      <FloatingWidget />
    </PlaygroundContext.Provider>
  );
};

// --- The Floating Widget UI ---
const FloatingWidget = () => {
  const { isOpen, setIsOpen, logs, status, clearLogs, resetDatabase } = usePlayground();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs, isOpen]);

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '30px',
          right: '30px',
          background: THEME.surface,
          border: `1px solid ${status === 'ready' ? THEME.primary : status === 'error' ? THEME.error : THEME.warning}`,
          color: status === 'error' ? THEME.error : status === 'ready' ? THEME.primary : THEME.warning,
          padding: '12px 20px',
          borderRadius: '4px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          cursor: 'pointer',
          fontFamily: THEME.fontMono,
          fontWeight: 'bold',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          zIndex: 9999,
        }}
      >
        <div style={{
          width: '8px', height: '8px', borderRadius: '50%',
          background: status === 'ready' ? THEME.primary : status === 'error' ? THEME.error : THEME.warning,
          boxShadow: status === 'ready' ? `0 0 10px ${THEME.primary}` : status === 'error' ? `0 0 10px ${THEME.error}` : 'none',
        }} />
        <span>
          {status === 'error' ? 'ERROR' : status === 'initializing' ? 'LOADING...' : 'TERMINAL'}
        </span>
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '30px',
      right: '30px',
      width: '480px',
      height: '500px',
      background: THEME.bg,
      border: `1px solid ${THEME.border}`,
      borderRadius: '8px',
      boxShadow: '0 20px 50px rgba(0,0,0,0.8)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999,
      fontFamily: THEME.fontMono,
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px',
        background: THEME.surface,
        borderBottom: `1px solid ${THEME.border}`,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: status === 'ready' ? THEME.primary : status === 'error' ? THEME.error : THEME.warning,
          }} />
          <span style={{ color: THEME.primary, fontSize: '12px', fontWeight: 'bold' }}>
            DEFRADB_LIVE
          </span>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={resetDatabase} 
            style={{ 
              background: 'none', 
              border: `1px solid ${THEME.warning}`, 
              color: THEME.warning, 
              cursor: 'pointer', 
              fontSize: '10px',
              padding: '4px 8px',
              borderRadius: '2px',
            }}
            title="Reset database and reload page"
          >
            RESET
          </button>
          <button 
            onClick={clearLogs} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#666', 
              cursor: 'pointer', 
              fontSize: '11px' 
            }}
          >
            CLEAR
          </button>
          <button 
            onClick={() => setIsOpen(false)} 
            style={{ 
              background: 'none', 
              border: 'none', 
              color: '#666', 
              cursor: 'pointer', 
              fontSize: '11px' 
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Logs Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        fontSize: '12px',
        lineHeight: '1.6',
        color: '#ccc'
      }}>
        {logs.length === 0 && (
          <div style={{ color: '#555', textAlign: 'center', marginTop: '80px' }}>
            <div style={{ fontSize: '14px', marginBottom: '12px' }}>
              {status === 'initializing' ? '⏳ Initializing...' : status === 'error' ? '❌ Error occurred' : '✓ Ready'}
            </div>
            <div style={{ fontSize: '11px', color: '#444' }}>
              Click "Run" buttons in the docs to execute commands.<br/>
              Follow the tutorial steps in order.
            </div>
          </div>
        )}
        {logs.map((log) => (
          <div key={log.id} style={{ marginBottom: '10px' }}>
            <div style={{ color: '#444', fontSize: '10px', marginBottom: '2px' }}>
              [{log.timestamp}] {log.type.toUpperCase()}
            </div>
            <pre style={{ 
              margin: 0, 
              whiteSpace: 'pre-wrap', 
              wordBreak: 'break-word',
              color: log.type === 'error' ? THEME.error : 
                     log.type === 'input' ? '#fff' : 
                     log.type === 'system' ? THEME.primary : '#aaa',
              fontSize: log.type === 'output' ? '11px' : '12px',
            }}>
              {log.content}
            </pre>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      
      {/* Footer hint */}
      <div style={{
        padding: '8px 16px',
        background: THEME.surface,
        borderTop: `1px solid ${THEME.border}`,
        fontSize: '10px',
        color: '#444',
        textAlign: 'center',
      }}>
        In-browser DefraDB • Data resets on page refresh
      </div>
    </div>
  );
};

// --- The "Run" Button for MDX ---
export const RunButton = ({ 
  code, 
  type = 'query', 
  label 
}: { 
  code: string, 
  type?: 'schema' | 'query', 
  label?: string 
}) => {
  return (
    <BrowserOnly>
      {() => {
        const { runCommand, status } = usePlayground();
        const isDisabled = status !== 'ready';
        
        return (
          <button
            onClick={() => runCommand(type, code, label)}
            disabled={isDisabled}
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              background: isDisabled ? 'transparent' : 'rgba(0, 255, 148, 0.1)',
              border: `1px solid ${isDisabled ? '#444' : THEME.primary}`,
              color: isDisabled ? '#444' : THEME.primary,
              borderRadius: '2px',
              fontSize: '11px',
              fontFamily: THEME.fontMono,
              fontWeight: 'bold',
              cursor: isDisabled ? 'not-allowed' : 'pointer',
              opacity: isDisabled ? 0.5 : 1,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.background = 'rgba(0, 255, 148, 0.2)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isDisabled) {
                e.currentTarget.style.background = 'rgba(0, 255, 148, 0.1)';
              }
            }}
          >
            ▶ {label || 'RUN IN BROWSER'}
          </button>
        );
      }}
    </BrowserOnly>
  );
};