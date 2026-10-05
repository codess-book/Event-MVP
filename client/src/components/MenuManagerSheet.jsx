// components/MenuManagerSheet.jsx
import { useState } from "react";
import {
  UtensilsCrossed,
  IndianRupee,
  Tag,
  Plus,
  Check,
  Trash2,
  Pencil,
  X,
  Loader2,
  Sparkles,
  AlertCircle,
  Eye,
  EyeOff,
  Inbox,
} from "lucide-react";
import Sheet from "./Sheet";
import IconField from "./IconField";
import { useToast } from "./Toast";
import {
  useAddMenuItem,
  useUpdateMenuItem,
  useDeleteMenuItem,
} from "../hooks/food/useFood";
import "../food.css";
import "../menu-manager.css";

const EMPTY = { name: "", price: "", category: "" };
const MAX_ITEMS = 40;

/* ------------------------------ item card ------------------------------ */
function MenuItemCard({ item, busy, onEdit, onToggle, onRemove }) {
  return (
    <article className={`mmx__item ${item.available ? "" : "is-off"}`}>
      {/* left: status dot + name */}
      <div className="mmx__itemMain">
        <div className="mmx__itemRow">
          <span
            className={`mmx__status ${item.available ? "is-live" : "is-off"}`}
            title={item.available ? "Available" : "Sold out"}
          />
          <h4 className="mmx__itemName">{item.name}</h4>
        </div>

        <div className="mmx__itemMeta">
          <span className="mmx__price">
            <IndianRupee size={12} /> {item.price}
          </span>
          {item.category && (
            <span className="mmx__catChip">
              <Tag size={10} /> {item.category}
            </span>
          )}
        </div>
      </div>

      {/* right: actions */}
      <div className="mmx__itemActions">
        <button
          type="button"
          className={`mmx__actionBtn mmx__actionBtn--toggle ${
            item.available ? "" : "is-off"
          }`}
          disabled={busy}
          onClick={() => onToggle(item)}
          title={item.available ? "Mark sold out" : "Mark available"}
          aria-label={item.available ? "Mark sold out" : "Mark available"}
        >
          {item.available ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button
          type="button"
          className="mmx__actionBtn mmx__actionBtn--edit"
          disabled={busy}
          onClick={() => onEdit(item)}
          aria-label={`Edit ${item.name}`}
        >
          <Pencil size={14} />
        </button>
        <button
          type="button"
          className="mmx__actionBtn mmx__actionBtn--danger"
          disabled={busy}
          onClick={() => onRemove(item)}
          aria-label={`Delete ${item.name}`}
        >
          <Trash2 size={14} />
        </button>
      </div>
    </article>
  );
}

/* ------------------------------ main ------------------------------ */
export default function MenuManagerSheet({ user, onClose }) {
  const toast = useToast();
  const add = useAddMenuItem();
  const upd = useUpdateMenuItem();
  const del = useDeleteMenuItem();
  const busy = add.isMutating || upd.isMutating || del.isMutating;

  const [form, setForm] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [err, setErr] = useState("");
  const menu = user.menu || [];
  const nearLimit = menu.length >= MAX_ITEMS * 0.8;

  const reset = () => {
    setForm(EMPTY);
    setEditId(null);
    setErr("");
  };

  const submit = async (e) => {
    e.preventDefault();
    if (busy) return;
    const name = form.name.trim();
    if (name.length < 2) return setErr("Item name is too short");
    if (form.price === "") return setErr("Enter a price");

    const payload = {
      name,
      price: Number(form.price),
      category: form.category.trim(),
    };

    try {
      if (editId) await upd.trigger({ id: editId, patch: payload });
      else await add.trigger(payload);
      toast(editId ? "Item updated" : "Item added", "success");
      reset();
    } catch (ex) {
      setErr(ex.message || "Could not save item");
    }
  };

  const startEdit = (i) => {
    setEditId(i.id);
    setForm({
      name: i.name,
      price: String(i.price),
      category: i.category || "",
    });
    setErr("");
  };

  const toggle = async (i) => {
    try {
      await upd.trigger({ id: i.id, patch: { available: !i.available } });
      toast(i.available ? "Marked sold out" : "Marked available", "success");
    } catch (ex) {
      toast(ex.message, "error");
    }
  };

  const remove = async (i) => {
    if (!window.confirm(`Delete "${i.name}"?`)) return;
    try {
      await del.trigger(i.id);
      if (editId === i.id) reset();
      toast("Item removed", "success");
    } catch (ex) {
      toast(ex.message, "error");
    }
  };

  return (
    <Sheet title="My menu" onClose={onClose}>
      <div className="mmx">
        {/* ---------- INTRO ---------- */}
        <div className="mmx__intro">
          <div className="mmx__introIcon">
            <UtensilsCrossed size={18} />
          </div>
          <div className="mmx__introText">
            <p>
              {editId ? "Editing an item" : "Add items for your stall"}
            </p>
            <span>
              {editId
                ? "Make your changes and tap Update"
                : "Players see this menu in the app"}
            </span>
          </div>
        </div>

        {/* ---------- FORM ---------- */}
        <form className="mmx__form" onSubmit={submit} noValidate>
          <IconField
            icon={UtensilsCrossed}
            id="m-name"
            label="Item name"
            value={form.name}
            onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            maxLength={60}
            disabled={busy}
            autoComplete="off"
          />

          <div className="mmx__row">
            <IconField
              icon={IndianRupee}
              id="m-price"
              label="Price (₹)"
              inputMode="numeric"
              maxLength={6}
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  price: e.target.value.replace(/\D/g, ""),
                }))
              }
              disabled={busy}
            />
            <IconField
              icon={Tag}
              id="m-cat"
              label="Category"
              placeholder="Snacks, Drinks…"
              maxLength={30}
              value={form.category}
              onChange={(e) =>
                setForm((f) => ({ ...f, category: e.target.value }))
              }
              disabled={busy}
              autoComplete="off"
            />
          </div>

          {err && (
            <div className="mmx__err" role="alert">
              <AlertCircle size={14} />
              <span>{err}</span>
            </div>
          )}

          <div className="mmx__formActions">
            {editId && (
              <button
                type="button"
                className="mmx__btn mmx__btn--ghost"
                onClick={reset}
                disabled={busy}
              >
                <X size={15} /> Cancel
              </button>
            )}
            <button
              type="submit"
              className="mmx__btn mmx__btn--primary"
              disabled={busy}
            >
              {busy && editId ? (
                <>
                  <Loader2 size={15} className="spin" /> Saving…
                </>
              ) : editId ? (
                <>
                  <Check size={15} /> Update item
                </>
              ) : (
                <>
                  <Plus size={15} /> Add item
                </>
              )}
            </button>
          </div>
        </form>

        {/* ---------- ITEMS LIST ---------- */}
        <section className="mmx__listSection">
          <header className="mmx__listHead">
            <h3 className="mmx__listTitle">
              <Sparkles size={13} /> Your items
            </h3>
            <span
              className={`mmx__listCount ${nearLimit ? "is-near" : ""}`}
            >
              {menu.length}/{MAX_ITEMS}
            </span>
          </header>

          {menu.length === 0 ? (
            <div className="mmx__empty">
              <div className="mmx__emptyIcon">
                <Inbox size={22} />
              </div>
              <p className="mmx__emptyTitle">No items yet</p>
              <p className="mmx__emptyText">Add your first one above.</p>
            </div>
          ) : (
            <div className="mmx__items">
              {menu.map((i) => (
                <MenuItemCard
                  key={i.id}
                  item={i}
                  busy={busy}
                  onEdit={startEdit}
                  onToggle={toggle}
                  onRemove={remove}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </Sheet>
  );
}