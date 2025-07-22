// src/components/customer-workspace/customer/appointments/appointments-table-toolbar.jsx
"use client";

import { Cross2Icon } from "@radix-ui/react-icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Search, 
  SlidersHorizontal, 
  Eye
} from "lucide-react";
import { statusOptions } from "./columns/appointments-columns";
import { DataTableFacetedFilter } from "./data-table-faceted-filter";

export function AppointmentsTableToolbar({ 
  table, 
  globalFilter, 
  setGlobalFilter 
}) {
  const isFiltered = table.getState().columnFilters.length > 0 || globalFilter;

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-1 items-center space-x-2">
        {/* Global Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search appointments..."
            value={globalFilter ?? ""}
            onChange={(event) => setGlobalFilter(String(event.target.value))}
            className="pl-8 h-8"
          />
        </div>

        {/* Status Filter */}
        {table.getColumn("status") && (
          <DataTableFacetedFilter
            column={table.getColumn("status")}
            title="Status"
            options={statusOptions}
          />
        )}

        {/* Clear Filters */}
        {isFiltered && (
          <Button
            variant="ghost"
            onClick={() => {
              table.resetColumnFilters();
              setGlobalFilter("");
            }}
            className="h-8 px-2 lg:px-3"
          >
            Reset
            <Cross2Icon className="ml-2 h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Right Side Actions */}
      <div className="flex items-center space-x-2">
        {/* Active Filters Display */}
        {table.getState().columnFilters.length > 0 && (
          <div className="flex items-center space-x-1">
            {table.getState().columnFilters.map((filter) => {
              const column = table.getColumn(filter.id);
              if (!column || !filter.value) return null;
              
              return (
                <Badge
                  key={filter.id}
                  variant="secondary"
                  className="text-xs"
                >
                  {filter.id}: {Array.isArray(filter.value) ? filter.value.length : filter.value}
                </Badge>
              );
            })}
          </div>
        )}

        {/* Column Visibility Toggle */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-8 lg:flex"
            >
              <SlidersHorizontal className="mr-2 h-4 w-4" />
              <span className="hidden lg:inline">View</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuLabel>Toggle columns</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {table
              .getAllColumns()
              .filter(
                (column) =>
                  typeof column.accessorFn !== "undefined" && column.getCanHide()
              )
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(!!value)}
                  >
                    <Eye className="mr-2 h-4 w-4" />
                    {column.id.replace('_', ' ')}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}