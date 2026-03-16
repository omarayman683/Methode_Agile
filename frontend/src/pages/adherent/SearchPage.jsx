import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:5000/api";

// ── Book Card ────────────────────────────────────────────────
function BookCard({ book }) {
  const navigate = useNavigate();

  const handleEmprunter = (e) => {
    e.stopPropagation();
    navigate(`/livres/${book.id_livre}/emprunt`);
  };

  return (
    <div style={{
      background: "rgba(255,255,255,0.04)",
      border: "1px solid var(--border)",
      borderRadius: "12px",
      padding: "18px 22px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      gap: "16px",
      transition: "background 0.2s",
    }}
    onMouseEnter={e => e.currentTarget.style.background = "var(--bg-secondary)"}
    onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.04)"}
    >
      <div>
        <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--text)", marginBottom: "4px" }}>
          {book.titre}
        </div>
        <div style={{ fontSize: "0.85rem", color: "var(--text-muted)" }}>
          {book.auteur} {book.date_publication ? `· ${new Date(book.date_publication).getFullYear()}` : ""}
        </div>
        {book.categorie && (
          <div style={{
            display: "inline-block", marginTop: "8px",
            background: "rgba(212,175,100,0.15)", color: "#d4af64",
            borderRadius: "6px", padding: "2px 10px", fontSize: "0.75rem", fontWeight: 600
          }}>
            {book.categorie}
          </div>
        )}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end", flexShrink: 0 }}>
        <div style={{
          padding: "6px 14px",
          borderRadius: "20px",
          fontSize: "0.8rem",
          fontWeight: 700,
          background: book.disponibilite ? "rgba(80,200,120,0.15)" : "rgba(220,80,80,0.15)",
          color: book.disponibilite ? "#50c878" : "#dc5050",
          border: `1px solid ${book.disponibilite ? "rgba(80,200,120,0.3)" : "rgba(220,80,80,0.3)"}`,
        }}>
          {book.disponibilite ? "Disponible" : "Indisponible"}
        </div>
        {book.disponibilite && (
          <button
            onClick={handleEmprunter}
            style={{
              padding: "6px 14px",
              borderRadius: "6px",
              fontSize: "0.8rem",
              fontWeight: 700,
              border: "none",
              background: "rgba(212,175,100,0.3)",
              color: "#d4af64",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
          >
            Emprunter
          </button>
        )}
      </div>
    </div>
  );
}

// ── Typing cursor ────────────────────────────────────────────
function TypingCursor() {
  return (
    <span style={{
      display: "inline-block",
      width: "2px", height: "1.1em",
      background: "#d4af64",
      marginLeft: "3px",
      verticalAlign: "text-bottom",
      animation: "blink 0.8s step-end infinite",
    }} />
  );
}

// ── Main Search Page ─────────────────────────────────────────
export default function SearchPage() {
  const [tab, setTab] = useState("simple"); // "simple" | "ai"

  // Simple search
  const [simpleQuery, setSimpleQuery] = useState("");
  const [simpleResults, setSimpleResults] = useState([]);
  const [simpleLoading, setSimpleLoading] = useState(false);
  const [simpleError, setSimpleError] = useState("");

  // AI search
  const [aiQuery, setAiQuery] = useState("");
  const [aiText, setAiText] = useState("");       // streamed text
  const [aiBooks, setAiBooks] = useState([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiDone, setAiDone] = useState(false);
  const [aiError, setAiError] = useState("");
  const aiResponseRef = useRef("");

  // ── Simple search handler ──────────────────────────────────
  const handleSimpleSearch = async (e) => {
    e.preventDefault();
    if (!simpleQuery.trim()) return;
    setSimpleLoading(true);
    setSimpleError("");
    setSimpleResults([]);
    try {
      const res = await fetch(`${API_URL}/search/simple?q=${encodeURIComponent(simpleQuery)}`);
      const data = await res.json();
      if (data.success) setSimpleResults(data.data);
      else setSimpleError(data.message);
    } catch {
      setSimpleError("Impossible de contacter le serveur.");
    } finally {
      setSimpleLoading(false);
    }
  };

  // ── AI search handler (streaming) ─────────────────────────
  const handleAISearch = async (e) => {
    e.preventDefault();
    if (!aiQuery.trim()) return;

    setAiLoading(true);
    setAiDone(false);
    setAiError("");
    setAiText("");
    setAiBooks([]);
    aiResponseRef.current = "";

    try {
      const res = await fetch(`${API_URL}/search/ai`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: aiQuery }),
      });

      if (!res.ok) throw new Error("Erreur serveur");

      const contentType = res.headers.get("content-type") || "";

      // ── Streaming SSE response ─────────────────────────────
      if (contentType.includes("text/event-stream")) {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n").filter(l => l.startsWith("data:"));

          for (const line of lines) {
            try {
              const json = JSON.parse(line.replace("data: ", ""));

              if (json.error) {
                setAiError(json.error);
                setAiLoading(false);
                return;
              }

              if (json.token) {
                aiResponseRef.current += json.token;
                setAiText(aiResponseRef.current);
              }

              if (json.done) {
                setAiDone(true);
                setAiLoading(false);
                // After streaming, do a simple search to show matching books
                fetchMatchingBooks(aiResponseRef.current);
              }
            } catch { /* skip */ }
          }
        }
      } else {
        // Fallback: non-streaming JSON response
        const data = await res.json();
        if (data.success) {
          setAiText("Voici les résultats correspondants à votre recherche.");
          setAiBooks(data.data || []);
        } else {
          setAiError(data.message);
        }
        setAiDone(true);
        setAiLoading(false);
      }

    } catch (err) {
      setAiError("Impossible de contacter le serveur ou l'IA n'est pas disponible.");
      setAiLoading(false);
    }
  };

  // ── Extract book titles from AI response and fetch matching books ─────
  const fetchMatchingBooks = async (text) => {
    try {
      // Get all books and filter by those mentioned in AI response
      const res = await fetch(`${API_URL}/livres`);
      const data = await res.json();
      if (data.success) {
        const mentioned = data.data.filter(book =>
          text.toLowerCase().includes(book.titre.toLowerCase()) ||
          text.toLowerCase().includes(book.auteur.toLowerCase())
        );
        setAiBooks(mentioned);
      }
    } catch { /* silent */ }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg)",
      fontFamily: "'Georgia', 'Times New Roman', serif",
      color: "var(--text)",
      padding: "48px 24px",
    }}>
      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:translateY(0)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        * { box-sizing: border-box; }
        input:focus { outline: none; }
        button:hover { opacity: 0.85; cursor: pointer; }
      `}</style>

      <div style={{ maxWidth: "720px", margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "48px" }}>
          <div style={{ fontSize: "2.6rem", fontWeight: 700, letterSpacing: "-0.5px", color: "var(--text)" }}>
            Bibliothèque
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: "1rem", marginTop: "6px", fontStyle: "italic" }}>
            Recherchez parmi nos ouvrages
          </div>
        </div>

        {/* Tab Switch */}
        <div style={{
          display: "flex",
          background: "var(--bg-secondary)",
          borderRadius: "12px",
          padding: "4px",
          marginBottom: "32px",
          border: "1px solid var(--border)",
        }}>
          {[
            { key: "simple", label: "🔍 Recherche simple" },
            { key: "ai",     label: "✨ Recherche par IA" },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)} style={{
              flex: 1, padding: "10px",
              borderRadius: "9px", border: "none",
              background: tab === t.key ? "#d4af64" : "transparent",
              color: tab === t.key ? "#0f0e0b" : "#8a7a60",
              fontWeight: 700, fontSize: "0.9rem",
              transition: "all 0.2s",
              fontFamily: "inherit",
            }}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── SIMPLE SEARCH TAB ── */}
        {tab === "simple" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>
            <form onSubmit={handleSimpleSearch} style={{ display: "flex", gap: "10px", marginBottom: "28px" }}>
              <input
                value={simpleQuery}
                onChange={e => setSimpleQuery(e.target.value)}
                placeholder="Titre, auteur ou catégorie..."
                style={{
                  flex: 1, padding: "14px 18px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  borderRadius: "10px", color: "var(--text)",
                  fontSize: "1rem", fontFamily: "inherit",
                }}
              />
              <button type="submit" style={{
                padding: "14px 24px",
                background: "#d4af64", color: "#0f0e0b",
                border: "none", borderRadius: "10px",
                fontWeight: 700, fontSize: "1rem",
                fontFamily: "inherit",
              }}>
                {simpleLoading ? "..." : "Chercher"}
              </button>
            </form>

            {simpleError && (
              <div style={{ color: "#dc5050", marginBottom: "16px", fontSize: "0.9rem" }}>{simpleError}</div>
            )}

            {simpleResults.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "4px" }}>
                  {simpleResults.length} résultat{simpleResults.length > 1 ? "s" : ""} trouvé{simpleResults.length > 1 ? "s" : ""}
                </div>
                {simpleResults.map(book => <BookCard key={book.id_livre} book={book} />)}
              </div>
            )}

            {!simpleLoading && simpleResults.length === 0 && simpleQuery && !simpleError && (
              <div style={{ textAlign: "center", color: "var(--text-muted)", padding: "40px", fontStyle: "italic" }}>
                Aucun livre trouvé pour « {simpleQuery} »
              </div>
            )}
          </div>
        )}

        {/* ── AI SEARCH TAB ── */}
        {tab === "ai" && (
          <div style={{ animation: "fadeIn 0.3s ease" }}>

            <div style={{
              background: "rgba(212,175,100,0.08)",
              border: "1px solid rgba(212,175,100,0.2)",
              borderRadius: "10px", padding: "12px 16px",
              marginBottom: "20px", fontSize: "0.85rem", color: "#a09060",
            }}>
              💡 Posez votre question en langage naturel — ex: <em>"Je cherche un roman de fantasy pour adolescents"</em>
            </div>

            <form onSubmit={handleAISearch} style={{ marginBottom: "28px" }}>
              <textarea
                value={aiQuery}
                onChange={e => setAiQuery(e.target.value)}
                placeholder="Décrivez ce que vous cherchez..."
                rows={3}
                style={{
                  width: "100%", padding: "14px 18px",
                  background: "var(--input-bg)",
                  border: "1px solid var(--input-border)",
                  borderRadius: "10px", color: "var(--text)",
                  fontSize: "1rem", fontFamily: "inherit",
                  resize: "vertical", marginBottom: "10px",
                }}
              />
              <button type="submit" disabled={aiLoading} style={{
                width: "100%", padding: "14px",
                background: aiLoading ? "rgba(212,175,100,0.3)" : "#d4af64",
                color: aiLoading ? "#8a7a60" : "#0f0e0b",
                border: "none", borderRadius: "10px",
                fontWeight: 700, fontSize: "1rem",
                fontFamily: "inherit", transition: "all 0.2s",
              }}>
                {aiLoading ? "L'IA réfléchit..." : "✨ Rechercher avec l'IA"}
              </button>
            </form>

            {/* AI streaming response box */}
            {(aiText || aiLoading) && (
              <div style={{
                background: "var(--bg-secondary)",
                border: "1px solid var(--border)",
                borderRadius: "12px", padding: "20px 24px",
                marginBottom: "24px",
                animation: "fadeIn 0.3s ease",
              }}>
                <div style={{
                  fontSize: "0.75rem", fontWeight: 700,
                  color: "#d4af64", letterSpacing: "0.1em",
                  marginBottom: "12px", textTransform: "uppercase",
                }}>
                  ✨ Assistant IA
                </div>

                {aiLoading && !aiText && (
                  <div style={{ display: "flex", gap: "6px", alignItems: "center", color: "var(--text-muted)" }}>
                    <div style={{
                      width: "16px", height: "16px",
                      border: "2px solid #d4af64",
                      borderTopColor: "transparent",
                      borderRadius: "50%",
                      animation: "spin 0.8s linear infinite",
                    }} />
                    Connexion à l'IA...
                  </div>
                )}

                {aiText && (
                  <div style={{
                    lineHeight: "1.75", color: "var(--text)",
                    fontSize: "0.98rem", whiteSpace: "pre-wrap",
                  }}>
                    {aiText}
                    {!aiDone && <TypingCursor />}
                  </div>
                )}
              </div>
            )}

            {aiError && (
              <div style={{
                background: "rgba(220,80,80,0.1)",
                border: "1px solid rgba(220,80,80,0.3)",
                borderRadius: "10px", padding: "14px 18px",
                color: "#dc5050", fontSize: "0.9rem", marginBottom: "20px",
              }}>
                ⚠️ {aiError}
              </div>
            )}

            {/* Books suggested by AI */}
            {aiDone && aiBooks.length > 0 && (
              <div style={{ animation: "fadeIn 0.4s ease" }}>
                <div style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginBottom: "12px" }}>
                  📚 Livres correspondants dans notre catalogue :
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {aiBooks.map(book => <BookCard key={book.id_livre} book={book} />)}
                </div>
              </div>
            )}

            {aiDone && aiBooks.length === 0 && !aiError && (
              <div style={{
                textAlign: "center", color: "var(--text-muted)",
                padding: "20px", fontStyle: "italic", fontSize: "0.9rem"
              }}>
                Aucun livre correspondant trouvé dans le catalogue actuel.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}