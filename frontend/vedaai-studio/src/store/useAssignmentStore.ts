// src/store/useAssignmentStore.ts
import { create } from 'zustand';
import { apiClient } from '../services/api';
import { IAssignment, AssignmentGenerationStatus } from '../types/api.types';

interface AssignmentState {
  assignments: IAssignment[];
  activeAssignment: IAssignment | null;
  uploadProgress: number;
  generationStatus: AssignmentGenerationStatus;
  errorReason: string | null;
  isLoading: boolean;
  
  fetchAssignments: () => Promise<IAssignment[]>;
  fetchAssignmentById: (id: string) => Promise<IAssignment>;
  setActiveAssignment: (assignment: IAssignment | null) => void;
  updateAssignmentStatus: (
    id: string,
    status: IAssignment['status'],
    paperData?: IAssignment['paperData'],
    errorReason?: string
  ) => void;
  setUploadProgress: (progress: number) => void;
  setGenerationStatus: (status: AssignmentGenerationStatus) => void;
  setErrorReason: (reason: string | null) => void;
  addAssignment: (assignment: IAssignment) => void;
  deleteAssignment: (id: string) => Promise<void>;
  resetCreationState: () => void;
}

export const useAssignmentStore = create<AssignmentState>((set, get) => {
  let assignmentsBackup: IAssignment[] = [];

  return {
    assignments: [],
    activeAssignment: null,
    uploadProgress: 0,
    generationStatus: 'idle',
    errorReason: null,
    isLoading: false,

    fetchAssignments: async () => {
      set({ isLoading: true });
      try {
        const res = await apiClient.get('/assignments');
        const assignments = res.data.assignments || [];
        set({ assignments });
        assignmentsBackup = assignments;
        return assignments;
      } catch (error) {
        set({ assignments: [] });
      } finally {
        set({ isLoading: false });
      }
    },

    fetchAssignmentById: async (id) => {
      set({ isLoading: true });
      try {
        const res = await apiClient.get(`/assignments/${id}`);
        const assignment = res.data.assignment; 
        
        
        const currentList = get().assignments;
        const exists = currentList.find((a) => a._id === id);
        if (exists) {
          set({
            assignments: currentList.map((a) => (a._id === id ? assignment : a)),
          });
        } else {
          set({ assignments: [...currentList, assignment] });
        }
        
        const active = get().activeAssignment;
        if (active?._id === id) {
          set({ activeAssignment: assignment });
        }
        
        return assignment;
      } catch (error) {
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    setActiveAssignment: (activeAssignment) => {
      set({ activeAssignment });
    },

    updateAssignmentStatus: (id, status, paperData, errorReason) => {
      const updateFn = (assignment: IAssignment): IAssignment => {
        if (assignment._id === id) {
          return {
            ...assignment,
            status,
            ...(paperData !== undefined ? { paperData } : {}),
            ...(errorReason !== undefined ? { errorReason } : {}),
          };
        }
        return assignment;
      };

      const updatedAssignments = get().assignments.map(updateFn);
      const active = get().activeAssignment;
      const updatedActive = active?._id === id ? updateFn(active) : active;

      set({
        assignments: updatedAssignments,
        activeAssignment: updatedActive,
        ...(active?._id === id ? { generationStatus: status as AssignmentGenerationStatus } : {}),
        ...(active?._id === id && errorReason ? { errorReason } : {}),
      });
      
      assignmentsBackup = updatedAssignments;
    },

    setUploadProgress: (uploadProgress) => {
      set({ uploadProgress });
    },

    setGenerationStatus: (generationStatus) => {
      set({ generationStatus });
    },

    setErrorReason: (errorReason) => {
      set({ errorReason });
    },

    addAssignment: (assignment) => {
      const currentList = get().assignments;
      set({ assignments: [assignment, ...currentList] });
      assignmentsBackup = get().assignments;
    },

    deleteAssignment: async (id) => {
      const previousAssignments = get().assignments;
      
      set({
        assignments: previousAssignments.filter((a) => a._id !== id),
      });

      try {
        await apiClient.delete(`/assignments/${id}`);
        assignmentsBackup = get().assignments;
      } catch (error) {
        set({ assignments: previousAssignments });
        throw error;
      }
    },

    resetCreationState: () => {
      set({
        uploadProgress: 0,
        generationStatus: 'idle',
        errorReason: null,
      });
    },
  };
});
