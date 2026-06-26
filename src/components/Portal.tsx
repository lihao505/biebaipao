import { createPortal } from 'react-dom';
import type { ReactNode } from 'react';

interface PortalProps {
  children: ReactNode;
  zIndex?: number;
}

/**
 * Renders children into a portal at document.body,
 * ensuring they sit above all page-level content (Dock, Header, etc.)
 */
export default function Portal({ children }: PortalProps) {
  return createPortal(children, document.body);
}
