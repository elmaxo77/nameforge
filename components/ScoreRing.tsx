export function ScoreRing({ score }: { score: number }) {
  const color = score >= 85 ? "#c7f36b" : score >= 70 ? "#d8c86b" : "#9197a1";
  return (
    <div
      className="grid h-11 w-11 place-items-center rounded-full text-xs font-bold"
      style={{ background: `conic-gradient(${color} ${score * 3.6}deg, #252930 0)` }}
      title={`Total score ${score}`}
    >
      <span className="grid h-9 w-9 place-items-center rounded-full bg-panel">{score}</span>
    </div>
  );
}
