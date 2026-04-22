import { useApp } from "@/store/AppContext";
import Header from "@/components/layout/Header";
import WorkflowStepper from "@/components/layout/WorkflowStepper";
import DIY from "@/features/diy/DIY";
import { WORKFLOW_STAGES } from "@/lib/constants";
import { btnPrimary, btnSm, card } from "@/styles/theme";
import { fmt } from "@/lib/utils";

// Feature components
import Projects from "@/features/projects/Projects";
import FindSubs from "@/features/find-subs/FindSubs";
import Subs from "@/features/subs/Subs";
import Contracts from "@/features/contracts/Contracts";
import Permits from "@/features/permits/Permits";
import Schedule from "@/features/schedule/Schedule";
import Budget from "@/features/budget/Budget";
import Safety from "@/features/safety/Safety";

const HIRE_SUB_STEPS = [
  { key: "find",     label: "1 · Find Contractors",  desc: "Search by trade and location" },
  { key: "list",     label: "2 · Your Contractors",  desc: "Vet and manage your list" },
  { key: "contract", label: "3 · Review Contract",   desc: "AI review before you sign" },
];

function StageIntro({ stage: stageData }) {
  return (
    <div style={{ padding: "14px 18px", background: "#3b82f608", border: "1px solid #3b82f622", borderRadius: 10, marginBottom: 24, fontSize: 13, color: "#94a3b8", lineHeight: 1.7 }}>
      <span style={{ color: "#93c5fd", fontWeight: 700 }}>Why this step matters: </span>
      {stageData.why}
    </div>
  );
}

function Stage1() {
  const { proj } = useApp();
  return (
    <div>
      {!proj && (
        <div style={{ ...card, textAlign: "center", padding: "32px 24px", marginBottom: 20, borderColor: "#3b82f633" }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🏗</div>
          <div style={{ fontSize: 17, fontWeight: 800, color: "#f8fafc", marginBottom: 6 }}>Start by creating your project</div>
          <div style={{ fontSize: 13, color: "#64748b", marginBottom: 0 }}>
            Click <strong style={{ color: "#e2e8f0" }}>+ New Project</strong> below to set up your project details and run the AI analysis.
          </div>
        </div>
      )}
      <Projects />
    </div>
  );
}

function Stage2() {
  const { proj } = useApp();
  const aiEst = proj?.aiAnalysis?.costEstimate;
  return (
    <div>
      {aiEst && (
        <div style={{ ...card, marginBottom: 20, borderColor: "#22c55e33", background: "#22c55e08" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: "#22c55e", textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 8 }}>
            AI Cost Estimate for {proj.name}
          </div>
          <div style={{ display: "flex", gap: 20, flexWrap: "wrap", marginBottom: 8 }}>
            <div>
              <div style={{ fontSize: 11, color: "#64748b" }}>Low estimate</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#22c55e" }}>{fmt(aiEst.totalLow)}</div>
            </div>
            <div>
              <div style={{ fontSize: 11, color: "#64748b" }}>High estimate</div>
              <div style={{ fontSize: 20, fontWeight: 800, color: "#f59e0b" }}>{fmt(aiEst.totalHigh)}</div>
            </div>
          </div>
          {aiEst.notes && <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>{aiEst.notes}</div>}
        </div>
      )}
      {!aiEst && (
        <div style={{ ...card, marginBottom: 20, borderColor: "#f59e0b33", background: "#f59e0b08" }}>
          <div style={{ fontSize: 13, color: "#fcd34d" }}>
            💡 Run the <strong>AI Analysis</strong> in Step 1 to get a cost estimate you can use as a baseline for your budget line items.
          </div>
        </div>
      )}
      <Budget />
    </div>
  );
}

function Stage3() {
  const { hireSubStep, setHireSubStep } = useApp();
  const active = HIRE_SUB_STEPS.find(s => s.key === hireSubStep) || HIRE_SUB_STEPS[0];

  return (
    <div>
      {/* Sub-step navigation */}
      <div style={{ display: "flex", gap: 8, marginBottom: 24, flexWrap: "wrap" }}>
        {HIRE_SUB_STEPS.map(step => {
          const isCurrent = step.key === hireSubStep;
          return (
            <button key={step.key} onClick={() => setHireSubStep(step.key)} style={{
              padding: "10px 18px", borderRadius: 10, border: "none", cursor: "pointer",
              background: isCurrent ? "#3b82f6" : "#0f172a",
              color: isCurrent ? "#fff" : "#64748b",
              fontSize: 13, fontWeight: 700,
              borderBottom: isCurrent ? "2px solid #2563eb" : "2px solid transparent",
              transition: "all .15s",
            }}>
              {step.label}
            </button>
          );
        })}
      </div>

      {/* Sub-step description */}
      <div style={{ fontSize: 12, color: "#475569", marginBottom: 16 }}>{active.desc}</div>

      {hireSubStep === "find"     && <FindSubs />}
      {hireSubStep === "list"     && <Subs />}
      {hireSubStep === "contract" && <Contracts />}
    </div>
  );
}

function Stage4() { return <Permits />; }
function Stage5() { return <Schedule />; }

function Stage6() {
  const { totalBudgeted, totalActual, totalPaid, projBudget } = useApp();
  const paidItems = projBudget.filter(b => b.paid);
  const lienCount = paidItems.filter(b => b.lienWaiver).length;
  const over = totalActual > totalBudgeted;

  return (
    <div>
      {/* Payment health mini-dash */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Total Spent", value: fmt(totalActual), color: over ? "#ef4444" : "#22c55e", sub: `of ${fmt(totalBudgeted)} planned` },
          { label: "Total Paid Out", value: fmt(totalPaid), color: "#f59e0b", sub: `${fmt(totalActual - totalPaid)} still owed` },
          { label: "Lien Waivers", value: `${lienCount}/${paidItems.length}`, color: lienCount < paidItems.length && paidItems.length > 0 ? "#f59e0b" : "#22c55e", sub: "received for paid work" },
        ].map(c => (
          <div key={c.label} style={card}>
            <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: ".07em" }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: c.color, margin: "4px 0 2px" }}>{c.value}</div>
            <div style={{ fontSize: 11, color: "#475569" }}>{c.sub}</div>
          </div>
        ))}
      </div>
      <Budget />
    </div>
  );
}

function Stage7() {
  return <Safety />;
}

const STAGE_COMPONENTS = [null, Stage1, Stage2, Stage3, Stage4, Stage5, Stage6, Stage7];

export default function App() {
  const { appMode, stage, setStage } = useApp();
  const stageData = WORKFLOW_STAGES.find(s => s.id === stage);
  const StageComp = STAGE_COMPONENTS[stage] || Stage1;
  const isFirst = stage === 1;
  const isLast = stage === WORKFLOW_STAGES.length;
  const prev = WORKFLOW_STAGES.find(s => s.id === stage - 1);
  const next = WORKFLOW_STAGES.find(s => s.id === stage + 1);

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0" }}>
      <Header />

      {appMode === "diy" ? (
        <DIY />
      ) : (
        <>
          <WorkflowStepper />

          <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 20px 60px" }}>
            {/* Stage header */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: "#3b82f6", fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em", marginBottom: 6 }}>
                Step {stage} of {WORKFLOW_STAGES.length}
              </div>
              <h1 style={{ fontSize: 26, fontWeight: 900, color: "#f8fafc", margin: 0 }}>
                {stageData.icon} {stageData.title}
              </h1>
            </div>

            <StageIntro stage={stageData} />
            <StageComp />

            {/* Back / Next navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 36, paddingTop: 20, borderTop: "1px solid #1e293b" }}>
              {!isFirst ? (
                <button onClick={() => setStage(stage - 1)} style={{ ...btnSm, color: "#94a3b8", display: "flex", alignItems: "center", gap: 6 }}>
                  ← {prev.short}
                </button>
              ) : <div />}

              {!isLast ? (
                <button onClick={() => setStage(stage + 1)} style={{ ...btnPrimary, display: "flex", alignItems: "center", gap: 6 }}>
                  Next: {next.title} →
                </button>
              ) : (
                <div style={{ fontSize: 13, color: "#22c55e", fontWeight: 700 }}>✓ You've completed the full workflow</div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
