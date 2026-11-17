/**
 * DEMO OBDOBJE (od 17. 11. 2026).
 *
 * Dokler je DEMO vklopljen:
 *  - vsak račun lokala ima vse funkcije brezplačno, brez plačila in brez časovne omejitve;
 *  - prijava je obvezna (račun gosta in račun lokala), brez nje ni kartice ne nadzorne plošče;
 *  - en račun pomeni en lokal (DEMO_MAX_VENUES). Več lokalov odobri superadmin po povpraševanju
 *    tako, da računu dodeli paket Veriga ali Po meri (brez plačila);
 *  - podpis Loyavi na strani gosta, v sporočilih in na plakatu je obvezen in ga lokal ne more skriti;
 *  - cenik, preizkusno obdobje in plačilo (Polar) so skriti, koda zanje ostane.
 *
 * IZKLOP: DEMO = false. Vrnejo se paketi, 30 dnevni preizkus in plačilo (lib/plans.ts, lib/access.ts).
 * Pred izklopom vsem lokalom podaljšaj `trial_ends_at`, sicer se nadzorne plošče zaklenejo isti dan.
 */
export const DEMO = true;

/** Koliko lokalov ima lahko en račun med demom brez odobritve. */
export const DEMO_MAX_VENUES = 1;

/** Največ kampanj po elektronski pošti na lokal v sedmih dneh med demom (varovalo za skupno kvoto pošte). */
export const DEMO_CAMPAIGNS_PER_WEEK = 2;
