import { publicOffers } from "./publicOffer.js";

export const publicSponsor = (u) => {
  const o = u.offer;
  return {
    id: u._id,
    businessName: u.businessName,
    photoUrl: u.photoUrl || "",
    category: u.sponsorCategory || "",
    address: u.address || "",
    mapLink: u.mapLink || "",
   offers: publicOffers(u.offers),
  };
};
