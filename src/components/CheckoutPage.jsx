// CheckoutPage.jsx

import React, { useContext, useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom"; // Import useNavigate
import { loadStripe } from "@stripe/stripe-js";
import {
    Elements,
    CardElement,
    useStripe,
    useElements
} from "@stripe/react-stripe-js";
import { AuthContext } from "../contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Your publishable key
const stripePromise = loadStripe("pk_test_51RtrPaCyBBmYSliqIvj10wMPVCOb4axz3WKt7X05WsNjED9uKxgGK3Ama91WAyrgi292EDbKIdLVw4LW7hECPRBE0071OpcxQV");

// Success Modal Component
function SuccessModal({ onRedirect }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 transition-opacity duration-300">
            <Card className="w-full max-w-md m-4 bg-background transform transition-all duration-300 scale-100">
                <CardContent className="pt-8 flex flex-col items-center text-center space-y-4">
                    {/* Checkmark Icon */}
                    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    </div>
                    <CardTitle className="text-2xl font-bold">Order Placed!</CardTitle>
                    <p className="text-muted-foreground">
                        Thank you for your purchase. Your order is being processed and you will receive a confirmation email shortly.
                    </p>
                    <Button onClick={onRedirect} className="w-full py-3 text-lg">
                        Take me home
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}


function CheckoutForm() {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate(); // Hook for navigation
    const { user } = useContext(AuthContext);
    const [clientSecret, setClientSecret] = useState("");
    const [loading, setLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false); // State for success modal

    // Form state for shipping details
    const [email, setEmail] = useState('');
    const [name, setName] = useState('');
    const [address, setAddress] = useState({
        line1: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'IN',
    });

    const { state } = useLocation();
    const amount = state?.amount || 0;

    // Pre-fill email from user context
    useEffect(() => {
        if (user?.email) {
            setEmail(user.email);
        }
    }, [user]);

    // Create PaymentIntent
    useEffect(() => {
        const createPaymentIntent = async () => {
            if (amount <= 0 || !user) {
                return;
            }
            try {
                const res = await fetch("http://localhost:8080/api/checkout", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${user.idToken}`,
                    },
                });
                if (!res.ok) {
                    const errorData = await res.json();
                    throw new Error(errorData.error || "Failed to initialize payment.");
                }
                const data = await res.json();
                setClientSecret(data.clientSecret);
            } catch (err) {
                toast.error(err.message || "Could not start checkout. Please try again.");
            }
        };
        createPaymentIntent();
    }, [user, amount]);

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (!stripe || !elements || !clientSecret) {
            return;
        }
        setLoading(true);

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement(CardElement),
                billing_details: {
                    name: name,
                    email: email,
                    address: {
                        line1: address.line1,
                        city: address.city,
                        state: address.state,
                        postal_code: address.postal_code,
                        country: address.country,
                    },
                },
            },
        });

        setLoading(false);

        if (result.error) {
            toast.error(result.error.message);
        } else if (result.paymentIntent.status === "succeeded") {
            // **MODIFICATION**: Show success modal instead of toast
            setShowSuccessModal(true);
        }
    };

    return (
        <>
            {/* Render success modal when payment is successful */}
            {showSuccessModal && (
                <SuccessModal onRedirect={() => navigate('/user-homepage')} />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">
                            Shipping & Payment
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Shipping Details Section */}
                            <div className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Full Name</Label>
                                    <Input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="John Doe" required />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email Address</Label>
                                    <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
                                </div>
                                <div>
                                    <Label htmlFor="line1">Address</Label>
                                    <Input id="line1" name="line1" type="text" value={address.line1} onChange={handleAddressChange} placeholder="1234 Main St" required />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div>
                                        <Label htmlFor="city">City</Label>
                                        <Input id="city" name="city" type="text" value={address.city} onChange={handleAddressChange} placeholder="Anytown" required />
                                    </div>
                                    <div>
                                        <Label htmlFor="state">State / Province</Label>
                                        <Input id="state" name="state" type="text" value={address.state} onChange={handleAddressChange} placeholder="CA" required />
                                    </div>
                                    <div>
                                        <Label htmlFor="postal_code">ZIP / Postal</Label>
                                        <Input id="postal_code" name="postal_code" type="text" value={address.postal_code} onChange={handleAddressChange} placeholder="12345" required />
                                    </div>
                                </div>
                            </div>

                            {/* Payment Details Section */}
                            <div className="space-y-2">
                                <Label>Card Information</Label>
                                <div className="p-3 border rounded-md bg-background">
                                    <CardElement options={{ style: { base: { fontSize: "16px", color: "#424770", "::placeholder": { color: "#aab7c4" } }, invalid: { color: "#9e2146" } } }} />
                                </div>
                            </div>

                            <Button type="submit" disabled={!stripe || loading || amount <= 0} className="w-full">
                                {loading ? "Processing..." : `Pay ₹${amount.toFixed(2)}`}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Order Summary */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl font-semibold">
                            Order Summary
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex justify-between">
                            <span>Subtotal</span>
                            <span>₹{amount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Shipping</span>
                            <span>Free</span>
                        </div>
                        <hr />
                        <div className="flex justify-between font-bold text-lg">
                            <span>Total</span>
                            <span>₹{amount.toFixed(2)}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}

export default function CheckoutPage() {
    return (
        <div className="min-h-screen bg-background px-4 py-8">
            <div className="max-w-5xl mx-auto">
                <Elements stripe={stripePromise}>
                    <CheckoutForm />
                </Elements>
            </div>
        </div>
    );
}
