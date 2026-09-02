import { useNavigate } from "react-router-dom";
import { launcherShortcuts } from "../config/launcherConfig.js";

export default function Launcher() {
  const navigate = useNavigate();

  function handleTap(shortcut) {
    if (shortcut.type === "internal") {
      navigate(shortcut.to);
    } else {
      window.open(shortcut.url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="content">
      <div className="launcher-grid">
        {launcherShortcuts.map((s) => (
          <button
            key={s.id}
            className={`launcher-tile ${s.tileClass}`}
            onClick={() => handleTap(s)}
          >
            <span className="icone">{s.icon}</span>
            <span>{s.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
