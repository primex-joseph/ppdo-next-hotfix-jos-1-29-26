"use client";

import { useState, useEffect } from "react";
import {
    ResizableModal,
    ResizableModalContent,
    ResizableModalHeader,
    ResizableModalTitle,
    ResizableModalDescription,
    ResizableModalBody,
    ResizableModalFooter,
} from "@/components/ui/resizable-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import RichTextEditor from "@/components/ui/RichTextEditor";
import { Bug, Lightbulb, ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { useRouter } from "next/navigation";

interface ConcernModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    screenshot: string | null;
}

type ConcernType = "bug" | "suggestion" | null;

export function ConcernModal({ open, onOpenChange, screenshot }: ConcernModalProps) {
    const router = useRouter();
    const [step, setStep] = useState<"selection" | "form">("selection");
    const [type, setType] = useState<ConcernType>(null);

    // Form State
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isProcessingScreenshot, setIsProcessingScreenshot] = useState(false);
    const [multimedia, setMultimedia] = useState<Array<{ storageId: string, type: "image" | "video", name: string }>>([]);

    // Mutations
    const createBugReport = useMutation(api.bugReports.create);
    const createSuggestion = useMutation(api.suggestions.create);
    const generateUploadUrl = useMutation(api.media.generateUploadUrl);

    // Reset state when modal is closed
    useEffect(() => {
        if (!open) {
            setTimeout(() => {
                setStep("selection");
                setType(null);
                setTitle("");
                setDescription("");
                setMultimedia([]);
            }, 300);
        }
    }, [open]);

    // Handle Screenshot Upload and Editor Autofill
    const handleScreenshotAutofill = async () => {
        if (screenshot && (description === "" || description === "<p></p>")) {
            try {
                setIsProcessingScreenshot(true);
                // Convert base64 to blob
                const res = await fetch(screenshot);
                const blob = await res.blob();
                const file = new File([blob], "screenshot.png", { type: "image/png" });

                // Upload to Convex
                const postUrl = await generateUploadUrl();
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });

                if (result.ok) {
                    const { storageId } = await result.json();
                    // Generate URL (approximate, ideally we get this from backend helper or assume standard format)
                    const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_URL!.replace(".cloud", ".site");
                    const imageUrl = `${convexSiteUrl}/images/${storageId}`;

                    const imgHtml = `<p><strong>Captured Screenshot:</strong></p><img src="${imageUrl}" class="rounded-md border border-zinc-200 dark:border-zinc-700 my-2" />`;
                    setDescription(imgHtml);

                    setMultimedia(prev => [...prev, {
                        storageId,
                        type: "image",
                        name: "screenshot.png"
                    }]);
                }
            } catch (error) {
                console.error("Failed to auto-upload screenshot", error);
                toast.error("Failed to upload screenshot");
            } finally {
                setIsProcessingScreenshot(false);
            }
        }
    };

    // Trigger autofill when entering form step
    useEffect(() => {
        if (step === "form" && screenshot && open) {
            handleScreenshotAutofill();
        }
    }, [step, screenshot, open]);

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) {
            toast.error("Please fill in all fields");
            return;
        }

        setIsSubmitting(true);
        let resultId: any = null;

        try {
            if (type === "bug") {
                const result = await createBugReport({
                    title,
                    description,
                    multimedia: multimedia.map(m => ({
                        storageId: m.storageId as any,
                        type: m.type,
                        name: m.name
                    }))
                });
                resultId = result.reportId;
            } else {
                const result = await createSuggestion({
                    title,
                    description,
                    multimedia: multimedia.map(m => ({
                        storageId: m.storageId as any,
                        type: m.type,
                        name: m.name
                    }))
                });
                resultId = result.suggestionId;
            }

            // Success Feedback
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 }
            });

            toast.success(type === "bug" ? "Bug Reported!" : "Suggestion Submitted!", {
                description: "Thank you for your feedback.",
                action: {
                    label: "View Report",
                    onClick: () => {
                        const path = type === "bug"
                            ? `/dashboard/settings/updates/bugs-report/${resultId}`
                            : `/dashboard/settings/updates/suggestions/${resultId}`;
                        router.push(path);
                    }
                },
            });

            onOpenChange(false);
        } catch (error) {
            console.error(error);
            toast.error("Failed to submit", { description: "Something went wrong. Please try again." });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <ResizableModal open={open} onOpenChange={onOpenChange}>
            <ResizableModalContent className="sm:max-w-[800px] h-[80vh] flex flex-col" allowOverflow>

                {step === "selection" ? (
                    <>
                        <ResizableModalHeader>
                            <ResizableModalTitle>Report Concerns</ResizableModalTitle>
                            <ResizableModalDescription>
                                How can we help you today?
                            </ResizableModalDescription>
                        </ResizableModalHeader>
                        <ResizableModalBody className="p-6 flex flex-col md:flex-row gap-4 items-center justify-center">

                            {/* Suggestion Card */}
                            <div
                                onClick={() => { setType("suggestion"); setStep("form"); }}
                                className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-[#15803D] dark:hover:border-[#15803D] hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer w-full md:w-1/2 h-64 group"
                            >
                                <div className="p-4 rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Lightbulb size={32} />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Make a Suggestion</h3>
                                <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
                                    Have an idea to improve the app? Let us know!
                                </p>
                            </div>

                            {/* Bug Report Card */}
                            <div
                                onClick={() => { setType("bug"); setStep("form"); }}
                                className="flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-zinc-200 dark:border-zinc-700 hover:border-red-500 dark:hover:border-red-500 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all cursor-pointer w-full md:w-1/2 h-64 group"
                            >
                                <div className="p-4 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 mb-4 group-hover:scale-110 transition-transform">
                                    <Bug size={32} />
                                </div>
                                <h3 className="text-xl font-semibold mb-2">Report a Bug</h3>
                                <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm">
                                    Something not working right? Tell us about it.
                                </p>
                            </div>

                        </ResizableModalBody>
                    </>
                ) : (
                    <>
                        <ResizableModalHeader className="flex flex-row items-center gap-2 border-b-0 pb-2">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setStep("selection")}
                                className="mr-2"
                            >
                                <ArrowLeft size={16} />
                            </Button>
                            <div className="flex flex-col">
                                <ResizableModalTitle>
                                    {type === "bug" ? "Report a Bug" : "Make a Suggestion"}
                                </ResizableModalTitle>
                                <ResizableModalDescription>
                                    {type === "bug"
                                        ? "Describe the issue you encountered."
                                        : "Share your ideas for improvement."}
                                </ResizableModalDescription>
                            </div>
                        </ResizableModalHeader>

                        <ResizableModalBody className="p-6 space-y-4 pt-2">
                            <div className="space-y-2">
                                <Label htmlFor="title">Title *</Label>
                                <Input
                                    id="title"
                                    placeholder={type === "bug" ? "e.g., Navigation menu is broken" : "e.g., Add dark mode toggle"}
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full"
                                    autoFocus
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Description *</Label>
                                <RichTextEditor
                                    value={description}
                                    onChange={setDescription}
                                    placeholder="Details..."
                                    onMultimediaChange={(newMedia) => {
                                        setMultimedia(prev => [...prev, ...newMedia]);
                                    }}
                                    className="min-h-[300px]"
                                />
                                <p className="text-xs text-muted-foreground flex items-center gap-2">
                                    {isProcessingScreenshot && <Loader2 className="w-3 h-3 animate-spin" />}
                                    {isProcessingScreenshot
                                        ? "Attaching screenshot..."
                                        : screenshot
                                            ? "A screenshot of your current page has been automatically attached."
                                            : "You can add screenshots or videos to help explain."}
                                </p>
                            </div>
                        </ResizableModalBody>

                        <ResizableModalFooter>
                            <Button
                                variant="outline"
                                onClick={() => onOpenChange(false)}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                                className={`${type === "bug"
                                    ? "bg-red-600 hover:bg-red-700"
                                    : "bg-[#15803D] hover:bg-[#15803D]/90"
                                    } text-white gap-2`}
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Submitting...
                                    </>
                                ) : (
                                    <>
                                        {type === "bug" ? <Bug className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                        Submit {type === "bug" ? "Report" : "Suggestion"}
                                    </>
                                )}
                            </Button>
                        </ResizableModalFooter>
                    </>
                )}
            </ResizableModalContent>
        </ResizableModal>
    );
}
