import { streamLinks } from "../config/launcherConfig.js";

export default function Streams() {
  return (
    <div className="content">
      <div className="launcher-grid">
        {streamLinks.map((s) => (
          <button
            key={s.id}
            className="launcher-tile tile-outro"
            onClick={() => window.open(s.url, "_blank", "noopener,noreferrer")}
          >
            <span className="icone">{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
