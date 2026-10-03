import { useState } from "react";
import { Tag, Ticket, CalendarDays } from "lucide-react";
import Sheet from "./Sheet";
import IconField from "./IconField";
import { useAddOffer, useEditOffer } from "../hooks/profile/useOffers";
import { useToast } from "./Toast";
// "2026-10-20" in IST, which is what the <input type="date"> expects
const toDateInput = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-CA", { timeZone: "Asia/Kolkata" })
    : "";

// `offer` is null when adding a new one
export default function OfferSheet({ offer, onClose }) {
  const add = useAddOffer();
  const edit = useEditOffer();
  const { isMutating, error, reset } = offer ? edit : add;
  const [form, setForm] = useState({
    title: offer?.title || "",
    description: offer?.description || "",
    code: offer?.code || "",
    validTill: toDateInput(offer?.validTill),
  });

  const toast = useToast();
  const onChange = (e) => {
    reset();
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (offer) await edit.trigger({ id: offer.id, offer: form });
      else await add.trigger(form);
      toast(offer ? "Offer updated" : "Offer added");
      onClose();
    } catch {
      /* shown from `error` */
    }
  };

  return (
    <Sheet title={offer ? "Edit offer" : "Add an offer"} onClose={onClose}>
      <form className="sheet__form" onSubmit={onSubmit}>
        <IconField
          icon={Tag}
          id="o-title"
          name="title"
          label="Offer title"
          placeholder="e.g. Flat 10% off on pre-wedding shoots"
          maxLength={80}
          value={form.title}
          onChange={onChange}
          required
        />

        <div className="f2 f2--area">
          <div className="f2__body">
            <label htmlFor="o-desc">Description (optional)</label>
            <textarea
              id="o-desc"
              name="description"
              rows={3}
              maxLength={300}
              placeholder="Show your Aaradhna pass at the counter"
              value={form.description}
              onChange={onChange}
            />
          </div>
        </div>

        <IconField
          icon={Ticket}
          id="o-code"
          name="code"
          label="Offer code (optional)"
          placeholder="e.g. GARBA10"
          autoCapitalize="characters"
          maxLength={20}
          value={form.code}
          onChange={onChange}
        />

        <IconField
          icon={CalendarDays}
          id="o-date"
          name="validTill"
          label="Valid till (optional)"
          type="date"
          value={form.validTill}
          onChange={onChange}
        />

        {error && (
          <div className="a2__err" role="alert">
            {error.message}
          </div>
        )}
        <button className="a2__btn" disabled={isMutating}>
          {isMutating ? "Saving…" : offer ? "Save changes" : "Add offer"}
        </button>
      </form>
    </Sheet>
  );
}
