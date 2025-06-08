// account/page.jsx
// import AccountOverview from "@/components/customer/account/AccountOverview";
import { createClient } from "@/utils/supabase/server";

export default async function AccountPage() {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  
  // Fetch user's account data
  const { data: accountData } = await supabase
    .from('account')
    .select(`
      *,
      individual_customer(*),
      phone(*),
      address(*)
    `)
    .eq('account_id', user.user.id)
    .single();
  
  // return <AccountOverview userData={accountData} />;
  return (
    <div className="container">
      <h1>Account Overview</h1>
      <pre>{JSON.stringify(accountData, null, 2)}</pre>
    </div>
  );
}