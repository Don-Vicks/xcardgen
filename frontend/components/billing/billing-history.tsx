"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Transaction } from "@/lib/api/requests/payments.request"
import { format } from "date-fns"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

interface BillingHistoryProps {
  transactions: Transaction[]
  isLoading: boolean
  page: number
  total: number
  limit: number
  onPageChange: (page: number) => void
}

export function BillingHistory({
  transactions,
  isLoading,
  page,
  total,
  limit,
  onPageChange
}: BillingHistoryProps) {
  const totalPages = Math.ceil(total / limit)
  if (isLoading) {
    return (
      <div className="flex h-[200px] items-center justify-center border rounded-lg">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (transactions.length === 0) {
    return (
      <div className="flex h-[200px] items-center justify-center border rounded-lg bg-muted/40">
        <p className="text-muted-foreground">No transaction history found</p>
      </div>
    )
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Reference</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((tx) => (
            <TableRow key={tx.id}>
              <TableCell className="font-medium">
                {format(new Date(tx.date), "MMM d, yyyy")}
              </TableCell>
              <TableCell>{tx.description}</TableCell>
              <TableCell>
                {/* Format crypto logic or fiat */}
                {tx.currency === 'SOL' || tx.currency === 'ETH' || tx.currency === 'SOL_TX'
                  ? `${parseFloat(tx.amount.toString()).toFixed(4)} ${tx.currency.replace('_TX', '')}`
                  : `$${parseFloat(tx.amount.toString()).toFixed(2)}`
                }
              </TableCell>
              <TableCell>
                <Badge variant={
                  tx.status === 'COMPLETED' ? 'outline' :
                    tx.status === 'PENDING' ? 'secondary' : 'destructive'
                } className={
                  tx.status === 'COMPLETED' ? 'border-green-500/30 text-green-500' : ''
                }>
                  {tx.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right font-mono text-xs text-muted-foreground">
                {tx.txHash ? (
                  <a
                    href={`https://solscan.io/tx/${tx.txHash}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-primary underline decoration-dotted"
                  >
                    {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                  </a>
                ) : '-'}
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
