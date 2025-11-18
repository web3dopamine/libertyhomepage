import { libertyChainData } from "@shared/schema";

export interface IStorage {
  getChainData(): typeof libertyChainData;
  getMetrics(): typeof libertyChainData.metrics;
  getFeatures(): typeof libertyChainData.features;
}

export class MemStorage implements IStorage {
  getChainData() {
    return libertyChainData;
  }

  getMetrics() {
    return libertyChainData.metrics;
  }

  getFeatures() {
    return libertyChainData.features;
  }
}

export const storage = new MemStorage();
