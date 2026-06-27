import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Scrolls to top on every route change (pathname + search).
 * Uses requestAnimationFrame to ensure DOM is ready.
 * Compatible with HashRouter and BrowserRouter.
 * Also resets scroll on any <main> container.
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const main = document.querySelector('main');
      if (main) {
        main.scrollTop = 0;
      }
    });
  }, [pathname, search]);

  return null;
}
