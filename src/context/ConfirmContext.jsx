import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import '../styles/confirm.css';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: 'Konfirmasi',
    message: '',
    confirmText: 'Ya, Lanjutkan',
    cancelText: 'Batal',
    variant: 'danger', // 'danger' | 'warning' | 'info'
    icon: null
  });

  const resolverRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialogState({
        isOpen: true,
        title: options.title || 'Konfirmasi',
        message: options.message || 'Apakah Anda yakin ingin melanjutkan?',
        confirmText: options.confirmText || 'Ya, Lanjutkan',
        cancelText: options.cancelText || 'Batal',
        variant: options.variant || 'danger',
        icon: options.icon || null
      });
    });
  }, []);

  const handleConfirm = () => {
    if (resolverRef.current) {
      resolverRef.current(true);
      resolverRef.current = null;
    }
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    if (resolverRef.current) {
      resolverRef.current(false);
      resolverRef.current = null;
    }
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (dialogState.isOpen && e.key === 'Escape') {
        handleCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dialogState.isOpen]);

  const defaultIconMap = {
    danger: 'fa-solid fa-triangle-exclamation',
    warning: 'fa-solid fa-circle-exclamation',
    info: 'fa-solid fa-circle-info'
  };

  const activeIcon = dialogState.icon || defaultIconMap[dialogState.variant] || defaultIconMap.info;

  const modalContent = dialogState.isOpen ? (
    <div
      className="confirm-modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancel();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
    >
      <div className="confirm-modal-box">
        <div className={`confirm-modal-icon-wrapper variant-${dialogState.variant}`}>
          <i className={activeIcon}></i>
        </div>
        <h3 id="confirm-modal-title" className="confirm-modal-title">
          {dialogState.title}
        </h3>
        <p className="confirm-modal-message">{dialogState.message}</p>
        <div className="confirm-modal-actions">
          <button
            type="button"
            className="confirm-modal-btn btn-cancel"
            onClick={handleCancel}
          >
            {dialogState.cancelText}
          </button>
          <button
            type="button"
            className={`confirm-modal-btn btn-confirm-${dialogState.variant}`}
            onClick={handleConfirm}
            autoFocus
          >
            {dialogState.confirmText}
          </button>
        </div>
      </div>
    </div>
  ) : null;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {typeof document !== 'undefined' && modalContent
        ? createPortal(modalContent, document.body)
        : modalContent}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
