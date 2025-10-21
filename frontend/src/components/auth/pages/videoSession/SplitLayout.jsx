import React, { useRef, useState } from 'react';
import './SplitLayout.css';

/**
 * SplitLayout - a simple horizontal split layout with draggable gutter.
 * Left: main content (video), Right: side panel (chat)
 */
export default function SplitLayout({ left, right, minLeft = 300, minRight = 300, initialLeft = 800 }) {
  const [leftWidth, setLeftWidth] = useState(initialLeft);
  const dragging = useRef(false);

  const onMouseDown = (e) => {
    dragging.current = true;
    document.body.style.cursor = 'col-resize';
  };
  const onMouseMove = (e) => {
    if (!dragging.current) return;
    const newLeft = Math.max(minLeft, e.clientX);
    const total = window.innerWidth;
    const maxLeft = total - minRight;
    setLeftWidth(Math.min(newLeft, maxLeft));
  };
  const onMouseUp = () => {
    dragging.current = false;
    document.body.style.cursor = '';
  };

  React.useEffect(() => {
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  });

  return (
    <div className="split-layout" style={{ width: '100vw', height: '100vh' }}>
      <div style={{ width: leftWidth, minWidth: minLeft, maxWidth: `calc(100vw - ${minRight}px)`, height: '100vh' }}>
        {left}
      </div>
      <div
        className="gutter"
        style={{ height: '100vh' }}
        onMouseDown={onMouseDown}
        role="separator"
        aria-orientation="vertical"
        tabIndex={0}
      />
      <div style={{ flex: 1, minWidth: minRight, height: '100vh', overflow: 'auto' }}>
        {right}
      </div>
    </div>
  );
} 