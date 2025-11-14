import React from 'react';
import type { PoolMemberDisplay } from '../../../types';
import { Card } from '../../../shared/components/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../shared/components/table';
import { Badge } from '../../../shared/components/badge';

interface PoolMembersProps {
  members: PoolMemberDisplay[];
}

export const PoolMembers: React.FC<PoolMembersProps> = ({ members }) => {
  return (
    <Card className="p-6 mt-6">
      <h3 className="text-lg font-semibold mb-4 text-emerald-900">Pool Members</h3>
      {members.length === 0 ? (
        <p className="text-slate-600">No members in pool yet</p>
      ) : (
        <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="text-emerald-900 font-semibold">Ship ID</TableHead>
                <TableHead className="text-emerald-900 font-semibold">Before Pool</TableHead>
                <TableHead className="text-emerald-900 font-semibold">After Pool</TableHead>
                <TableHead className="text-emerald-900 font-semibold">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member, idx) => (
                <TableRow
                  key={member.ship_id}
                  className={`border-b border-slate-200 hover:bg-emerald-50 transition-colors ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-slate-50'
                  }`}
                >
                  <TableCell className="font-semibold text-emerald-700">{member.ship_name || member.ship_id}</TableCell>
                  <TableCell className="text-slate-700 font-mono text-sm">{member.cb_before.toFixed(2)}</TableCell>
                  <TableCell className="text-slate-700 font-mono text-sm">{member.cb_after !== null ? member.cb_after.toFixed(2) : 'N/A'}</TableCell>
                  <TableCell>
                    <Badge variant={member.cb_after !== null && member.cb_after >= 0 ? 'success' : 'error'}>
                      {member.cb_after !== null && member.cb_after >= 0 ? 'Compliant' : 'Deficit'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </Card>
  );
};
