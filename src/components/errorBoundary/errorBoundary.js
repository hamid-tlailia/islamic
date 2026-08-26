import React from "react";
import "./errorBoundary.css";

/*
 * The last line of defence between a thrown error and a blank screen.
 *
 * Every page in this app is `React.lazy`, so navigating always fetches a
 * chunk by its hashed filename. After a deploy those filenames change: an open
 * tab still running the previous build asks for a file the server no longer
 * has, the import rejects, and — with nothing catching it — React unmounts the
 * whole tree. The result is a white page with no way out but clearing the app's
 * data, which is exactly what a reader will not do.
 *
 * A stale chunk is recoverable: the current build is one reload away. So that
 * case reloads itself, once, guarded against a loop by a flag that lives only
 * for the session. Anything else is shown as a message with a way forward,
 * because a readable failure beats a blank one.
 */

const RELOADED_KEY = "app:recovered-from-stale-chunk";

/* Browsers word this differently; all of them mean the same thing. */
function isStaleChunkError(error) {
  const name = error?.name || "";
  const message = error?.message || "";
  return (
    name === "ChunkLoadError" ||
    /Loading chunk [\w-]+ failed/i.test(message) ||
    /Loading CSS chunk/i.test(message) ||
    /error loading dynamically imported module/i.test(message) ||
    /Importing a module script failed/i.test(message)
  );
}

function readFlag() {
  try {
    return sessionStorage.getItem(RELOADED_KEY) === "1";
  } catch {
    // No storage means no guard, so treat it as already used and do not loop.
    return true;
  }
}

function writeFlag() {
  try {
    sessionStorage.setItem(RELOADED_KEY, "1");
  } catch {
    /* nothing to do; the check above already errs on the safe side */
  }
}

class ErrorBoundary extends React.Component {
  state = { error: null, reloading: false };

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error) {
    if (isStaleChunkError(error) && !readFlag()) {
      writeFlag();
      this.setState({ reloading: true });
      window.location.reload();
      return;
    }
    console.error("Unrecovered error:", error);
  }

  handleReload = () => {
    try {
      sessionStorage.removeItem(RELOADED_KEY);
    } catch {
      /* the reload below still happens */
    }
    window.location.reload();
  };

  render() {
    const { error, reloading } = this.state;
    if (!error) return this.props.children;

    const arabic = this.props.language !== "en";

    // Mid-reload: a spinner rather than an error the reader will never read.
    if (reloading) {
      return (
        <div className="appError" role="status">
          <div className="appError__spinner" aria-hidden="true" />
          <p className="appError__title">
            {arabic ? "يجري تحديث التطبيق…" : "Updating the app…"}
          </p>
        </div>
      );
    }

    return (
      <div className="appError" role="alert">
        <span className="appError__icon" aria-hidden="true">
          ⚠️
        </span>
        <h1 className="appError__title">
          {arabic ? "تعذّر عرض هذه الصفحة" : "This page could not be shown"}
        </h1>
        <p className="appError__body">
          {arabic
            ? "حدث خلل غير متوقّع. أعد التحميل، فإن تكرّر فأبلغنا عنه من قائمة «الإبلاغ عن خطأ»."
            : "Something went wrong. Reload the page — if it keeps happening, report it from the “Report an error” menu."}
        </p>

        <div className="appError__actions">
          <button
            type="button"
            className="u-btn u-btn--primary"
            onClick={this.handleReload}
          >
            {arabic ? "إعادة التحميل" : "Reload"}
          </button>
          <a className="u-btn" href="/">
            {arabic ? "الصفحة الرئيسية" : "Home"}
          </a>
        </div>
      </div>
    );
  }
}

export default ErrorBoundary;
