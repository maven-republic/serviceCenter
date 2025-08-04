// ============================================================================
// 7. src/components/customer-workspace/collections/ErrorState.jsx
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";

export function ErrorState({ error, onRetry }) {
  return (
    <Alert className="max-w-lg mx-auto border-destructive/50">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="space-y-4">
        <div>
          <h5 className="font-semibold mb-2 text-destructive">Unable to load services</h5>
          <p className="text-sm text-muted-foreground">{error}</p>
          <p className="text-xs text-muted-foreground mt-2">
            This might be a temporary connectivity issue. Please try again.
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={onRetry} size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Retry
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="outline" 
            size="sm"
          >
            Refresh Page
          </Button>
        </div>
      </AlertDescription>
    </Alert>
  );
}