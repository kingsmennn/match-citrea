<template>
  <div class="tw-max-w-7xl tw-mx-auto">
    <div class="tw-p-6 sm:tw-p-10">
      <FinalizeRegistration
        v-if="!userStore.passedSecondaryCheck"
        class="tw-mb-6"
      />

      <div class="tw-mb-6 tw-flex tw-justify-between tw-items-center">
        <div
          class="tw-h-16 tw-w-16 tw-rounded-full tw-bg-gray-100 tw-text-4xl tw-font-black
          tw-flex tw-items-center tw-justify-center tw-select-none">
          {{ userInitial }}
        </div>

        <NuxtLink
          v-if="isBuyer"
          to="/requests/create"
          class="tw-inline-block tw-p-4 tw-px-6 tw-rounded-full tw-bg-black
          tw-select-none tw-text-white hover:tw-bg-black/80
          tw-transition-all tw-duration-300 tw-font-black">
          Request for an item
        </NuxtLink>
      </div>
      
      <div>
        <Tabs
          :tab_list="tab_list"
          :value="tab"
          @model-value="($event) => tab = $event"
          class="tw-inline-flex tw-gap-x-1 sm:tw-gap-x-2 tw-justify-between
          tw-rounded-sm tw-w-full [&>*]:tw-flex-grow [&>*]:tw-max-w-[50%]">
          <template v-slot:tab="{ tab, index: i, is_active }">
            <div
              :class="[is_active ? 'tw-border-black' : 'tw-text-gray-400 tw-border-transparent']"
              class="tw-border-b-4 tw-py-2 tw-transition tw-duration-300 tw-font-medium tw-cursor-pointer">
              <span class="tw-flex tw-flex-col tw-items-center">
                <v-icon>{{ (tab as any)?.icon }}</v-icon>
                <span>{{ (tab as any)?.name }}</span>
              </span>
            </div>
          </template>
        </Tabs>

        <div class="tw-mt-6">
          <div v-show="tab===tab_list[0].slug" class="tw-grid sm:tw-grid-cols-2 tw-gap-3">
            <RequestItem
              v-for="request in activeRequestList" :key="request._id"
              :requestId="request.requestId"
              :lifecycle="request.lifecycle"
              :itemName="request.requestName"
              :thumbnail="request.images[0]"
              :created-at="new Date(request.createdAt * 1000)"
              :buyerId="request.buyerAddress"
              :buyer-address="request.buyerAddress!"
              :locked-seller-address="request.lockedSellerId ?? null"
              :sellers-price-quote="request.sellersPriceQuote ?? null"
              :account-type="userStore.accountType!"
            />
          </div>
          
          <div v-show="tab===tab_list[1].slug" class="tw-grid tw-gap-3">
            <RequestItem
              v-for="request in completedRequestList" :key="request._id"
              :requestId="request.requestId"
              :lifecycle="request.lifecycle"
              :itemName="request.requestName"
              :thumbnail="request.images[0]"
              :created-at="new Date(request.createdAt * 1000)"
              :buyerId="request.buyerAddress"
              :buyer-address="request.buyerAddress!"
              :locked-seller-address="request.lockedSellerId ?? null"
              :sellers-price-quote="request.sellersPriceQuote ?? null"
              :account-type="userStore.accountType!"
              is-completed
            />
          </div>

          <!-- show empty state UI when either tab has no content -->
          <div
            v-show="(tab===tab_list[0].slug && activeRequestList.length===0) || (tab===tab_list[1].slug && completedRequestList.length===0)"
            class="tw-p-6 tw-py-10 tw-text-center tw-border-4 tw-border-gray-400/5 tw-rounded-2xl
            tw-bg-gray-300/5 tw-my-10 tw-text-2xl tw-text-gray-500">
            <p>All {{ tab }} requests will be listed here...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import FinalizeRegistration from '@/components/FinalizeRegistration.vue'
import Tabs from '@/components/Tabs.vue';
import RequestItem from '@/components/RequestItem.vue';
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { RequestLifecycle, AccountType, User, Request, Offer, RequestLifecycleIndex } from '@/types'
import { useUserStore } from '@/pinia/user';
import { useRequestsStore } from '@/pinia/request';

const env = useRuntimeConfig().public
useHead({
  title: env.appName+' - Your account',
})
definePageMeta({
  middleware: 'auth',
  requiresAuth: true,
})

const route = useRoute()
const userStore = useUserStore()
const userInitial = computed(() => userStore?.username?.charAt(0).toUpperCase() ?? '?')
const isSeller = computed(() => userStore.accountType === AccountType.SELLER)
const isBuyer = computed(() => userStore.accountType === AccountType.BUYER) 

const tab = ref()
const tab_list = ref<{ name: string, slug: string, icon: string }[]>([])
onBeforeMount(()=>{
  if (isSeller.value) {
    tab_list.value = [
      { name: 'Accepted requests', slug: 'accepted', icon: 'mdi-timelapse' },
      { name: 'Requests I fulfilled', slug: 'fulfilled', icon: 'mdi-cube-send' },
    ]
    return
  }

  tab_list.value = [
    { name: 'Active requests', slug: 'active', icon: 'mdi-timelapse' },
    { name: 'Completed requests', slug: 'completed', icon: 'mdi-cube-send' },
  ]
})

const requestsStore = useRequestsStore()
onMounted(()=>{
  requestsStore.fetchAllUserRequests(userStore.accountId!)
})

onMounted(()=>{
  if (isSeller.value) {
    // fetchSellersAcceptedOfferIds()
    return
  }

  requestsStore.fetchAllUserRequests(userStore.accountId!)
})

const activeRequestList = computed(() => {
  if (isSeller.value) {
    return []
    // return sellerRequestList.value.filter(request => request.lifecycle !== RequestLifecycle.COMPLETED).reverse()
  }
  return requestsStore.list.filter(request=>{
    return request.lifecycle !== RequestLifecycleIndex.COMPLETED
  })
})

const completedRequestList = computed(() => {
  if (isSeller.value) {
    // return sellerRequestList.value.filter(request => request.lifecycle === RequestLifecycle.COMPLETED).reverse()
  }
  return requestsStore.list.filter(request=>{
    return request.lifecycle === RequestLifecycleIndex.COMPLETED
  })
})

// const userRequestList = ref<Request[]>([])

// const requestIdsWithAcceptedOffersFromSeller = ref<string[]>([])
// const fetchSellersAcceptedOfferIds = async () => {
// }
// const sellerRequestList = ref<Request[]>([])
</script>

<!-- <script setup lang="ts">
import { getDatabase, ref as RTDBRef, equalTo, orderByChild, query, onValue } from "firebase/database";



const isCompletedNow = ref(false)
const isCompleted = computed(()=>!!userCookie.value?.username)


const user = useCurrentUser()
const userCookie = useCookie<User>('user')
const userInitial = computed(() => userCookie.value?.username?.charAt(0).toUpperCase() ?? '?')
const isSeller = computed(() => userCookie.value?.accountType === AccountType.SELLER)
const isBuyer = computed(() => userCookie.value?.accountType === AccountType.BUYER) 

const userRequestList = ref<Request[]>([])
// fetching from firebase RTDB
const fetchUserRequests = async () => {
  const db = getDatabase();
  const myRequestsRef = query(RTDBRef(db, 'requests/'), orderByChild('buyerId'), equalTo(user.value?.uid!))
  onValue(myRequestsRef, (snapshot) => {
    const newRequestList: Request[] = []
    snapshot.forEach((childSnapshot) => {
      const childKey = childSnapshot.key;
      const childData = childSnapshot.val();
      newRequestList.push({
        id: childKey,
        ...childData,
      } as Request)
    });
    userRequestList.value = newRequestList
  });
}


const requestIdsWithAcceptedOffersFromSeller = ref<string[]>([])
const fetchSellersAcceptedOfferIds = async () => {
  const db = getDatabase();

  const sellerOfferRef = query(RTDBRef(db, 'offers/'), orderByChild('sellerId'), equalTo(user.value?.uid!))
  onValue(sellerOfferRef, (snapshot) => {
    const list:string[] = []
    snapshot.forEach((childSnapshot) => {
      const childData = childSnapshot.val();
      list.push(childData.requestId)
    })
    requestIdsWithAcceptedOffersFromSeller.value = list
  })
}
const sellerRequestList = ref<Request[]>([])
watch(()=>requestIdsWithAcceptedOffersFromSeller.value, (value)=>{
  sellerRequestList.value = []
  const db = getDatabase();
  value.map((requestId)=>{
    const acceptedRequestsRef = RTDBRef(db, 'requests/'+ requestId)
    onValue(acceptedRequestsRef, (snapshot) => {
      const data = {
        ...snapshot.val(),
        id: snapshot.key
      }
      // if sellers offer was not the one accepted, then don't show it
      if(data.lifecycle !== RequestLifecycle.ACCEPTED_BY_SELLER && data.lockedSellerId !== user.value?.uid!) return
      sellerRequestList.value.push(data)
    // using once here because of a duplication bug when updates trigger this function
    }, { onlyOnce: true });
  })
})
</script> -->