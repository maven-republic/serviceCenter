import Link from "next/link";

export default function ProjectPriceWidget1() {
  return (
    <div className="price-widget pt-[25px] rounded-[8px]">
      <h3 className="widget-title">$100 - $150</h3>
      <p className="text text-sm">Hourly Rate</p>
      <div className="grid">
        <Link href="/contact" className="ud-btn btn-thm">
          Submit a Proposal
          <i className="fal fa-arrow-right-long" />
        </Link>
      </div>
    </div>
  );
}
