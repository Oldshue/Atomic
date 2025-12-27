import { useEffect, useRef, useState } from 'react';
import { buildPreviewHtml } from '../services/codeGenerator';
import type { GeneratedCode } from '../types';
import styles from './Preview.module.css';

interface PreviewProps {
  code: GeneratedCode;
}

export function Preview({ code }: PreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    if (iframeRef.current) {
      const html = buildPreviewHtml(code);
      iframeRef.current.srcdoc = html;
    }
  }, [code]);

  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({ width: rect.width, height: rect.height });
      }
    };

    updateDimensions();
    const observer = new ResizeObserver(updateDimensions);
    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.browserBar}>
        <div className={styles.trafficLights}>
          <span className={styles.dot} data-color="red"></span>
          <span className={styles.dot} data-color="yellow"></span>
          <span className={styles.dot} data-color="green"></span>
        </div>
        <div className={styles.addressBar}>
          <svg className={styles.lockIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span className={styles.url}>localhost:3000</span>
        </div>
        <div className={styles.actions}>
          <button className={styles.actionBtn} title="Refresh">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
        </div>
      </div>
      <div className={styles.previewContent} ref={containerRef}>
        <iframe
          ref={iframeRef}
          className={styles.iframe}
          style={{ width: dimensions.width, height: dimensions.height }}
          sandbox="allow-scripts allow-forms allow-modals"
          title="Preview"
        />
      </div>
    </div>
  );
}
