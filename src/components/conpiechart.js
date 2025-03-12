import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";

const COLORS = ["#FFBB28", "#FF8042", "#00C49F", "#0088FE", "#FF6361"];

const ConsultantAppointmentsPie = ({ data }) => {
    if (!data || Object.keys(data).length === 0) {
        return <p>No data available</p>;
      }
    
      const chartData = Object.entries(data).map(([key, value], index) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1), // Capitalize keys
        value,
        color: COLORS[index % COLORS.length], // Rotate through colors
      }));

    return (
        <div className="chart-container">
            <PieChart width={400} height={400}>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    label
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend />
            </PieChart>
        </div>
    );
};

export default ConsultantAppointmentsPie;
