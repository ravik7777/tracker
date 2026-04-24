'use client'

import { BarChart, Bar, XAxis, YAxis, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface DataPoint {
  day: string
  completed: number
}

interface Props {
  data: DataPoint[]
  color: string
}

export default function WeeklyChart({ data, color }: Props) {
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barSize={28} margin={{ top: 4, right: 0, bottom: 0, left: -32 }}>
        <XAxis
          dataKey="day"
          tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 12 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis domain={[0, 1]} hide />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.05)' }}
          content={({ active, payload }) => {
            if (!active || !payload?.length) return null
            return (
              <div className="bg-black/70 backdrop-blur-sm border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white">
                {payload[0].payload.completed ? 'Completed ✓' : 'Not done'}
              </div>
            )
          }}
        />
        <Bar dataKey="completed" radius={[6, 6, 0, 0]}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.completed ? color : 'rgba(255,255,255,0.08)'}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
