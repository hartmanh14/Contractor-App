export default function SectionHead({ title }) {
  return (
    <div style={{
      fontSize: 12, color: "#64748b", fontWeight: 700,
      textTransform: "uppercase", letterSpacing: ".08em", marginBottom: 10,
    }}>
      {title}
    </div>
  );
}
