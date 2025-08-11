import React, { useState, useEffect } from 'react';
import { getAllMessages, replyToMessage } from '../service/commuincationAPI.js'; // Adjust path
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Send } from 'lucide-react';

export default function CommunicationPage() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedMessage, setSelectedMessage] = useState(null);
    const [isReplyDialogOpen, setIsReplyDialogOpen] = useState(false);
    const [replyContent, setReplyContent] = useState('');
    const [replyLoading, setReplyLoading] = useState(false);

    const fetchMessages = async () => {
        try {
            const data = await getAllMessages();
            // Sort messages: unreplied first, then by date newest first
            data.sort((a, b) => {
                if (a.replied !== b.replied) {
                    return a.replied ? 1 : -1;
                }
                return new Date(b.receivedDate) - new Date(a.receivedDate);
            });
            setMessages(data);
        } catch (error) {
            toast.error("Failed to fetch messages.");
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleReplyClick = (message) => {
        setSelectedMessage(message);
        setReplyContent('');
        setIsReplyDialogOpen(true);
    };

    const handleSendReply = async () => {
        if (!replyContent.trim()) {
            toast.error("Reply message cannot be empty.");
            return;
        }
        setReplyLoading(true);
        try {
            await replyToMessage(selectedMessage.id, { replyMessage: replyContent });
            toast.success("Reply sent successfully!");
            setIsReplyDialogOpen(false);
            // Refresh the messages list to show the updated status
            fetchMessages();
        } catch (error) {
            toast.error("Failed to send reply.",error);
        } finally {
            setReplyLoading(false);
        }
    };

    if (loading) {
        return <div className="p-8 text-center">Loading messages...</div>;
    }

    return (
        <div className="p-8">
            <h2 className="text-3xl font-bold tracking-tight mb-6">Communications Inbox</h2>
            {messages.length > 0 ? (
                <Card>
                    <CardContent className="p-0">
                        <Accordion type="single" collapsible className="w-full">
                            {messages.map((msg) => (
                                <AccordionItem value={`item-${msg.id}`} key={msg.id}>
                                    <AccordionTrigger className="px-6 py-4 hover:no-underline">
                                        <div className="flex justify-between items-center w-full">
                                            <div className="text-left">
                                                <p className="font-semibold">{msg.customerName}</p>
                                                <p className="text-sm text-muted-foreground">{msg.customerEmail}</p>
                                            </div>
                                            <div className="flex items-center space-x-4">
                                                <span className="text-sm text-muted-foreground hidden md:inline">
                                                    {new Date(msg.receivedDate).toLocaleString()}
                                                </span>
                                                <Badge variant={msg.replied ? "secondary" : "default"}>
                                                    {msg.replied ? "Replied" : "New"}
                                                </Badge>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-6 pb-6 bg-muted/30">
                                        <p className="mb-4">{msg.message}</p>
                                        {msg.replied && (
                                            <div className="p-3 bg-background rounded-md border">
                                                <p className="font-semibold text-sm mb-1">Your Reply:</p>
                                                <p className="text-sm text-muted-foreground">{msg.reply}</p>
                                            </div>
                                        )}
                                        {!msg.replied && (
                                            <Button onClick={() => handleReplyClick(msg)}>Reply</Button>
                                        )}
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-20 border-2 border-dashed rounded-lg">
                    <h3 className="text-xl font-semibold">No messages yet.</h3>
                    <p className="text-muted-foreground mt-2">New messages from users will appear here.</p>
                </div>
            )}

            {/* Reply Dialog */}
            <Dialog open={isReplyDialogOpen} onOpenChange={setIsReplyDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reply to {selectedMessage?.customerName}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div>
                            <Label htmlFor="customer-email">To</Label>
                            <Input id="customer-email" value={selectedMessage?.customerEmail || ''} readOnly disabled />
                        </div>
                        <div>
                            <Label htmlFor="reply-message">Your Reply</Label>
                            <Textarea
                                id="reply-message"
                                value={replyContent}
                                onChange={(e) => setReplyContent(e.target.value)}
                                placeholder="Type your response here..."
                                rows={6}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleSendReply} disabled={replyLoading}>
                            {replyLoading ? 'Sending...' : <><Send size={16} className="mr-2" /> Send Reply</>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
