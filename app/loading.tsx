export default function Loading() {
  return (
    <div style={{ padding: 22 }}>
      {/* KPI skeleton */}
      <div style={{ height: 32, width: 200, borderRadius: 8, marginBottom: 24 }} className="skeleton" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        {[...Array(4)].map((_,i) => (
          <div key={i} className="skeleton" style={{ height: 110, borderRadius: 13 }} />
        ))}
      </div>
      {/* Chart skeletons */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18, marginBottom: 20 }}>
        {[...Array(2)].map((_,i) => (
          <div key={i} className="skeleton" style={{ height: 280, borderRadius: 13 }} />
        ))}
      </div>
      {/* Table skeleton */}
      <div className="skeleton" style={{ height: 320, borderRadius: 13 }} />
    </div>
  );
}