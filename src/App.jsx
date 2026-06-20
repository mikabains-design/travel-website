import { useState, useEffect, useMemo } from "react";

import { DESTINATIONS } from "./destinations";

const ERA_CONFIG = {
  "20s": {
    label: "Do It In Your 20s",
    subtitle: "High physical demand or extreme climate urgency — don't wait",
    color: "#FF4D4D",
    accent: "#FF8C00",
    icon: " ",
    bg: "linear-gradient(135deg, #1a0000 0%, #0d0d0d 100%)",
  },
  "30s": {
    label: "Your 30s & Peak Years",
    subtitle: "More budget, still fit — experiences that reward maturity",
    color: "#FF8C00",
    accent: "#FFD700",
    icon: " ",
    bg: "linear-gradient(135deg, #0d0800 0%, #0d0d0d 100%)",
  },
  kids: {
    label: "With Kids",
    subtitle: "Safe, magical, family-infrastructure ready — share it with them",
    color: "#00C896",
    accent: "#00FFB3",
    icon: " ",
    bg: "linear-gradient(135deg, #00100a 0%, #0d0d0d 100%)",
  },
  retired: {
    label: "When You're Retired",
    subtitle: "Time-rich, comfort-oriented — slow travel at its finest",
    color: "#7B9FFF",
    accent: "#C0CFFF",
    icon: " ",
    bg: "linear-gradient(135deg, #00060d 0%, #0d0d0d 100%)",
  },
};

const URGENCY_LABELS = ["", "Low", "Low-Mod", "Moderate", "High", "CRITICAL"];
const PHYSICAL_LABELS = ["", "Easy", "Moderate", "Active", "Demanding", "Extreme"];

function UrgencyDot({ level }) {
  const colors = ["", "#4CAF50", "#8BC34A", "#FFC107", "#FF5722", "#FF0000"];
  return (
    <span style={{
      display: "inline-block",
      width: 10,
      height: 10,
      borderRadius: "50%",
      background: colors[level],
      marginRight: 6,
      boxShadow: level >= 4 ? `0 0 8px ${colors[level]}` : "none",
    }} />
  );
}

function PhysicalBar({ level }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} style={{
          width: 14,
          height: 6,
          borderRadius: 2,
          background: i <= level ? "#FF8C00" : "rgba(255,255,255,0.1)",
          transition: "all 0.3s",
        }} />
      ))}
    </div>
  );
}

function DestinationCard({ dest, onClick }) {
  const era = ERA_CONFIG[dest.era];
  return (
    <div
      onClick={() => onClick(dest)}
      style={{
        cursor: "pointer",
        borderRadius: 16,
        overflow: "hidden",
        background: "#111",
        border: "1px solid rgba(255,255,255,0.08)",
        transition: "transform 0.2s, border-color 0.2s, box-shadow 0.2s",
        position: "relative",
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.borderColor = era.color + "80";
        e.currentTarget.style.boxShadow = `0 12px 40px ${era.color}20`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
        e.currentTarget.style.boxShadow = "none";
      }}
    >
      <div style={{ position: "relative", paddingBottom: "60%", overflow: "hidden" }}>
        <img
          src={dest.image}
          alt={dest.name}
          style={{
            position: "absolute",
            top: 0, left: 0,
            width: "100%", height: "100%",
            objectFit: "cover",
            filter: "brightness(0.85)",
          }}
          onError={e => {
            e.target.style.display = "none";
            e.target.parentElement.style.background = "#1a1a1a";
          }}
        />
        <div style={{
          position: "absolute",
          bottom: 0, left: 0, right: 0,
          height: "15%",
          background: "linear-gradient(transparent, rgba(0,0,0,0.9))",
        }} />
        {dest.climateUrgency >= 4 && (
          <div style={{
            position: "absolute",
            top: 10, right: 10,
            background: dest.climateUrgency === 5 ? "#FF0000" : "#FF5722",
            color: "white",
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 4,
            letterSpacing: 1,
            fontFamily: "monospace",
          }}>
            {dest.climateUrgency === 5 ? " ACT NOW" : "URGENT"}
          </div>
        )}
        {dest.kidFriendly && (
          <div style={{
            position: "absolute",
            top: 10, left: 10,
            background: "rgba(0,200,150,0.85)",
            color: "white",
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 4,
          }}>
             Kid-Friendly
          </div>
        )}
      </div>
      <div style={{ padding: "14px 16px 16px" }}>
        <div style={{ fontSize: 11, color: era.color, fontWeight: 700, letterSpacing: 1.5, marginBottom: 4, textTransform: "uppercase", fontFamily: "monospace" }}>
          {dest.country}
        </div>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 10, lineHeight: 1.3 }}>
          {dest.name}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <div style={{ fontSize: 10, color: "#666", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Physical</div>
            <PhysicalBar level={dest.physicalDemand} />
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 10, color: "#666", marginBottom: 4, textTransform: "uppercase", letterSpacing: 1 }}>Climate</div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end" }}>
              <UrgencyDot level={dest.climateUrgency} />
              <span style={{ fontSize: 12, color: "#aaa" }}>{URGENCY_LABELS[dest.climateUrgency]}</span>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 10, display: "flex", gap: 4, flexWrap: "wrap" }}>
          {dest.tags.slice(0, 3).map(tag => (
            <span key={tag} style={{
              fontSize: 10,
              background: "rgba(255,255,255,0.06)",
              color: "#888",
              padding: "2px 7px",
              borderRadius: 4,
            }}>{tag}</span>
          ))}
          <span style={{
            fontSize: 10,
            background: "rgba(255,255,255,0.04)",
            color: "#555",
            padding: "2px 7px",
            borderRadius: 4,
          }}>{dest.cost}</span>
        </div>
      </div>
    </div>
  );
}

function Modal({ dest, onClose }) {
  const era = ERA_CONFIG[dest.era];
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.88)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 20,
        backdropFilter: "blur(6px)",
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#0f0f0f",
          border: `1px solid ${era.color}40`,
          borderRadius: 20,
          maxWidth: 720,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: `0 30px 80px ${era.color}20`,
        }}
      >
        <div style={{ position: "relative", paddingBottom: "45%", overflow: "hidden", borderRadius: "20px 20px 0 0" }}>
          <img
            src={dest.image}
            alt={dest.name}
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { e.target.style.display = "none"; }}
          />
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.55) 11%, transparent 55%)",
          }} />
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 16, right: 16,
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "white",
              width: 36, height: 36,
              borderRadius: "50%",
              cursor: "pointer",
              fontSize: 18,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          ></button>
          <div style={{ position: "absolute", bottom: 20, left: 24, right: 24 }}>
            <div style={{ fontSize: 11, color: era.color, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", marginBottom: 6, fontFamily: "monospace" }}>
              {era.icon} {era.label}  {dest.country}
            </div>
            <div style={{ fontSize: 26, fontWeight: 800, color: "white", lineHeight: 1.2 }}>
              {dest.name}
            </div>
          </div>
        </div>

        <div style={{ padding: "24px 28px 32px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 16, marginBottom: 24 }}>
            {[
              { label: "Physical Demand", value: PHYSICAL_LABELS[dest.physicalDemand], sub: <PhysicalBar level={dest.physicalDemand} /> },
              { label: "Climate Urgency", value: URGENCY_LABELS[dest.climateUrgency], sub: <div style={{ display: "flex", alignItems: "center" }}><UrgencyDot level={dest.climateUrgency} /><span style={{ fontSize: 11, color: "#888" }}>out of 5</span></div> },
              { label: "Kid-Friendly", value: dest.kidFriendly ? "Yes  " : "No" },
              { label: "Cost Level", value: dest.cost },
            ].map(item => (
              <div key={item.label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 10, padding: "10px 12px" }}>
                <div style={{ fontSize: 10, color: "#555", textTransform: "uppercase", letterSpacing: 1, marginBottom: 4 }}>{item.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#ddd" }}>{item.value}</div>
                {item.sub && <div style={{ marginTop: 4 }}>{item.sub}</div>}
              </div>
            ))}
          </div>

          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: era.color, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 10, fontFamily: "monospace" }}>Overview</div>
            <p style={{ color: "#ccc", lineHeight: 1.8, fontSize: 14, margin: 0 }}>{dest.blurb}</p>
          </div>

          <div style={{ marginBottom: 20, padding: "14px 16px", background: "rgba(255,140,0,0.07)", borderRadius: 10, borderLeft: `3px solid ${era.color}` }}>
            <div style={{ fontSize: 11, color: era.color, textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 8, fontFamily: "monospace" }}>Why {era.label}?</div>
            <p style={{ color: "#ccc", lineHeight: 1.7, fontSize: 13, margin: 0 }}>{dest.whyNow}</p>
          </div>

          {dest.climateNote && (
            <div style={{
              padding: "14px 16px",
              background: dest.climateUrgency >= 4 ? "rgba(255,0,0,0.08)" : "rgba(255,255,255,0.04)",
              borderRadius: 10,
              borderLeft: `3px solid ${dest.climateUrgency >= 4 ? "#FF4444" : "#555"}`,
              marginBottom: 20,
            }}>
              <div style={{ fontSize: 11, color: dest.climateUrgency >= 4 ? "#FF4444" : "#888", textTransform: "uppercase", letterSpacing: 1.5, fontWeight: 700, marginBottom: 8, fontFamily: "monospace" }}>
                 Climate Note
              </div>
              <p style={{ color: "#ccc", lineHeight: 1.7, fontSize: 13, margin: 0 }}>{dest.climateNote}</p>
            </div>
          )}

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <span style={{ fontSize: 12, color: "#555" }}>Best with:</span>
            <span style={{ fontSize: 13, color: "#aaa", background: "rgba(255,255,255,0.05)", padding: "4px 10px", borderRadius: 6 }}>
              {dest.companionIdeal}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function shuffleArray(array) {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}
export default function App() {
  const [activeEra, setActiveEra] = useState("20s");
  const [selectedDest, setSelectedDest] = useState(null);
  const [search, setSearch] = useState("");

 const shuffledEraDestinations = useMemo(() => {
  return shuffleArray(
    DESTINATIONS.filter(d => d.era === activeEra)
  );
}, [activeEra]);

const filtered = shuffledEraDestinations.filter(d => {
  if (!search) return true;
  const q = search.toLowerCase();
  return (
    d.name.toLowerCase().includes(q) ||
    d.country.toLowerCase().includes(q) ||
    d.region.toLowerCase().includes(q) ||
    d.tags.some(t => t.toLowerCase().includes(q))
  );
});

  const era = ERA_CONFIG[activeEra];

  return (
    <div style={{
      minHeight: "100vh",
      background: "#080808",
      color: "white",
      fontFamily: "'Georgia', 'Times New Roman', serif",
    }}>
      {/* Header */}
      <div style={{
        background: "linear-gradient(180deg, #0a0a0a 0%, #080808 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "60px 40px 40px",
        textAlign: "center",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse at 50% 0%, rgba(255,140,0,0.05) 0%, transparent 70%)",
          pointerEvents: "none",
        }} />
        <div style={{ fontSize: 11, color: "#FF8C00", letterSpacing: 4, textTransform: "uppercase", marginBottom: 16, fontFamily: "monospace" }}>
          A LIFE-STAGED TRAVEL GUIDE: 101 DESTINATIONS
        </div>
        <h1 style={{
          fontSize: "clamp(36px, 6vw, 72px)",
          fontWeight: 900,
          margin: "0 0 16px",
          background: "linear-gradient(135deg, #fff 0%, #aaa 100%)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1.1,
          letterSpacing: -2,
        }}>
          My Bucket List of Travel
        </h1>
        <p style={{ color: "#666", fontSize: 16, maxWidth: 540, margin: "0 auto", lineHeight: 1.7 }}>
          Organized by physical capacity, climate urgency, and life stage —
          because the right trip at the wrong time is a missed opportunity.
        </p>
      </div>

      {/* Era Nav */}
      <div style={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background: "rgba(8,8,8,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        padding: "0 40px",
        display: "flex",
        gap: 0,
        overflowX: "auto",
      }}>
        {Object.entries(ERA_CONFIG).map(([key, cfg]) => (
          <button
            key={key}
            onClick={() => { setActiveEra(key); setSearch(""); }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "20px 24px",
              color: activeEra === key ? cfg.color : "#555",
              borderBottom: activeEra === key ? `2px solid ${cfg.color}` : "2px solid transparent",
              fontFamily: "monospace",
              fontSize: 12,
              fontWeight: 700,
              letterSpacing: 1,
              textTransform: "uppercase",
              whiteSpace: "nowrap",
              transition: "all 0.2s",
            }}
          >
            {cfg.icon} {cfg.label}
          </button>
        ))}
      </div>

      {/* Main Content */}
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "40px 40px 80px" }}>
        {/* Era Header */}
        <div style={{ marginBottom: 32, display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div>
            <div style={{ fontSize: 11, color: era.color, fontWeight: 700, letterSpacing: 2, textTransform: "uppercase", fontFamily: "monospace", marginBottom: 6 }}>
              {era.icon} {era.label}
            </div>
            <div style={{ fontSize: 16, color: "#666", maxWidth: 500 }}>{era.subtitle}</div>
          </div>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Filter by name, country, region, or tag..."
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "10px 16px",
              color: "white",
              fontSize: 13,
              width: 340,
              outline: "none",
              fontFamily: "monospace",
            }}
          />
        </div>

        {/* Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))",
          gap: 20,
        }}>
          {filtered.map(dest => (
            <DestinationCard key={dest.id} dest={dest} onClick={setSelectedDest} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#444", fontSize: 14 }}>
            No destinations match that search.
          </div>
        )}

        {/* Legend */}
        <div style={{
          marginTop: 60,
          padding: "24px 32px",
          background: "rgba(255,255,255,0.03)",
          borderRadius: 16,
          border: "1px solid rgba(255,255,255,0.06)",
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 32,
        }}>
          <div>
            <div style={{ fontSize: 11, color: "#FF8C00", fontWeight: 700, letterSpacing: 2, marginBottom: 12, fontFamily: "monospace" }}>CLIMATE URGENCY SCALE</div>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <UrgencyDot level={i} />
                <span style={{ fontSize: 12, color: "#888" }}><strong style={{ color: "#aaa" }}>{i}</strong> — {URGENCY_LABELS[i]}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 11, color: "#FF8C00", fontWeight: 700, letterSpacing: 2, marginBottom: 12, fontFamily: "monospace" }}>PHYSICAL DEMAND SCALE</div>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <PhysicalBar level={i} />
                <span style={{ fontSize: 12, color: "#888" }}><strong style={{ color: "#aaa" }}>{i}</strong> — {PHYSICAL_LABELS[i]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedDest && <Modal dest={selectedDest} onClose={() => setSelectedDest(null)} />}
    </div>
  );
}