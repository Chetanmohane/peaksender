// src/components/Modal.tsx
'use client';

import React from 'react';
import styles from './Modal.module.css';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.content} onClick={e => e.stopPropagation()}>
        {title && <h2 className={styles.title}>{title}</h2>}
        <div className={styles.body}>{children}</div>
        <button className={styles.closeBtn} onClick={onClose}>✖ Close</button>
      </div>
    </div>
  );
};
export default Modal;
