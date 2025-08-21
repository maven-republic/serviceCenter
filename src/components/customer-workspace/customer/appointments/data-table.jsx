// src/components/customer-workspace/customer/appointments/data-table.jsx
"use client";

import React from "react";
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  Search, 
  Settings2, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Calendar,
  Clock,
  MessageSquare,
  Eye,
  SortAsc,
  SortDesc
} from "lucide-react";
import { cn } from "@/lib/utils";

// Mobile Card Component for Individual Appointments
const AppointmentMobileCard = ({ appointment, onViewAppointment }) => {
  const getStatusColor = (status) => {
    const colors = {
      'pending': 'text-yellow-700 bg-yellow-50 border-yellow-200',
      'interested': 'text-blue-700 bg-blue-50 border-blue-200', 
      'competing': 'text-purple-700 bg-purple-50 border-purple-200',
      'evaluating': 'text-orange-700 bg-orange-50 border-orange-200',
      'quoted': 'text-green-700 bg-green-50 border-green-200',
      'converted': 'text-emerald-700 bg-emerald-50 border-emerald-200',
      'cancelled': 'text-red-700 bg-red-50 border-red-200',
    };
    return colors[status] || 'text-muted-foreground bg-muted border-border';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const truncateText = (text, maxLength = 80) => {
    if (!text) return '';
    return text.length > maxLength ? `${text.substring(0, maxLength)}...` : text;
  };

  return (
    <Card 
      className="mb-3 hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 cursor-pointer relative"
      onClick={() => onViewAppointment(appointment.appointment_id)}
    >
      <CardContent className="p-4">
        {/* Header Row */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0 pr-2">
            <h3 className="font-semibold text-sm text-foreground mb-1 line-clamp-2 leading-tight">
              {appointment.title || 'Untitled Request'}
            </h3>
            <p className="text-xs text-muted-foreground mb-2">
              {appointment.service?.name || 'Service Request'}
            </p>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <Badge 
                className={cn(
                  "text-xs px-2 py-0.5 font-medium capitalize",
                  getStatusColor(appointment.status)
                )}
                variant="outline"
              >
                {appointment.status.replace('_', ' ')}
              </Badge>
              <span className="text-xs text-muted-foreground font-mono">
                #{appointment.appointment_id.slice(0, 8)}
              </span>
            </div>
          </div>
          
          <Button
            size="sm"
            variant="ghost"
            className="h-9 w-9 p-0 flex-shrink-0 touch-target"
            onClick={(e) => {
              e.stopPropagation();
              onViewAppointment(appointment.appointment_id);
            }}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>

        {/* Message Preview */}
        {appointment.customer_message && (
          <div className="mb-3 p-3 bg-muted/30 rounded-md">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-3 w-3 text-muted-foreground mt-0.5 flex-shrink-0" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                {truncateText(appointment.customer_message, 120)}
              </p>
            </div>
          </div>
        )}

        {/* Footer Row */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(appointment.created_at)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatTime(appointment.created_at)}</span>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-semibold text-xs text-foreground">
              {appointment.interest_summary?.total_interests || 0} responses
            </div>
            <div className="text-xs text-muted-foreground">
              {appointment.interest_summary?.active_interests || 0} active
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export function DataTable({
  columns,
  data,
  onRowClick,
}) {
  const [sorting, setSorting] = React.useState([]);
  const [columnFilters, setColumnFilters] = React.useState([]);
  const [columnVisibility, setColumnVisibility] = React.useState({});
  const [rowSelection, setRowSelection] = React.useState({});
  const [globalFilter, setGlobalFilter] = React.useState("");
  const [isMobile, setIsMobile] = React.useState(false);

  // Detect mobile screen size
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // md breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    globalFilterFn: "includesString",
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: isMobile ? 5 : 10, // Fewer items on mobile
      },
    },
  });

  return (
    <div className="w-full space-y-4">
      {/* Mobile-First Toolbar */}
      <div className="space-y-3 sm:space-y-0 sm:flex sm:items-center sm:justify-between">
        <div className="flex flex-col sm:flex-row sm:flex-1 sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
          {/* Global Search - Full width on mobile */}
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 text-muted-foreground -translate-y-1/2" />
            <Input
              placeholder="Search appointments..."
              value={globalFilter ?? ""}
              onChange={(event) => setGlobalFilter(event.target.value)}
              className="pl-9 h-11 sm:h-10 touch-target"
            />
          </div>
          
          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto h-11 sm:h-10 touch-target">
                Status <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              {['pending', 'interested', 'competing', 'evaluating', 'quoted', 'converted', 'cancelled'].map((status) => {
                const isSelected = table.getColumn("status")?.getFilterValue()?.includes(status);
                return (
                  <DropdownMenuCheckboxItem
                    key={status}
                    className="capitalize"
                    checked={isSelected}
                    onCheckedChange={(value) => {
                      const currentFilter = table.getColumn("status")?.getFilterValue() || [];
                      if (value) {
                        table.getColumn("status")?.setFilterValue([...currentFilter, status]);
                      } else {
                        table.getColumn("status")?.setFilterValue(
                          currentFilter.filter((s) => s !== status)
                        );
                      }
                    }}
                  >
                    {status.replace('_', ' ')}
                  </DropdownMenuCheckboxItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Column Visibility - Hidden on mobile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="hidden sm:flex h-11 sm:h-10">
              <Settings2 className="mr-2 h-4 w-4" />
              View
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) =>
                      column.toggleVisibility(!!value)
                    }
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Mobile Cards or Desktop Table */}
      {isMobile ? (
        // Mobile Card Layout
        <div className="space-y-3">
          {table.getRowModel().rows?.length ? (
            table.getRowModel().rows.map((row) => (
              <AppointmentMobileCard
                key={row.id}
                appointment={row.original}
                onViewAppointment={(appointmentId) => {
                  const appointment = data.find(apt => apt.appointment_id === appointmentId);
                  if (appointment) onRowClick?.(appointment);
                }}
              />
            ))
          ) : (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground">No appointments found.</p>
            </Card>
          )}
        </div>
      ) : (
        // Desktop Table Layout
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent border-border">
                  {headerGroup.headers.map((header) => {
                    return (
                      <TableHead 
                        key={header.id}
                        className="font-semibold text-muted-foreground"
                      >
                        {header.isPlaceholder ? null : (
                          <div
                            className={cn(
                              header.column.getCanSort()
                                ? "cursor-pointer select-none flex items-center space-x-1 hover:text-foreground"
                                : ""
                            )}
                            onClick={header.column.getToggleSortingHandler()}
                          >
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext()
                            )}
                            {header.column.getCanSort() && (
                              <span className="ml-1">
                                {{
                                  asc: "↑",
                                  desc: "↓",
                                }[header.column.getIsSorted()] ?? "↕"}
                              </span>
                            )}
                          </div>
                        )}
                      </TableHead>
                    );
                  })}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className={cn(
                      "group cursor-pointer transition-colors hover:bg-muted/30 border-border/50"
                    )}
                    onClick={() => onRowClick?.(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-4">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Mobile-Optimized Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-3 sm:space-y-0 sm:space-x-2 py-4">
        <div className="text-sm text-muted-foreground order-2 sm:order-1">
          {table.getFilteredSelectedRowModel().rows.length} of{" "}
          {table.getFilteredRowModel().rows.length} row(s) selected.
        </div>
        
        <div className="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-6 lg:space-x-8 order-1 sm:order-2">
          {/* Rows per page - simplified on mobile */}
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Rows</p>
            <select
              className="h-10 w-16 rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring touch-target"
              value={table.getState().pagination.pageSize}
              onChange={(e) => {
                table.setPageSize(Number(e.target.value));
              }}
            >
              {(isMobile ? [5, 10, 20] : [10, 20, 30, 40, 50]).map((pageSize) => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
          
          {/* Page indicator */}
          <div className="text-sm font-medium">
            Page {table.getState().pagination.pageIndex + 1} of{" "}
            {table.getPageCount()}
          </div>
          
          {/* Navigation buttons */}
          <div className="flex items-center space-x-1">
            <Button
              variant="outline"
              className="hidden sm:flex h-10 w-10 p-0 touch-target"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to first page</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-10 w-10 p-0 touch-target"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <span className="sr-only">Go to previous page</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-10 w-10 p-0 touch-target"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to next page</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden sm:flex h-10 w-10 p-0 touch-target"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              <span className="sr-only">Go to last page</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile-optimized Results Summary */}
      <div className="border-t border-border bg-muted/20 px-4 sm:px-6 py-3 sm:py-4 mt-0 rounded-b-lg">
        <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
            <span>
              Showing {table.getRowModel().rows.length} of {data.length} appointment
              {data.length !== 1 ? 's' : ''}
              {table.getState().globalFilter && (
                <span> (filtered)</span>
              )}
            </span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-3 sm:gap-6 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-muted-foreground">Pending</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                <span className="text-muted-foreground">Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-muted-foreground">Completed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}