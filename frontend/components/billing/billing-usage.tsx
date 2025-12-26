"use client"

import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { UsageRecord } from "@/lib/api/requests/payments.request"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight, Loader2, Zap } from "lucide-react"

interface BillingUsageProps {
  usage: UsageRecord[]
  isLoading: boolean
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function BillingUsage({
  usage,
  isLoading,
  page,
  total,
  limit,
  onPageChange
}: BillingUsageProps) {
  const totalPages = Math.ceil(total / limit)
  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center border rounded-lg">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (usage.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center border rounded-lg bg-muted/40">
        <p className="text-muted-foreground">No usage history found</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>Attendee</TableHead>
            <TableHead className="text-right">Cost</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usage.map((record) => (
            <TableRow key={record.id}>
              <TableCell className="font-medium text-muted-foreground">
                {format(new Date(record.createdAt), "MMM d, HH:mm")}
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Zap className="w-3 h-3 text-yellow-500" />
                  <span>Generation</span>
                </div>
              </TableCell>
              <TableCell>{record.event?.name || "Unknown Event"}</TableCell>
              <TableCell>
                {record.attendee ? (
                  <div className="flex flex-col">
                    <span>{record.attendee.name}</span>
                    <span className="text-xs text-muted-foreground">{record.attendee.email}</span>
                  </div>
                ) : (
                  <span className="italic text-muted-foreground">Direct/Test</span>
                )}
              </TableCell>
              <TableCell className="text-right font-mono text-xs">
                -1 Credit
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t">
          <div className="text-sm text-muted-foreground">
            Page {page} of {totalPages}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
