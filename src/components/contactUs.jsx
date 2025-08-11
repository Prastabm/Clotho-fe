import React, { useState, useContext, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { AuthContext } from '../contexts/AuthContext';
import { sendMessage } from '../service/commuincationAPI.js'; // Corrected import path
import { toast } from "sonner";

export default function ContactUs() {
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', message: '' });
    const [loading, setLoading] = useState(false);
    const { user } = useContext(AuthContext);

    // Pre-fill form with user data if available
    useEffect(() => {
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.name || '',
                email: user.email || ''
            }));
        }
    }, [user, isOpen]);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.email || !formData.message) {
            toast.error("Please fill out all fields.");
            return;
        }
        setLoading(true);
        try {
            const response = await sendMessage(formData);
            toast.success(response || "Message sent successfully!");
            setIsOpen(false); // Close form on success
            setFormData(prev => ({ ...prev, message: '' })); // Clear message field
        } catch (error) {
            toast.error("Failed to send message. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Floating Action Button */}
            <Button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-8 right-8 h-16 w-16 rounded-full shadow-lg z-50 flex items-center justify-center"
                aria-label="Contact Us"
            >
                {isOpen ? <X size={28} /> : <MessageSquare size={28} />}
            </Button>

            {/* Contact Form Modal */}
            {isOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 flex items-end justify-end pb-28 pr-4">
                    <Card className="w-full max-w-md m-4 transform transition-all duration-300 ease-out translate-y-0">
                        <CardHeader>
                            <CardTitle>Contact Us</CardTitle>
                        </CardHeader>
                        <form onSubmit={handleSubmit}>
                            <CardContent className="space-y-4">
                                <div>
                                    <Label htmlFor="name">Name</Label>
                                    <Input id="name" value={formData.name} onChange={handleInputChange} placeholder="Your Name" required />
                                </div>
                                <div>
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="your.email@example.com" required />
                                </div>
                                <div>
                                    <Label htmlFor="message">Message</Label>
                                    <Textarea id="message" value={formData.message} onChange={handleInputChange} placeholder="How can we help you?" required />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? 'Sending...' : <><Send size={16} className="mr-2" /> Send Message</>}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            )}
        </>
    );
}
