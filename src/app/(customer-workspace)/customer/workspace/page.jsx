import GlobalSearch from '@/components/customer-workspace/element/GlobalSearch';
import CustomerWorkspaceStructure from '@/components/customer-workspace/CustomerWorkspaceStructure';


export default function CustomerWorkspaceInterface() {
  return (
    <div className="dashboard__content">
      <div className="row">
        <div className="col-xl-12">
          <h2 className="mb-4">Find Services</h2>
          
          <div className="dashboard_card">
            <div className="dashboard_card_body">
              <div className="w-full max-w-xl mx-4">
                <GlobalSearch />
              </div>
              
              <CustomerWorkspaceStructure />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}