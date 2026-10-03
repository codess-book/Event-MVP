import { useState } from "react";
import { Gift, Trophy, User as UserIcon } from "lucide-react";
import Sheet from "./Sheet";
import IconField from "./IconField";
import { useToast } from "./Toast";
import { useAddPrize, useEditPrize } from "../hooks/prizes/usePrizes";
import { useSponsors } from "../hooks/sponsors/useSponsors";

// `prize` is null when adding. `isAdmin` shows the donor picker.
export default function PrizeSheet({ prize, isAdmin, onClose }) {
  const toast = useToast();
  const add = useAddPrize();
  const edit = useEditPrize();
  const { isMutating, error, reset } = prize ? edit : add;
  const { sponsors } = useSponsors();
  const [form, setForm] = useState({
    title: prize?.title || "",
    forWhat: prize?.forWhat || "",
    description: prize?.description || "",
    sponsorId: "",
    donorName: "",
  });

  const onChange = (e) => {
    reset();
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    // Donor fields are only sent when an admin adds a new prize
    const body = { title: form.title, forWhat: form.forWhat, description: form.description };
    if (!prize && isAdmin) {
      if (form.sponsorId) body.sponsorId = form.sponsorId;
      else body.donorName = form.donorName;
    }
    try {
      if (prize) await edit.trigger({ id: prize.id, prize: body });
      else await add.trigger(body);
      toast(prize ? "Prize updated" : "Prize added");
      onClose();
    } catch { /* shown from `error` */ }
  };

  return (
    <Sheet title={prize ? "Edit prize" : "Add a prize"} onClose={onClose}>
      <form className="sheet__form" onSubmit={onSubmit}>
        <IconField icon={Gift} id="p-title" name="title" label="Prize"
          placeholder="e.g. Gold coin or ₹5,000 voucher" maxLength={80}
          value={form.title} onChange={onChange} required />
        <IconField icon={Trophy} id="p-for" name="forWhat" label="For (optional)"
          placeholder="e.g. Best Dressed Couple" maxLength={60}
          value={form.forWhat} onChange={onChange} />

        <div className="f2 f2--area">
          <div className="f2__body">
            <label htmlFor="p-desc">Details (optional)</label>
            <textarea id="p-desc" name="description" rows={3} maxLength={300}
              value={form.description} onChange={onChange} />
          </div>
        </div>

        {!prize && isAdmin && (
          <>
            <select className="adm__select" name="sponsorId" value={form.sponsorId} onChange={onChange}>
              <option value="">Given by someone else (type name)</option>
              {sponsors.map((s) => <option key={s.id} value={s.id}>{s.businessName}</option>)}
            </select>
            {!form.sponsorId && (
              <IconField icon={UserIcon} id="p-donor" name="donorName" label="Donor name"
                placeholder="e.g. Rajesh Patel" maxLength={60}
                value={form.donorName} onChange={onChange} required />
            )}
          </>
        )}

        {error && <div className="a2__err" role="alert">{error.message}</div>}
        <button className="a2__btn" disabled={isMutating}>
          {isMutating ? "Saving…" : prize ? "Save changes" : "Add prize"}
        </button>
      </form>
    </Sheet>
  );
}