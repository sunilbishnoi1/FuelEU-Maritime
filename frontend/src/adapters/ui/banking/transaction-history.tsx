import * as React from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/components/table';
import type { Transaction } from '../../../core/domain/entities';
import { format } from 'date-fns';
import { cn } from '../../../shared/lib/utils';

interface TransactionHistoryProps {
  transactions: Transaction[];
}

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ transactions }) => {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
      <h3 className="text-xl font-semibold p-4 border-b border-border text-secondary-900">Transaction History</h3>
      <Table>
        <TableHeader>
          <TableRow className="bg-secondary-50">
            <TableHead className="w-[150px]">Date</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Amount (tCO₂e)</TableHead>
            <TableHead>CB Before</TableHead>
            <TableHead>CB After</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                No transactions yet.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-primary-50 transition-colors border-b border-border">
                <TableCell className="text-xs text-muted-foreground">
                  {format(new Date(transaction.date), 'MMM dd, yyyy HH:mm')}
                </TableCell>
                <TableCell className="capitalize text-secondary-700">{transaction.type}</TableCell>
                <TableCell
                  className={cn(
                    transaction.amount >= 0 ? 'text-primary-700' : 'text-destructive',
                    'font-semibold font-mono'
                  )}
                >
                  {transaction.amount >= 0 ? '+' : ''}
                  {transaction.amount.toFixed(0)}
                </TableCell>
                <TableCell className="font-mono text-secondary-700">{transaction.cb_before_transaction.toFixed(0)}</TableCell>
                <TableCell className="font-mono text-secondary-700">{transaction.cb_after_transaction.toFixed(0)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export { TransactionHistory };
