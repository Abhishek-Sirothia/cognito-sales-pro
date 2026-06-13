import {
  Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer,
  Tooltip, XAxis, YAxis, Cell,
} from "recharts";

const interactionData = [
  { week: "W1", interactions: 12, memories: 34 },
  { week: "W2", interactions: 19, memories: 51 },
  { week: "W3", interactions: 15, memories: 47 },
  { week: "W4", interactions: 28, memories: 79 },
  { week: "W5", interactions: 34, memories: 94 },
];

const sentimentData = [
  { name: "John Chen", score: 62 },
  { name: "Sarah Malik", score: 88 },
  { name: "Raj Patel", score: 75 },
  { name: "Emily Torres", score: 95 },
  { name: "David Kim", score: 45 },
];

function barColor(s: number) {
  if (s < 60) return "#EF4444";
  if (s < 80) return "#F59E0B";
  return "#22C55E";
}

const tooltipStyle = {
  backgroundColor: "#0F1724",
  border: "1px solid #1E2D40",
  borderRadius: 8,
  fontSize: 12,
  color: "#F0F4FF",
};

export function InteractionTrend() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 h-[340px] flex flex-col">
      <div>
        <h3 className="text-sm font-semibold">Interaction Trend</h3>
        <p className="text-xs text-text-muted mt-0.5">Sessions vs memories retained, last 5 weeks</p>
      </div>
      <div className="flex-1 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={interactionData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="#1E2D40" strokeDasharray="2 4" />
            <XAxis dataKey="week" stroke="#4A5A72" fontSize={11} tickLine={false} axisLine={false} />
            <YAxis stroke="#4A5A72" fontSize={11} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ stroke: "#1E2D40" }} />
            <Line type="monotone" dataKey="interactions" stroke="#4F7EF7" strokeWidth={2} dot={{ r: 3, fill: "#4F7EF7" }} />
            <Line type="monotone" dataKey="memories" stroke="#7C5EF7" strokeWidth={2} dot={{ r: 3, fill: "#7C5EF7" }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="flex items-center gap-4 text-xs text-text-secondary">
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-primary" /> Interactions</span>
        <span className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-violet" /> Memories</span>
      </div>
    </div>
  );
}

export function SentimentChart() {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 h-[340px] flex flex-col">
      <div>
        <h3 className="text-sm font-semibold">Customer Sentiment</h3>
        <p className="text-xs text-text-muted mt-0.5">Health score by account</p>
      </div>
      <div className="flex-1 mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={sentimentData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <CartesianGrid stroke="#1E2D40" strokeDasharray="2 4" vertical={false} />
            <XAxis dataKey="name" stroke="#4A5A72" fontSize={10} tickLine={false} axisLine={false} />
            <YAxis stroke="#4A5A72" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
            <Tooltip contentStyle={tooltipStyle} cursor={{ fill: "rgba(79,126,247,0.06)" }} />
            <Bar dataKey="score" radius={[6, 6, 0, 0]}>
              {sentimentData.map((d) => (
                <Cell key={d.name} fill={barColor(d.score)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
