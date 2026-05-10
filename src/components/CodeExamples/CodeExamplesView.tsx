import { useState } from 'react';
import { codeExamples, TOPICS } from '../../data/codeExamples';
import './CodeExamplesView.css';

export default function CodeExamplesView() {
  const [selectedId, setSelectedId] = useState(codeExamples[0].id);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const selected = codeExamples.find((e) => e.id === selectedId)!;

  function handleCopy() {
    navigator.clipboard.writeText(selected.code).then(() => {
      setCopiedId(selectedId);
      setTimeout(() => setCopiedId(null), 2000);
    });
  }

  return (
    <div className="code-examples-layout">
      {/* Left: topic list */}
      <nav className="code-examples-nav">
        <p className="code-nav-title">Examples</p>
        {TOPICS.map((topic) => (
          <div key={topic} className="code-nav-group">
            <p className="code-nav-topic">{topic}</p>
            {codeExamples
              .filter((e) => e.topic === topic)
              .map((e) => (
                <button
                  key={e.id}
                  className={`code-nav-item ${selectedId === e.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(e.id)}
                >
                  {e.title}
                </button>
              ))}
          </div>
        ))}
      </nav>

      {/* Right: selected example */}
      <div className="code-examples-content">
        <div className="example-header">
          <span className="example-topic-tag">{selected.topic}</span>
          <h2 className="example-title">{selected.title}</h2>
          <p className="example-description">{selected.description}</p>
        </div>

        <div className="example-code-wrapper">
          <div className="example-code-toolbar">
            <span className="example-lang">{selected.language}</span>
            <button className="copy-btn" onClick={handleCopy}>
              {copiedId === selectedId ? '✓ Copied' : 'Copy'}
            </button>
          </div>
          <pre className={`example-code hljs language-${selected.language}`}>
            <code>{selected.code}</code>
          </pre>
        </div>

        <div className="example-key-points">
          <h3>Key points</h3>
          <ul>
            {selected.keyPoints.map((point, i) => (
              <li key={i}>{point}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
