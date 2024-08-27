export const chainName = "Sepolia";
const env = useRuntimeConfig().public;

const chains = {
  11155111: {
    name: "Sepolia",
    chainId: 11155111,
    rpcUrl: "",
    blockExplorer: "https://sepolia.etherscan.io",
  },
  80002: {
    name: "Amoy",
    chainId: 80002,
    rpcUrl: "",
    blockExplorer: "https://amoy.polygonscan.com/",
  },
};

export const chainInfo = chains[env.chainId];

export const LOCATION_DECIMALS = 18;
export const PROJECT_ID = "73801621aec60dfaa2197c7640c15858";
export const DEBUG = true;
export const appMetaData = {
  name: "Finder",
  description:
    "Finder is a blockchain application that allows buyers to find the best deals on products they want to buy.",
  icons: [window.location.origin + "/favicon.ico"],
  url: window.location.origin,
};

export const TIME_TILL_LOCK = 15 * 60 * 1000; // ms
