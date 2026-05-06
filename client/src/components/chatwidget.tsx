import { useEffect } from 'react';

export default function ChatWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://contexo-server.onrender.com/widget.js';
    script.async = true;
    script.dataset.widgetId = '3ffc2f97-261d-4f30-a6f4-2ba48487f9ac';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}