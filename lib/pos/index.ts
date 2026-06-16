import { eblagajnaAdapter } from "./eblagajna";
import type { PosAdapter, PosProvider } from "./types";

const ADAPTERS: Record<PosProvider, PosAdapter> = {
  eblagajna: eblagajnaAdapter,
};

export function getPosAdapter(provider: PosProvider): PosAdapter {
  const a = ADAPTERS[provider];
  if (!a) throw new Error(`Neznan POS provider: ${provider}`);
  return a;
}

export type { PosAdapter, PosCredentials, PosProvider, ReceiptVerification } from "./types";
