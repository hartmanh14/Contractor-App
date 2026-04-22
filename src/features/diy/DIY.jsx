import { useState } from "react";
import { useApp } from "@/store/AppContext";
import { card, btnPrimary, btnSm, colors } from "@/styles/theme";
import NewDIYWizard from "./NewDIYWizard";
import DIYDetail from "./DIYDetail";

const DIFFICULTY_COLORS = { beginner: "#22c55e", intermediate: "#f59e0b", advanced: "#ef4444" };
const STATUS_COLORS = { planning: "#3b82f6", "in-progress": "#f59e0b", complete: "#22c55e" };

function ProjectCard({ project, onClick }) {
  const { aiAnalysis, status, completedSteps = [] } = project;
  const totalSteps = aiAnalysis?.steps?.length || 0;
  const pct = totalSteps ? Math.round((completedSteps.length / totalSteps) * 100) : 0;
  const diff = aiAnalysis?.difficulty;
  const diffColor = DIFFICULTY_COLORS[diff] || "#64748b";
  const statColor = STATUS_COLORS[status] || "#64748b";

  return (
    <div
      onClick={onClick}
      style={{
        ...card,
        cursor: "pointer",
        transition: "border-color .15s, background .15s",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={e => e.currentTarget.style.borderColor = "#3b82f6"}
      onMouseLeave={e => e.currentTarget.style.borderColor = "#1e293b"}
    >
      {/* Status badge */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{
          fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em",
          color: statColor, background: statColor + "22", padding: "3px 8px", borderRadius: 99,
        }}>
          {status}
        </div>
        {diff && (
          <div style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em",
            color: diffColor, background: diffColor + "22", padding: "3px 8px", borderRadius: 99,
          }}>
            {diff}
          </div>
        )}
      </div>

      {/* Title */}
      <div style={{ fontSize: 16, fontWeight: 800, color: "#f8fafc", marginBottom: 4 }}>{project.name}</div>
      {project.room && (
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 12 }}>📍 {project.room}</div>
      )}

      {/* Stats row */}
      <div style={{ display: "flex", gap: 16, marginBottom: 14, flexWrap: "wrap" }}>
        {aiAnalysis?.estimatedTotalCost != null && (
          <div>
            <div style={{ fontSize: 10, color: "#475569" }}>Est. Cost</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#22c55e" }}>
              ${aiAnalysis.estimatedTotalCost}
            </div>
          </div>
        )}
        {aiAnalysis?.totalTimeHours != null && (
          <div>
            <div style={{ fontSize: 10, color: "#475569" }}>Time</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0" }}>
              {aiAnalysis.totalTimeHours}h
            </div>
          </div>
        )}
        {totalSteps > 0 && (
          <div>
            <div style={{ fontSize: 10, color: "#475569" }}>Steps</div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "#e2e8f0" }}>
              {completedSteps.length}/{totalSteps}
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      {totalSteps > 0 && (
        <div>
          <div style={{ height: 4, background: "#1e293b", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ height: "100%", width: `${pct}%`, background: pct === 100 ? "#22c55e" : "#3b82f6", borderRadius: 99, transition: "width .3s" }} />
          </div>
          <div style={{ fontSize: 10, color: "#475569", marginTop: 4 }}>{pct}% complete</div>
        </div>
      )}

      {/* Arrow hint */}
      <div style={{ position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)", color: "#334155", fontSize: 18 }}>›</div>
    </div>
  );
}

function EmptyState({ onNew }) {
  return (
    <div style={{ ...card, textAlign: "center", padding: "48px 24px", borderColor: "#3b82f633" }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔧</div>
      <div style={{ fontSize: 18, fontWeight: 800, color: "#f8fafc", marginBottom: 8 }}>No DIY projects yet</div>
      <div style={{ fontSize: 13, color: "#64748b", maxWidth: 360, margin: "0 auto 24px" }}>
        Start your first project — get an AI-powered materials list, step-by-step guidance, time estimate, and total cost breakdown.
      </div>
      <button onClick={onNew} style={btnPrimary}>+ Start a DIY Project</button>
    </div>
  );
}

export default function DIY() {
  const { diyProjects } = useApp();
  const [view, setView] = useState("list"); // "list" | "new" | "detail"
  const [selectedId, setSelectedId] = useState(null);

  const selectedProject = diyProjects.find(p => p.id === selectedId);

  if (view === "new") {
    return <NewDIYWizard onBack={() => setView("list")} />;
  }

  if (view === "detail" && selectedProject) {
    return (
      <DIYDetail
        project={selectedProject}
        onBack={() => { setView("list"); setSelectedId(null); }}
      />
    );
  }

  const inProgress = diyProjects.filter(p => p.status === "in-progress");
  const planning = diyProjects.filter(p => p.status === "planning");
  const complete = diyProjects.filter(p => p.status === "complete");

  return (
    <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 20px 60px" }}>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 900, color: "#f8fafc", margin: "0 0 4px" }}>
            🔧 DIY Projects
          </h1>
          <div style={{ fontSize: 13, color: "#64748b" }}>
            AI-powered planning, materials, and step-by-step guidance
          </div>
        </div>
        {diyProjects.length > 0 && (
          <button onClick={() => setView("new")} style={btnPrimary}>+ New Project</button>
        )}
      </div>

      {diyProjects.length === 0 && <EmptyState onNew={() => setView("new")} />}

      {/* Summary stats */}
      {diyProjects.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 12, marginBottom: 28 }}>
          {[
            { label: "Total Projects", value: diyProjects.length, color: "#3b82f6" },
            { label: "In Progress", value: inProgress.length, color: "#f59e0b" },
            { label: "Complete", value: complete.length, color: "#22c55e" },
            {
              label: "Total Est. Cost",
              value: "$" + diyProjects.reduce((s, p) => s + (p.aiAnalysis?.estimatedTotalCost || 0), 0),
              color: "#a78bfa",
            },
          ].map(c => (
            <div key={c.label} style={card}>
              <div style={{ fontSize: 10, color: "#64748b", textTransform: "uppercase", letterSpacing: ".07em" }}>{c.label}</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: c.color, margin: "4px 0 0" }}>{c.value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Project sections */}
      {inProgress.length > 0 && (
        <Section title="In Progress" projects={inProgress} onOpen={id => { setSelectedId(id); setView("detail"); }} />
      )}
      {planning.length > 0 && (
        <Section title="Planning" projects={planning} onOpen={id => { setSelectedId(id); setView("detail"); }} />
      )}
      {complete.length > 0 && (
        <Section title="Completed" projects={complete} onOpen={id => { setSelectedId(id); setView("detail"); }} />
      )}
    </div>
  );
}

function Section({ title, projects, onOpen }) {
  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 12 }}>
        {title} · {projects.length}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 16 }}>
        {projects.map(p => (
          <ProjectCard key={p.id} project={p} onClick={() => onOpen(p.id)} />
        ))}
      </div>
    </div>
  );
}
