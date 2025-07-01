// ============ 4. InsightsHeader.jsx ============
export default function InsightsHeader({ hideEarnings, setHideEarnings }) {
  return (
    <div className="d-flex justify-content-between bdrb1 pb15 mb20">
      <div>
        <h5 className="title">Income Insights</h5>
        <p className="text fz14 mb-0">Track your earning patterns and optimize your schedule</p>
      </div>
      <button
        onClick={() => setHideEarnings(!hideEarnings)}
        className="btn btn-outline-primary btn-sm"
      >
        {hideEarnings ? '👁️ Show' : '🙈 Hide'} Earnings
      </button>
    </div>
  );
}
