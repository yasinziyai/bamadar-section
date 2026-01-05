import { API_URL } from "./utils";

export const getImageUrl = (imageUrl?: string): string => {
  if (!imageUrl) return "";

  return imageUrl.startsWith("https") ? imageUrl : `${API_URL}${imageUrl}`;
};
