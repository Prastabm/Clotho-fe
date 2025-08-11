// OrderPage.jsx

import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext'; // Adjust path if necessary
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OrderPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchOrders = async () => {
            if (!user) {
                setLoading(false);
                return;
            }

            try {
                const res = await fetch("https://clotho-monolithic.onrender.com/api/orders/me", {
                    headers: {
                        "Authorization": `Bearer ${user.idToken}`,
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch orders.");
                }

                const data = await res.json();
                // Sort orders by date, newest first
                data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate));
                setOrders(data);

            } catch (err) {
                toast.error(err.message || "An error occurred while fetching your orders.");
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user]);

    const generateInvoice = (order) => {
        const doc = new jsPDF();
        const pageHeight = doc.internal.pageSize.height;
        let y = 20;

        // Header
        doc.setFontSize(28);
        doc.setFont("helvetica", "bold");
        doc.text("Clotho", 20, y);
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Invoice", 190, y, { align: "right" });
        y += 8;
        doc.setLineWidth(0.5);
        doc.line(20, y, 190, y);
        y += 15;

        // Company & Customer Details
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Bill To:", 20, y);
        doc.setFont("helvetica", "normal");
        const addressLines = doc.splitTextToSize(order.address, 80);
        doc.text(addressLines, 20, y + 5);

        doc.setFont("helvetica", "bold");
        doc.text("Order Number:", 120, y);
        doc.text("Order Date:", 120, y + 5);
        doc.text("Status:", 120, y + 10);

        doc.setFont("helvetica", "normal");
        doc.text(order.orderNumber, 150, y);
        doc.text(new Date(order.orderDate).toLocaleDateString(), 150, y + 5);
        doc.text(order.status, 150, y + 10);

        y += 30;

        // Table using jspdf-autotable for better formatting
        const tableColumn = ["Item Description (SKU)", "Quantity", "Unit Price", "Total"];
        const tableRows = [];
        let subtotal = 0;

        order.orderLineItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            const itemData = [
                item.skuCode,
                item.quantity,
                `₹${item.price.toFixed(2)}`,
                `₹${itemTotal.toFixed(2)}`
            ];
            tableRows.push(itemData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: y,
            theme: 'striped',
            headStyles: { fillColor: [30, 30, 30] },
            styles: { fontSize: 10 },
            didDrawPage: function(data) {
                // This function is called after the table is drawn on each page
                y = data.cursor.y; // Update y to the position after the table
            }
        });

        // Totals Section
        y += 10; // Add some space after the table
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Subtotal:", 140, y);
        doc.text(`₹${subtotal.toFixed(2)}`, 190, y, { align: "right" });
        y += 7;
        doc.text("Shipping:", 140, y);
        doc.text("FREE", 190, y, { align: "right" });
        y += 7;
        doc.setLineWidth(0.2);
        doc.line(140, y, 190, y);
        y += 7;
        doc.setFontSize(14);
        doc.text("Total Amount:", 140, y);
        doc.text(`₹${subtotal.toFixed(2)}`, 190, y, { align: "right" });

        // Footer
        const footerY = pageHeight - 20;
        doc.setLineWidth(0.5);
        doc.line(20, footerY - 5, 190, footerY - 5);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Thank you for your business!", 105, footerY, { align: "center" });
        doc.text("www.clotho.com | contact@clotho.com", 105, footerY + 5, { align: "center" });

        doc.save(`Clotho-Invoice-${order.orderNumber}.pdf`);
    };


    if (loading) {
        return <div className="text-center py-10">Loading your orders...</div>;
    }

    return (
        <div className="min-h-screen bg-background px-4 py-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">My Orders</h1>
                {orders.length > 0 ? (
                    <div className="space-y-6">
                        {orders.map(order => (
                            <Card key={order.id} className="overflow-hidden">
                                <CardHeader className="bg-muted/50 flex flex-row items-center justify-between py-4 px-6">
                                    <div>
                                        <p className="text-sm text-muted-foreground">Order Number</p>
                                        <p className="font-mono text-lg">{order.orderNumber}</p>
                                    </div>
                                    <Badge variant={order.status === 'CREATED' ? 'default' : 'secondary'}>
                                        {order.status}
                                    </Badge>
                                </CardHeader>
                                <CardContent className="p-6 space-y-4">
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-muted-foreground">Order Date</p>
                                            <p>{new Date(order.orderDate).toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">Shipping Address</p>
                                            <p>{order.address}</p>
                                        </div>
                                    </div>
                                    <hr/>
                                    <div>
                                        <h4 className="font-semibold mb-2">Items</h4>
                                        <ul className="space-y-2">
                                            {order.orderLineItems.map(item => (
                                                <li key={item.id} className="flex justify-between items-center text-sm">
                                                    <span>{item.skuCode} (x{item.quantity})</span>
                                                    <span className="font-medium">₹{(item.price * item.quantity).toFixed(2)}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/50 flex items-center justify-between py-4 px-6">
                                    <div className="font-bold text-lg">
                                        Total: ₹{order.orderLineItems.reduce((acc, item) => acc + item.price * item.quantity, 0).toFixed(2)}
                                    </div>
                                    <Button onClick={() => generateInvoice(order)}>
                                        Download Invoice
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 border-2 border-dashed rounded-lg">
                        <h2 className="text-xl font-semibold">You have no orders yet.</h2>
                        <p className="text-muted-foreground mt-2">When you place an order, it will appear here.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
