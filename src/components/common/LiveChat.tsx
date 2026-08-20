import { useEffect } from 'react';

// Smartupp live chat widget
// Replace the key below with your actual Smartupp account key
const SMARTUPP_KEY = 'YOUR_SMARTUPP_KEY';

export function LiveChat() {
  useEffect(() => {
    if (SMARTUPP_KEY === 'YOUR_SMARTUPP_KEY') return; // Skip if not configured

    // Inject Smartupp script
    const w = window as unknown as Record<string, unknown>;
    w._smartsupp = w._smartsupp || {};
    (w._smartsupp as Record<string, unknown>).key = SMARTUPP_KEY;
    w.smartsupp || (w.smartsupp = function (...args: unknown[]) {
      ((w.smartsupp as unknown as { _: unknown[] })._ = (w.smartsupp as unknown as { _: unknown[] })._ || []).push(args);
    });

    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.charset = 'utf-8';
    script.async = true;
    script.src = 'https://www.smartsuppchat.com/loader.js?';
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  return null;
}
