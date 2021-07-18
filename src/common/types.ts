import { Window as KeplrWindow } from "@keplr-wallet/types";
import { Akash } from "akashjs";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Window extends KeplrWindow {}
}

export interface Account {
  address: string,
  name?: string,
  akash?: Akash
}

export type AccountUpdate = (account: Account) => void;