'use client';

import {useEffect, useRef, type ReactNode} from 'react';
import {Search, X} from 'lucide-react';
import {closeOnDialogBackdrop,overlayEscape} from '../lib/overlay-interactions';
import './header-search.css';

/** A lightweight, keyboard-safe search sheet. Results retain the shared search
 * implementation; this component only owns the overlay and its focus. */
export default function HeaderSearchDialog({
  query,
  onQuery,
  onClose,
  children,
}: {
  query: string;
  onQuery: (value: string) => void;
  onClose: () => void;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const input = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const element = dialog.current;
    if (element && !element.open) element.showModal();
    const viewport = window.visualViewport;
    const fitViewport = () => {
      element?.style.setProperty('--ux-search-viewport-height', `${viewport?.height ?? window.innerHeight}px`);
      element?.style.setProperty('--ux-search-viewport-offset', `${viewport?.offsetTop ?? 0}px`);
    };
    fitViewport();
    viewport?.addEventListener('resize', fitViewport);
    viewport?.addEventListener('scroll', fitViewport);
    window.addEventListener('resize', fitViewport);
    input.current?.focus();
    return () => {
      viewport?.removeEventListener('resize', fitViewport);
      viewport?.removeEventListener('scroll', fitViewport);
      window.removeEventListener('resize', fitViewport);
      if (element?.open) element.close();
      if (previous?.isConnected) previous.focus();
    };
  }, []);

  return (
    <dialog
      ref={dialog}
      className="ux-search-dialog"
      data-overlay-origin="top-right"
      aria-labelledby="mobile-search-title"
      onClick={event=>closeOnDialogBackdrop(event,onClose)}
      onCancel={event => {
        event.preventDefault();
        onClose();
      }}
    >
      <header className="ux-search-dialog-header">
        <h2 id="mobile-search-title">Search</h2>
        <button type="button" className="v2-icon" aria-label="Close search" onClick={onClose}>
          <X size={20} />
        </button>
      </header>
      <label className="ux-search-dialog-field">
        <Search size={19} aria-hidden="true" />
        <span className="v2-sr-only">Search in this learning space</span>
        <input
          ref={input}
          type="search"
          onKeyDown={event=>{if(overlayEscape(event.nativeEvent)){event.preventDefault();event.stopPropagation();onClose();}}}
          aria-label="Search in this learning space"
          maxLength={200}
          value={query}
          onChange={event => onQuery(event.target.value)}
          placeholder="Search your learning space…"
        />
        {query && (
          <button
            type="button"
            className="v2-icon"
            aria-label="Clear search query"
            onClick={() => {
              onQuery('');
              input.current?.focus();
            }}
          >
            <X size={17} />
          </button>
        )}
      </label>
      {query.trim() && <div className="ux-search-dialog-results">{children}</div>}
    </dialog>
  );
}
