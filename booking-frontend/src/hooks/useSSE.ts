import { useEffect, useRef, useCallback } from 'react';
import { getToken } from '@/src/lib/auth';
import { useAppointmentStore } from '@/src/store/appointmentStore';
import { toast } from 'react-hot-toast';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export const APPOINTMENT_EXPIRED_EVENT = 'appointment.expired';
export const APPOINTMENT_STATUS_CHANGED_EVENT = 'appointment.status.changed';

interface SSEEvent {
  event: string;
  data: {
    appointmentId: string;
    status: string;
  };
}

export function useSSE() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const isConnectingRef = useRef(false);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { updateAppointmentStatus } = useAppointmentStore();

  const connect = useCallback(async () => {
    const token = getToken();
    if (!token) {
      console.log('No auth token, skipping SSE connection');
      return;
    }

    if (isConnectingRef.current) return;
    isConnectingRef.current = true;

    const controller = new AbortController();
    abortControllerRef.current = controller;

    try {
      const url = `${API_BASE_URL}/events/stream`;
      console.log('Connecting to SSE:', url);

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'text/event-stream',
        },
        signal: controller.signal,
        credentials: 'include',
      });

      isConnectingRef.current = false;

      if (!response.ok) {
        console.error('SSE connection failed:', response.status, response.statusText);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        console.error('No reader available');
        return;
      }

      const decoder = new TextDecoder();
      let buffer = '';

      const readStream = async () => {
        try {
          while (true) {
            if (controller.signal.aborted) break;

            const result = await reader.read();
            if (result.done || controller.signal.aborted) break;

            buffer += decoder.decode(result.value, { stream: true });
            const lines = buffer.split('\n\n');
            buffer = lines.pop() || '';

            for (const rawLine of lines) {
              const line = rawLine.trim();
              if (!line || !line.startsWith('data:')) continue;

              const data = line.slice(5).trim();
              if (!data) continue;

              try {
                const payload = JSON.parse(data);
                const eventType = payload.event || 'message';

                console.log('SSE event received:', eventType, payload.data);

                if (eventType === APPOINTMENT_EXPIRED_EVENT) {
                  updateAppointmentStatus(payload.data.appointmentId, payload.data.status);
                  toast.error('Your appointment has expired. Please book again.');
                } else if (eventType === APPOINTMENT_STATUS_CHANGED_EVENT) {
                  updateAppointmentStatus(payload.data.appointmentId, payload.data.status);
                } else if (eventType === 'connected') {
                  console.log('SSE connected:', payload.data);
                }
              } catch (e) {
                console.error('Failed to parse SSE data:', e);
              }
            }
          }
        } catch (e) {
          const error = e as Error;
          if (error.name !== 'AbortError') {
            console.error('SSE stream error:', error.message);
          }
        }
      };

      readStream();
    } catch (e) {
      isConnectingRef.current = false;
      const error = e as Error;
      if (error.name !== 'AbortError') {
        console.error('Failed to connect SSE:', error.message);
      }
    }
  }, [updateAppointmentStatus]);

  const disconnect = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }

    if (abortControllerRef.current) {
      abortControllerRef.current.abort('Manual disconnect');
      abortControllerRef.current = null;
    }

    isConnectingRef.current = false;
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return { connect, disconnect };
}