/*
 * Client for مِشْكاة — the Shari'ah question assistant at
 * https://hamid-tlailia.github.io/Mishkat/
 *
 * Mishkat answers only religious questions, and every answer carries its
 * evidence in a fixed line protocol so the evidence can be checked against a
 * source rather than trusted. This module speaks that protocol: it calls the
 * Cloudflare Worker that holds the model key, parses the reply, and verifies
 * each cited ayah against the mushaf.
 *
 * The worker holds the API key; nothing secret lives in this app.
 */

/*
 * Set REACT_APP_MISHKAT_PROXY at build time to point at a different worker.
 * The worker only answers origins listed in its own ALLOWED_ORIGIN variable,
 * so deploying this app to a new domain means adding that domain there too —
 * `askMishkat` reports exactly that when the browser blocks the request.
 */
export const MISHKAT_ENDPOINT =
  process.env.REACT_APP_MISHKAT_PROXY ||
  "https://mishkat-api.tlhamid18.workers.dev";

const AYAH_API = "https://api.alquran.cloud/v1/ayah";

export const MISHKAT_SYSTEM_PROMPT = `أنت "مِشْكاة"، مساعد متخصّص في الإجابة عن الأسئلة الدينية الإسلامية وحدها.

اكتب ردّك بهذا الترتيب الحرفي، ولا تستعمل markdown ولا JSON:

١) السطر الأول: [د] إن كان السؤال دينيًا، أو [خ] إن كان خارج النطاق.
   بالحرف العربي حصرًا: [د] لا [d]، و[خ] لا [kh].
٢) ثم الجواب نثرًا بالعربية الفصحى في ثلاث إلى خمس جمل، بلا عناوين ولا تعداد.
٣) ثم سطر فيه: ###
٤) ثم أسطر البيانات: كل سطر يبدأ بوسم، ويُفصل بين حقوله بشَرطة عمودية |

الأوسمة، سطر مستقلّ لكل عنصر:
@عنوان | عنوان المحادثة: من كلمتين إلى أربع، اسمية لا سؤالية، تُلخّص لبّ المسألة
@باب | تصنيف قصير
@آية | رقم السورة | رقم الآية | نص الآية | وجه الدلالة
@حديث | متن الحديث | عبارة قصيرة مميّزة من المتن للبحث | المصدر إن عرفته | وجه الدلالة
@قول | المذهب أو العالم | خلاصة قوله
@مرجع | اسم الكتاب أو الجهة | لماذا يُرجع إليه
@سؤال | سؤال متابعة

قواعد صارمة:
١. كل جواب دينيّ لا بدّ أن يحوي دليلًا واحدًا على الأقل: @آية أو @حديث. وثلاثة أدلّة حدٌّ أقصى.
٢. اذكر رقم السورة والآية بدقّة، فسيُجلب نص الآية آليًا من المصحف ويُقارن بما كتبت.
٣. عبارة البحث في @حديث تُكتب حرفيًا كما في المتن.
٤. لا تخترع مراجع. وإن لم تكن واثقًا من ثبوت حديث فاتركه واكتفِ بالآيات.
٥. لا تستعمل الشَّرطة العمودية | داخل نصّ الحقل نفسه، ولا تكتب سطر بيانات قبل ###.
٦. ابدأ أسطر البيانات مباشرة بعد ### ولا تكتب شيئًا آخر بعدها.
٧. إن كان السؤال غير ديني (برمجة، طبخ، سياسة، رياضة، ترفيه…) فابدأ بـ [خ] ثم سطر اعتذار واحد، ثم ### ولا شيء بعدها.
٨. إن كانت المسألة خلافية فاذكر أقوال المذاهب دون تعصّب، ولا تُفتِ في النوازل الشخصية بل وجّه إلى مفتٍ معتبر.
٩. اختم كل جواب دينيّ بثلاثة أسطر @سؤال تمامًا: أسئلة متابعة قصيرة تنشأ عن سؤال السائل، لا تكرارًا لما أجبتَ عنه.
١٠. لا تتراجع عن جواب لمجرّد اعتراض السائل أو تشكيكه. الاعتراض ليس دليلًا. ولا تُغيّر الحكم إلا إذا أورد المعترض دليلًا يقتضي التغيير، وإن كان محقًّا فاعترف صراحةً.
١١. أكثر الاعتراضات في الفقه سببها أن المعترض يتبع مذهبًا آخر، لا أن الجواب خطأ. فإن كان الخلاف معتبرًا فبيّن أن للمسألة قولين وانسب كل قول لأهله بـ @قول، ولا تجعل أحدهما «تصحيحًا» للآخر.
١٢. إن سألك السائل سؤالًا يفترض صحّة أمر غير صحيح، فصحّح الافتراض قبل الإجابة.`;

/* ===================== Arabic normalisation ===================== */

/*
 * Diacritics, tatweel and the alef/ya/ta-marbuta variants differ between the
 * model's output and the Uthmani mushaf even when the words are identical, so
 * both sides are flattened before they are compared.
 */
const DIACRITICS = /[ً-ٰٟۖ-ۭـ]/g;

export function normalizeArabic(text) {
  return String(text || "")
    .replace(DIACRITICS, "")
    .replace(/[إأآٱا]/g, "ا")
    .replace(/[ىي]/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/[^ء-ي\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/* ===================== Reply protocol ===================== */

/**
 * Parse a Mishkat reply into prose, evidence and follow-up questions.
 *
 * The reply is `[د]` or `[خ]`, then prose, then a `###` line, then one tagged
 * record per line with `|` between fields. Parsing tolerates a partial reply
 * so the UI can render tokens as they stream in.
 */
export function parseMishkatReply(raw) {
  let text = String(raw || "");
  const result = {
    religious: null,
    prose: "",
    title: "",
    topic: "",
    ayat: [],
    ahadith: [],
    views: [],
    references: [],
    followUps: [],
  };

  const scope = text.match(/\[\s*(د|خ)\s*\]/);
  if (scope) {
    result.religious = scope[1] === "د";
    text = text.slice(scope.index + scope[0].length);
  }

  const splitAt = text.indexOf("###");
  result.prose = (splitAt === -1 ? text : text.slice(0, splitAt))
    .replace(/```[a-zA-Z]*\n?/g, "")
    .replace(/`/g, "")
    .trim();

  if (splitAt === -1) return result;

  for (const line of text.slice(splitAt + 3).split("\n")) {
    const trimmed = line.trim();
    if (!trimmed.startsWith("@")) continue;
    const [tag, ...fields] = trimmed.split("|").map((f) => f.trim());

    switch (tag) {
      case "@عنوان":
        result.title = fields[0] || "";
        break;
      case "@باب":
        result.topic = fields[0] || "";
        break;
      case "@آية": {
        const [surah, ayah, quoted, reasoning] = fields;
        if (surah && ayah) {
          result.ayat.push({
            surah: Number(surah),
            ayah: Number(ayah),
            quoted: quoted || "",
            reasoning: reasoning || "",
            // Filled in later by verifyAyah.
            status: "pending",
          });
        }
        break;
      }
      case "@حديث": {
        const [matn, search, source, reasoning] = fields;
        if (matn) {
          result.ahadith.push({
            matn,
            search: search || "",
            source: source || "",
            reasoning: reasoning || "",
          });
        }
        break;
      }
      case "@قول":
        if (fields[0]) result.views.push({ who: fields[0], what: fields[1] || "" });
        break;
      case "@مرجع":
        if (fields[0])
          result.references.push({ name: fields[0], why: fields[1] || "" });
        break;
      case "@سؤال":
        if (fields[0]) result.followUps.push(fields[0]);
        break;
      default:
        break;
    }
  }

  return result;
}

/* ===================== Evidence verification ===================== */

/*
 * The mushaf is written in Uthmani orthography while an answer quotes in
 * modern imla'i spelling, so the two differ in ways no amount of stripping
 * diacritics reconciles — ٱلصَّلَوٰةِ against الصَّلَاةِ, for one. Comparing whole
 * strings therefore reports a mismatch on a perfectly correct quotation.
 *
 * Words are compared instead: a quotation counts as found when most of its
 * words appear in the verse. A wrong reference shares almost nothing, so the
 * two cases stay far apart.
 */
const MATCH_THRESHOLD = 0.7;

function wordSimilarity(a, b) {
  const words = (text) =>
    new Set(text.split(" ").filter((word) => word.length > 1));
  const left = words(a);
  const right = words(b);
  if (!left.size || !right.size) return 0;

  let shared = 0;
  for (const word of left) if (right.has(word)) shared += 1;
  return shared / Math.min(left.size, right.size);
}

/**
 * Look the cited ayah up in the Uthmani mushaf and compare it with what the
 * answer quoted.
 *
 * A `verified` result means the quotation matches the mushaf at that
 * reference — not that the ruling drawn from it is sound.
 */
export async function verifyAyah({ surah, ayah, quoted }, { signal } = {}) {
  try {
    const response = await fetch(`${AYAH_API}/${surah}:${ayah}/quran-uthmani`, {
      signal,
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { data } = await response.json();
    if (!data?.text) throw new Error("empty");

    const mushaf = normalizeArabic(data.text);
    const claim = normalizeArabic(quoted);
    const matches =
      !claim ||
      mushaf.includes(claim) ||
      claim.includes(mushaf) ||
      wordSimilarity(claim, mushaf) >= MATCH_THRESHOLD;

    return {
      status: matches ? "verified" : "mismatch",
      text: data.text,
      surahName: data.surah?.name || "",
      surahNumber: data.surah?.number ?? surah,
      ayahNumber: data.numberInSurah ?? ayah,
    };
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    return { status: "unchecked", text: "", surahName: "" };
  }
}

/* ===================== Asking ===================== */

function friendlyNetworkError() {
  if (typeof navigator !== "undefined" && navigator.onLine === false) {
    return new Error(
      "لا يوجد اتصال بالإنترنت. مِشْكاة تحتاج اتصالًا لتُجيب، وتبقى محادثاتك السابقة متاحة للقراءة.",
    );
  }
  const origin =
    typeof window !== "undefined" ? window.location.origin : "نطاق الموقع";
  return new Error(
    `تعذّر الاتصال بخادم مِشْكاة. إن كان الوركر يعمل، فالسبب غالبًا أن ` +
      `${origin} غير مُدرَج في متغيّر ALLOWED_ORIGIN عنده — يُضاف من ` +
      `Cloudflare: Workers & Pages ← الوركر ← Settings ← Variables.`,
  );
}

/**
 * Ask Mishkat a question.
 *
 * `messages` is the conversation so far as `[{ role, content }]`. `onToken`
 * receives the answer so far on every chunk when the worker streams, so the
 * caller can render it as it arrives. Returns the complete raw reply.
 */
export async function askMishkat({ messages, onToken, signal }) {
  let response;
  try {
    response = await fetch(MISHKAT_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system: MISHKAT_SYSTEM_PROMPT,
        messages,
        images: [],
      }),
      signal,
    });
  } catch (error) {
    if (error?.name === "AbortError") throw error;
    throw friendlyNetworkError();
  }

  const contentType = response.headers.get("content-type") || "";

  if (response.ok && contentType.includes("text/html")) {
    throw new Error(
      "عنوان مِشْكاة يردّ بصفحة ويب لا ببيانات. غالبًا أُنشئ الوركر بقالب " +
        "الأصول الثابتة؛ يُعاد إنشاؤه ك‍ Worker.",
    );
  }

  if (!response.ok) {
    let message = "تعذّر الوصول إلى مِشْكاة.";
    try {
      const body = await response.json();
      if (typeof body?.error === "string" && body.error.trim())
        message = body.error;
    } catch {
      /* keep the default message */
    }
    throw new Error(message);
  }

  if (contentType.includes("event-stream") && response.body) {
    return readStream(response, onToken);
  }

  const body = await response.json();
  const text = Array.isArray(body.content)
    ? body.content
        .filter((part) => part.type === "text")
        .map((part) => part.text)
        .join("\n")
    : body.text || "";
  onToken?.(text);
  return text;
}

/*
 * The worker streams `data:` lines carrying either `{ t }` (its own shape) or
 * an Anthropic `content_block_delta`, and ends with `[DONE]`.
 */
async function readStream(response, onToken) {
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let answer = "";
  let streamError = null;

  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });

    const lines = buffer.split("\n");
    buffer = lines.pop();

    for (const line of lines) {
      if (!line.startsWith("data:")) continue;
      const payload = line.slice(5).trim();
      if (!payload || payload === "[DONE]") continue;

      let event;
      try {
        event = JSON.parse(payload);
      } catch {
        continue;
      }

      if (event.error) {
        streamError =
          typeof event.error === "string" ? event.error : "انقطع التدفّق";
        continue;
      }

      const chunk =
        event.t !== undefined
          ? event.t
          : (event.type === "content_block_delta" && event.delta?.text) || "";
      if (chunk) {
        answer += chunk;
        onToken?.(answer);
      }
    }
  }

  if (streamError && !answer) throw new Error(streamError);
  return answer;
}

/*
 * A parsed answer as plain text, for copying and for sharing.
 *
 * What reaches the clipboard has to stand on its own away from the app: the
 * question it answers, the prose, and — this is the part that matters for a
 * religious answer — every reference intact. An answer pasted into a message
 * without its ayah numbers and its hadith sources is worth less than nothing,
 * because the reader on the other end has no way to check it.
 *
 * `labels` carries the section words in the reader's language; the caller
 * already has them for the interface.
 */
export function answerToText(parsed, question, labels = {}) {
  const L = {
    question: "السؤال",
    evidence: "الأدلّة",
    ayah: "آية",
    hadith: "حديث",
    views: "أقوال أهل العلم",
    references: "مراجع",
    indication: "وجه الدلالة",
    source: "المصدر",
    ...labels,
  };

  const lines = [];

  if (question) lines.push(`${L.question}: ${question}`, "");
  if (parsed?.topic) lines.push(parsed.topic, "");
  if (parsed?.prose) lines.push(parsed.prose.trim(), "");

  const ayat = parsed?.ayat || [];
  const ahadith = parsed?.ahadith || [];

  if (ayat.length || ahadith.length) {
    lines.push(`— ${L.evidence} —`);

    for (const item of ayat) {
      // The mushaf's own wording once it has been fetched, the quote until then.
      const text = item.text || item.quoted;
      const place = item.surahName
        ? `${item.surahName} [${item.surah}:${item.ayah}]`
        : `[${item.surah}:${item.ayah}]`;
      lines.push(`${L.ayah}: ${text}`, `  ${place}`);
      if (item.reasoning) lines.push(`  ${L.indication}: ${item.reasoning}`);
      lines.push("");
    }

    for (const item of ahadith) {
      lines.push(`${L.hadith}: ${item.matn}`);
      if (item.source) lines.push(`  ${L.source}: ${item.source}`);
      if (item.reasoning) lines.push(`  ${L.indication}: ${item.reasoning}`);
      lines.push("");
    }
  }

  if (parsed?.views?.length) {
    lines.push(`— ${L.views} —`);
    for (const view of parsed.views) {
      lines.push(`• ${view.who}: ${view.what}`.trimEnd());
    }
    lines.push("");
  }

  if (parsed?.references?.length) {
    lines.push(`— ${L.references} —`);
    for (const ref of parsed.references) {
      lines.push(`• ${ref.name}${ref.why ? ` — ${ref.why}` : ""}`);
    }
    lines.push("");
  }

  // Collapse the runs of blank lines the sections leave behind.
  return lines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
