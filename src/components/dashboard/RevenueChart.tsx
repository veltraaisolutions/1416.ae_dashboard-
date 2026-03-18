import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data: {
    date: string;
    bookings: number;
    revenue: number;
  }[];
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <div className="w-full">
      <div className="glass-card rounded-xl p-6 w-full">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-foreground">
            Bookings & Revenue
          </h3>
          <p className="text-sm text-muted-foreground">Last 6 months by date</p>
        </div>

        <div className="h-[320px] w-full">
          <ResponsiveContainer
            width="100%"
            height="100%"
          >
            <BarChart
              data={data}
              barCategoryGap="20%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                vertical={false}
              />
              <XAxis
                dataKey="date"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 12 }}
                tickFormatter={(v) => `£${v}`}
                domain={[0, "dataMax + 50"]}
              />
              <Tooltip
                cursor={{ fill: "rgba(250, 204, 21, 0.1)" }}
                contentStyle={{
                  backgroundColor: "#0B0B0B",
                  border: "1px solid rgba(250,204,21,0.4)",
                  borderRadius: "10px",
                  color: "#FACC15",
                  boxShadow: "0 10px 40px rgba(0,0,0,0.7)",
                }}
                formatter={(value: number, name: string) =>
                  name === "revenue"
                    ? [`£${value.toLocaleString()}`, "Revenue"]
                    : [value, "Bookings"]
                }
              />

              {/* Bookings */}
              <Bar
                dataKey="bookings"
                name="Bookings"
                fill="#FACC15"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />

              {/* Revenue */}
              <Bar
                dataKey="revenue"
                name="Revenue"
                fill="#34D399"
                radius={[6, 6, 0, 0]}
                maxBarSize={48}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 flex justify-center items-center gap-4 text-sm">
          <span className="inline-block h-3 w-3 rounded-sm bg-yellow-400" />{" "}
          Bookings
          <span className="inline-block h-3 w-3 rounded-sm bg-green-400" />{" "}
          Revenue
        </div>
      </div>
    </div>
  );
}
