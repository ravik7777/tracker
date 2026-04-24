'use client'

import { motion } from 'framer-motion'

interface Props {
  label: string
  value: string
  sub: string
  icon: string
  index: number
}

export default function StatsCard({ label, value, sub, icon, index }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="glass p-5"
    >
      <div className="flex items-start justify-between mb-3">
        <span className="text-white/40 text-sm">{label}</span>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-2xl font-bold text-white truncate">{value}</p>
      <p className="text-white/40 text-xs mt-1">{sub}</p>
    </motion.div>
  )
}
