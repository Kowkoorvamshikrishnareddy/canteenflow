import React from 'react';
import { OrderStatus, DietaryTag } from '../../types';
import { Clock, CheckCircle2, ChefHat, PackageCheck, XCircle, AlertCircle, Sparkles } from 'lucide-react';

export const OrderStatusBadge: React.FC<{ status: OrderStatus; size?: 'sm' | 'md' }> = ({
  status,
  size = 'md',
}) => {
  const configs: Record<
    OrderStatus,
    { label: string; bg: string; text: string; border: string; icon: React.ReactNode }
  > = {
    PENDING_PAYMENT: {
      label: 'Payment Pending',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <Clock className="w-3.5 h-3.5 mr-1" />,
    },
    PLACED: {
      label: 'Order Placed',
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200',
      icon: <Sparkles className="w-3.5 h-3.5 mr-1 text-blue-600 animate-pulse" />,
    },
    ACCEPTED: {
      label: 'Accepted',
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
    },
    PREPARING: {
      label: 'In Kitchen',
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200',
      icon: <ChefHat className="w-3.5 h-3.5 mr-1 animate-bounce" />,
    },
    READY: {
      label: 'Ready for Pickup',
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-300',
      icon: <PackageCheck className="w-3.5 h-3.5 mr-1 text-emerald-600" />,
    },
    COLLECTED: {
      label: 'Collected',
      bg: 'bg-slate-100',
      text: 'text-slate-700',
      border: 'border-slate-200',
      icon: <CheckCircle2 className="w-3.5 h-3.5 mr-1" />,
    },
    CANCELLED: {
      label: 'Cancelled',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: <XCircle className="w-3.5 h-3.5 mr-1" />,
    },
    REJECTED: {
      label: 'Declined',
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200',
      icon: <AlertCircle className="w-3.5 h-3.5 mr-1" />,
    },
  };

  const c = configs[status] || configs.PLACED;
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-2.5 py-1 text-xs font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border ${c.bg} ${c.text} ${c.border} ${padding} transition-all`}
    >
      {c.icon}
      {c.label}
    </span>
  );
};

export const DietaryBadge: React.FC<{ tag: DietaryTag }> = ({ tag }) => {
  const configs: Record<DietaryTag, { label: string; dot: string; bg: string; text: string }> = {
    veg: { label: 'Veg', dot: 'bg-emerald-600', bg: 'bg-emerald-50', text: 'text-emerald-800' },
    vegan: { label: 'Vegan', dot: 'bg-green-600', bg: 'bg-green-50', text: 'text-green-800' },
    jain: { label: 'Jain Friendly', dot: 'bg-amber-600', bg: 'bg-amber-50', text: 'text-amber-800' },
    'high-protein': { label: 'High Protein', dot: 'bg-blue-600', bg: 'bg-blue-50', text: 'text-blue-800' },
    'gluten-free': { label: 'Gluten-Free', dot: 'bg-purple-600', bg: 'bg-purple-50', text: 'text-purple-800' },
    egg: { label: 'Contains Egg', dot: 'bg-yellow-600', bg: 'bg-yellow-50', text: 'text-yellow-800' },
  };

  const c = configs[tag] || { label: tag, dot: 'bg-slate-400', bg: 'bg-slate-50', text: 'text-slate-700' };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium ${c.bg} ${c.text} border border-slate-200/60`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot}`} />
      {c.label}
    </span>
  );
};
