'use client';

import { useState, useCallback } from 'react';
import api from '@/src/lib/api';

interface WalletBalance {
  walletBalance: number;
}

export function useWalletBalance() {
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletBalance = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get<WalletBalance>('/patients/me/wallet');
      setWalletBalance(response.data.walletBalance);
      return response.data.walletBalance;
    } catch (err: any) {
      setError(err.message || 'Failed to fetch wallet balance');
      return 0;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    walletBalance,
    isLoading,
    error,
    fetchWalletBalance
  };
}