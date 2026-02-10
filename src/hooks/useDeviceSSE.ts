import { useEffect, useRef, useState, useCallback } from 'react';
import axios from 'axios';
import type { DeviceData } from '../types/device';

const SSE_URL = import.meta.env.VITE_SSE_URL || 'http://localhost:3000/api/devices/stream';

export function useDeviceSSE() {
  const [devices, setDevices] = useState<DeviceData[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const retryTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(async () => {
    // Clean up previous connection
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const abortController = new AbortController();
    abortControllerRef.current = abortController;

    try {
      const response = await axios.get(SSE_URL, {
        responseType: 'stream',
        headers: {
          Accept: 'text/event-stream',
          'Cache-Control': 'no-cache',
        },
        adapter: 'fetch',
        signal: abortController.signal,
      });

      setIsConnected(true);
      setError(null);

      const reader = (response.data as ReadableStream).getReader();
      const decoder = new TextDecoder();
      let buffer = '';

      const processStream = async () => {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const payload = JSON.parse(line.slice(6));
                  // Handle both formats: direct array or nested in 'payload' property
                  if (Array.isArray(payload.data)) {
                    setDevices(payload.data);
                  } else if (payload && Array.isArray(payload.payload)) {
                    setDevices(payload.payload);
                  }
                } catch {
                  // skip malformed JSON
                }
              }
            }
          }
        } catch (err) {
          if (!abortController.signal.aborted) {
            console.error('Stream read error:', err);
          }
        }
      };

      await processStream();
    } catch (err) {
      if (axios.isCancel(err) || (err instanceof DOMException && err.name === 'AbortError')) {
        return;
      }
      console.error('SSE connection error:', err);
      setError('Cannot connect to server. Retrying...');
      setIsConnected(false);

      // Retry after 5 seconds
      retryTimeoutRef.current = setTimeout(() => {
        connect();
      }, 5000);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current);
      retryTimeoutRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return { devices, isConnected, error, reconnect: connect };
}
