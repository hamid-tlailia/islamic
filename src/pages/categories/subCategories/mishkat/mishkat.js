import React, { useCallback, useEffect, useRef, useState } from "react";
import "./mishkat.css";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "../../../../components/languages/provider";
import {
  askMishkat,
  parseMishkatReply,
  verifyAyah,
} from "../../../../lib/mishkat";

import SendRoundedIcon from "@mui/icons-material/SendRounded";
import StopRoundedIcon from "@mui/icons-material/StopRounded";
import DeleteOutlineRoundedIcon from "@mui/icons-material/DeleteOutlineRounded";
import MenuBookRoundedIcon from "@mui/icons-material/MenuBookRounded";
import FormatQuoteRoundedIcon from "@mui/icons-material/FormatQuoteRounded";
import BalanceRoundedIcon from "@mui/icons-material/BalanceRounded";
import LibraryBooksRoundedIcon from "@mui/icons-material/LibraryBooksRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import HelpOutlineRoundedIcon from "@mui/icons-material/HelpOutlineRounded";

const STORAGE_KEY = "mishkat:conversation";
const MAX_TURNS = 24;

const SUGGESTIONS = {
  ar: [
    "ما حكم الجمع بين الصلاتين في السفر؟",
    "كيف أقضي الصيام الذي فاتني بعذر؟",
    "ما شروط صحّة الوضوء؟",
    "ما الفرق بين الزكاة والصدقة؟",
  ],
  en: [
    "ما حكم الجمع بين الصلاتين في السفر؟",
    "كيف أقضي الصيام الذي فاتني بعذر؟",
    "ما شروط صحّة الوضوء؟",
    "ما الفرق بين الزكاة والصدقة؟",
  ],
};

const T = {
  ar: {
    title: "مِشْكاة",
    lede: "اسأل عن مسألة شرعية، ويُقابَل كل دليل بمصدره: الآيات تُجلب من المصحف بالرسم العثماني وتُقارن بما ورد في الجواب.",
    placeholder: "اكتب سؤالك الشرعي…",
    send: "أرسل",
    stop: "إيقاف",
    clear: "محادثة جديدة",
    thinking: "مِشْكاة تُجيب…",
    outOfScope: "خارج النطاق",
    evidence: "الأدلة",
    ayah: "آية",
    hadith: "حديث",
    views: "أقوال أهل العلم",
    references: "مراجع",
    followUps: "أسئلة تفتح الباب التالي",
    verified: "مُطابق للمصحف",
    mismatch: "لا يطابق نصّ المصحف",
    unchecked: "تعذّر التحقّق",
    checking: "يُتحقَّق…",
    indication: "وجه الدلالة",
    source: "المصدر",
    disclaimer:
      "الجواب من نموذج ذكاء اصطناعي وقد يخطئ في تنزيل الدليل على المسألة. ووسم «مُطابق للمصحف» يعني أن موضع النصّ ثبت، لا أن الاستدلال به صحيح. ولا يُعتمد فتوى في النوازل الشخصية؛ تُراجَع فيها دار إفتاء معتبرة.",
    suggestionsTitle: "ابدأ بسؤال",
    emptyTitle: "لم تبدأ محادثة بعد",
  },
  en: {
    title: "Mishkat",
    lede: "Ask a Shari'ah question. Every proof is matched against its source: cited ayat are fetched from the Uthmani mushaf and compared with what the answer quoted.",
    placeholder: "Type your question…",
    send: "Send",
    stop: "Stop",
    clear: "New conversation",
    thinking: "Mishkat is answering…",
    outOfScope: "Out of scope",
    evidence: "Evidence",
    ayah: "Ayah",
    hadith: "Hadith",
    views: "Scholarly views",
    references: "References",
    followUps: "Follow-up questions",
    verified: "Matches the mushaf",
    mismatch: "Does not match the mushaf",
    unchecked: "Could not verify",
    checking: "Verifying…",
    indication: "Relevance",
    source: "Source",
    disclaimer:
      "Answers come from an AI model and may misapply a proof. A “matches the mushaf” badge means the wording was found at that reference — not that the reasoning from it is sound. Do not treat this as a fatwa on a personal matter; consult a qualified mufti.",
    suggestionsTitle: "Start with a question",
    emptyTitle: "No conversation yet",
  },
};

/* ===================== Evidence cards ===================== */

function VerificationBadge({ status, t }) {
  const map = {
    verified: { cls: "ok", Icon: CheckCircleRoundedIcon, label: t.verified },
    mismatch: { cls: "warn", Icon: ErrorOutlineRoundedIcon, label: t.mismatch },
    unchecked: { cls: "muted", Icon: HelpOutlineRoundedIcon, label: t.unchecked },
    pending: { cls: "muted", Icon: HelpOutlineRoundedIcon, label: t.checking },
  };
  const { cls, Icon, label } = map[status] || map.pending;
  return (
    <span className={`mishkat-badge mishkat-badge--${cls}`}>
      <Icon fontSize="small" aria-hidden="true" />
      {label}
    </span>
  );
}

function AyahCard({ item, t }) {
  // Prefer the mushaf's own wording once it has been fetched.
  const text = item.text || item.quoted;
  return (
    <article className="mishkat-evidence">
      <header className="mishkat-evidence__head">
        <span className="mishkat-evidence__kind">
          <MenuBookRoundedIcon fontSize="small" aria-hidden="true" />
          {t.ayah}
        </span>
        <VerificationBadge status={item.status} t={t} />
      </header>

      <p className="mishkat-evidence__text u-quran">{text}</p>

      <p className="mishkat-evidence__ref">
        {item.surahName ? `${item.surahName} — ` : ""}
        {`[${item.surah}:${item.ayah}]`}
      </p>

      {item.status === "mismatch" && item.quoted && (
        <p className="mishkat-evidence__note">
          {t.mismatch}: «{item.quoted}»
        </p>
      )}

      {item.reasoning && (
        <p className="mishkat-evidence__why">
          <b>{t.indication}:</b> {item.reasoning}
        </p>
      )}
    </article>
  );
}

function HadithCard({ item, t }) {
  return (
    <article className="mishkat-evidence">
      <header className="mishkat-evidence__head">
        <span className="mishkat-evidence__kind">
          <FormatQuoteRoundedIcon fontSize="small" aria-hidden="true" />
          {t.hadith}
        </span>
      </header>

      <p className="mishkat-evidence__text">{item.matn}</p>

      {item.source && (
        <p className="mishkat-evidence__ref">
          {t.source}: {item.source}
        </p>
      )}

      {item.reasoning && (
        <p className="mishkat-evidence__why">
          <b>{t.indication}:</b> {item.reasoning}
        </p>
      )}
    </article>
  );
}

function Answer({ parsed, t, onFollowUp }) {
  const hasEvidence = parsed.ayat.length > 0 || parsed.ahadith.length > 0;

  return (
    <div className="mishkat-answer">
      {parsed.religious === false && (
        <p className="mishkat-chip mishkat-chip--warn">{t.outOfScope}</p>
      )}

      {parsed.topic && <p className="mishkat-answer__topic">{parsed.topic}</p>}

      {parsed.prose.split("\n").map(
        (paragraph, i) =>
          paragraph.trim() && (
            <p key={i} className="mishkat-answer__prose u-prose">
              {paragraph}
            </p>
          ),
      )}

      {hasEvidence && (
        <section className="mishkat-section">
          <h3 className="mishkat-section__title">{t.evidence}</h3>
          <div className="u-stack u-stack--tight">
            {parsed.ayat.map((item, i) => (
              <AyahCard key={`a${i}`} item={item} t={t} />
            ))}
            {parsed.ahadith.map((item, i) => (
              <HadithCard key={`h${i}`} item={item} t={t} />
            ))}
          </div>
        </section>
      )}

      {parsed.views.length > 0 && (
        <section className="mishkat-section">
          <h3 className="mishkat-section__title">
            <BalanceRoundedIcon fontSize="small" aria-hidden="true" /> {t.views}
          </h3>
          <ul className="mishkat-list">
            {parsed.views.map((view, i) => (
              <li key={i}>
                <b>{view.who}:</b> {view.what}
              </li>
            ))}
          </ul>
        </section>
      )}

      {parsed.references.length > 0 && (
        <section className="mishkat-section">
          <h3 className="mishkat-section__title">
            <LibraryBooksRoundedIcon fontSize="small" aria-hidden="true" />{" "}
            {t.references}
          </h3>
          <ul className="mishkat-list">
            {parsed.references.map((ref, i) => (
              <li key={i}>
                <b>{ref.name}</b>
                {ref.why ? ` — ${ref.why}` : ""}
              </li>
            ))}
          </ul>
        </section>
      )}

      {parsed.followUps.length > 0 && (
        <section className="mishkat-section">
          <h3 className="mishkat-section__title">{t.followUps}</h3>
          <div className="u-cluster">
            {parsed.followUps.map((question, i) => (
              <button
                key={i}
                type="button"
                className="u-btn u-btn--ghost mishkat-followup"
                onClick={() => onFollowUp(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/* ===================== Page ===================== */

const Mishkat = () => {
  const { language } = useTranslation();
  const t = T[language === "en" ? "en" : "ar"];

  const [turns, setTurns] = useState([]);
  const [draft, setDraft] = useState("");
  const [streaming, setStreaming] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const abortRef = useRef(null);
  const endRef = useRef(null);
  const askedFromUrl = useRef(false);

  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    document.title = `${t.title} | ${
      language === "en" ? "God's Religion" : "دين الله"
    }`;
  }, [t.title, language]);

  // Restore the previous conversation so a reload does not lose it.
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) setTurns(JSON.parse(saved));
    } catch {
      /* a corrupt entry just means starting fresh */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(turns.slice(-MAX_TURNS)));
    } catch {
      /* storage may be full or disabled; the conversation still works */
    }
  }, [turns]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [turns, streaming]);

  // Stop an in-flight answer if the reader leaves the page.
  useEffect(() => () => abortRef.current?.abort(), []);

  const ask = useCallback(
    async (question) => {
      const text = question.trim();
      if (!text || busy) return;

      setError("");
      setDraft("");
      setBusy(true);
      setStreaming("");

      const history = [
        ...turns.map((turn) => ({ role: turn.role, content: turn.content })),
        { role: "user", content: text },
      ];
      setTurns((prev) => [...prev, { role: "user", content: text }]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const raw = await askMishkat({
          messages: history.slice(-MAX_TURNS),
          onToken: setStreaming,
          signal: controller.signal,
        });

        const parsed = parseMishkatReply(raw);

        setTurns((prev) => [
          ...prev,
          { role: "assistant", content: raw, parsed },
        ]);
        setStreaming("");

        // Check each cited ayah against the mushaf, then patch the rendered
        // answer in place as the results arrive.
        parsed.ayat.forEach(async (citation, index) => {
          const result = await verifyAyah(citation, {
            signal: controller.signal,
          }).catch(() => null);
          if (!result) return;

          setTurns((prev) => {
            const next = [...prev];
            const turn = next[next.length - 1];
            if (!turn?.parsed?.ayat?.[index]) return prev;
            const ayat = [...turn.parsed.ayat];
            ayat[index] = { ...ayat[index], ...result };
            next[next.length - 1] = {
              ...turn,
              parsed: { ...turn.parsed, ayat },
            };
            return next;
          });
        });
      } catch (err) {
        if (err?.name !== "AbortError") setError(err.message);
        setStreaming("");
      } finally {
        setBusy(false);
        abortRef.current = null;
      }
    },
    [busy, turns],
  );

  /*
   * Another page can hand a question over as `?q=…` — the Quran page uses
   * this to ask about the ayah being read. The parameter is consumed once and
   * then cleared, so a reload does not ask again.
   */
  useEffect(() => {
    const question = searchParams.get("q");
    if (!question || askedFromUrl.current) return;
    askedFromUrl.current = true;
    setSearchParams({}, { replace: true });
    ask(question);
  }, [searchParams, setSearchParams, ask]);

  const stop = () => abortRef.current?.abort();

  const clear = () => {
    abortRef.current?.abort();
    setTurns([]);
    setStreaming("");
    setError("");
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      /* nothing to clean up */
    }
  };

  const onSubmit = (event) => {
    event.preventDefault();
    ask(draft);
  };

  const streamingParsed = streaming ? parseMishkatReply(streaming) : null;

  return (
    <div className="mishkat" dir="rtl">
      <header className="mishkat-head">
        <h1 className="mishkat-head__title">{t.title}</h1>
        <p className="mishkat-head__lede u-prose">{t.lede}</p>
      </header>

      <div className="mishkat-thread" role="log" aria-live="polite">
        {turns.length === 0 && !streaming && (
          <div className="u-empty">
            <span className="u-empty__icon" aria-hidden="true">
              🕯️
            </span>
            <p className="u-empty__title">{t.emptyTitle}</p>
            <p className="u-empty__body">{t.suggestionsTitle}</p>
            <div className="u-cluster mishkat-suggestions">
              {(SUGGESTIONS[language] || SUGGESTIONS.ar).map((s) => (
                <button
                  key={s}
                  type="button"
                  className="u-btn u-btn--ghost mishkat-followup"
                  onClick={() => ask(s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {turns.map((turn, i) =>
          turn.role === "user" ? (
            <p key={i} className="mishkat-question">
              {turn.content}
            </p>
          ) : (
            <Answer key={i} parsed={turn.parsed} t={t} onFollowUp={ask} />
          ),
        )}

        {streamingParsed && (
          <div className="mishkat-answer mishkat-answer--streaming">
            {streamingParsed.prose
              ? streamingParsed.prose
                  .split("\n")
                  .map(
                    (paragraph, i) =>
                      paragraph.trim() && (
                        <p key={i} className="mishkat-answer__prose u-prose">
                          {paragraph}
                        </p>
                      ),
                  )
              : null}
          </div>
        )}

        {busy && !streaming && (
          <div className="mishkat-answer" aria-label={t.thinking}>
            <div className="u-skeleton u-skeleton--title" />
            <div className="u-skeleton u-skeleton--text" />
            <div className="u-skeleton u-skeleton--text" />
          </div>
        )}

        {error && (
          <p className="mishkat-error" role="alert">
            {error}
          </p>
        )}

        <div ref={endRef} />
      </div>

      <form className="mishkat-composer" onSubmit={onSubmit}>
        <label className="u-visually-hidden" htmlFor="mishkat-input">
          {t.placeholder}
        </label>
        <input
          id="mishkat-input"
          className="mishkat-composer__input"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder={t.placeholder}
          disabled={busy}
          autoComplete="off"
        />

        {busy ? (
          <button type="button" className="u-btn" onClick={stop}>
            <StopRoundedIcon fontSize="small" aria-hidden="true" />
            {t.stop}
          </button>
        ) : (
          <button
            type="submit"
            className="u-btn u-btn--primary"
            disabled={!draft.trim()}
          >
            <SendRoundedIcon fontSize="small" aria-hidden="true" />
            {t.send}
          </button>
        )}

        {turns.length > 0 && (
          <button
            type="button"
            className="u-btn u-btn--ghost"
            onClick={clear}
            title={t.clear}
          >
            <DeleteOutlineRoundedIcon fontSize="small" aria-hidden="true" />
            <span className="u-visually-hidden">{t.clear}</span>
          </button>
        )}
      </form>

      <p className="mishkat-disclaimer">{t.disclaimer}</p>
    </div>
  );
};

export default Mishkat;
