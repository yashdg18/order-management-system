"use client";

import { useEffect, useRef } from "react";
import { getSocket } from "@/lib/socketClient";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/contexts/ToastContext";

/**
 * Subscribes to real-time order events for as long as the calling
 * component is mounted. `onNewOrder` / `onStatusUpdated` are called with
 * the event payload so pages can refetch just the data they show.
 * Reconnection is handled automatically by socket.io-client.
 */
export function useOrderSocket({ onNewOrder, onStatusUpdated } = {}) {
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  const socketRef = useRef(null);
  const callbacksRef = useRef({ onNewOrder, onStatusUpdated });
  callbacksRef.current = { onNewOrder, onStatusUpdated };

  useEffect(() => {
    if (!accessToken) return;

    const socket = getSocket(accessToken);
    socketRef.current = socket;

    const handleNewOrder = (payload) => {
      showToast(`New order received — ₹${payload.totalAmount}`, "success");
      callbacksRef.current.onNewOrder?.(payload);
    };

    const handleStatusUpdated = (payload) => {
      showToast(`Order status updated to ${payload.status}`, "info");
      callbacksRef.current.onStatusUpdated?.(payload);
    };

    socket.on("new-order", handleNewOrder);
    socket.on("status-updated", handleStatusUpdated);

    return () => {
      socket.off("new-order", handleNewOrder);
      socket.off("status-updated", handleStatusUpdated);
    };
  }, [accessToken, showToast]);

  return socketRef;
}
