import { create } from 'zustand';

type ProfileStore = {
  profileId: string | null;
  setProfileId: (id: string | null) => void;
};

export const useProfileStore = create<ProfileStore>((set) => ({
  profileId: null,
  setProfileId: (id) => set({ profileId: id }),
}));