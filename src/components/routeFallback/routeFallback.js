import React from "react";
import "./routeFallback.css";

/*
 * What stands in for a page while its chunk is on the way.
 *
 * Every route here is `React.lazy`, so a tap on a link suspends. React answers
 * a suspension by hiding everything already inside the nearest boundary — it
 * writes `display: none !important` onto those nodes — and rendering the
 * fallback instead. With one boundary around the whole app that meant the
 * header, the page and the footer all left the layout at once: the document
 * collapsed to nothing for a frame and then sprang back to full height, which
 * is the flicker a reader sees as the page shrinking and growing again.
 *
 * So the boundary now sits inside <main>, around the routes alone, and this
 * is what fills it: a block one viewport tall. The chrome stays where it is,
 * the document keeps its height, and the change of page reads as a change of
 * page rather than as a fault.
 */

const RouteFallback = () => (
  <div className="routeFallback" role="status" aria-live="polite">
    <span className="routeFallback__spinner" aria-hidden="true" />
    <span className="u-visually-hidden">جارٍ التحميل…</span>
  </div>
);

export default RouteFallback;
