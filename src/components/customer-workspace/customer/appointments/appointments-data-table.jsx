// src/components/customer-workspace/customer/appointments/appointments-data-table.jsx
"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import {
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { Calendar, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";

import { appointmentsColumns, defaultColumnVisibility } from "./columns/appointments-columns";
import { AppointmentsTableToolbar } from "./appointments-table-toolbar";
import CustomerAppointmentDashboard from "../../interests/CustomerAppointmentDashboard";
import { cn } from "@/lib/utils";

export function AppointmentsDataTable({ 
  data,
  onRowClick,
  isLoading = false,
}) {
  const router = useRouter();
  const [sorting, setSorting] = useState([]);
  const [columnFilters, setColumnFilters] = useState([]);
  const [columnVisibility, setColumnVisibility] = useState(defaultColumnVisibility);
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");
  
  // Drawer state for appointment details
  const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const table = useReactTable({
    data,
    columns: appointmentsColumns,
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
        pageSize: 10,
      },
    },
  });

  // Handle row click to open appointment details
  const handleRowClick = (appointment) => {
    setSelectedAppointmentId(appointment.appointment_id);
    setIsDrawerOpen(true);
    onRowClick?.(appointment);
  };

  // Handle drawer close
  const handleCloseDrawer = () => {
    setIsDrawerOpen(false);
    setSelectedAppointmentId(null);
  };

  // Handle create appointment
  const handleCreateAppointment = () => {
    router.push('/customer/workspace');
  };

  const selectedAppointment = data.find(
    apt => apt.appointment_id === selectedAppointmentId
  );

  return (
    <>
      <Card className="animate-fade-in relative">
        {/* Large Create Button - Top Right Corner INSIDE Card */}
        <Button
          onClick={handleCreateAppointment}
          className="absolute top-4 right-4 z-10 h-12 w-12 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-200"
          title="Create New Appointment"
        >
          <Plus className="h-6 w-6" />
        </Button>

        <CardHeader className="pb-4 pr-20">
          <CardTitle className="flex items-center gap-3 text-foreground">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
              <Calendar className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">Your Appointments</h3>
              <p className="text-sm text-muted-foreground font-normal">
                {data.length} appointment{data.length !== 1 ? 's' : ''} total
              </p>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Toolbar with search and filters */}
          <AppointmentsTableToolbar 
            table={table}
            globalFilter={globalFilter}
            setGlobalFilter={setGlobalFilter}
          />

          {/* Table Container with Fixed Height and Scroll */}
          <div className="rounded-md border">
            <div className="relative">
              {/* Fixed height container with internal scroll */}
              <div className="max-h-[600px] overflow-y-auto">
                <Table>
                  <TableHeader className="sticky top-0 bg-background z-10">
                    {table.getHeaderGroups().map((headerGroup) => (
                      <TableRow key={headerGroup.id} className="hover:bg-transparent border-border">
                        {headerGroup.headers.map((header) => {
                          return (
                            <TableHead key={header.id} className="font-semibold text-muted-foreground bg-background">
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
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
                            "group cursor-pointer transition-colors hover:bg-muted/30",
                            "border-border/50"
                          )}
                          onClick={() => handleRowClick(row.original)}
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
                          colSpan={appointmentsColumns.length}
                          className="h-24 text-center"
                        >
                          {isLoading ? "Loading appointments..." : "No appointments found."}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between space-x-2 py-4">
            <div className="flex-1 text-sm text-muted-foreground">
              {table.getFilteredSelectedRowModel().rows.length} of{" "}
              {table.getFilteredRowModel().rows.length} appointment(s) selected.
            </div>
            <div className="space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.previousPage()}
                disabled={!table.getCanPreviousPage()}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => table.nextPage()}
                disabled={!table.getCanNextPage()}
              >
                Next
              </Button>
            </div>
          </div>

          {/* Enhanced Footer */}
          <div className="border-t border-border bg-muted/20 px-6 py-4 mt-0 rounded-b-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                <span>
                  Showing {table.getRowModel().rows.length} of {data.length} appointment{data.length !== 1 ? 's' : ''}
                </span>
              </div>
              
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-6 text-xs">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-muted-foreground">Pending</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-muted-foreground">Active</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-muted-foreground">Completed</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointment Details Drawer */}
      <Sheet open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-4xl overflow-y-auto">
          <SheetHeader className="pb-6 border-b">
            <div className="space-y-1">
              <SheetTitle className="text-xl">
                {selectedAppointment?.title || 'Appointment Details'}
              </SheetTitle>
              <SheetDescription className="flex items-center gap-2">
                <span>{selectedAppointment?.service?.name || 'Service Request'}</span>
                {selectedAppointment && (
                  <>
                    <span>•</span>
                    <span className="capitalize">
                      {selectedAppointment.status?.replace('_', ' ')}
                    </span>
                  </>
                )}
              </SheetDescription>
            </div>
          </SheetHeader>

          {/* Render the appointment dashboard */}
          <div className="py-6">
            {selectedAppointmentId && (
              <CustomerAppointmentDashboard 
                appointmentId={selectedAppointmentId}
              />
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}