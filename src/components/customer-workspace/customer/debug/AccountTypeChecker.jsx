// src/components/customer-workspace/customer/debug/AccountTypeChecker.jsx
"use client";

import { Button } from '@/components/ui/button';
import { useAccountType } from '@/primitives/customer/useAccountType';

export const AccountTypeChecker = () => {
  const { checkAccountType } = useAccountType();

  const handleCheckUserAccount = async () => {
    const result = await checkAccountType();
    
    if (result.error) {
      alert(`❌ ${result.error}`);
      return;
    }

    if (result.isCustomer) {
      alert(`✅ This is a CUSTOMER account!\nCustomer ID: ${result.customerData.customer_id}\nEmail: ${result.email}`);
    } else if (result.isProfessional) {
      alert(`⚠️ This is a PROFESSIONAL account!\nProfessional ID: ${result.professionalData.professional_id}\nEmail: ${result.email}\n\nYou need to log in with a customer account to view appointments.`);
    } else {
      alert(`❌ Account type unclear!\nEmail: ${result.email}\nNeither customer nor professional records found.`);
    }
  };

  return (
    <Button onClick={handleCheckUserAccount} variant="outline">
      Check Account Type
    </Button>
  );
};