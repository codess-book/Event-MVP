// pages/Rules.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Users,
  UserCheck,
  Ticket,
  Clock,
  Music2,
  AlertOctagon,
  Ban,
  Wine,
  ShieldCheck,
  Sparkles,
  Swords,
  ScrollText,
  HeartHandshake,
  CheckCircle2,
  Languages,
} from "lucide-react";
import BottomNav from "../components/BottomNav";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";
import "../rules.css";

/* ============================================================
   CONTENT — English + Hindi
   ============================================================ */
const CONTENT = {
  en: {
    title: "Rules & Regulations",
    subtitle: "Couple Garba — please read carefully",
    badge: "Aaradhna 2026",
    rules: [
      {
        icon: Users,
        t: "Two participants per couple",
        d: "A couple will consist of two participants — one male and one female, or two females only. Two males cannot perform Garba together.",
      },
      {
        icon: UserCheck,
        t: "Registration is mandatory",
        d: "Both participants must be registered. Participation without registration is not allowed.",
      },
      {
        icon: Ticket,
        t: "Entry time is fixed",
        d: "Entry to the competition will only be valid until the pre-decided time.",
      },
      {
        icon: Music2,
        t: "No vulgar songs",
        d: "Vulgar or filmi songs will not be played during Garba. Pass holders or members will not pressure the DJ to play such songs.",
      },
      {
        icon: AlertOctagon,
        t: "No objectionable performance",
        d: "Any indecent, objectionable, or religiously / socially offensive performance is strictly prohibited.",
      },
      {
        icon: Clock,
        t: "Report by 9:00 – 9:30 PM",
        d: "Participants must be present at the venue between 9:00 PM and 9:30 PM.",
      },
      {
        icon: Ban,
        t: "No political content",
        d: "Display of any political, objectionable or controversial material is strictly prohibited.",
      },
      {
        icon: ShieldCheck,
        t: "Damage = responsibility",
        d: "Any damage to the stage, sound system or event material will be the responsibility of the concerned participant.",
      },
      {
        icon: Swords,
        t: "Discipline is a must",
        d: "Any participant who misbehaves or breaks discipline during the event may be removed from the premises.",
      },
      {
        icon: ScrollText,
        t: "Organiser's rights",
        d: "The organisers reserve the right to make reasonable changes or amendments to the rules if required.",
      },
      {
        icon: Sparkles,
        t: "Tilak is compulsory",
        d: "All pass holders must apply a tilak on their forehead.",
      },
      {
        icon: CheckCircle2,
        t: "Acceptance of rules",
        d: "By participating in Garba, participants are deemed to have accepted all rules and conditions.",
      },
      {
        icon: Wine,
        t: "No alcohol or intoxicants",
        d: "Participants under the influence of alcohol or any intoxicating substance will not be allowed entry.",
      },
    ],
    note:
      "Anyone found violating these rules may be asked to leave the venue. Thank you for your cooperation — we will do our best to give you a wonderful experience.",
    helpT: "Need help?",
    helpD: "Contact any core team member for assistance.",
    helpBtn: "Contact the team",
  },

  hi: {
    title: "नियम एवं शर्तें",
    subtitle: "कपल गरबा — कृपया ध्यान से पढ़ें",
    badge: "आराधना 2026",
    rules: [
      {
        icon: Users,
        t: "एक कपल में दो प्रतिभागी",
        d: "एक कपल में दो प्रतिभागी होंगे — एक पुरुष एवं एक महिला अथवा दो महिलाएँ। दो पुरुष एक साथ गरबा नहीं कर सकेंगे।",
      },
      {
        icon: UserCheck,
        t: "रजिस्ट्रेशन अनिवार्य है",
        d: "दोनों प्रतिभागियों का रजिस्ट्रेशन अनिवार्य होगा। बिना पंजीयन आयोजन में भाग नहीं लिया जा सकेगा।",
      },
      {
        icon: Ticket,
        t: "प्रवेश समय निश्चित है",
        d: "प्रतियोगिता में प्रवेश पूर्व निर्धारित समय तक ही मान्य होगा।",
      },
      {
        icon: Music2,
        t: "अश्लील गाने प्रतिबंधित",
        d: "गरबा में अश्लील फिल्मी गाने नहीं बजाए जाएंगे। पास धारक अथवा सदस्य डीजे संचालक पर अश्लील गाने बजाने का दबाव नहीं बनाएंगे।",
      },
      {
        icon: AlertOctagon,
        t: "आपत्तिजनक प्रस्तुति नहीं",
        d: "अशोभनीय, आपत्तिजनक अथवा किसी की धार्मिक / सामाजिक भावना को ठेस पहुँचाने वाली प्रस्तुति नहीं की जाएगी।",
      },
      {
        icon: Clock,
        t: "रात 9:00 – 9:30 तक उपस्थित",
        d: "प्रतिभागियों को आयोजन स्थल पर रात 9:00 से 9:30 बजे तक उपस्थित होना होगा।",
      },
      {
        icon: Ban,
        t: "राजनीतिक सामग्री प्रतिबंधित",
        d: "किसी भी प्रकार की राजनीतिक, आपत्तिजनक अथवा विवादित सामग्री का प्रदर्शन प्रतिबंधित रहेगा।",
      },
      {
        icon: ShieldCheck,
        t: "नुकसान की जिम्मेदारी",
        d: "मंच, साउंड सिस्टम अथवा आयोजन सामग्री को नुकसान पहुँचाने पर संबंधित प्रतिभागी जिम्मेदार होगा।",
      },
      {
        icon: Swords,
        t: "अनुशासन आवश्यक है",
        d: "आयोजन के दौरान अनुशासनहीनता करने वाले प्रतिभागी को परिसर से बाहर किया जा सकता है।",
      },
      {
        icon: ScrollText,
        t: "आयोजक के अधिकार",
        d: "आयोजक आवश्यकता पड़ने पर नियमों में उचित परिवर्तन / संशोधन करने का अधिकार रखते हैं।",
      },
      {
        icon: Sparkles,
        t: "तिलक लगाना अनिवार्य",
        d: "पास धारकों को ललाट पर तिलक लगाना अनिवार्य होगा।",
      },
      {
        icon: CheckCircle2,
        t: "नियमों की स्वीकृति",
        d: "गरबा में भाग लेने का अर्थ है कि प्रतिभागी ने सभी नियम एवं शर्तें स्वीकार कर ली हैं।",
      },
      {
        icon: Wine,
        t: "शराब एवं मादक पदार्थ प्रतिबंधित",
        d: "शराब अथवा किसी भी मादक पदार्थ का सेवन करने वाले प्रतिभागी को प्रवेश नहीं दिया जाएगा।",
      },
    ],
    note:
      "जो भी इन नियमों का उल्लंघन करेगा, उसे कार्यक्रम स्थल से बाहर किया जा सकता है। आपके सहयोग के लिए धन्यवाद — हम आपको बेहतरीन अनुभव देने की पूरी कोशिश करेंगे।",
    helpT: "मदद चाहिए?",
    helpD: "किसी भी कोर टीम सदस्य से संपर्क करें।",
    helpBtn: "टीम से संपर्क करें",
  },
};

/* ------------------------------ component ------------------------------ */
export default function Rules() {
  const [lang, setLang] = useState("en");
  const c = CONTENT[lang];

  return (
    <div className="pf">
      <div className="pf__wrap">
        <div className="rlx">
          {/* ---------- HEADER ---------- */}
          <header className="rlx__header">
            <Link to="/profile" className="rlx__backBtn" aria-label="Back">
              <ArrowLeft size={20} strokeWidth={2.4} />
            </Link>

            <div className="rlx__headerCenter">
              <span className="rlx__headerEyebrow">
                <Sparkles size={11} />
                {c.badge}
              </span>
              <h1 className="rlx__headerTitle">{c.title}</h1>
            </div>

            <span style={{ width: 42 }} />
          </header>

          {/* ---------- LANGUAGE SWITCH ---------- */}
          <div className="rlx__langWrap">
            <div className="rlx__lang" role="tablist" aria-label="Language">
              <button
                type="button"
                role="tab"
                aria-selected={lang === "en"}
                className={`rlx__langBtn ${lang === "en" ? "is-active" : ""}`}
                onClick={() => setLang("en")}
              >
                <Languages size={13} />
                English
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={lang === "hi"}
                className={`rlx__langBtn ${lang === "hi" ? "is-active" : ""}`}
                onClick={() => setLang("hi")}
              >
                <Languages size={13} />
                हिन्दी
              </button>
            </div>
          </div>

          {/* ---------- SUBTITLE ---------- */}
          <p className="rlx__sub">{c.subtitle}</p>

          {/* ---------- RULES LIST ---------- */}
          <div className="rlx__list">
            {c.rules.map(({ icon: Icon, t, d }, i) => (
              <article key={i} className="rlx__rule">
                <span className="rlx__ruleNum">{String(i + 1).padStart(2, "0")}</span>

                <div className="rlx__ruleBody">
                  <div className="rlx__ruleHead">
                    <span className="rlx__ruleIcon">
                      <Icon size={16} strokeWidth={2.2} />
                    </span>
                    <h3 className="rlx__ruleTitle">{t}</h3>
                  </div>
                  <p className="rlx__ruleDesc">{d}</p>
                </div>
              </article>
            ))}
          </div>

          {/* ---------- NOTE ---------- */}
          <div className="rlx__note">
            <div className="rlx__noteGlow" aria-hidden="true" />
            <div className="rlx__noteHead">
              <AlertOctagon size={16} />
              <strong>Important</strong>
            </div>
            <p>{c.note}</p>
          </div>

          {/* ---------- HELP ---------- */}
          <div className="rlx__help">
            <div className="rlx__helpIcon">
              <HeartHandshake size={20} />
            </div>
            <div className="rlx__helpText">
              <h3>{c.helpT}</h3>
              <p>{c.helpD}</p>
            </div>
            <Link to="/members" className="rlx__helpBtn">
              {c.helpBtn}
            </Link>
          </div>

          <div className="pf__spacer" />
          <BottomNav />
        </div>
      </div>
    </div>
  );
}