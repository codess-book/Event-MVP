// The only user fields that are safe to send to the client (never the password hash)
// import { publicOffers } from "./publicOffer.js";
// export const publicUser = (u) => ({
//   id: u._id,
//   name: u.name,
//   phone: u.phone,
//   userType: u.userType,
//   role: u.role,
//   isApproved: u.isApproved,
//   photoUrl: u.photoUrl || "",
//   passNumber: u.passNumber,
//   gender: u.gender,
//   businessName: u.businessName,
//   sponsorCategory: u.sponsorCategory,
//   offers: publicOffers(u.offers),
//   address: u.address || "",
//   mapLink: u.mapLink || "",
//   links: {
//     website: u.links?.website || "",
//     instagram: u.links?.instagram || "",
//     facebook: u.links?.facebook || "",
//     youtube: u.links?.youtube || "",
//     whatsapp: u.links?.whatsapp || "",
//   },
// });

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
  links: {
    website: u.links?.website || "",
    instagram: u.links?.instagram || "",
    facebook: u.links?.facebook || "",
    youtube: u.links?.youtube || "",
    whatsapp: u.links?.whatsapp || "",
  },
  // food partner
  stallNumber: u.stallNumber || "",
  isOpen: u.isOpen !== false,
  menu: (u.menu || []).map(publicMenuItem),
  ratingAvg: u.ratingAvg || 0,
  ratingCount: u.ratingCount || 0,
});

export const publicMenuItem = (i) => ({
  id: i._id,
  name: i.name,
  price: i.price,
  category: i.category || "",
  available: i.available !== false,
});

// What OTHER users see about a stall: no phone, no role, nothing private
export const publicStall = (u, myRating = 0) => ({
  id: u._id,
  businessName: u.businessName || u.name,
  name: u.name, 
  phone: u.phone || u.Phone,
  stallNumber: u.stallNumber || "",
  isOpen: u.isOpen !== false,
  photoUrl: u.photoUrl || "",
  menu: (u.menu || []).map(publicMenuItem),
  ratingAvg: u.ratingAvg || 0,
  ratingCount: u.ratingCount || 0,
  myRating,
});
