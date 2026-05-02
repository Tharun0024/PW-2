/**
 * @file src/components/OfflineBanner.jsx
 * @description A banner that appears at the bottom of the screen when the user is offline.
 */
import { useState, useEffect } from 'react';

const OfflineBanner = () => {
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!isOffline) {
    return null;
  }

  return (
    <div
      className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-black p-3 text-center text-sm shadow-lg"
      role="status"
      aria-live="assertive"
    >
      You are currently offline. Some features may be limited, but you can still view your chat history.
    </div>
  );
};

export default OfflineBanner;
