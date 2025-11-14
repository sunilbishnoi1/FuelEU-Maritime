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
    <div className="rounded-xl border border-slate-700 bg-slate-800 overflow-hidden">
      <h3 className="text-xl font-semibold p-4 border-b border-slate-700">Transaction History</h3>
      <Table>
        <TableHeader>
          <TableRow>
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
              <TableCell colSpan={5} className="text-center text-slate-400 py-4">
                No transactions yet.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id} className="hover:bg-slate-700/50 transition-colors">
                <TableCell className="text-xs text-slate-400">
                  {format(new Date(transaction.date), 'MMM dd, yyyy HH:mm')}
                </TableCell>
                <TableCell className="capitalize">{transaction.type}</TableCell>
                <TableCell
                  className={cn(
                    transaction.amount >= 0 ? 'text-green-500' : 'text-red-500',
                    'font-semibold'
                  )}
                >
                  {transaction.amount >= 0 ? '+' : ''}
                  {transaction.amount.toFixed(0)}
                </TableCell>
                <TableCell>{transaction.cb_before_transaction.toFixed(0)}</TableCell>
                <TableCell>{transaction.cb_after_transaction.toFixed(0)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export { TransactionHistory };
