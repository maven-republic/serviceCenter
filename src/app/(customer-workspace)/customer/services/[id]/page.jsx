import { createClient } from "../../../../../../utils/supabase/server";

import ProfessionalManifest from "@/components/ProfessionalManifest";


export default async function ProfessionalCollectionInterface({ params }) {
  // Ensure params is properly awaited in Next.js 13+
  const serviceId = await params.id; // Fix for the first error
  
  try {
    const supabase = await createClient();

    console.log("Fetching with service ID:", serviceId);
    
    // Skip the service check since that table doesn't exist
    // Directly fetch professionals instead
    const { data, error } = await supabase
      .from("professional_service")
      .select(`
        professional_id,
        individual_professional (
          professional_id,
          bio,
          hourly_rate,
          rate_currency,
          verification_status,
          account (
            first_name,
            last_name,
            profile_picture_url
          )
        )
      `)
      .eq("service_id", serviceId)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching professionals:", error);
      throw new Error("Failed to load professionals");
    }

    if (!data || data.length === 0) {
      // No error but empty data
      return (
        <div className="container-fluid bg-light py-4">
          <div className="container">
            <div className="row mb-4">
              <div className="col">
                <h3 className="fw-bold mb-0">Professionals for this Service</h3>
                <p className="text-muted">0 professionals available</p>
              </div>
            </div>

            <div className="alert alert-light text-center">
              <p className="mb-2">No professionals currently offer this service.</p>
              <a href="/services" className="btn btn-sm btn-primary mt-2">Browse other services</a>
            </div>
          </div>
        </div>
      );
    }

    const professionals = data.map((item) => {
      const pro = item.individual_professional;
      return {
        ...pro,
        full_name: `${pro.account.first_name} ${pro.account.last_name}`,
        profile_picture_url: pro.account.profile_picture_url,
      };
    });

    return (
      <div className="container-fluid bg-light py-4">
        <div className="container">
          <div className="row mb-4">
            <div className="col">
              <h3 className="fw-bold mb-0">Professionals for this Service</h3>
              <p className="text-muted">{professionals.length} professionals available</p>
            </div>
          </div>

          <div className="row g-4">
            {professionals.map((pro) => (
              <div className="col-md-6 col-lg-4" key={pro.professional_id}>
                <ProfessionalManifest data={pro} />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  } catch (err) {
    console.error("Error in professional listing:", err);
    
    return (
      <div className="container py-5">
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error loading professionals</h4>
          <p>We encountered a problem while trying to load the professionals for this service.</p>
          <hr />
          <p className="mb-0">Please try again later or contact support if the problem persists.</p>
          <p className="text-muted mt-2 small">Error details: {err.message}</p>
        </div>
        <a href="/services" className="btn btn-primary mt-3">Return to Services</a>
      </div>
    );
  }
}