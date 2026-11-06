import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';

const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); setError(''); return; }
    try { setItems((await api.get('/wishlist')).data.items); setError(''); }
    catch (requestError) { setError(requestError.response?.data?.error || 'Your wishlist could not be loaded.'); }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const toggle = async (product) => {
    const existing = items.find((item) => item.product.id === product.id);
    const { data } = existing
      ? await api.delete(`/wishlist/items/${product.id}`)
      : await api.post('/wishlist/items', { productId: product.id });
    setItems(data.items);
    setError('');
    return !existing;
  };

  const value = useMemo(() => ({
    items, count: items.length, error, refresh, toggle,
    has: (productId) => items.some((item) => item.product.id === productId),
  }), [items, error, refresh]);
  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>;
}

export function useWishlist() {
  return useContext(WishlistContext);
}
