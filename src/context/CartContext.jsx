import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../services/api';
import { getErrorMessage } from '../services/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    if (!user) { setItems([]); setError(''); return; }
    setLoading(true);
    try { setItems((await api.get('/cart')).data.items); setError(''); }
    catch (requestError) { setError(getErrorMessage(requestError)); }
    finally { setLoading(false); }
  }, [user]);

  useEffect(() => { refresh(); }, [refresh]);

  const addItem = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/items', { productId, quantity });
    setItems(data.items);
    setError('');
  };
  const setQuantity = async (id, quantity) => {
    const { data } = await api.patch(`/cart/items/${id}`, { quantity });
    setItems(data.items);
    setError('');
  };
  const removeItem = async (id) => {
    const { data } = await api.delete(`/cart/items/${id}`);
    setItems(data.items);
    setError('');
  };
  const clear = () => { setItems([]); setError(''); };
  const value = useMemo(() => ({
    items, loading, error, refresh, addItem, setQuantity, removeItem, clear,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0)
  }), [items, loading, refresh]);
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  return useContext(CartContext);
}
