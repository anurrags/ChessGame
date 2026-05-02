import { useEffect } from 'react';

export default function ChatWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://contexo-server.onrender.com/widget.js';
    script.async = true;
    script.dataset.widgetId = 'dbda0757-b123-4cc2-820f-86853faa13ba';
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}