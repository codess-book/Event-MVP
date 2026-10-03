// Offers sorted so live ones come first and expired ones last
export const publicOffers = (offers = []) =>
  offers
    .filter((o) => o?.title)
    .map((o) => ({
      id: o._id,
      title: o.title,
      description: o.description || "",
      code: o.code || "",
      validTill: o.validTill || null,
      expired: !!o.validTill && new Date(o.validTill) < new Date(),
    }))
    .sort((a, b) => Number(a.expired) - Number(b.expired));
