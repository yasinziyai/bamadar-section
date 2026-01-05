import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const IMAGE_URL = "https://cdn.avani.website/v1/upload-v1/";
export const API_URL = "https://avani.s3.ir-thr-at1.arvanstorage.ir/";
