import { publicOffers } from "./publicOffer.js";

export const publicSponsor = (u) => ({
  id: u._id,
  businessName: u.businessName,
  photoUrl: u.photoUrl || "",
  category: u.sponsorCategory || "",
  address: u.address || "",
  mapLink: u.mapLink || "",
  offers: publicOffers(u.offers),

  // Owner details, shown on the sponsor detail page
  ownerName: u.name || "",
  ownerPhone: u.phone || "",
  links: {
    website: u.links?.website || "",
    instagram: u.links?.instagram || "",
    facebook: u.links?.facebook || "",
    youtube: u.links?.youtube || "",
    whatsapp: u.links?.whatsapp || "",
  },
});