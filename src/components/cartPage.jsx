import React, { useEffect, useState } from "react";
// START: Replaced 'sonner' with 'react-hot-toast' for consistency
import { toast, Toaster } from "react-hot-toast";
// END: Replaced 'sonner'
import {
    getCartItems,
    updateCartItem,
    removeCartItem,
} from "../service/cartAPI";
import { getProductBySkuCode } from "../service/productAPI";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function CartPage() {
    const [cartItems, setCartItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const totalPrice = cartItems.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
    );

    const handleProceedToCheckout = () => {
        navigate("/checkout", { state: { amount: totalPrice } });
    };

    useEffect(() => {
        fetchCartWithProducts();
    }, []);

    const fetchCartWithProducts = async () => {
        try {
            const cart = await getCartItems();
            const enrichedCart = await Promise.all(
                cart.map(async (cartItem) => {
                    const product = await getProductBySkuCode(cartItem.skuCode);
                    return {
                        ...cartItem,
                        productName: product?.name || "Unknown Product",
                        skuCode: product?.skuCode || "N/A",
                        price: product?.price || 0,
                    };
                })
            );
            setCartItems(enrichedCart);
        } catch (error) {
            console.error("Failed to load cart items:", error);
            toast.error("Failed to load your cart.");
        } finally {
            setLoading(false);
        }
    };

    const handleQuantityChange = async (itemId, currentQty, delta) => {
        const newQty = currentQty + delta;
        if (newQty < 1) return;

        try {
            await updateCartItem(itemId, newQty);
            setCartItems((prevItems) =>
                prevItems.map((item) =>
                    item.id === itemId ? { ...item, quantity: newQty } : item
                )
            );
            toast.success("Quantity updated!");
        } catch (error) {
            toast.error("Failed to update quantity.");
            console.error("Failed to update quantity:", error);
        }
    };

    const handleRemoveItem = async (itemId) => {
        try {
            await removeCartItem(itemId);
            setCartItems((prevItems) =>
                prevItems.filter((item) => item.id !== itemId)
            );
            toast.success("Item removed from cart.");
        } catch (error) {
            toast.error("Failed to remove item.");
            console.error("Failed to remove item:", error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* START: Added Toaster component */}
            <Toaster position="top-right" reverseOrder={false} />
            {/* END: Added Toaster component */}

            {/* Cart Items */}
            <div className="md:col-span-2">
                <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
                <div className="overflow-x-auto">
                    <table className="w-full table-auto border border-border rounded-lg">
                        <thead className="bg-muted text-muted-foreground">
                        <tr>
                            <th className="p-3 text-left">Product</th>
                            <th className="p-3 text-center">Quantity</th>
                            <th className="p-3 text-right">Price</th>
                            <th className="p-3 text-center">Remove</th>
                        </tr>
                        </thead>
                        <tbody>
                        {!loading && cartItems.length > 0 ? (
                            cartItems.map((item) => (
                                <tr
                                    key={item.id}
                                    className="border-t border-border hover:bg-muted/30 transition-colors"
                                >
                                    <td className="p-3">
                                        <div className="flex flex-col">
                                            <span className="font-medium">
                                                {item.productName}
                                            </span>
                                            <span className="text-sm text-muted-foreground">
                                                {item.skuCode}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-3 text-center">
                                        <div className="inline-flex items-center space-x-2">
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        item.id,
                                                        item.quantity,
                                                        -1
                                                    )
                                                }
                                            >
                                                <Minus size={14} />
                                            </Button>
                                            <span className="min-w-[20px] text-sm font-semibold">
                                                {item.quantity}
                                            </span>
                                            <Button
                                                size="icon"
                                                variant="outline"
                                                onClick={() =>
                                                    handleQuantityChange(
                                                        item.id,
                                                        item.quantity,
                                                        1
                                                    )
                                                }
                                            >
                                                <Plus size={14} />
                                            </Button>
                                        </div>
                                    </td>
                                    <td className="p-3 text-right font-semibold">
                                        ₹{(item.price * item.quantity).toFixed(2)}
                                    </td>
                                    <td className="p-3 text-center">
                                        <Button
                                            size="icon"
                                            variant="destructive"
                                            onClick={() => handleRemoveItem(item.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td
                                    colSpan="4"
                                    className="text-center p-4 text-muted-foreground"
                                >
                                    {loading
                                        ? "Loading..."
                                        : "Your cart is empty."}
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Summary */}
            <div>
                <Card className="sticky top-24">
                    <CardContent className="p-6">
                        <h3 className="text-lg font-semibold mb-4">Summary</h3>
                        <div className="flex justify-between text-sm mb-2">
                            <span>Subtotal</span>
                            <span>₹{totalPrice.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-4">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <div className="flex justify-between font-bold text-base">
                            <span>Total</span>
                            <span>₹{totalPrice.toFixed(2)}</span>
                        </div>

                        <Button
                            className="mt-6 w-full"
                            disabled={cartItems.length === 0}
                            onClick={handleProceedToCheckout}
                        >
                            Proceed to Checkout
                        </Button>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}