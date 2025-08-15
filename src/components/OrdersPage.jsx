import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast, Toaster } from "react-hot-toast";
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export default function OrderPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user } = useContext(AuthContext);

    useEffect(() => {
        // ... (fetchOrders function remains the same)
        const fetchOrders = async () => {
            if (!user) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch("https://clotho-monolithic.onrender.com/api/orders/me", {
                    headers: { "Authorization": `Bearer ${user.idToken}` },
                });
                if (!res.ok) throw new Error("Failed to fetch orders.");
                const data = await res.json();
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
        y += 10;

        // Header line
        doc.setLineWidth(0.5);
        doc.line(20, y, 190, y);
        y += 15;

        // Order Number section (above Bill To to avoid overlap)
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Order Number:", 20, y);
        doc.setFont("helvetica", "normal");
        doc.text(order.orderNumber, 20, y + 5);
        y += 20;

        // --- Left Column (Billing Address) ---
        doc.setFont("helvetica", "bold");
        doc.text("Bill To:", 20, y);
        y += 5;

        doc.setFont("helvetica", "normal");
        const addressLines = doc.splitTextToSize(order.address, 80);
        doc.text(addressLines, 20, y);
        const addressHeight = addressLines.length * 5;

        // --- Right Column (Order Details) ---
        const rightColumnY = y - 5; // Align with "Bill To:"
        doc.setFont("helvetica", "bold");
        doc.text("Order Date:", 120, rightColumnY);
        doc.text("Status:", 120, rightColumnY + 8);

        doc.setFont("helvetica", "normal");
        doc.text(new Date(order.orderDate).toLocaleDateString(), 190, rightColumnY, { align: 'right' });
        doc.text(order.status, 190, rightColumnY + 8, { align: 'right' });

        // Calculate proper spacing for table start
        const orderDetailsHeight = 20; // Fixed height since we're using consistent spacing
        const tableStartY = y + Math.max(addressHeight, orderDetailsHeight) + 25;

        // Table using jspdf-autotable
        const tableColumn = ["Item Description (SKU)", "Quantity", "Unit Price", "Total"];
        const tableRows = [];
        let subtotal = 0;

        order.orderLineItems.forEach(item => {
            const itemTotal = item.price * item.quantity;
            subtotal += itemTotal;
            const itemData = [
                item.skuCode,
                item.quantity.toString(),
                item.price.toFixed(2), // Remove currency symbol to match your image
                itemTotal.toFixed(2)
            ];
            tableRows.push(itemData);
        });

        // Draw the table and capture the final Y position
        const tableResult = autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: tableStartY,
            theme: 'striped',
            headStyles: {
                fillColor: [30, 30, 30],
                textColor: [255, 255, 255],
                fontStyle: 'bold'
            },
            styles: {
                fontSize: 10,
                cellPadding: 3
            },
            columnStyles: {
                1: { halign: 'center' }, // Quantity column centered
                2: { halign: 'right' },  // Unit Price right-aligned
                3: { halign: 'right' }   // Total right-aligned
            },
            margin: { left: 20, right: 20 }
        });

        // Get the Y position after the table
        y = doc.lastAutoTable.finalY + 15;

        // Totals Section - properly aligned
        const totalsStartX = 120; // Move labels further left
        const valuesX = 190;

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text("Subtotal:", totalsStartX, y, { align: "left" });
        doc.text(subtotal.toFixed(2), valuesX, y, { align: "right" });
        y += 10;

        doc.text("Shipping:", totalsStartX, y, { align: "left" });
        doc.text("FREE", valuesX, y, { align: "right" });
        y += 10;

        // Line above total
        doc.setLineWidth(0.5);
        doc.line(totalsStartX, y, valuesX, y);
        y += 10;

        doc.setFontSize(14);
        doc.text("Total Amount:", totalsStartX, y, { align: "left" });
        doc.text(subtotal.toFixed(2), valuesX, y, { align: "right" });

        // Footer - ensure it doesn't overlap
        const footerY = Math.max(y + 30, pageHeight - 30);
        doc.setLineWidth(0.5);
        doc.line(20, footerY - 5, 190, footerY - 5);
        doc.setFontSize(10);
        doc.setTextColor(150);
        doc.text("Thank you for your business!", 105, footerY, { align: "center" });
        doc.text("www.clotho.com | contact@clotho.com", 105, footerY + 5, { align: "center" });

        // Reset text color
        doc.setTextColor(0);

        doc.save(`Clotho-Invoice-${order.orderNumber}.pdf`);
    };

    // The returned JSX remains the same
    if (loading) {
        return <div className="text-center py-10">Loading your orders...</div>;
    }
    return (
        <div className="min-h-screen bg-background px-4 py-8">
            <Toaster position="top-right" reverseOrder={false} />
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