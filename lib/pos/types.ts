// Provider-agnostičen vmesnik za povezavo z blagajno (POS) lokala.
// Trenutno: eBlagajna. Kasneje dodaš druge POS-e brez spremembe ostale kode.

export type PosProvider = "eblagajna";

export interface PosCredentials {
  bu_uid: string; // ID poslovne enote (izolacija per-lokal)
  client_id: string;
  client_secret: string;
}

export interface ReceiptVerification {
  found: boolean;
  amount?: number; // znesek v EUR (omogoči zanesljive per_euro točke)
  issuedAt?: string; // ISO
  zoi?: string;
  eor?: string;
  error?: string;
  raw?: unknown;
}

export interface PosAdapter {
  provider: PosProvider;
  /** Hitro preveri, ali poverilnice delujejo (vrne token ali napako). */
  testConnection(creds: PosCredentials): Promise<{ ok: boolean; error?: string }>;
  /** Preveri račun PRI VIRU (blagajni) po podatkih iz skeniranega QR. */
  verifyReceipt(
    creds: PosCredentials,
    q: { zoiHex: string; davcna: string; issuedAt: Date },
  ): Promise<ReceiptVerification>;
  /**
   * Unovči kupon kot popust v ODPRTI transakciji (pred plačilom) → porabi se v računu,
   * neodvisno od telefona gosta (prepreči screen-record ponaredbo unovčenja).
   * ČAKA potrditev eBlagajne (kako aplicirati na konkretno naročilo — docs/eblagajna-questions.md Q4).
   */
  applyCouponDiscount?(
    creds: PosCredentials,
    q: { orderId: string; couponCode: string; percent?: number; amountEur?: number },
  ): Promise<{ ok: boolean; error?: string }>;
}
