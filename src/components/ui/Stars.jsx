export default function Stars({ n, max = 5, small = false }) {
  return (
    <span style={{ color: "#f59e0b", fontSize: small ? 12 : 15 }}>
      {Array.from({ length: max }, (_, i) => i < Math.round(n) ? "★" : "☆").join("")}
    </span>
  );
}
