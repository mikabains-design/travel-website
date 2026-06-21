import { useState, useEffect, useMemo, useRef } from "react";
import { DESTINATIONS } from "./destinations";

/* ----------------------------------------------------------------------------
   My Bucket List of Travel
   Minimal landing: three stacked white sliders (budget, length, activity) + Go.
   Reads only the current schema: estimatedCost, idealDays, physicalDemand,
   image, info, tags, climateNote (optional), country, region, name.
---------------------------------------------------------------------------- */

const EMBER = "#FF8C00"; // results identity only (cards + modal)
const PHYSICAL_LABELS = ["", "Easy", "Moderate", "Active", "Demanding", "Extreme"];
const ACTIVITY_DIAL = ["", "Relaxed", "Easy-going", "Active", "Demanding", "Extreme"];

// Budget slider: $1,500 across nearly the whole track; $10,000 sits just shy of
// the right end; the final notch (>= BUDGET_MAX) means no cost ceiling.
const BUDGET_MIN = 1500;
const BUDGET_MAX = 10250; // last notch = Unlimited
const BUDGET_STEP = 250;

const DAYS_MIN = 3;
const DAYS_MAX = 30;
const ACT_MIN = 1;
const ACT_MAX = 5;

const fmtMoney = (n) => "$" + n.toLocaleString("en-CA");

// White fill up to the thumb, faint track beyond it.
const fillStyle = (val, min, max) => {
  const pct = ((val - min) / (max - min)) * 100;
  return {
    backgroundImage: `linear-gradient(to right, #fff 0%, #fff ${pct}%, rgba(255,255,255,0.18) ${pct}%, rgba(255,255,255,0.18) 100%)`,
  };
};

// ---- results-side pieces (keep the warm identity) -------------------------

function PhysicalBar({ level }) {
  return (
    <div style={{ display: "flex", gap: 3, alignItems: "center" }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            width: 14,
            height: 6,
            borderRadius: 2,
            background: i <= level ? EMBER : "rgba(255,255,255,0.1)",
          }}
        />
      ))}
    </div>
  );
}

function DestinationCard({ dest, onClick }) {
  return (
    <button type="button" onClick={() => onClick(dest)} className="card" aria-label={`Open ${dest.name}`}>
      <div className="card-photo">
        <img
          src={dest.image}
          alt={dest.name}
          loading="lazy"
          onError={(e) => {
            e.target.style.display = "none";
            e.target.parentElement.style.background = "#1a1a1a";
          }}
        />
        <div className="card-photo-fade" />
      </div>
      <div className="card-body">
        <div className="card-country">{dest.country}</div>
        <div className="card-name">{dest.name}</div>
        <div className="card-meta">
          <PhysicalBar level={dest.physicalDemand} />
          <span className="card-dot">·</span>
          <span>{dest.idealDays} days</span>
          <span className="card-dot">·</span>
          <span>{fmtMoney(dest.estimatedCost)}</span>
        </div>
        <div className="card-tags">
          {dest.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="tag">{tag}</span>
          ))}
        </div>
      </div>
    </button>
  );
}

function Modal({ dest, onClose }) {
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const stats = [
    { label: "Activity", value: PHYSICAL_LABELS[dest.physicalDemand], sub: <PhysicalBar level={dest.physicalDemand} /> },
    { label: "Ideal length", value: `${dest.idealDays} days` },
    { label: "Est. cost", value: `${fmtMoney(dest.estimatedCost)} CAD`, sub: <span className="stat-fine">per person from Toronto</span> },
    { label: "Region", value: dest.region },
  ];

  return (
    <div className="modal-scrim" onClick={onClose} role="dialog" aria-modal="true" aria-label={dest.name}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-photo">
          <img src={dest.image} alt={dest.name} onError={(e) => { e.target.style.display = "none"; }} />
          <div className="modal-photo-fade" />
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">×</button>
          <div className="modal-title-wrap">
            <div className="modal-eyebrow">{dest.country} · {dest.region}</div>
            <h2 className="modal-name">{dest.name}</h2>
          </div>
        </div>

        <div className="modal-body">
          <div className="modal-stats">
            {stats.map((s) => (
              <div key={s.label} className="stat">
                <div className="stat-label">{s.label}</div>
                <div className="stat-value">{s.value}</div>
                {s.sub && <div className="stat-sub">{s.sub}</div>}
              </div>
            ))}
          </div>

          <div className="modal-section">
            <div className="modal-section-label">Overview</div>
            <p className="modal-prose">{dest.info}</p>
          </div>

          {dest.climateNote && (
            <div className="climate-note">
              <div className="climate-note-label">Climate note</div>
              <p className="modal-prose">{dest.climateNote}</p>
            </div>
          )}

          <div className="modal-tags">
            {dest.tags.map((tag) => (
              <span key={tag} className="tag">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---- main app --------------------------------------------------------------

export default function App() {
  const [budget, setBudget] = useState(4000);
  const [days, setDays] = useState(10);
  const [activity, setActivity] = useState(3);
  const [revealed, setRevealed] = useState(false);
  const [selected, setSelected] = useState(null);

  const gridRef = useRef(null);
  const noLimit = budget >= BUDGET_MAX;

  const matches = useMemo(() => {
    return DESTINATIONS
      .filter(
        (d) =>
          d.estimatedCost >= budget * 0.4 &&
          (noLimit || d.estimatedCost <= budget * 1.2) &&
          d.idealDays >= days - 7 &&
          d.idealDays <= days + 3 &&
          (d.physicalDemand === activity || d.physicalDemand === activity - 1)
      )
      .sort((a, b) => a.estimatedCost - b.estimatedCost);
  }, [budget, days, activity, noLimit]);

  const go = () => {
    setRevealed(true);
    requestAnimationFrame(() => {
      gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  return (
    <div className="page">
      <style>{CSS}</style>

      {/* Landing: three stacked sliders + Go */}
      <section className="panel" aria-label="Trip filters">
        <div className="dials">
          <div className="dial">
            <div className="dial-head">
              <span className="dial-name">Budget</span>
              <span className="dial-read">{noLimit ? "Unlimited" : fmtMoney(budget)}</span>
            </div>
            <input
              type="range"
              min={BUDGET_MIN}
              max={BUDGET_MAX}
              step={BUDGET_STEP}
              value={budget}
              style={fillStyle(budget, BUDGET_MIN, BUDGET_MAX)}
              onChange={(e) => setBudget(Number(e.target.value))}
              aria-label="Budget per person in Canadian dollars"
            />
            <div className="dial-scale">
              <span>{fmtMoney(BUDGET_MIN)}</span>
              <span>Unlimited</span>
            </div>
          </div>

          <div className="dial">
            <div className="dial-head">
              <span className="dial-name">Length</span>
              <span className="dial-read">{days} days</span>
            </div>
            <input
              type="range"
              min={DAYS_MIN}
              max={DAYS_MAX}
              step={1}
              value={days}
              style={fillStyle(days, DAYS_MIN, DAYS_MAX)}
              onChange={(e) => setDays(Number(e.target.value))}
              aria-label="Trip length in days"
            />
            <div className="dial-scale">
              <span>3 days</span>
              <span>30 days</span>
            </div>
          </div>

          <div className="dial">
            <div className="dial-head">
              <span className="dial-name">Activity</span>
              <span className="dial-read">{ACTIVITY_DIAL[activity]}</span>
            </div>
            <input
              type="range"
              min={ACT_MIN}
              max={ACT_MAX}
              step={1}
              value={activity}
              style={fillStyle(activity, ACT_MIN, ACT_MAX)}
              onChange={(e) => setActivity(Number(e.target.value))}
              aria-label="How active the trip should be, 1 relaxed to 5 extreme"
            />
            <div className="dial-scale">
              <span>Relaxed</span>
              <span>Extreme</span>
            </div>
          </div>
        </div>

        <button type="button" className="go" onClick={go}>Go</button>
      </section>

      {/* Results */}
      <main ref={gridRef} className="results">
        {revealed && (
          matches.length > 0 ? (
            <div className="grid grid-in">
              {matches.map((dest) => (
                <DestinationCard key={dest.id} dest={dest} onClick={setSelected} />
              ))}
            </div>
          ) : (
            <div className="empty">
              Nothing fits all three dials at once. Loosen one, usually budget or
              days, and the trips come back.
            </div>
          )
        )}
      </main>

      {selected && <Modal dest={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

// ---- styles ----------------------------------------------------------------

const CSS = `
  :root { --ember: ${EMBER}; }

  .page {
    min-height: 100vh;
    background: #000;
    color: #f5f3ef;
    font-family: Georgia, 'Times New Roman', serif;
  }
  .dial-name, .dial-read, .dial-scale, .go,
  .card-country, .modal-eyebrow, .modal-section-label, .climate-note-label,
  .stat-label, .tag, .card-meta {
    font-family: ui-monospace, Menlo, Consolas, monospace;
  }

  /* landing */
  .panel {
    min-height: 100vh;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    gap: 52px; padding: 48px 24px;
  }
  .dials {
    width: 100%; max-width: 520px;
    display: flex; flex-direction: column; gap: 44px;
  }
  .dial { width: 100%; }
  .dial-head { display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 16px; }
  .dial-name { font-size: 13px; letter-spacing: 3px; text-transform: uppercase; color: #8a8a8a; }
  .dial-read { font-size: 24px; font-weight: 700; color: #fff; letter-spacing: 0.5px; }
  .dial-scale {
    display: flex; justify-content: space-between; margin-top: 12px;
    font-size: 11px; letter-spacing: 0.5px; color: #5a5a5a;
  }

  /* white range inputs: thin centered track, large hit area */
  input[type="range"] {
    -webkit-appearance: none; appearance: none;
    width: 100%; height: 20px; cursor: pointer;
    background-color: transparent;
    background-repeat: no-repeat; background-position: 0 center; background-size: 100% 4px;
    border-radius: 4px;
  }
  input[type="range"]::-webkit-slider-thumb {
    -webkit-appearance: none; appearance: none;
    width: 18px; height: 18px; border-radius: 50%;
    background: #fff; border: none; cursor: pointer;
    box-shadow: 0 1px 4px rgba(0,0,0,0.6);
  }
  input[type="range"]::-moz-range-track { background: transparent; height: 4px; border-radius: 4px; }
  input[type="range"]::-moz-range-thumb {
    width: 18px; height: 18px; border-radius: 50%; background: #fff; border: none; cursor: pointer;
  }
  input[type="range"]:focus-visible { outline: 2px solid #fff; outline-offset: 6px; }

  .go {
    font-size: 13px; letter-spacing: 3px; text-transform: uppercase; font-weight: 700;
    color: #fff; background: transparent; border: 1px solid rgba(255,255,255,0.45);
    border-radius: 8px; padding: 14px 56px; cursor: pointer;
    transition: background 0.18s, color 0.18s;
  }
  .go:hover { background: #fff; color: #000; }
  .go:focus-visible { outline: 2px solid #fff; outline-offset: 4px; }

  /* results */
  .results { max-width: 1280px; margin: 0 auto; padding: 32px 24px 96px; }
  .grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px; }
  .grid-in { animation: fade-up 0.5s ease both; }
  .empty { text-align: center; max-width: 600px; margin: -30vh auto 0; padding: 0 16px; color: #fff; font-size: 24px; line-height: 1.6; }
  .empty { text-align: center; padding: 64px 16px; color: #d0d0d0; font-size: 18px; line-height: 1.7; }

  /* card */
  .card {
    display: block; width: 100%; text-align: left; padding: 0; cursor: pointer;
    background: #111; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px;
    overflow: hidden; color: inherit; font: inherit;
    transform: translateZ(0);
    transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
  }
  .card:hover, .card:focus-visible {
    transform: translateY(-4px) translateZ(0); border-color: rgba(255,140,0,0.5);
    box-shadow: 0 12px 40px rgba(255,140,0,0.12); outline: none;
  }
  .card-photo { position: relative; padding-bottom: 60%; overflow: hidden; }
  .card-photo img { position: absolute; top: -1px; left: -1px; width: calc(100% + 2px); height: calc(100% + 2px); object-fit: cover; object-position: center; filter: brightness(0.85); }
  .card-photo-fade { position: absolute; left: 0; right: 0; bottom: 0; height: 22%; background: linear-gradient(transparent, rgba(0,0,0,0.85)); }
  .card-body { padding: 14px 16px 16px; }
  .card-country { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ember); font-weight: 700; margin-bottom: 5px; }
  .card-name { font-size: 17px; font-weight: 700; color: #fff; line-height: 1.3; margin-bottom: 12px; font-family: Georgia, serif; }
  .card-meta { display: flex; align-items: center; gap: 8px; font-size: 12px; color: #9a958c; }
  .card-dot { color: #444; }
  .card-tags { display: flex; flex-wrap: wrap; gap: 5px; margin-top: 12px; }
  .tag { font-size: 10px; letter-spacing: 0.3px; color: #8a857c; background: rgba(255,255,255,0.06); padding: 3px 8px; border-radius: 4px; }

  /* modal */
  .modal-scrim {
    position: fixed; inset: 0; z-index: 1000; padding: 20px;
    background: rgba(0,0,0,0.88); backdrop-filter: blur(6px);
    display: flex; align-items: center; justify-content: center;
  }
  .modal-card {
    background: #0f0f0f; border: 1px solid rgba(255,140,0,0.25); border-radius: 20px;
    width: 100%; max-width: 720px; max-height: 90vh; overflow-y: auto;
    box-shadow: 0 30px 80px rgba(0,0,0,0.6);
    scrollbar-width: thin;
    scrollbar-color: rgba(255,255,255,0.18) transparent;
  }
  .modal-card::-webkit-scrollbar { width: 6px; }
  .modal-card::-webkit-scrollbar-track { background: transparent; }
  .modal-card::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.18); border-radius: 999px; }
  .modal-card::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.32); }
  .modal-photo { position: relative; padding-bottom: 46%; overflow: hidden; border-radius: 20px 20px 0 0; }
  .modal-photo img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .modal-photo-fade { position: absolute; inset: 0; background: linear-gradient(to top, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.5) 14%, transparent 55%); }
  .modal-close {
    position: absolute; top: 16px; right: 16px; width: 36px; height: 36px; border-radius: 50%;
    background: rgba(0,0,0,0.6); border: 1px solid rgba(255,255,255,0.2); color: #fff;
    font-size: 22px; line-height: 1; cursor: pointer; display: flex; align-items: center; justify-content: center;
  }
  .modal-close:hover { background: rgba(0,0,0,0.85); }
  .modal-title-wrap { position: absolute; left: 24px; right: 24px; bottom: 20px; }
  .modal-eyebrow { font-size: 11px; letter-spacing: 2px; text-transform: uppercase; color: var(--ember); font-weight: 700; margin-bottom: 6px; }
  .modal-name { margin: 0; font-size: 28px; font-weight: 700; color: #fff; line-height: 1.2; font-family: Georgia, serif; }
  .modal-body { padding: 24px 28px 30px; }
  .modal-stats { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; margin-bottom: 26px; }
  .stat { background: rgba(255,255,255,0.04); border-radius: 10px; padding: 11px 13px; }
  .stat-label { font-size: 10px; letter-spacing: 1px; text-transform: uppercase; color: #666; margin-bottom: 5px; }
  .stat-value { font-size: 14px; font-weight: 700; color: #e6e2da; font-family: Georgia, serif; }
  .stat-sub { margin-top: 6px; }
  .stat-fine { font-family: Georgia, serif; font-size: 11px; color: #6a655d; }
  .modal-section { margin-bottom: 22px; }
  .modal-section-label, .climate-note-label { font-size: 11px; letter-spacing: 1.5px; text-transform: uppercase; color: var(--ember); font-weight: 700; margin-bottom: 10px; }
  .modal-prose { margin: 0; color: #cfcabf; line-height: 1.8; font-size: 15px; }
  .climate-note { padding: 14px 16px; margin-bottom: 22px; border-radius: 10px; background: rgba(255,255,255,0.04); border-left: 3px solid #555; }
  .climate-note-label { color: #9a958c; }
  .modal-tags { display: flex; flex-wrap: wrap; gap: 6px; }

  @media (max-width: 760px) {
    .modal-stats { grid-template-columns: 1fr 1fr; }
  }
  @media (prefers-reduced-motion: reduce) {
    * { animation: none !important; transition: none !important; scroll-behavior: auto !important; }
  }
`;
