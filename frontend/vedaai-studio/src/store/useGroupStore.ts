// src/store/useGroupStore.ts
import { create } from 'zustand';
import { apiClient } from '../services/api';
import { IGroup, IRosterStudent } from '../types/api.types';

interface GroupState {
  groups: IGroup[];
  isLoading: boolean;
  
  fetchGroups: () => Promise<IGroup[]>;
  createGroup: (groupData: { name: string; subject: string; roster: IRosterStudent[] }) => Promise<IGroup>;
  deleteGroup: (id: string) => Promise<void>;
  addStudent: (groupId: string, student: IRosterStudent) => Promise<IGroup>;
  removeStudent: (groupId: string, rollNumber: string) => Promise<IGroup>;
}

export const useGroupStore = create<GroupState>((set, get) => {
  return {
    groups: [],
    isLoading: false,

    fetchGroups: async () => {
      set({ isLoading: true });
      try {
        const res = await apiClient.get('/groups');
        
        let fetchedGroups = res.data.groups || res.data.data || res.data;
        
        if (!Array.isArray(fetchedGroups)) {
           fetchedGroups = [];
        }

        set({ groups: fetchedGroups });
        return fetchedGroups;
      } catch (error) {
        set({ groups: [] }); 
        throw error;
      } finally {
        set({ isLoading: false });
      }
    },

    createGroup: async (groupData) => {
      const tempId = `temp-${Date.now()}`;
      const previousGroups = get().groups;
      
      const optimisticGroup: IGroup = {
        _id: tempId,
        name: groupData.name,
        subject: groupData.subject,
        teacherId: 'placeholder',
        roster: groupData.roster,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      set({ groups: [...previousGroups, optimisticGroup] });

      try {
        const res = await apiClient.post('/groups', groupData);
        const realGroup = res.data.data || res.data;
        
        set({
          groups: get().groups.map((g) => (g._id === tempId ? realGroup : g)),
        });
        return realGroup;
      } catch (error) {
        set({ groups: previousGroups });
        throw error;
      }
    },

    deleteGroup: async (id) => {
      const previousGroups = get().groups;
      
      set({
        groups: previousGroups.filter((g) => g._id !== id),
      });

      try {
        await apiClient.delete(`/groups/${id}`);
      } catch (error) {
        set({ groups: previousGroups });
        throw error;
      }
    },

    addStudent: async (groupId, student) => {
      const previousGroups = get().groups;
      
      const updatedGroups = previousGroups.map((g) => {
        if (g._id === groupId) {
          return {
            ...g,
            roster: [...g.roster, student],
          };
        }
        return g;
      });
      set({ groups: updatedGroups });

      try {
        const res = await apiClient.post(`/groups/${groupId}/students`, student);
        const updatedGroup = res.data.data || res.data;
        
        set({
          groups: get().groups.map((g) => (g._id === groupId ? updatedGroup : g)),
        });
        return updatedGroup;
      } catch (error) {
        set({ groups: previousGroups });
        throw error;
      }
    },

    removeStudent: async (groupId, rollNumber) => {
      const previousGroups = get().groups;
      
      const updatedGroups = previousGroups.map((g) => {
        if (g._id === groupId) {
          return {
            ...g,
            roster: g.roster.filter((s) => s.rollNumber !== rollNumber),
          };
        }
        return g;
      });
      set({ groups: updatedGroups });

      try {
        const res = await apiClient.delete(`/groups/${groupId}/students/${rollNumber}`);
        const updatedGroup = res.data.data || res.data;
        
        set({
          groups: get().groups.map((g) => (g._id === groupId ? updatedGroup : g)),
        });
        return updatedGroup;
      } catch (error) {
        set({ groups: previousGroups });
        throw error;
      }
    },
  };
});
