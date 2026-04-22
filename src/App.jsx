import { useApp } from "@/store/AppContext";
import Header from "@/components/layout/Header";
import Nav from "@/components/layout/Nav";
import Dashboard from "@/features/dashboard/Dashboard";
import Projects from "@/features/projects/Projects";
import FindSubs from "@/features/find-subs/FindSubs";
import Permits from "@/features/permits/Permits";
import Subs from "@/features/subs/Subs";
import Schedule from "@/features/schedule/Schedule";
import Budget from "@/features/budget/Budget";
import Safety from "@/features/safety/Safety";
import Contracts from "@/features/contracts/Contracts";

const VIEWS = {
  Dashboard, Projects, "Find Subs": FindSubs,
  Permits, Subs, Schedule, Budget, Safety, Contracts,
};

export default function App() {
  const { tab } = useApp();
  const View = VIEWS[tab];

  return (
    <div style={{ minHeight: "100vh", background: "#020617", color: "#e2e8f0" }}>
      <Header />
      <Nav />
      <div style={{ maxWidth: 960, margin: "0 auto", padding: "28px 20px" }}>
        <h1 style={{ fontSize: 24, fontWeight: 900, color: "#f8fafc", margin: "0 0 20px" }}>{tab}</h1>
        <View />
      </div>
    </div>
  );
}
