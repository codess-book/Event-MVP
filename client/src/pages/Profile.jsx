import { useState } from "react";
import { mutate } from "swr";
import { Link, useNavigate } from "react-router-dom";
import {
  Menu,
  Bell,
  LogOut,
  Pencil,
  Phone,
  Ticket,
  User as UserIcon,
  UserRound,
  Vote,
  Trophy,
  ShieldCheck,
  Store,
  Plus,
  Megaphone,
  CalendarDays,
  Camera,
  ScrollText,
  Users,
  Gift,
} from "lucide-react";
import OfferCarousel from "../components/OfferCarousel";
import BottomNav from "../components/BottomNav";
import Avatar from "../components/Avatar";
import Sheet from "../components/Sheet";
import EditProfileSheet from "../components/EditProfileSheet";
import OfferSheet from "../components/OfferSheet";
import PushBanner from "../components/PushBanner";
import { useToast } from "../components/Toast";
import { useMe } from "../hooks/auth/useMe";
import { logout } from "../hooks/auth/useAuthMutations";
import { useDeleteOffer } from "../hooks/profile/useOffers";
import { useNotifications } from "../hooks/notifications/useNotifications";
import { useAdminStats } from "../hooks/admin/useAdminUsers";
import { useEvent } from "../hooks/events/useEvents"; // apne file ke naam se match karo
import { useWinners } from "../hooks/challenges/useChallenges";
import { removeDeviceToken } from "../lib/push";
import "../auth.css";
import "../profile.css";
import InstallBanner from "../components/InstallBanner";
import { Share2 } from "lucide-react";
import ShareAppSheet from "../components/ShareAppSheet";

const cap = (s) => (s ? s[0].toUpperCase() + s.slice(1) : "");

const fmtT = (t) => {
  const [h, m] = t.split(":").map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`;
};

export default function Profile() {
  // All hooks first, before any early return
  const { user } = useMe();
  const navigate = useNavigate();
  const toast = useToast();
  const del = useDeleteOffer();
  const { notifications, unread, markSeen } = useNotifications();
  const [panel, setPanel] = useState(null); // null | "menu" | "details" | "edit" | "offer" | "bell"
  const [editing, setEditing] = useState(null); // offer being edited, null = adding new
  const { stats } = useAdminStats(user?.role === "admin");
  const { items: eventItems } = useEvent();
  const { winners } = useWinners();
  const close = () => setPanel(null);

  if (!user) return null;

  const isSponsor = user.userType === "sponsor";
  const isAdmin = user.role === "admin";
  const offers = user.offers || [];

  // Event banner: ek slot dress code, ek challenge, ek agla schedule
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const nowHM = new Date().toLocaleTimeString("en-GB", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
  const todaysUpdates = eventItems.filter(
    (i) => i.kind === "update" && i.day === today,
  );
  const dress = todaysUpdates.find((i) => i.category === "dresscode");
  const challenge = todaysUpdates.find((i) => i.category === "challenge");
  const next = eventItems
    .filter((i) => i.kind === "schedule" && i.day === today && i.time >= nowHM)
    .sort((a, b) => a.time.localeCompare(b.time))[0];
  const bannerRows = [
    dress && ["👗 Dress code", dress.title],
    challenge && ["🏆 Challenge", challenge.title],
    next && [`⏰ ${fmtT(next.time)}`, next.title],
  ].filter(Boolean);

  const openOffer = (o = null) => {
    setEditing(o);
    setPanel("offer");
  };

  const onRemoveOffer = async (o) => {
    try {
      await del.trigger(o.id);
      toast("Offer removed");
    } catch (e) {
      toast(e.message, "error");
    }
  };

  // Token must be removed while the login token still exists
  const onLogout = async () => {
    await removeDeviceToken();
    logout();
    // Clear every cached API response so the next login never sees this user's data
    mutate(() => true, undefined, { revalidate: false });
    navigate("/login", { replace: true });
  };

  const openBell = () => {
    markSeen();
    setPanel("bell");
  };

  const items = [
    {
      icon: UserRound,
      title: "My Details",
      sub: "View your profile",
      action: () => setPanel("details"),
    },
    {
      icon: CalendarDays,
      title: "Event",
      sub: "Today, schedule & venue",
      to: "/event",
    },
    {
      icon: Camera,
      title: "Challenges",
      sub: "Upload today's photo",
      to: "/challenges",
    },
    { icon: Gift, title: "Prizes", sub: "See what you can win", to: "/prizes" },

    {
      icon: Users,
      title: "Members",
      sub: "Meet & contact the team",
      to: "/members",
    },
    {
      icon: ScrollText,
      title: "Rules & Support",
      sub: "नियम / Do's & don'ts",
      to: "/rules",
    },
    { icon: Vote, title: "Vote", sub: "Pick your favourites", soon: true },
    {
      icon: Trophy,
      title: "Leaderboard",
      sub: "See who is leading",
      soon: true,
    },

    ...(isAdmin
      ? [
          {
            icon: Users,
            title: "All Users",
            sub: "List & details",
            to: "/admin/users",
          },
          {
            icon: UserRound,
            title: "Players",
            sub: "Manage players",
            to: "/admin/players",
          },
          {
            icon: UserRound,
            title: "Members",
            sub: "Manage members",
            to: "/admin/members",
          },
          {
            icon: Store,
            title: "Manage Sponsors",
            sub: "Approve & categories",
            to: "/admin/sponsors",
          },
          {
            icon: ShieldCheck,
            title: "Reset Requests",
            sub: "Admin only",
            to: "/admin/resets",
          },
          {
            icon: Megaphone,
            title: "Send Notification",
            sub: "Admin only",
            to: "/admin/notify",
          },
          {
            icon: CalendarDays,
            title: "Manage Event",
            sub: "Admin only",
            to: "/admin/event",
          },
          {
            icon: Camera,
            title: "Challenge Photos",
            sub: "Pick winners",
            to: "/admin/challenges",
          },
        ]
      : []),
  ];

  const rows = [
    ["Name", user.name],
    ["Mobile", user.phone],
    ["Type", cap(user.userType)],
    user.passNumber && ["Pass number", user.passNumber],
    user.gender && ["Gender", cap(user.gender)],
    user.businessName && ["Business", user.businessName],
    user.sponsorCategory && ["Category", user.sponsorCategory],
  ].filter(Boolean);

  return (
    <div className="pf">
      <div className="pf__wrap">
        <header className="pf__hero">
          <div className="topbar">
            <button
              className="iconbtn"
              aria-label="Share app"
              onClick={() => setPanel("share")}
            >
              <Share2 size={20} />
            </button>

            <button
              className="iconbtn"
              aria-label="Open menu"
              onClick={() => setPanel("menu")}
            >
              <Menu size={22} />
            </button>

            <div className="topbar__right">
              <button
                className="iconbtn"
                aria-label="Notifications"
                onClick={openBell}
              >
                <Bell size={20} />
                {unread && panel !== "bell" && (
                  <span className="iconbtn__dot" />
                )}
              </button>
              <button
                className="iconbtn"
                aria-label="Log out"
                onClick={onLogout}
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>
        </header>

        <section className="pf__card">
          <div className="pf__avatarWrap">
            <Avatar user={user} />
            <button
              className="pf__edit"
              aria-label="Edit profile"
              onClick={() => setPanel("edit")}
            >
              <Pencil size={15} />
            </button>
          </div>
          <h1 className="pf__name">
            {isSponsor && user.businessName ? user.businessName : user.name}
          </h1>
          {isSponsor && user.businessName && (
            <p className="pf__owner">{user.name}</p>
          )}
          <span className="pf__badge">
            {cap(user.userType)}
            {user.sponsorCategory ? ` · ${user.sponsorCategory}` : ""}
          </span>
          <div className="chips2">
            <span className="chip2">
              <Phone size={14} /> {user.phone}
            </span>
            {user.passNumber && (
              <span className="chip2">
                <Ticket size={14} /> Pass {user.passNumber}
              </span>
            )}
            {user.gender && (
              <span className="chip2">
                <UserIcon size={14} /> {cap(user.gender)}
              </span>
            )}
          </div>
        </section>
        {winners[0] && (
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              gap: 16,
              margin: "18px 0",
              padding: "14px 16px",
              borderRadius: 20,
              overflow: "hidden",

              background:
                "linear-gradient(135deg, rgba(35,8,12,.98), rgba(74,12,22,.96) 55%, rgba(38,8,14,.98))",

              border: "1px solid rgba(242,196,109,.55)",

              boxShadow:
                "0 12px 35px rgba(0,0,0,.35), inset 0 1px 0 rgba(255,255,255,.08)",

              color: "#fff",
            }}
          >
            {/* Premium glow */}
            <div
              style={{
                position: "absolute",
                top: -70,
                right: -50,
                width: 160,
                height: 160,
                borderRadius: "50%",
                background: "rgba(242,196,109,.12)",
                filter: "blur(35px)",
                pointerEvents: "none",
              }}
            />

            {/* Gold accent line */}
            <div
              style={{
                position: "absolute",
                left: 0,
                top: 18,
                bottom: 18,
                width: 3,
                borderRadius: 10,
                background: "linear-gradient(#f8d98b, #c89235)",
                boxShadow: "0 0 12px rgba(242,196,109,.5)",
              }}
            />

            {/* Winner Image */}
            <div
              style={{
                position: "relative",
                flexShrink: 0,
                width: 78,
                height: 78,
                padding: 3,
                borderRadius: 17,
                background:
                  "linear-gradient(135deg, #f8d98b, #c89235, #f8d98b)",
                boxShadow: "0 5px 18px rgba(0,0,0,.35)",
              }}
            >
              <img
                src={winners[0].photoUrl}
                alt={`${winners[0].name}, winner`}
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: 14,
                  objectFit: "cover",
                  display: "block",
                }}
              />

              {/* Crown badge */}
              <div
                style={{
                  position: "absolute",
                  right: -7,
                  bottom: -7,
                  width: 27,
                  height: 27,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "#26080e",
                  border: "1px solid #f2c46d",
                  boxShadow: "0 4px 10px rgba(0,0,0,.35)",
                  fontSize: 13,
                }}
              >
                👑
              </div>
            </div>

            {/* Content */}
            <div
              style={{
                position: "relative",
                minWidth: 0,
                flex: 1,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 7,
                  color: "#f2c46d",
                  fontSize: 10,
                  fontWeight: 800,
                  letterSpacing: 1.5,
                  textTransform: "uppercase",
                  marginBottom: 5,
                }}
              >
                <Trophy size={14} strokeWidth={2.5} />
                <span>Challenge Winner</span>
              </div>

              <div
                style={{
                  fontSize: 19,
                  lineHeight: 1.2,
                  fontWeight: 800,
                  letterSpacing: "-0.2px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  color: "#fff",
                }}
              >
                {winners[0].name}
              </div>

              <div
                style={{
                  marginTop: 5,
                  fontSize: 12,
                  lineHeight: 1.4,
                  color: "rgba(255,255,255,.68)",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {winners[0].title}
              </div>
            </div>

            {/* Right-side award mark */}
            <div
              style={{
                position: "relative",
                flexShrink: 0,
                width: 38,
                height: 38,
                borderRadius: 12,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(242,196,109,.08)",
                border: "1px solid rgba(242,196,109,.2)",
                color: "#f2c46d",
              }}
            >
              <Trophy size={18} strokeWidth={1.8} />
            </div>
          </div>
        )}

        {isAdmin && stats && (
          <div
            className="chips2"
            style={{ justifyContent: "center", margin: "12px 0" }}
          >
            <Link to="/admin/users" className="chip2">
              Users {stats.total}
            </Link>
            <Link to="/admin/players" className="chip2">
              Players {stats.byType.player.total}
            </Link>
            <Link to="/admin/members" className="chip2">
              Members {stats.byType.member.total}
            </Link>
            <Link to="/admin/sponsors" className="chip2">
              Sponsors {stats.byType.sponsor.total}
              {stats.byType.sponsor.pending > 0 &&
                ` · ${stats.byType.sponsor.pending} pending`}
            </Link>
          </div>
        )}

        <Link
          to="/event"
          style={{
            display: "block",
            margin: "14px 0",
            padding: "14px 16px",
            borderRadius: 16,
            textDecoration: "none",
            color: "#fff",
            background: "linear-gradient(135deg,#6b0f1a,#8a1626)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              color: "#f2c46d",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
            }}
          >
            <CalendarDays size={16} /> TODAY AT AARADHNA
          </div>

          {bannerRows.length ? (
            bannerRows.map(([label, value]) => (
              <div
                key={label}
                style={{
                  display: "flex",
                  gap: 10,
                  marginTop: 8,
                  alignItems: "baseline",
                }}
              >
                <span
                  style={{
                    minWidth: 104,
                    fontSize: 12,
                    color: "#f2c46d",
                    fontWeight: 700,
                  }}
                >
                  {label}
                </span>
                <span style={{ fontWeight: 600 }}>{value}</span>
              </div>
            ))
          ) : (
            <div style={{ marginTop: 8, fontWeight: 600 }}>
              Nothing posted for today yet
            </div>
          )}

          <div style={{ marginTop: 10, fontSize: 13, opacity: 0.85 }}>
            Tap to see full event →
          </div>
        </Link>

        {!user.isApproved && (
          <div className="pf__notice">
            Your {user.userType} account is waiting for admin approval. You will
            appear in the app once it is approved.
          </div>
        )}
        <InstallBanner />

        <PushBanner />

        {isSponsor && (
          <>
            <div className="pf__sectionRow">
              <h2 className="pf__section" style={{ margin: 0 }}>
                Your offers ({offers.length}/5)
              </h2>
              {offers.length < 5 && offers.length > 0 && (
                <button className="smallbtn" onClick={() => openOffer()}>
                  <Plus size={15} /> Add
                </button>
              )}
            </div>

            {offers.length === 0 ? (
              <button
                className="offer offer--empty"
                onClick={() => openOffer()}
              >
                <span className="tile__ic">
                  <Plus size={22} />
                </span>
                <span>
                  <div className="tile__t">Add an offer</div>
                  <div className="tile__s">Players will see it in the app</div>
                </span>
              </button>
            ) : (
              <OfferCarousel
                offers={offers}
                onEdit={openOffer}
                onRemove={onRemoveOffer}
                removing={del.isMutating}
              />
            )}
          </>
        )}

        <h2 className="pf__section">Quick actions</h2>
        <div className="pf__grid">
          {items.map(({ icon: Icon, title, sub, action, to, soon }) => {
            const inner = (
              <>
                <span className="tile__ic">
                  <Icon size={22} />
                </span>
                <span>
                  <div className="tile__t">{title}</div>
                  <div className="tile__s">{sub}</div>
                </span>
                {soon && <span className="tile__soon">SOON</span>}
              </>
            );
            return to ? (
              <Link key={title} to={to} className="tile">
                {inner}
              </Link>
            ) : (
              <button
                key={title}
                className="tile"
                disabled={soon}
                onClick={action}
              >
                {inner}
              </button>
            );
          })}
        </div>

        <div className="pf__spacer" />
        <BottomNav />
      </div>
      {panel === "share" && <ShareAppSheet onClose={close} />}
      {panel === "menu" && (
        <div className="drawer__bg" onClick={close}>
          <aside
            className="drawer"
            aria-label="Menu"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="drawer__top">
              <Avatar user={user} className="drawer__avatar" />
              <div className="drawer__name">{user.name}</div>
              <div className="drawer__sub">
                {cap(user.userType)} · {user.phone}
              </div>
            </div>
            <nav className="drawer__list">
              {items.map(({ icon: Icon, title, action, to, soon }) =>
                to ? (
                  <Link
                    key={title}
                    to={to}
                    className="drawer__item"
                    onClick={close}
                  >
                    <Icon size={20} /> {title}
                  </Link>
                ) : (
                  <button
                    key={title}
                    className="drawer__item"
                    disabled={soon}
                    onClick={() => {
                      close();
                      action?.();
                    }}
                  >
                    <Icon size={20} /> {title} {soon && <small>SOON</small>}
                  </button>
                ),
              )}
            </nav>
            <div className="drawer__foot">
              <button className="drawer__item" onClick={onLogout}>
                <LogOut size={20} /> Log out
              </button>
            </div>
          </aside>
        </div>
      )}

      {panel === "details" && (
        <Sheet title="My Details" onClose={close}>
          {rows.map(([k, v]) => (
            <div className="row" key={k}>
              <span>{k}</span>
              <span>{v}</span>
            </div>
          ))}
        </Sheet>
      )}

      {panel === "edit" && <EditProfileSheet user={user} onClose={close} />}
      {panel === "offer" && isSponsor && (
        <OfferSheet offer={editing} onClose={close} />
      )}

      {panel === "bell" && (
        <Sheet title="Notifications" onClose={close}>
          {notifications.length === 0 ? (
            <p className="sheet__empty">
              <Bell size={34} />
              No notifications yet
            </p>
          ) : (
            <ul className="nlist">
              {notifications.map((n) => (
                <li key={n.id}>
                  <Link to={n.link || "/"} className="nitem" onClick={close}>
                    <div className="nitem__t">{n.title}</div>
                    <p className="nitem__b">{n.body}</p>
                    <time className="nitem__d">
                      {new Date(n.createdAt).toLocaleString("en-IN", {
                        day: "numeric",
                        month: "short",
                        hour: "numeric",
                        minute: "2-digit",
                        timeZone: "Asia/Kolkata",
                      })}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Sheet>
      )}
    </div>
  );
}
