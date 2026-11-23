import { createContext, useContext, useState, useCallback, useRef } from 'react';
import {
  IconAlertCircle,
  IconAlertTriangle,
  IconInfoCircle
} from '@tabler/icons-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle
} from '../components/ui/alert-dialog';

const ConfirmContext = createContext(null);

const VARIANT_CONFIG = {
  danger: {
    Icon: IconAlertTriangle,
    mediaClass: 'bg-destructive/10 text-destructive',
    actionVariant: 'destructive'
  },
  warning: {
    Icon: IconAlertCircle,
    mediaClass: 'bg-warning/15 text-warning',
    actionVariant: 'default'
  },
  info: {
    Icon: IconInfoCircle,
    mediaClass: 'bg-muted text-foreground',
    actionVariant: 'default'
  }
};

export function ConfirmProvider({ children }) {
  const [dialogState, setDialogState] = useState({
    isOpen: false,
    title: 'Konfirmasi',
    message: '',
    confirmText: 'Ya, Lanjutkan',
    cancelText: 'Batal',
    variant: 'danger'
  });

  const resolverRef = useRef(null);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setDialogState({
        isOpen: true,
        title: options.title || 'Konfirmasi',
        message: options.message || 'Apakah Anda yakin ingin melanjutkan?',
        confirmText: options.confirmText || 'Ya, Lanjutkan',
        cancelText: options.cancelText || 'Batal',
        variant: options.variant || 'danger'
      });
    });
  }, []);

  const settle = useCallback((result) => {
    if (resolverRef.current) {
      const resolve = resolverRef.current;
      resolverRef.current = null;
      resolve(result);
    }
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      settle(false);
    }
  };

  const variantMeta = VARIANT_CONFIG[dialogState.variant] || VARIANT_CONFIG.info;
  const VariantIcon = variantMeta.Icon;

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={dialogState.isOpen} onOpenChange={handleOpenChange}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogMedia className={`size-12 rounded-xl ${variantMeta.mediaClass}`}>
              <VariantIcon className="size-6" stroke={1.75} aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle className="font-display text-lg font-semibold">
              {dialogState.title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-relaxed text-muted-foreground">
              {dialogState.message}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => settle(false)}>
              {dialogState.cancelText}
            </AlertDialogCancel>
            <AlertDialogAction
              variant={variantMeta.actionVariant}
              onClick={() => settle(true)}
            >
              {dialogState.confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
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
