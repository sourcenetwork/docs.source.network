import CodeBlock from '@theme/CodeBlock';

export default function SideBySide ({children, lLang, lTitle, lQuery, lResult}) {
  return (
    <>
    <div style={{float:'left', width: '49%'}}>
        <CodeBlock
          language={lLang}
          title={lTitle}>
          {children}
        </CodeBlock>
    </div>
    <div style={{float:'right', width: '49%'}}>
    la
    </div>
    <div style={{clear:'both'}}></div>
    </>
  );
}