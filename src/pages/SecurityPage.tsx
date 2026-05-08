import { Link } from "react-router-dom";
import { Footer } from "../components/Footer";
import { useLanguage } from "../i18n";

const GITHUB_SVG = (
  <svg
    className="w-4 h-4"
    fill="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

export function SecurityPage() {
  const { t, toggle } = useLanguage();
  const s = t.security;

  return (
    <div className="min-h-screen bg-white text-gray-800 flex flex-col">
      {/* Header */}
      <header className="border-b border-gray-200 px-4 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-black text-gray-800 hover:text-gray-600"
          >
            <span>⛏️</span>
            <span>{s.header}</span>
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">{s.headerSub}</span>
            <button
              onClick={toggle}
              className="text-xs text-gray-400 hover:text-gray-600 transition-colors border border-gray-200 rounded px-2 py-1"
            >
              {t.langToggle}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-10 space-y-10">
        <div>
          <h1 className="text-3xl font-black text-gray-900">{s.title}</h1>
          <p className="text-gray-500 mt-2 text-sm">{s.description}</p>
        </div>

        {/* What we access */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            {s.whatWeAccess}
          </h2>
          <p className="text-sm text-gray-600">{s.whatWeAccessIntro}</p>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-bold text-green-800">{s.userInfoTitle}</h3>
            <ul className="text-sm text-green-700 space-y-1">
              {s.userInfoItems.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 space-y-2">
            <h3 className="text-sm font-bold text-green-800">{s.repoMetaTitle}</h3>
            <ul className="text-sm text-green-700 space-y-1">
              {s.repoMetaItems.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* What we never access */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            {s.neverAccess}
          </h2>
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <ul className="text-sm text-red-700 space-y-1">
              {s.neverAccessItems.map((item, i) => (
                <li key={i}>• {item}</li>
              ))}
            </ul>
          </div>
        </section>

        {/* OAuth scope */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            {s.oauthScope}
          </h2>
          <p className="text-sm text-gray-600">
            {s.oauthScopeText1}{" "}
            <strong>{s.oauthScopeNone}</strong>
            {s.oauthScopeText2}{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">scope=</code>{" "}
            {s.oauthScopeText3}
          </p>
          <p className="text-sm text-gray-600">{s.oauthScopeWarning}</p>
        </section>

        {/* Token handling */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            {s.tokenHandling}
          </h2>
          <ul className="text-sm text-gray-600 space-y-2">
            {s.tokenHandlingItems.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-green-500 flex-shrink-0 font-bold">✓</span>
                <span>
                  {item}
                  {i === 1 && (
                    <>
                      {" "}(
                      <code className="bg-gray-100 px-1 rounded text-xs">
                        DELETE /applications/{"{client_id}"}/token
                      </code>
                      )
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
          <p className="text-sm text-gray-500 bg-gray-50 border border-gray-200 rounded-lg p-3">
            {s.tokenNotePrefix}{" "}
            <code className="bg-gray-100 px-1 rounded text-xs">
              {s.tokenNoteCode}
            </code>{" "}
            {s.tokenNoteSuffix}
          </p>
        </section>

        {/* Session design */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            {s.sessionDesign}
          </h2>
          <ul className="text-sm text-gray-600 space-y-2">
            <li className="flex gap-2">
              <span className="text-blue-500 flex-shrink-0">•</span>
              <span>
                {s.sessionItem1Prefix}{" "}
                <code className="bg-gray-100 px-1 rounded text-xs">
                  {s.sessionItem1Code}
                </code>{" "}
                {s.sessionItem1Suffix}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 flex-shrink-0">•</span>
              <span>
                {s.sessionItem2Prefix}{" "}
                <code className="bg-gray-100 px-1 rounded text-xs">
                  {s.sessionItem2Code}
                </code>{" "}
                {s.sessionItem2Suffix}
              </span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 flex-shrink-0">•</span>
              <span>{s.sessionItem3}</span>
            </li>
            <li className="flex gap-2">
              <span className="text-blue-500 flex-shrink-0">•</span>
              <span>{s.sessionItem4}</span>
            </li>
          </ul>
        </section>

        {/* PKCE */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            {s.pkce}
          </h2>
          <ul className="text-sm text-gray-600 space-y-2">
            {s.pkceItems.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-blue-500 flex-shrink-0">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* No storage */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            {s.dataStorage}
          </h2>
          <ul className="text-sm text-gray-600 space-y-2">
            {s.dataStorageItems.map((item, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-green-500 flex-shrink-0 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Rate limiting */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            {s.rateLimiting}
          </h2>
          <p className="text-sm text-gray-600">{s.rateLimitingText1}</p>
          <p className="text-sm text-gray-600">{s.rateLimitingText2}</p>
          <ul className="text-sm text-gray-600 space-y-1 ml-4">
            {s.rateLimitingItems.map((item, i) => (
              <li key={i}>• {item}</li>
            ))}
          </ul>
        </section>

        {/* Source */}
        <section className="space-y-3">
          <h2 className="text-xl font-bold text-gray-800 border-b border-gray-200 pb-2">
            {s.sourceCode}
          </h2>
          <p className="text-sm text-gray-600">{s.sourceCodeText}</p>
          <a
            href="https://github.com/tomoki013/github-kurorekishi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700 transition-colors"
          >
            {GITHUB_SVG}
            {s.sourceCodeLink}
          </a>
        </section>

        <div className="text-center pb-8">
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            {s.backToTop}
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
