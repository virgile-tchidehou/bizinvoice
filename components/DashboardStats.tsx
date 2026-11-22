'use client';

import { DollarSign, FileText, Clock, CheckCircle } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';

interface DashboardStatsProps {
  totalRevenue: number;
  invoiceCount: number;
  pendingCount: number;
  paidCount: number;
  currency?: string;
}

export default function DashboardStats({
  totalRevenue,
  invoiceCount,
  pendingCount,
  paidCount,
  currency = 'USD',
}: DashboardStatsProps) {
  const stats = [
    {
      label: 'Revenus du mois',
      value: formatCurrency(totalRevenue, currency),
      icon: DollarSign,
      gradient: 'from-emerald-500 to-green-600',
      glow: 'shadow-emerald-500/20',
      bgIcon: 'bg-emerald-500/15',
      textColor: 'text-emerald-400',
    },
    {
      label: 'Factures ce mois',
      value: invoiceCount.toString(),
      icon: FileText,
      gradient: 'from-violet-500 to-indigo-600',
      glow: 'shadow-violet-500/20',
      bgIcon: 'bg-violet-500/15',
      textColor: 'text-violet-400',
    },
    {
      label: 'En attente',
      value: pendingCount.toString(),
      icon: Clock,
      gradient: 'from-amber-500 to-orange-600',
      glow: 'shadow-amber-500/20',
      bgIcon: 'bg-amber-500/15',
      textColor: 'text-amber-400',
    },
    {
      label: 'Payées',
      value: paidCount.toString(),
      icon: CheckCircle,
      gradient: 'from-sky-500 to-blue-600',
      glow: 'shadow-sky-500/20',
      bgIcon: 'bg-sky-500/15',
      textColor: 'text-sky-400',
    },
  ];

  return (
    <div className="grid grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
      {stats.map((stat, idx) => (
        <div
          key={stat.label}
          className={`relative overflow-hidden rounded-2xl bg-slate-800/50 border border-white/5 p-3 sm:p-5 hover:border-white/10 transition-all group ${stat.glow} hover:shadow-lg ${
            idx === 0 ? 'col-span-3 lg:col-span-1' : 'col-span-1 lg:col-span-1'
          }`}
        >
          {/* Gradient orb en background */}
          <div
            className={`absolute -top-8 -right-8 w-24 h-24 rounded-full bg-gradient-to-br ${stat.gradient} opacity-10 group-hover:opacity-20 blur-2xl transition-opacity`}
          />

          <div className="relative">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-2 sm:mb-3 gap-1 sm:gap-0">
              <span className="text-[9px] sm:text-xs font-medium text-slate-400 uppercase tracking-wider truncate w-full">
                {stat.label === 'Factures ce mois' ? 'Factures' : stat.label}
              </span>
              <div className={`hidden sm:flex p-2 rounded-xl ${stat.bgIcon}`}>
                <stat.icon className={`w-4 h-4 ${stat.textColor}`} />
              </div>
            </div>
            <p className={`text-xl sm:text-2xl font-bold text-white`}>{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
