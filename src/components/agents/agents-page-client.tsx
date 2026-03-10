"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SearchX } from "lucide-react";
import { Navbar } from "@/components/ui/navbar";
import { AgentCard } from "@/components/agents/agent-card";
import { CategoryFilter } from "@/components/agents/category-filter";
import { SearchBar } from "@/components/agents/search-bar";
import { SortSelect } from "@/components/agents/sort-select";
import type { Agent, SortOption } from "@/lib/types";

interface AgentsPageClientProps {
  agents: Agent[];
}

export function AgentsPageClient({ agents }: AgentsPageClientProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("name");

  const filteredAgents = useMemo(() => {
    let result = agents;

    // Filter by category
    if (selectedCategory) {
      result = result.filter((a) => a.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (a) =>
          a.displayName.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // Sort
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case "name":
          return a.displayName.localeCompare(b.displayName, "zh-CN");
        case "downloads":
          return b.downloads - a.downloads;
        case "newest":
          return b.version.localeCompare(a.version);
        default:
          return 0;
      }
    });

    return result;
  }, [agents, selectedCategory, searchQuery, sortBy]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <main className="container mx-auto px-6 pt-28 pb-20">
        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-3">
            <span className="text-gradient">Agent Templates</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl">
            Discover and install curated AI agent personas
          </p>
        </motion.div>

        {/* Search + Sort row */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-3 mb-6"
        >
          <div className="flex-1">
            <SearchBar value={searchQuery} onChange={setSearchQuery} />
          </div>
          <SortSelect value={sortBy} onChange={setSortBy} />
        </motion.div>

        {/* Category filter */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mb-8"
        >
          <CategoryFilter
            agents={agents}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
          />
        </motion.div>

        {/* Result count */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredAgents.length === agents.length
              ? `${agents.length} agents available`
              : `${filteredAgents.length} of ${agents.length} agents`}
          </p>
        </div>

        {/* Agent grid */}
        {filteredAgents.length > 0 ? (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredAgents.map((agent, i) => (
                <AgentCard key={agent.name} agent={agent} index={i} />
              ))}
            </AnimatePresence>
          </motion.div>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            <div className="rounded-full bg-[hsl(var(--glass-bg)/0.05)] p-4 mb-4">
              <SearchX className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-1">
              No agents found
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              No agents match your current filters. Try adjusting your search
              query or category selection.
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
