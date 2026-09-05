import { useEffect, useCallback } from 'react';

export default function Menu({ id, options, onSelect, currentIdx }) {
  const handleKey = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
    const idx = parseInt(e.key, 10) - 1;
    if (idx >= 0 && idx < options.length) {
      onSelect(options[idx].value);
    }
  }, [options, onSelect]);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  return (
    <div className="screen-menu" id={id}>
      {options.map((opt, i) => (
        <div
          key={i}
          className={`screen-option${currentIdx === i ? ' selected' : ''}`}
          tabIndex={0}
          role="button"
          onClick={() => onSelect(opt.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              onSelect(opt.value);
            }
          }}
        >
          <span className="key">{i + 1}</span>
          <span className="opt-text">
            <span className="opt-title">{opt.title}</span>
          </span>
        </div>
      ))}
    </div>
  );
}
