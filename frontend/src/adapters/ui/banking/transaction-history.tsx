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
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      <h3 className="text-lg font-semibold p-5 border-b border-slate-200 text-slate-900">Transaction History</h3>
      <Table>
        <TableHeader>
          <TableRow className="bg-slate-50 border-b border-slate-200">
            <TableHead className="w-[150px] text-slate-500 font-semibold text-xs uppercase tracking-wider">Date</TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Action</TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">Amount (tCO₂e)</TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">CB Before</TableHead>
            <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">CB After</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-slate-500 py-6">
                No transactions yet.
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction, idx) => (
              <TableRow key={transaction.id} className={`hover:bg-slate-50/80 transition-colors border-b border-slate-100 ${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                  }`}>
                <TableCell className="text-sm font-medium text-slate-500">
                  {format(new Date(transaction.date), 'MMM dd, yyyy HH:mm')}
                </TableCell>
                <TableCell className="capitalize text-slate-700 font-medium">{transaction.type}</TableCell>
                <TableCell
                  className={cn(
                    transaction.amount >= 0 ? 'text-emerald-700 bg-emerald-50 border-emerald-200' : 'text-rose-700 bg-rose-50 border-rose-200',
                    'font-mono tabular-nums text-sm inline-flex items-center px-2.5 py-0.5 rounded-md border mt-2.5 font-semibold'
                  )}
                >
                  {transaction.amount >= 0 ? '+' : ''}
                  {transaction.amount.toFixed(0)}
                </TableCell>
                <TableCell className="font-mono tabular-nums text-slate-600">{transaction.cb_before_transaction.toFixed(0)}</TableCell>
                <TableCell className="font-mono tabular-nums text-slate-600">{transaction.cb_after_transaction.toFixed(0)}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export { TransactionHistory };
