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
    <Card className="p-4 mt-6">
      <h3 className="text-xl font-semibold mb-4 text-gray-800">Current Pool Members</h3>
      {members.length === 0 ? (
        <p className="text-gray-500">No members in the current pool.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ship ID</TableHead>
            <TableHead>CB Before Pooling</TableHead>
            <TableHead>CB After Pooling</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.ship_id}>
                <TableCell className="font-medium">{member.ship_name || member.ship_id}</TableCell>
                <TableCell>{member.cb_before.toFixed(2)} gCO₂eq</TableCell>
                <TableCell>{member.cb_after !== null ? member.cb_after.toFixed(2) : 'N/A'} gCO₂eq</TableCell>
                <TableCell>
                  <Badge variant={member.cb_after !== null && member.cb_after >= 0 ? 'success' : 'destructive'}>
                    {member.cb_after !== null && member.cb_after >= 0 ? 'Compliant' : 'Deficit'}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Card>
  );
};
