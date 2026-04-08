import { ASTRAL_STATUSES, getAstralStatus } from '../../constants/status'

interface AstralBadgeProps {
  user: any
  donePaidConsults: number
}

export default function AstralBadge({ user, donePaidConsults }: AstralBadgeProps) {
  if (!user) return null

  const statusKey = getAstralStatus(user, donePaidConsults)
  const status = ASTRAL_STATUSES[statusKey]

  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border ${status.color.replace('text-', 'border-').replace('400', '400/20').replace('500', '500/20')} bg-white/[0.02] backdrop-blur-md`}>
      <span className="text-sm">{status.discountEmoji}</span>
      <span className={`text-[11px] font-bold uppercase tracking-wider ${status.color}`}>
        {status.label}
      </span>
    </div>
  )
}
