// src/components/customer-workspace/customer/debug/SessionDebugger.jsx
"use client";

import { Button } from '@/components/ui/button';

export const SessionDebugger = ({ onRestoreSession }) => {
  return (
    <Button onClick={onRestoreSession} className="bg-blue-600 hover:bg-blue-700">
      🔄 Restore Session
    </Button>
  );
};