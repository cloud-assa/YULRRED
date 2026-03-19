'use client';
import * as Dialog from '@radix-ui/react-dialog';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export default function Modal({ open, onClose, title, children }: ModalProps) {
  return (
    <Dialog.Root open={open} onOpenChange={(v) => !v && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm" />
        <Dialog.Content asChild>
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="glass w-full max-w-lg max-h-[90vh] overflow-y-auto"
                >
                  <div className="flex items-center justify-between p-5 border-b border-white/[0.08]">
                    <Dialog.Title className="text-base font-semibold text-white">{title}</Dialog.Title>
                    <button
                      onClick={onClose}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/[0.08] transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="p-5">{children}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
