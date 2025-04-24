import React, { useEffect, useRef } from 'react';
import katex from 'katex';
import 'katex/dist/katex.min.css';

interface KatexDisplayProps {
  math: string;
  block?: boolean;
  errorColor?: string;
  throwOnError?: boolean;
  displayMode?: boolean;
}

const KatexDisplay: React.FC<KatexDisplayProps> = ({
  math,
  block = false,
  errorColor = '#cc0000',
  throwOnError = false,
  displayMode = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      katex.render(math, containerRef.current, {
        displayMode,
        errorColor,
        throwOnError,
      });
    }
  }, [math, displayMode, errorColor, throwOnError]);

  return <div className={block ? 'block' : 'inline-block'} ref={containerRef} />;
};

export default KatexDisplay;