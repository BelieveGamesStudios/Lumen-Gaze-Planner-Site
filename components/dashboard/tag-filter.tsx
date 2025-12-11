"use client"

import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { Tag } from "@/lib/types"

interface TagFilterProps {
  tags: Tag[]
  selectedTags: string[]
  onToggleTag: (tagId: string) => void
}

export function TagFilter({ tags, selectedTags, onToggleTag }: TagFilterProps) {
  if (tags.length === 0) return null

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => {
        const isSelected = selectedTags.includes(tag.id)
        return (
          <Badge
            key={tag.id}
            variant={isSelected ? "default" : "outline"}
            className={cn("cursor-pointer transition-colors", isSelected && "bg-primary")}
            style={{
              borderColor: tag.color,
              backgroundColor: isSelected ? tag.color : "transparent",
              color: isSelected ? "white" : tag.color,
            }}
            onClick={() => onToggleTag(tag.id)}
          >
            {tag.name}
            {tag.is_personal && " (Personal)"}
          </Badge>
        )
      })}
    </div>
  )
}
