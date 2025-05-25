import Link from "next/link";

export default function Mega({ staticMenuClass }) {
  return (
    <>
      <div id="mega-menu">
        <a
          className={`btn-mega fw500 ${
            staticMenuClass ? staticMenuClass : ""
          } `}
        >
          <span
            className={`pl30 pl10-xl pr5 fz15 vam flaticon-menu ${
              staticMenuClass ? staticMenuClass : ""
            } `}
          />
           Services
        </a>
        <ul className="menu ps-0">
          {/* Interior Home Services */}
          <li>
            <a className="dropdown">
              <span className="menu-icn flaticon-interior-design" />
              <span className="menu-title">Interior Services</span>
            </a>
            <div className="drop-menu d-flex justify-content-between">
              <div className="one-third">
                <div className="h6 cat-title">Kitchen & Bath</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Kitchen Services</Link>
                  </li>
                  <li>
                    <Link href="/">Bathroom Services</Link>
                  </li>
                  <li>
                    <Link href="/">Cabinet Makers</Link>
                  </li>
                  <li>
                    <Link href="/">Cabinet Refacing</Link>
                  </li>
                  <li>
                    <Link href="/">Countertop Installation</Link>
                  </li>
                  <li>
                    <Link href="/">Bathtub Refinishing</Link>
                  </li>
                </ul>
                <div className="h6 cat-title">Design & Décor</div>
                <ul className="ps-0 mb-0">
                  <li>
                    <Link href="/">Interior Design</Link>
                  </li>
                  <li>
                    <Link href="/">Closet Design</Link>
                  </li>
                  <li>
                    <Link href="/">Home Staging</Link>
                  </li>
                  <li>
                    <Link href="/">Furniture Services</Link>
                  </li>
                  <li>
                    <Link href="/">Upholstery</Link>
                  </li>
                </ul>
              </div>
              <div className="one-third">
                <div className="h6 cat-title">Flooring & Surfaces</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Flooring</Link>
                  </li>
                  <li>
                    <Link href="/">Carpet Services</Link>
                  </li>
                  <li>
                    <Link href="/">Hardwood Floors</Link>
                  </li>
                  <li>
                    <Link href="/">Tile Installation</Link>
                  </li>
                  <li>
                    <Link href="/">Concrete Services</Link>
                  </li>
                  <li>
                    <Link href="/">Epoxy Flooring</Link>
                  </li>
                </ul>
                <div className="h6 cat-title">Walls & Ceilings</div>
                <ul className="ps-0 mb-0">
                  <li>
                    <Link href="/">Painting & Finishing</Link>
                  </li>
                  <li>
                    <Link href="/">Drywall</Link>
                  </li>
                  <li>
                    <Link href="/">Wallpaper Hanger</Link>
                  </li>
                  <li>
                    <Link href="/">Wallpaper Removal</Link>
                  </li>
                  <li>
                    <Link href="/">Plastering</Link>
                  </li>
                </ul>
              </div>
              <div className="one-third">
                <div className="h6 cat-title">Basement & Structure</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Basement Services</Link>
                  </li>
                  <li>
                    <Link href="/">Basement Waterproofing</Link>
                  </li>
                  <li>
                    <Link href="/">Foundation Services</Link>
                  </li>
                  <li>
                    <Link href="/">Masonry</Link>
                  </li>
                  <li>
                    <Link href="/">Structural Engineering</Link>
                  </li>
                  <li>
                    <Link href="/">Egress Window</Link>
                  </li>
                </ul>
                <div className="h6 cat-title">Remodeling</div>
                <ul className="ps-0 mb-0">
                  <li>
                    <Link href="/">Home Remodeling</Link>
                  </li>
                  <li>
                    <Link href="/">Contractors</Link>
                  </li>
                  <li>
                    <Link href="/">Architecture</Link>
                  </li>
                  <li>
                    <Link href="/">Mobile Home Remodeling</Link>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          {/* Exterior Home Services */}
          <li>
            <a className="dropdown">
              <span className="menu-icn flaticon-house" />
              <span className="menu-title">Exterior Services</span>
            </a>
            <div className="drop-menu d-flex justify-content-between">
              <div className="one-third">
                <div className="h6 cat-title">Roofing & Gutters</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Roofing</Link>
                  </li>
                  <li>
                    <Link href="/">Roof Cleaning</Link>
                  </li>
                  <li>
                    <Link href="/">Gutter Services</Link>
                  </li>
                  <li>
                    <Link href="/">Gutter Cleaning</Link>
                  </li>
                  <li>
                    <Link href="/">Gutter Repair</Link>
                  </li>
                </ul>
                <div className="h6 cat-title">Siding & Exterior</div>
                <ul className="ps-0 mb-0">
                  <li>
                    <Link href="/">Exterior Siding</Link>
                  </li>
                  <li>
                    <Link href="/">House Painting</Link>
                  </li>
                  <li>
                    <Link href="/">Stucco</Link>
                  </li>
                  <li>
                    <Link href="/">Pressure Washing</Link>
                  </li>
                </ul>
              </div>
              <div className="one-third">
                <div className="h6 cat-title">Windows & Doors</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Window Services</Link>
                  </li>
                  <li>
                    <Link href="/">Window Cleaning</Link>
                  </li>
                  <li>
                    <Link href="/">Window Replacement</Link>
                  </li>
                  <li>
                    <Link href="/">Window Treatment</Link>
                  </li>
                  <li>
                    <Link href="/">Door Services</Link>
                  </li>
                  <li>
                    <Link href="/">Garage Services</Link>
                  </li>
                  <li>
                    <Link href="/">Garage Doors</Link>
                  </li>
                </ul>
                <div className="h6 cat-title">Driveways & Concrete</div>
                <ul className="ps-0 mb-0">
                  <li>
                    <Link href="/">Driveway Services</Link>
                  </li>
                  <li>
                    <Link href="/">Concrete Driveways</Link>
                  </li>
                  <li>
                    <Link href="/">Driveway Pavers</Link>
                  </li>
                  <li>
                    <Link href="/">Stamped Concrete</Link>
                  </li>
                </ul>
              </div>
              <div className="one-third">
                <div className="h6 cat-title">Outdoor Structures</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Decks & Porches</Link>
                  </li>
                  <li>
                    <Link href="/">Fencing & Gates</Link>
                  </li>
                  <li>
                    <Link href="/">Dock Building</Link>
                  </li>
                  <li>
                    <Link href="/">Patios</Link>
                  </li>
                  <li>
                    <Link href="/">Awnings</Link>
                  </li>
                  <li>
                    <Link href="/">Outdoor Kitchens</Link>
                  </li>
                </ul>
                <div className="h6 cat-title">Protection</div>
                <ul className="ps-0 mb-0">
                  <li>
                    <Link href="/">Hurricane Shutters</Link>
                  </li>
                  <li>
                    <Link href="/">Window Security Film</Link>
                  </li>
                  <li>
                    <Link href="/">Window Tinting</Link>
                  </li>
                  <li>
                    <Link href="/">Disaster Preparedness</Link>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          {/* Mechanical & Utilities */}
          <li>
            <a className="dropdown">
              <span className="menu-icn flaticon-electric" />
              <span className="menu-title">Mechanical & Utilities</span>
            </a>
            <div className="drop-menu d-flex justify-content-between">
              <div className="one-third">
                <div className="h6 cat-title">Plumbing</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Plumbing</Link>
                  </li>
                  <li>
                    <Link href="/">Water Systems</Link>
                  </li>
                  <li>
                    <Link href="/">Water Heaters</Link>
                  </li>
                  <li>
                    <Link href="/">Water Softeners</Link>
                  </li>
                  <li>
                    <Link href="/">Drain Cleaning</Link>
                  </li>
                  <li>
                    <Link href="/">Drain Pipe Installation</Link>
                  </li>
                  <li>
                    <Link href="/">Sewer Cleaning</Link>
                  </li>
                  <li>
                    <Link href="/">Septic Tank Service</Link>
                  </li>
                  <li>
                    <Link href="/">Water Damage Restoration</Link>
                  </li>
                </ul>
              </div>
              <div className="one-third">
                <div className="h6 cat-title">Electrical & Lighting</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Electrical Services</Link>
                  </li>
                  <li>
                    <Link href="/">Lighting</Link>
                  </li>
                  <li>
                    <Link href="/">Ceiling Fan Installation</Link>
                  </li>
                  <li>
                    <Link href="/">Home Automation</Link>
                  </li>
                  <li>
                    <Link href="/">Generator Service</Link>
                  </li>
                </ul>
                <div className="h6 cat-title">HVAC</div>
                <ul className="ps-0 mb-0">
                  <li>
                    <Link href="/">HVAC</Link>
                  </li>
                  <li>
                    <Link href="/">Air Quality</Link>
                  </li>
                  <li>
                    <Link href="/">Air Duct Cleaning</Link>
                  </li>
                  <li>
                    <Link href="/">Heating Oil Company</Link>
                  </li>
                  <li>
                    <Link href="/">Fireplace & Chimney</Link>
                  </li>
                </ul>
              </div>
              <div className="one-third">
                <div className="h6 cat-title">Home Technology</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Home Entertainment</Link>
                  </li>
                  <li>
                    <Link href="/">Home Security</Link>
                  </li>
                  <li>
                    <Link href="/">Home Theater Installation</Link>
                  </li>
                  <li>
                    <Link href="/">Central Vacuum Cleaning</Link>
                  </li>
                </ul>
                <div className="h6 cat-title">Energy</div>
                <ul className="ps-0 mb-0">
                  <li>
                    <Link href="/">Solar Services</Link>
                  </li>
                  <li>
                    <Link href="/">Home Energy Audit</Link>
                  </li>
                  <li>
                    <Link href="/">Insulation</Link>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          {/* Landscape & Outdoor */}
          <li>
            <a className="dropdown">
              <span className="menu-icn flaticon-landscape" />
              <span className="menu-title">Landscape & Outdoor</span>
            </a>
            <div className="drop-menu d-flex justify-content-between">
              <div className="one-third">
                <div className="h6 cat-title">Lawn & Garden</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Lawn Care</Link>
                  </li>
                  <li>
                    <Link href="/">Landscaping</Link>
                  </li>
                  <li>
                    <Link href="/">Lawn & Landscaping</Link>
                  </li>
                  <li>
                    <Link href="/">Lawn Treatment</Link>
                  </li>
                  <li>
                    <Link href="/">Irrigation System</Link>
                  </li>
                  <li>
                    <Link href="/">Mulch Delivering</Link>
                  </li>
                  <li>
                    <Link href="/">Nurseries</Link>
                  </li>
                </ul>
                <div className="h6 cat-title">Tree & Plants</div>
                <ul className="ps-0 mb-0">
                  <li>
                    <Link href="/">Tree Services</Link>
                  </li>
                  <li>
                    <Link href="/">Leaf Removal</Link>
                  </li>
                </ul>
              </div>
              <div className="one-third">
                <div className="h6 cat-title">Outdoor Features</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Water Features</Link>
                  </li>
                  <li>
                    <Link href="/">Fountains</Link>
                  </li>
                  <li>
                    <Link href="/">Pool Installers</Link>
                  </li>
                  <li>
                    <Link href="/">Landscape Lighting</Link>
                  </li>
                  <li>
                    <Link href="/">Playground Equipment Installation</Link>
                  </li>
                  <li>
                    <Link href="/">Dog Fencing</Link>
                  </li>
                </ul>
                <div className="h6 cat-title">Seasonal</div>
                <ul className="ps-0 mb-0">
                  <li>
                    <Link href="/">Snow Removal</Link>
                  </li>
                  <li>
                    <Link href="/">Roof Snow Removal</Link>
                  </li>
                  <li>
                    <Link href="/">Holiday Services</Link>
                  </li>
                  <li>
                    <Link href="/">Holiday Decorating</Link>
                  </li>
                </ul>
              </div>
              <div className="one-third">
                <div className="h6 cat-title">Outdoor Maintenance</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Lawn Mower Repair</Link>
                  </li>
                  <li>
                    <Link href="/">Rototilling</Link>
                  </li>
                  <li>
                    <Link href="/">Stone & Gravel</Link>
                  </li>
                  <li>
                    <Link href="/">Hardscaping</Link>
                  </li>
                </ul>
                <div className="h6 cat-title">Excavation</div>
                <ul className="ps-0 mb-0">
                  <li>
                    <Link href="/">Excavation</Link>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          {/* Cleaning & Maintenance */}
          <li>
            <a className="dropdown">
              <span className="menu-icn flaticon-broom" />
              <span className="menu-title">Cleaning & Maintenance</span>
            </a>
            <div className="drop-menu d-flex justify-content-between">
              <div className="one-third">
                <div className="h6 cat-title">General Cleaning</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Home Cleaning</Link>
                  </li>
                  <li>
                    <Link href="/">House Cleaning</Link>
                  </li>
                  <li>
                    <Link href="/">Carpet Cleaning</Link>
                  </li>
                  <li>
                    <Link href="/">Cleaning Services</Link>
                  </li>
                  <li>
                    <Link href="/">Floor Buffing</Link>
                  </li>
                  <li>
                    <Link href="/">Floor Cleaning</Link>
                  </li>
                </ul>
                <div className="h6 cat-title">Professional Organizers</div>
                <ul className="ps-0 mb-0">
                  <li>
                    <Link href="/">Professional Organizers</Link>
                  </li>
                </ul>
              </div>
              <div className="one-third">
                <div className="h6 cat-title">Specialty Cleaning</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Specialty Cleaning</Link>
                  </li>
                  <li>
                    <Link href="/">Oriental Rug Cleaning</Link>
                  </li>
                  <li>
                    <Link href="/">Blind Cleaning</Link>
                  </li>
                  <li>
                    <Link href="/">Chimney Sweep</Link>
                  </li>
                  <li>
                    <Link href="/">Drapery Cleaning</Link>
                  </li>
                  <li>
                    <Link href="/">Upholstery Cleaning</Link>
                  </li>
                </ul>
                <div className="h6 cat-title">Waste Management</div>
                <ul className="ps-0 mb-0">
                  <li>
                    <Link href="/">Waste Management</Link>
                  </li>
                  <li>
                    <Link href="/">Dumpster Rental</Link>
                  </li>
                  <li>
                    <Link href="/">Hauling</Link>
                  </li>
                  <li>
                    <Link href="/">Trash Removal</Link>
                  </li>
                </ul>
              </div>
              <div className="one-third">
                <div className="h6 cat-title">Hazardous Materials</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Hazardous Materials</Link>
                  </li>
                  <li>
                    <Link href="/">Mold Removal</Link>
                  </li>
                  <li>
                    <Link href="/">Asbestos Removal</Link>
                  </li>
                  <li>
                    <Link href="/">Lead Paint Removal</Link>
                  </li>
                  <li>
                    <Link href="/">Biohazard Cleanup</Link>
                  </li>
                  <li>
                    <Link href="/">Radon Mitigation</Link>
                  </li>
                </ul>
                <div className="h6 cat-title">Animal Services</div>
                <ul className="ps-0 mb-0">
                  <li>
                    <Link href="/">Animal Services</Link>
                  </li>
                  <li>
                    <Link href="/">Animal Removal</Link>
                  </li>
                  <li>
                    <Link href="/">Pest Control</Link>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          {/* Repairs & Specialty */}
          <li>
            <a className="dropdown">
              <span className="menu-icn flaticon-tools" />
              <span className="menu-title">Repairs & Specialty</span>
            </a>
            <div className="drop-menu d-flex justify-content-between">
              <div className="one-third">
                <div className="h6 cat-title">Appliance & Electronics</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Appliance Repair</Link>
                  </li>
                  <li>
                    <Link href="/">Large Appliances</Link>
                  </li>
                  <li>
                    <Link href="/">Small Appliance Repair</Link>
                  </li>
                  <li>
                    <Link href="/">Grill Repair</Link>
                  </li>
                  <li>
                    <Link href="/">Electronics Repair</Link>
                  </li>
                  <li>
                    <Link href="/">Computer Repair</Link>
                  </li>
                  <li>
                    <Link href="/">Phone Repair</Link>
                  </li>
                  <li>
                    <Link href="/">Antenna Repair</Link>
                  </li>
                  <li>
                    <Link href="/">Satellite Tv</Link>
                  </li>
                </ul>
              </div>
              <div className="one-third">
                <div className="h6 cat-title">Specialty Crafts</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Glass Services</Link>
                  </li>
                  <li>
                    <Link href="/">Glass Block</Link>
                  </li>
                  <li>
                    <Link href="/">Glass Repair</Link>
                  </li>
                  <li>
                    <Link href="/">Screen Repair</Link>
                  </li>
                  <li>
                    <Link href="/">Metal Services</Link>
                  </li>
                  <li>
                    <Link href="/">Iron Work</Link>
                  </li>
                  <li>
                    <Link href="/">Metal Fabrication</Link>
                  </li>
                  <li>
                    <Link href="/">Welding</Link>
                  </li>
                  <li>
                    <Link href="/">Woodworking</Link>
                  </li>
                </ul>
              </div>
              <div className="one-third">
                <div className="h6 cat-title">Home Services</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Handyman</Link>
                  </li>
                  <li>
                    <Link href="/">Gas Leak Repair</Link>
                  </li>
                  <li>
                    <Link href="/">Dryer Vent Cleaning</Link>
                  </li>
                  <li>
                    <Link href="/">Childproofing</Link>
                  </li>
                  <li>
                    <Link href="/">Child Safety</Link>
                  </li>
                  <li>
                    <Link href="/">Furniture Refinishing</Link>
                  </li>
                  <li>
                    <Link href="/">Leather Repair</Link>
                  </li>
                  <li>
                    <Link href="/">Mailbox Repair</Link>
                  </li>
                  <li>
                    <Link href="/">Well & Water Pump Repair</Link>
                  </li>
                </ul>
              </div>
            </div>
          </li>

          {/* Professional Services */}
          <li>
            <a className="dropdown">
              <span className="menu-icn flaticon-inspection" />
              <span className="menu-title">Professional Services</span>
            </a>
            <div className="drop-menu d-flex justify-content-between">
              <div className="one-third">
                <div className="h6 cat-title">Property Assessment</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Home Inspection</Link>
                  </li>
                  <li>
                    <Link href="/">Appraisal Services</Link>
                  </li>
                  <li>
                    <Link href="/">Real Estate Appraising</Link>
                  </li>
                  <li>
                    <Link href="/">Jewelry Appraising</Link>
                  </li>
                  <li>
                    <Link href="/">Land Surveying</Link>
                  </li>
                </ul>
                <div className="h6 cat-title">Real Estate</div>
                <ul className="ps-0 mb-0">
                  <li>
                    <Link href="/">Real Estate</Link>
                  </li>
                  <li>
                    <Link href="/">Real Estate Agent</Link>
                  </li>
                  <li>
                    <Link href="/">Home Protection</Link>
                  </li>
                  <li>
                    <Link href="/">Home Warranty</Link>
                  </li>
                </ul>
              </div>
              <div className="one-third">
                <div className="h6 cat-title">Contractors & Builders</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">General Contractors</Link>
                  </li>
                  <li>
                    <Link href="/">Home Builder</Link>
                  </li>
                  <li>
                    <Link href="/">Home Remodeling</Link>
                  </li>
                </ul>
                <div className="h6 cat-title">Moving Services</div>
                <ul className="ps-0 mb-0">
                  <li>
                    <Link href="/">Moving Services</Link>
                  </li>
                  <li>
                    <Link href="/">Movers</Link>
                  </li>
                  <li>
                    <Link href="/">Piano Movers</Link>
                  </li>
                </ul>
              </div>
              <div className="one-third">
                <div className="h6 cat-title">Specialized Professionals</div>
                <ul className="ps-0 mb40">
                  <li>
                    <Link href="/">Architect</Link>
                  </li>
                  <li>
                    <Link href="/">Structural Engineering</Link>
                  </li>
                  <li>
                    <Link href="/">Skylight Installation</Link>
                  </li>
                </ul>
                <div className="h6 cat-title">Chimney Services</div>
                <ul className="ps-0 mb-0">
                  <li>
                    <Link href="/">Chimney Cap Repair</Link>
                  </li>
                  <li>
                    <Link href="/">Chimney Repair</Link>
                  </li>
                  <li>
                    <Link href="/">Fireplace Services</Link>
                  </li>
                  <li>
                    <Link href="/">Gas Fireplace Repair</Link>
                  </li>
                  <li>
                    <Link href="/">Firewood Company</Link>
                  </li>
                </ul>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </>
  );
}

