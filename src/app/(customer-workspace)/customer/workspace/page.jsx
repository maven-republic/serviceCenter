import GlobalSearch from '@/components/customer-workspace/element/GlobalSearch';
import CustomerAccountOverview from '@/components/customer-workspace/section/CustomerAccountOverview';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  Calendar, 
  MapPin, 
  Clock, 
  Star,
  TrendingUp,
  Users,
  BookOpen,
  ArrowRight
} from "lucide-react";

export default function CustomerWorkspaceInterface() {
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Find Services</h1>
        <p className="text-muted-foreground">
          Discover and book trusted professionals for all your service needs
        </p>
      </div>

      {/* Search Section */}
      <Card className="border-2 border-dashed border-primary/20 bg-primary/5">
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Search className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">What service do you need?</h3>
              <p className="text-sm text-muted-foreground max-w-md">
                Search for professionals in your area or browse popular service categories
              </p>
            </div>
            
            <div className="w-full max-w-xl">
              <GlobalSearch />
            </div>
          </div>
        </CardContent>
      </Card>

         </div>
  );
}