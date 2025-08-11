// // src/components/Dashboard.jsx
// import { useEffect, useState } from 'react';
// import { LayoutDashboard, Package, Users, MessageSquare, Box } from 'lucide-react';
// import { StatCard } from '@/components/ui/stat-card';
// import { getTotalUsers } from '@/service/userAPI';
// import { getTotalProducts } from "@/service/productAPI.js";
// import { getTotalInventoryItems } from "@/service/inventoryAPI.js";
// import {getAllOrders, getTotalOrders} from "@/service/orderAPI.js";
//
// export default function Dashboard() {
//     const [stats, setStats] = useState({
//         users: null,
//         products: null,
//         orders: null,
//         communications: null,
//         inventory: null
//     });
//     const [loading, setLoading] = useState(true);
//
//     useEffect(() => {
//         const fetchStats = async () => {
//             try {
//                 // Fetch all raw data in parallel
//                 const [usersCount, productCount, inventoryCount, fetchedOrders] = await Promise.all([
//                     getTotalUsers(),
//                     getTotalProducts(),
//                     getTotalInventoryItems(),
//                     getAllOrders(), // Just get the orders data here
//                     // getCommunicationsCount()
//                 ]);
//
//                 // Now, calculate the stats from the fetched data
//                 setStats({
//                     users: usersCount,
//                     products: productCount,
//                     inventory: inventoryCount,
//                     orders: getTotalOrders(fetchedOrders), // Calculate here
//                     communications: 0
//                 });
//             } catch (error) {
//                 console.error('Error fetching dashboard stats:', error);
//             } finally {
//                 setLoading(false);
//             }
//         };
//
//         fetchStats();
//     }, []);
//
//     const cards = [
//         {
//             title: "Total Users",
//             value: stats.users,
//             icon: Users,
//             className: "bg-card hover:bg-card/80"
//         },
//         {
//             title: "Total Products",
//             value: stats.products,
//             icon: Package,
//             className: "bg-card hover:bg-card/80"
//         },
//         {
//             title: "Total Stock Items",
//             value: stats.inventory,
//             icon: Box,
//             className: "bg-card hover:bg-card/80"
//         },
//         {
//             title: "Total Orders",
//             value: stats.orders,
//             icon: LayoutDashboard,
//             className: "bg-card hover:bg-card/80"
//         },
//         {
//             title: "Communications",
//             value: stats.communications,
//             icon: MessageSquare,
//             className: "bg-card hover:bg-card/80"
//         }
//     ];
//
//     return (
//         <div className="p-8 space-y-8">
//             <div>
//                 <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
//                 <p className="text-muted-foreground">
//                     Overview of your application statistics
//                 </p>
//             </div>
//
//             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
//                 {cards.map((card) => (
//                     <StatCard
//                         key={card.title}
//                         title={card.title}
//                         value={card.value ?? 0}
//                         icon={card.icon}
//                         className={card.className}
//                         loading={loading}
//                     />
//                 ))}
//             </div>
//         </div>
//     );
// }

import { useEffect, useState } from 'react';
import { LayoutDashboard, Package, Users, MessageSquare, Box, DollarSign } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTotalUsers } from '@/service/userAPI';
import { getTotalProducts } from "@/service/productAPI.js";
import { getTotalInventoryItems } from "@/service/inventoryAPI.js";
import {
    getAllOrders,
    getTotalOrders,
    getTotalSales,
    getCategorySalesData,
    getMonthlySalesData,
    getCountrySalesData
} from "@/service/orderAPI.js";
import {
    Bar,
    BarChart,
    Line,
    LineChart,
    Pie,
    PieChart,
    ResponsiveContainer,
    XAxis,
    YAxis,
    Tooltip,
    Legend,
    CartesianGrid,
    Cell
} from "recharts";

// Colors for the Pie Chart
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF1943'];

export default function Dashboard() {
    const [stats, setStats] = useState({
        users: null,
        products: null,
        orders: null,
        sales: null,
        inventory: null,
        communications: null,
    });
    const [chartData, setChartData] = useState({
        categoryData: [],
        monthlyData: [],
        countryData: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const [usersCount, productCount, inventoryCount, fetchedOrders] = await Promise.all([
                    getTotalUsers(),
                    getTotalProducts(),
                    getTotalInventoryItems(),
                    getAllOrders(),
                ]);

                setStats({
                    users: usersCount,
                    products: productCount,
                    inventory: inventoryCount,
                    orders: getTotalOrders(fetchedOrders),
                    sales: getTotalSales(fetchedOrders),
                    communications: 0
                });

                setChartData({
                    categoryData: getCategorySalesData(fetchedOrders),
                    monthlyData: getMonthlySalesData(fetchedOrders),
                    countryData: getCountrySalesData(fetchedOrders)
                });

            } catch (error) {
                console.error('Error fetching dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    const cards = [
        { title: "Total Sales", value: stats.sales, icon: DollarSign, format: (val) => `₹${val?.toFixed(2)}` },
        { title: "Total Users", value: stats.users, icon: Users },
        { title: "Total Products", value: stats.products, icon: Package },
        { title: "Total Orders", value: stats.orders, icon: LayoutDashboard },
        { title: "Total Stock Items", value: stats.inventory, icon: Box },
    ];

    return (
        <div className="p-8 space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
                <p className="text-muted-foreground">
                    Overview of your application statistics.
                </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                {cards.map((card) => (
                    <StatCard
                        key={card.title}
                        title={card.title}
                        value={card.format ? card.format(card.value ?? 0) : card.value ?? 0}
                        icon={card.icon}
                        loading={loading}
                    />
                ))}
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle>Sales by Category</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={chartData.categoryData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} fill="#8884d8" label>
                                    {chartData.categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Monthly Sales</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={chartData.monthlyData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `₹${value / 1000}k`} />
                                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                <Legend />
                                <Line type="monotone" dataKey="total" name="Sales" stroke="#8884d8" activeDot={{ r: 8 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                <Card className="col-span-1 lg:col-span-3">
                    <CardHeader>
                        <CardTitle>Sales by Country</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ResponsiveContainer width="100%" height={300}>
                            <BarChart data={chartData.countryData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis tickFormatter={(value) => `₹${value.toFixed(0)}`} />
                                <Tooltip formatter={(value) => `₹${value.toFixed(2)}`} />
                                <Legend />
                                <Bar dataKey="total" name="Sales" fill="#82ca9d" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
