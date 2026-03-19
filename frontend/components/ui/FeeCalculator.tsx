interface FeeCalculatorProps {
  amount: number;
  feePercent?: number;
}

export default function FeeCalculator({ amount, feePercent = 5 }: FeeCalculatorProps) {
  const fee = amount * (feePercent / 100);
  const net = amount - fee;

  return (
    <div className="glass-sm p-4 space-y-2.5" style={{ borderLeft: '3px solid rgba(124,58,237,0.5)' }}>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Desglose</p>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Monto total</span>
        <span className="text-white font-semibold">${amount.toFixed(2)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-gray-400">Comisión ({feePercent}%)</span>
        <span className="text-amber-300 font-medium">-${fee.toFixed(2)}</span>
      </div>
      <div className="border-t border-white/[0.08] pt-2 flex justify-between text-sm">
        <span className="text-gray-300 font-medium">El vendedor recibe</span>
        <span className="text-emerald-400 font-bold">${net.toFixed(2)}</span>
      </div>
    </div>
  );
}
