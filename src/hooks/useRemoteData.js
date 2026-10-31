import { useCallback, useEffect, useState } from 'react';

export default function useRemoteData(loader, refreshInterval = 30 * 60 * 1000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setData(await loader());
    } catch (err) {
      setError(err?.message || 'Tidak dapat memuat data.');
    } finally {
      setLoading(false);
    }
  }, [loader]);

  useEffect(() => {
    refresh();
    const timer = setInterval(refresh, refreshInterval);
    return () => clearInterval(timer);
  }, [refresh, refreshInterval]);

  return { data, loading, error, refresh };
}
