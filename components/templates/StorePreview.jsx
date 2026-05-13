"use client";
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TemplateNoir, TemplateCream, TemplateMinimal, TemplateBold, TemplateLuxury } from './index';

function StorePreview({ templateId='noir', ...props }){
  const frameRef = useRef(null);
  const [mountNode, setMountNode] = useState(null);
  const [frameHeight, setFrameHeight] = useState(900);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;

    const syncMountNode = () => {
      const doc = frame.contentDocument;
      if (!doc) return;
      doc.body.style.margin = '0';
      doc.body.style.padding = '0';
      doc.body.style.background = 'transparent';
      setMountNode(doc.body);
    };

    syncMountNode();
    frame.addEventListener('load', syncMountNode);
    return () => frame.removeEventListener('load', syncMountNode);
  }, []);

  useEffect(() => {
    if (!mountNode) return;

    const updateHeight = () => {
      const nextHeight = Math.max(1, mountNode.scrollHeight);
      setFrameHeight(nextHeight);
    };

    updateHeight();

    const observer = new ResizeObserver(() => updateHeight());
    observer.observe(mountNode);
    window.addEventListener('resize', updateHeight);

    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, [mountNode, templateId, props]);

  const preview = useMemo(() => {
    switch((templateId||'').toLowerCase()){
      case 'cream': return <TemplateCream {...props} />;
      case 'minimal': return <TemplateMinimal {...props} />;
      case 'bold': return <TemplateBold {...props} />;
      case 'luxury': return <TemplateLuxury {...props} />;
      case 'noir':
      default:
        return <TemplateNoir {...props} />;
    }
  }, [templateId, props]);

  return (
    <>
      <iframe
        ref={frameRef}
        title="Store preview"
        sandbox="allow-same-origin"
        scrolling="no"
        style={{ width: '100%', height: frameHeight, border: 0, display: 'block', background: 'transparent' }}
        srcDoc={`<!doctype html><html><head><meta charset="utf-8" /><style>html,body{margin:0;padding:0;background:transparent;overflow:hidden;}</style></head><body></body></html>`}
      />
      {mountNode ? createPortal(preview, mountNode) : null}
    </>
  );
}

export default React.memo(StorePreview);
