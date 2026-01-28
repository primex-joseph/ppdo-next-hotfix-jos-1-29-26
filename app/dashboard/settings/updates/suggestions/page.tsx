// app/dashboard/settings/updates/suggestions/page.tsx

"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useRouter } from "next/navigation";
import { Plus, AlertCircle, CheckCircle2, Clock, XCircle, Search, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SuggestionsPage() {
  const router = useRouter();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Fetch all suggestions
  const suggestions = useQuery(api.suggestions.getAll);
  const createSuggestion = useMutation(api.suggestions.create);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCreateSuggestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      toast.error("Validation Error", {
        description: "Please fill in all required fields",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const result = await createSuggestion({ title, description });
      console.log("✅ Suggestion created:", result);

      toast.success("Suggestion Submitted", {
        description: "Your suggestion has been successfully submitted",
      });
      setIsCreateDialogOpen(false);
      setTitle("");
      setDescription("");

      // ✅ Use ID-based routing
      console.log("🔗 Navigating to:", `/dashboard/settings/updates/suggestions/${result.suggestionId}`);
      router.push(`/dashboard/settings/updates/suggestions/${result.suggestionId}`);
    } catch (error) {
      console.error("❌ Error creating suggestion:", error);
      toast.error("Error", {
        description: "Failed to submit suggestion. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "acknowledged":
        return "bg-[#15803D]/10 text-[#15803D] border-[#15803D]/20";
      case "to_review":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800";
      case "denied":
        return "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "acknowledged":
        return <CheckCircle2 className="w-4 h-4" />;
      case "to_review":
        return <Clock className="w-4 h-4" />;
      case "denied":
        return <XCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "acknowledged":
        return "Acknowledged";
      case "to_review":
        return "To Review";
      case "denied":
        return "Denied";
      default:
        return "Pending";
    }
  };

  // Filter suggestions
  const filteredSuggestions = suggestions?.filter((suggestion) => {
    const matchesSearch =
      suggestion.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      suggestion.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === "all" || suggestion.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Debug logs
  console.log("💡 Suggestions Data:", suggestions);
  console.log("🔍 Filtered Suggestions:", filteredSuggestions);

  if (suggestions === undefined) {
    return <SuggestionsPageSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Suggestions</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Share your ideas to improve the system
          </p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 bg-[#15803D] hover:bg-[#15803D]/90 text-white">
              <Plus className="w-4 h-4" />
              Submit Suggestion
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Submit a Suggestion</DialogTitle>
              <DialogDescription>
                Share your ideas on how we can improve the system. We value your feedback!
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateSuggestion} className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief summary of your suggestion"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Detailed description of your suggestion, why it would be helpful, and any implementation ideas..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={6}
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsCreateDialogOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-[#15803D] hover:bg-[#15803D]/90 text-white"
                >
                  {isSubmitting ? "Submitting..." : "Submit Suggestion"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search suggestions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="acknowledged">Acknowledged</SelectItem>
            <SelectItem value="to_review">To Review</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Suggestions List */}
      <div className="space-y-3">
        {filteredSuggestions && filteredSuggestions.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              No suggestions found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              {searchQuery || statusFilter !== "all"
                ? "Try adjusting your filters"
                : "Be the first to share a suggestion"}
            </p>
            {!searchQuery && statusFilter === "all" && (
              <Button
                onClick={() => setIsCreateDialogOpen(true)}
                className="bg-[#15803D] hover:bg-[#15803D]/90 text-white"
              >
                <Plus className="w-4 h-4 mr-2" />
                Submit Suggestion
              </Button>
            )}
          </div>
        ) : (
          filteredSuggestions?.map((suggestion) => {
            console.log("🔗 Suggestion card:", { id: suggestion._id, title: suggestion.title });
            return (
              <div
                key={suggestion._id}
                onClick={() => {
                  // ✅ Use ID-based routing
                  console.log("🖱️ Clicking suggestion:", suggestion._id);
                  router.push(`/dashboard/settings/updates/suggestions/${suggestion._id}`);
                }}
                className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-5 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-[#15803D] transition-colors">
                        {suggestion.title}
                      </h3>
                      <span
                        className={`flex-shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          suggestion.status
                        )}`}
                      >
                        {getStatusIcon(suggestion.status)}
                        {getStatusText(suggestion.status)}
                      </span>
                    </div>

                    <div
                      className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3"
                      dangerouslySetInnerHTML={{
                        __html: suggestion.description.substring(0, 200) + "...",
                      }}
                    />

                    <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                      <span>
                        Suggested by{" "}
                        {(() => {
                          const submitter = suggestion.submitter;
                          if (submitter?.firstName || submitter?.lastName) {
                            const parts = [
                              submitter.firstName,
                              submitter.middleName,
                              submitter.lastName,
                              submitter.nameExtension,
                            ].filter(Boolean);
                            return parts.join(" ");
                          }
                          if (submitter?.name) return submitter.name;
                          if (submitter?.email) return submitter.email;
                          return "Unknown";
                        })()}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(suggestion.submittedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function SuggestionsPageSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-40" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-10 flex-1" />
        <Skeleton className="h-10 w-[180px]" />
      </div>
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    </div>
  );
}