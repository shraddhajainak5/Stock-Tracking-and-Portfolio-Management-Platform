// src/components/common/Modal.jsx

import React from 'react';
import { Modal as BootstrapModal, Button } from 'react-bootstrap';

const Modal = ({
  show,
  onHide,
  title,
  children,
  footer,
  size = 'md',
  centered = true,
  closeButton = true,
  backdrop = 'static',
  keyboard = true,
  primaryButtonText = 'Save',
  secondaryButtonText = 'Cancel',
  onPrimaryAction = null,
  onSecondaryAction = null,
  primaryButtonVariant = 'primary',
  secondaryButtonVariant = 'secondary',
  primaryButtonDisabled = false,
  secondaryButtonDisabled = false
}) => {
  // Default footer if none provided
  const defaultFooter = (
    <>
      {onSecondaryAction && (
        <Button 
          variant={secondaryButtonVariant} 
          onClick={onSecondaryAction || onHide}
          disabled={secondaryButtonDisabled}
        >
          {secondaryButtonText}
        </Button>
      )}
      {onPrimaryAction && (
        <Button 
          variant={primaryButtonVariant} 
          onClick={onPrimaryAction}
          disabled={primaryButtonDisabled}
        >
          {primaryButtonText}
        </Button>
      )}
    </>
  );

  return (
    <BootstrapModal
      show={show}
      onHide={onHide}
      size={size}
      centered={centered}
      backdrop={backdrop}
      keyboard={keyboard}
    >
      {title && (
        <BootstrapModal.Header closeButton={closeButton}>
          <BootstrapModal.Title>{title}</BootstrapModal.Title>
        </BootstrapModal.Header>
      )}
      
      <BootstrapModal.Body>
        {children}
      </BootstrapModal.Body>
      
      {(footer || onPrimaryAction || onSecondaryAction) && (
        <BootstrapModal.Footer>
          {footer || defaultFooter}
        </BootstrapModal.Footer>
      )}
    </BootstrapModal>
  );
};

export default Modal;