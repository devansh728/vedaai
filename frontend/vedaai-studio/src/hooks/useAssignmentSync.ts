// src/hooks/useAssignmentSync.ts
import { useEffect } from 'react';
import { useAssignmentStore } from '../store/useAssignmentStore';
import { webSocketService } from '../services/websocket';

export function useAssignmentSync(assignmentId: string) {
  const fetchAssignmentById = useAssignmentStore((state) => state.fetchAssignmentById);
  const updateAssignmentStatus = useAssignmentStore((state) => state.updateAssignmentStatus);
  const setGenerationStatus = useAssignmentStore((state) => state.setGenerationStatus);
  const setErrorReason = useAssignmentStore((state) => state.setErrorReason);
  const setActiveAssignment = useAssignmentStore((state) => state.setActiveAssignment);

  useEffect(() => {
    if (!assignmentId) return;

    const syncStateOverHttp = async () => {
      try {
        const assignment = await fetchAssignmentById(assignmentId);
        setActiveAssignment(assignment);
        setGenerationStatus(assignment.status);
        if (assignment.status === 'failed' && assignment.errorReason) {
          setErrorReason(assignment.errorReason);
        }
      } catch (err) {
        console.error('Failed to sync assignment state over HTTP:', err);
      }
    };
    syncStateOverHttp();

    const socket = webSocketService.connect();
    webSocketService.subscribeToAssignment(assignmentId);

    webSocketService.onStatusUpdate((data) => {
      if (data.assignmentId === assignmentId) {
        updateAssignmentStatus(assignmentId, data.status);
      }
    });

    webSocketService.onGenerationSuccess((data) => {
      if (data.assignmentId === assignmentId) {
        updateAssignmentStatus(assignmentId, 'completed', data.paperData);
      }
    });

    webSocketService.onGenerationFailed((data) => {
      if (data.assignmentId === assignmentId) {
        updateAssignmentStatus(assignmentId, 'failed', undefined, data.error);
      }
    });

    webSocketService.onPdfReady((data) => {
      if (data.assignmentId === assignmentId) {
        const active = useAssignmentStore.getState().activeAssignment;
        if (active && active.paperData) {
          const updatedPaper = { ...active.paperData, pdfUrl: data.pdfUrl };
          updateAssignmentStatus(assignmentId, 'completed', updatedPaper);
        } else {
          syncStateOverHttp();
        }
      }
    });

    const handleReconnect = () => {
      console.log('🔄 Socket reconnected, re-subscribing and re-fetching assignment:', assignmentId);
      webSocketService.subscribeToAssignment(assignmentId);
      syncStateOverHttp();
    };
    
    socket.on('reconnect', handleReconnect);

    return () => {
      socket.off('reconnect', handleReconnect);
      webSocketService.removeListeners();
    };
  }, [assignmentId, fetchAssignmentById, updateAssignmentStatus, setGenerationStatus, setErrorReason]);
}
