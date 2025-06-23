import { create } from 'zustand';

export const userChatStore = create((set) => ({
  chatPartner: {
    id: null,
    name: null,
    imageUrl: null,
  },

  updateChatPartner: (id, name, imageUrl = null) => {
    if (!id || !name) {
      console.warn('⚠️ updateChatPartner called with invalid parameters');
      return;
    }

    set({
        chatPartner: {
            id: id,
            name: name,
            imageUrl: imageUrl,
        },
    });
  },

  resetChatPartner: () => { 
    set({
      chatPartner: {
        id: null,
        name: null,
        imageUrl: null,
      },
    });
  },
}));
