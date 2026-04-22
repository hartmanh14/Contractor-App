import { createContext, useContext, useState } from "react";
import {
  initialProjects, initialSubs, initialPermits,
  initialTasks, initialBudget, initialSafetyItems, initialDIYProjects,
} from "./initialData";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [appMode, setAppMode] = useState("contractor"); // "contractor" | "diy"
  const [diyProjects, setDIYProjects] = useState(initialDIYProjects);
  const [stage, setStage] = useState(1);
  const [hireSubStep, setHireSubStep] = useState("find");
  const [activeProject, setActiveProject] = useState(1);
  const [projects, setProjects] = useState(initialProjects);
  const [subs, setSubs] = useState(initialSubs);
  const [permits, setPermits] = useState(initialPermits);
  const [tasks, setTasks] = useState(initialTasks);
  const [budget, setBudget] = useState(initialBudget);
  const [safety, setSafety] = useState(initialSafetyItems);

  const proj = projects.find(p => p.id === activeProject);
  const projBudget = budget.filter(b => b.projectId === activeProject);
  const projTasks = tasks.filter(t => t.projectId === activeProject);
  const projPermits = permits.filter(p => p.projectId === activeProject);

  const totalBudgeted = projBudget.reduce((s, b) => s + b.budgeted, 0);
  const totalActual = projBudget.reduce((s, b) => s + b.actual, 0);
  const totalPaid = projBudget.filter(b => b.paid).reduce((s, b) => s + b.actual, 0);
  const safetyPct = safety.length
    ? Math.round((safety.filter(s => s.done).length / safety.length) * 100)
    : 0;

  function goToHire(subStep = "find") {
    setStage(3);
    setHireSubStep(subStep);
  }

  return (
    <AppContext.Provider value={{
      appMode, setAppMode,
      diyProjects, setDIYProjects,
      stage, setStage,
      hireSubStep, setHireSubStep, goToHire,
      activeProject, setActiveProject,
      proj, projBudget, projTasks, projPermits,
      totalBudgeted, totalActual, totalPaid, safetyPct,
      projects, setProjects,
      subs, setSubs,
      permits, setPermits,
      tasks, setTasks,
      budget, setBudget,
      safety, setSafety,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
