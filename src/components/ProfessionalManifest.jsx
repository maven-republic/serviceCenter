"use client";
import Image from "next/image";

export default function ProfessionalManifest({ data }) {
  const {
    professional_id,
    first_name, 
    last_name,
    profile_picture_url,
    
    bio,
    verification_status,
    service_name,
    specialties = [],
  } = data;

  console.log('Professional Data:', data);
  const full_name = `${first_name ?? ''} ${last_name ?? ''}`.trim();


  // Extract job title/role from bio or use first specialty
  const jobTitle = specialties[0] || bio?.split('.')[0]?.substring(0, 30) || "Professional";
  
  // Determine badge display

  const badgeText = 
  verification_status === "verified" ? "Verified" :
  verification_status === "rejected" ? "Rejected" :
  verification_status === "suspended" ? "Suspended" :
  "";

  const badgeColor = 
  verification_status === "verified" ? "bg-success" :
  verification_status === "rejected" ? "bg-danger" :
  verification_status === "suspended" ? "bg-warning" :
  "bg-secondary";


  // const badgeText = verification_status === "verified" ? "Admin" : "";
  const showBadge = badgeText !== "";

  return (
    // shadow-sm p-4
    <div className="bg-white rounded ">
      <div className="d-flex justify-content-between align-items-start">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h5 className="mb-0 fw-bold">{full_name}</h5>
            {verification_status === "verified" && (
  <span className="badge bg-primary rounded-circle d-flex align-items-center justify-content-center" style={{ width: "24px", height: "24px" }}>
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="white" viewBox="0 0 16 16">
      <path d="M13.485 1.929a1 1 0 0 1 1.415 1.414l-8 8a1 1 0 0 1-1.414 0l-4-4A1 1 0 1 1 2.93 5.93L6.5 9.5l7-7z"/>
    </svg>
  </span>
)}


          </div>
          {service_name && (
  <span className="badge bg-primary bg-opacity-10 text-primary
   rounded-pill px-3 py-1 mt-2 d-inline-block"
  >
    {/* {service_name} */}
    {service_name.split(' ')[0]}

  </span>
)}
          {/* <p className="text-muted mb-0 mt-1">{jobTitle}</p> */}
        </div>
        
        {/* Profile image - right aligned as in the image */}
        <div className="rounded-circle overflow-hidden" 
        style={{width: "46px", 
        height: "46px"}}>
          {profile_picture_url ? (
            <Image
              src={profile_picture_url}
              alt={full_name}
              width={46}
              height={46}
              className="object-fit-cover w-100 h-100"
            />
          ) : (
            <div className="d-flex align-items-center justify-content-center w-100 h-100 bg-secondary text-white fw-bold">
              {full_name?.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons with email/call icons */}
      <div className="d-flex mt-4 border-top pt-2">
        <a href={`/messages/${professional_id}`} className="btn flex-grow-1 border-0 d-flex align-items-center justify-content-center text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-envelope me-2" viewBox="0 0 16 16">
            <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V4Zm2-1a1 1 0 0 0-1 1v.217l7 4.2 7-4.2V4a1 1 0 0 0-1-1H2Zm13 2.383-4.708 2.825L15 11.105V5.383Zm-.034 6.876-5.64-3.471L8 9.583l-1.326-.795-5.64 3.47A1 1 0 0 0 2 13h12a1 1 0 0 0 .966-.741ZM1 11.105l4.708-2.897L1 5.383v5.722Z"/>
          </svg>
          Email
        </a>
        <div className="vr my-2"></div>
        <a href={`/call/${professional_id}`} className="btn flex-grow-1 border-0 d-flex align-items-center justify-content-center text-secondary">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-telephone me-2" viewBox="0 0 16 16">
            <path d="M3.654 1.328a.678.678 0 0 0-1.015-.063L1.605 2.3c-.483.484-.661 1.169-.45 1.77a17.568 17.568 0 0 0 4.168 6.608 17.569 17.569 0 0 0 6.608 4.168c.601.211 1.286.033 1.77-.45l1.034-1.034a.678.678 0 0 0-.063-1.015l-2.307-1.794a.678.678 0 0 0-.58-.122l-2.19.547a1.745 1.745 0 0 1-1.657-.459L5.482 8.062a1.745 1.745 0 0 1-.46-1.657l.548-2.19a.678.678 0 0 0-.122-.58L3.654 1.328zM1.884.511a1.745 1.745 0 0 1 2.612.163L6.29 2.98c.329.423.445.974.315 1.494l-.547 2.19a.678.678 0 0 0 .178.643l2.457 2.457a.678.678 0 0 0 .644.178l2.189-.547a1.745 1.745 0 0 1 1.494.315l2.306 1.794c.829.645.905 1.87.163 2.611l-1.034 1.034c-.74.74-1.846 1.065-2.877.702a18.634 18.634 0 0 1-7.01-4.42 18.634 18.634 0 0 1-4.42-7.009c-.362-1.03-.037-2.137.703-2.877L1.885.511z"/>
          </svg>
          Call
        </a>
      </div>
    </div>
  );
}

