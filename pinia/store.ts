import { defineStore } from "pinia";
import { CreateStoreDTO, Store, STORE_STORE_KEY } from "@/types";
import { useUserStore } from "./user";
import { LOCATION_DECIMALS } from "@/utils/constants";
import { getEvmAddress } from "@/utils/contract-utils";

export const useStoreStore = defineStore(STORE_STORE_KEY, {
  state: () => ({}),
  getters: {},
  actions: {
    async createStore({
      name,
      description,
      latitude,
      longitude,
    }: CreateStoreDTO): Promise<any | undefined> {
      const userStore = useUserStore();

      try {
        const payload = {
          name,
          description,
          long: Math.trunc(longitude * 10 ** LOCATION_DECIMALS),
          lat: Math.trunc(latitude * 10 ** LOCATION_DECIMALS),
        };

        const contract = userStore.getContract();

        const receipt = await contract.createStore(
          payload.name,
          payload.description,
          payload.lat,
          payload.long
        );

        // save to store
        userStore.storeDetails = [
          {
            name: payload.name,
            description: payload.description,
            location: [payload.long, payload.lat],
          },
        ];
        return receipt;
      } catch (error) {
        console.error(error);
      }
    },
    async getUserStores(accountId: string): Promise<Store[] | undefined> {
      const userStore = useUserStore();

      try {
        const userAddress = await getEvmAddress(accountId);
        const contract = userStore.getContract();
        const storeCount = await contract.userStoreCount(userAddress);
        const stores = [];
        for (let i = 0; i < storeCount; i++) {
          const storeId = await contract.userStoreIds(userAddress, i);
          const store = await contract.userStores(userAddress, storeId);
          stores.push(store);
        }
        return stores;
      } catch (error) {
        console.error(error);
      }
    },
    async getUserStoreIds(accountId: string, index: number) {
      const userStore = useUserStore();

      const userAddress = await getEvmAddress(accountId);
      const contract = userStore.getContract();
      const storeIds = await contract.userStoreIds(userAddress, index);
      return storeIds;
    },
    async getUserStore(accountId: string, storeId: number) {
      const userStore = useUserStore();

      const userAddress = await getEvmAddress(accountId);
      const contract = userStore.getContract();
      const store = await contract.userStores(userAddress, storeId);
      return store;
    },
  },
});
