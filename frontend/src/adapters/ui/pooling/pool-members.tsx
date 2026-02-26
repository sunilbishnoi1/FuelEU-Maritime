import React from "react";
import type { PoolMemberDisplay } from "../../../core/domain/entities";
import { Card } from "../../../shared/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../shared/components/table";
import { Badge } from "../../../shared/components/badge";

interface PoolMembersProps {
  members: PoolMemberDisplay[];
}

export const PoolMembers: React.FC<PoolMembersProps> = ({ members }) => {
  return (
    <Card className="p-6 mt-6 bg-white border-slate-200 shadow-sm rounded-xl">
      <h3 className="text-lg font-semibold mb-4 text-slate-900">
        Pool Members
      </h3>
      {members.length === 0 ? (
        <p className="text-slate-500">No members in pool yet</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 border-b border-slate-200">
                <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  Ship ID
                </TableHead>
                <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  Before Pool
                </TableHead>
                <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  After Pool
                </TableHead>
                <TableHead className="text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  Status
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {members.map((member, idx) => (
                <TableRow
                  key={member.ship_id}
                  className={`border-b border-slate-100 hover:bg-slate-50/80 transition-colors ${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"
                  }`}
                >
                  <TableCell className="font-semibold text-slate-800">
                    {member.ship_name || member.ship_id}
                  </TableCell>
                  <TableCell className="text-slate-600 font-mono text-sm tabular-nums">
                    {Number.isFinite(Number(member.cb_before))
                      ? Number(member.cb_before).toFixed(2)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-slate-600 font-mono text-sm tabular-nums">
                    {member.cb_after !== null &&
                    Number.isFinite(Number(member.cb_after))
                      ? Number(member.cb_after).toFixed(2)
                      : "N/A"}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        member.cb_after !== null && member.cb_after >= 0
                          ? "success"
                          : "error"
                      }
                      className={
                        member.cb_after !== null && member.cb_after >= 0
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                          : "bg-rose-50 text-rose-700 border-rose-200"
                      }
                    >
                      {member.cb_after !== null && member.cb_after >= 0
                        ? "Compliant"
                        : "Deficit"}
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
