import React, { useEffect, useState } from 'react';
// START: Added imports for toast notifications
import { toast, Toaster } from 'react-hot-toast';
// END: Added imports
import {
    getAllInventoryLevels,
    createInventory,
    updateInventory,
    deleteInventory
} from '../service/inventoryAPI';
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "./ui/table";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "./ui/dialog";

const InventoryPage = () => {
    const [inventoryItems, setInventoryItems] = useState([]);
    const [totalValue, setTotalValue] = useState(0);
    const [loading, setLoading] = useState(true);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [currentInventory, setCurrentInventory] = useState({
        id: null,
        skuCode: '',
        quantity: 0
    });

    const fetchInventory = async () => {
        try {
            const data = await getAllInventoryLevels();
            setInventoryItems(data);
            const total = data.reduce((sum, item) => sum + item.value, 0);
            setTotalValue(total);
        } catch (error) {
            console.error('Failed to fetch inventory:', error);
            // START: Added toast
            toast.error('Failed to fetch inventory.');
            // END: Added toast
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleSubmitInventory = async (e) => {
        e.preventDefault();
        try {
            if (currentInventory.id) {
                await updateInventory(currentInventory.id, currentInventory);
                // START: Added toast
                toast.success('Inventory updated successfully!');
                // END: Added toast
            } else {
                await createInventory(currentInventory);
                // START: Added toast
                toast.success('Inventory added successfully!');
                // END: Added toast
            }
            setDialogOpen(false);
            setCurrentInventory({ id: null, skuCode: '', quantity: 0 });
            fetchInventory();
        } catch (error) {
            console.error('Failed to save inventory:', error);
            // START: Added toast
            toast.error('Failed to save inventory.');
            // END: Added toast
        }
    };

    const handleDeleteInventory = async (id) => {
        if (window.confirm('Are you sure you want to delete this inventory item?')) {
            try {
                await deleteInventory(id);
                // START: Added toast
                toast.success('Inventory item deleted.');
                // END: Added toast
                fetchInventory();
            } catch (error) {
                console.error('Failed to delete inventory:', error);
                // START: Added toast
                toast.error('Failed to delete inventory item.');
                // END: Added toast
            }
        }
    };

    if (loading) {
        return <div className="p-8">Loading inventory data...</div>;
    }

    return (
        <div className="p-8">
            {/* START: Added Toaster component to render notifications */}
            <Toaster position="top-right" reverseOrder={false} />
            {/* END: Added Toaster component */}
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold tracking-tight">Inventory Management</h2>
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                    <DialogTrigger asChild>
                        <Button variant="default">Add / Update Inventory</Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {currentInventory.id ? 'Update Inventory' : 'Add Inventory'}
                            </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleSubmitInventory} className="space-y-4">
                            <div>
                                <label htmlFor="skuCode" className="block text-sm font-medium mb-1">
                                    SKU Code
                                </label>
                                <Input
                                    id="skuCode"
                                    value={currentInventory.skuCode}
                                    onChange={(e) =>
                                        setCurrentInventory((prev) => ({
                                            ...prev,
                                            skuCode: e.target.value
                                        }))
                                    }
                                    required
                                />
                            </div>
                            <div>
                                <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                                    Quantity
                                </label>
                                <Input
                                    id="quantity"
                                    type="number"
                                    value={currentInventory.quantity}
                                    onChange={(e) =>
                                        setCurrentInventory((prev) => ({
                                            ...prev,
                                            quantity: parseInt(e.target.value)
                                        }))
                                    }
                                    required
                                    min="0"
                                />
                            </div>
                            <Button type="submit" className="w-full">
                                Save Changes
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            <div className="bg-card rounded-lg border border-border p-6">
                <div className="mb-4">
                    <p className="text-lg font-semibold">
                        Total Inventory Value: ₹{totalValue.toFixed(2)}
                    </p>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead>SKU Code</TableHead>
                            <TableHead className="text-right">Quantity</TableHead>
                            <TableHead className="text-right">Value (₹)</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {inventoryItems.map((item) => (
                            <TableRow key={item.skuCode}>
                                <TableCell>{item.productName}</TableCell>
                                <TableCell>{item.skuCode}</TableCell>
                                <TableCell className="text-right">{item.quantity}</TableCell>
                                <TableCell className="text-right">₹{item.value.toFixed(2)}</TableCell>
                                <TableCell className="text-right space-x-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setCurrentInventory({
                                                id: item.id,
                                                skuCode: item.skuCode,
                                                quantity: item.quantity
                                            });
                                            setDialogOpen(true);
                                        }}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        onClick={() => handleDeleteInventory(item.id)}
                                    >
                                        Delete
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default InventoryPage;