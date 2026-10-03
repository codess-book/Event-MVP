import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Shirt, Ban, ShieldAlert, MessageCircleWarning, HeartHandshake, Users } from "lucide-react";
import BottomNav from "../components/BottomNav";
import "../auth.css";
import "../profile.css";
import "../sponsers.css";

// All text lives here, so editing a rule never touches the layout
const CONTENT = {
  en: {
    title: "Rules & Support",
    sub: "Let's keep Aaradhna safe and joyful for everyone",
    rules: [
      { icon: Shirt, t: "Dress decently", d: "Please wear proper, decent and traditional clothes suitable for a family garba event." },
      { icon: Ban, t: "No fights", d: "Fighting or arguing with anyone is strictly not allowed." },
      { icon: ShieldAlert, t: "No mischief", d: "Do not trouble, tease or misbehave with anyone, and do not damage anything at the venue." },
      { icon: MessageCircleWarning, t: "No abusive language", d: "Please do not use bad words or abuse. Speak with respect to everyone." },
      { icon: HeartHandshake, t: "Cooperate with the team", d: "Follow the instructions of the core team and volunteers. Your cooperation helps us run a smooth event." },
    ],
    note: "Anyone who breaks these rules may be asked to leave the venue. Thank you for your support, we will do our best to give you a great experience.",
    helpT: "Need help?",
    helpD: "Contact any core team member.",
    helpBtn: "Contact the team",
  },
  hi: {
    title: "नियम और सहायता",
    sub: "आइए आराधना को सबके लिए सुरक्षित और आनंदमय बनाएं",
    rules: [
      { icon: Shirt, t: "सभ्य कपड़े पहनें", d: "कृपया पारिवारिक गरबा कार्यक्रम के अनुसार उचित, सभ्य और पारंपरिक कपड़े पहनकर आएं।" },
      { icon: Ban, t: "लड़ाई-झगड़ा नहीं", d: "किसी के साथ लड़ाई या बहस करना सख्त मना है।" },
      { icon: ShieldAlert, t: "शरारत नहीं", d: "किसी को परेशान न करें, छेड़छाड़ या बदतमीज़ी न करें, और कार्यक्रम स्थल की किसी चीज़ को नुकसान न पहुंचाएं।" },
      { icon: MessageCircleWarning, t: "गाली-गलौज नहीं", d: "कृपया अपशब्द या गाली का प्रयोग न करें। सभी से सम्मान के साथ बात करें।" },
      { icon: HeartHandshake, t: "टीम का सहयोग करें", d: "कोर टीम और वॉलंटियर्स के निर्देशों का पालन करें। आपका सहयोग कार्यक्रम को सुचारु रखने में मदद करता है।" },
    ],
    note: "जो भी इन नियमों का उल्लंघन करेगा, उसे कार्यक्रम स्थल से बाहर किया जा सकता है। आपके सहयोग के लिए धन्यवाद, हम आपको बेहतरीन अनुभव देने की पूरी कोशिश करेंगे।",
    helpT: "मदद चाहिए?",
    helpD: "किसी भी कोर टीम सदस्य से संपर्क करें।",
    helpBtn: "टीम से संपर्क करें",
  },
};

export default function Rules() {
  const [lang, setLang] = useState("en");
  const c = CONTENT[lang];

  return (
    <div className="pf">
      <div className="pf__wrap">
        <header className="sp__bar">
          <Link to="/profile" className="iconbtn" aria-label="Back"><ArrowLeft size={22} /></Link>
          <span className="sp__barTitle">{c.title}</span>
          <span style={{ width: 42 }} />
        </header>

        <div className="sp__tabs" role="tablist" aria-label="Language">
          <button role="tab" aria-selected={lang === "en"} onClick={() => setLang("en")}>English</button>
          <button role="tab" aria-selected={lang === "hi"} onClick={() => setLang("hi")}>हिन्दी</button>
        </div>

        <p className="rules__sub">{c.sub}</p>

        <div className="sp__list">
          {c.rules.map(({ icon: Icon, t, d }, i) => (
            <article key={i} className="rule">
              <span className="tile__ic"><Icon size={22} /></span>
              <div>
                <h3 className="rule__t">{t}</h3>
                <p className="rule__d">{d}</p>
              </div>
            </article>
          ))}

          <p className="pf__notice" style={{ margin: 0 }}>{c.note}</p>

          <div className="rule rule--help">
            <span className="tile__ic"><Users size={22} /></span>
            <div style={{ flex: 1 }}>
              <h3 className="rule__t">{c.helpT}</h3>
              <p className="rule__d">{c.helpD}</p>
              <Link to="/members" className="smallbtn" style={{ marginTop: 10, textDecoration: "none" }}>
                {c.helpBtn}
              </Link>
            </div>
          </div>
        </div>

        <div className="pf__spacer" />
        <BottomNav />
      </div>
    </div>
  );
}