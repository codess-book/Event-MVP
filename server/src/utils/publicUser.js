// The only user fields that are safe to send to the client (never the password hash)
import { publicOffers } from "./publicOffer.js";
export const publicUser = (u) => ({
  id: u._id,
  name: u.name,
  phone: u.phone,
  userType: u.userType,
  role: u.role,
  isApproved: u.isApproved,
  photoUrl: u.photoUrl || "",
  passNumber: u.passNumber,
  gender: u.gender,
  businessName: u.businessName,
  sponsorCategory: u.sponsorCategory,
  offers: publicOffers(u.offers),
   address: u.address || "",
  mapLink: u.mapLink || "",
});
