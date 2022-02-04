import storage from "@sitevision/api/server/storage";
const feedbackStore = storage.getCollectionDataStore('feedbackStore');

export const getPrevFeedback = () => {
  return feedbackStore.find('*', 5).toArray();
};