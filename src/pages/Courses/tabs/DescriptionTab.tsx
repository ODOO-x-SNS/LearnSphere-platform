import { useState, useEffect } from "react";
import { Save, X } from "lucide-react";
import { Button, Input, Textarea, Badge } from "../../../components/ui";
import { toast } from "../../../components/ui/Toast";
import type { Course } from "../../../types";

interface Props {
  course: Course;
  onSave: (data: Partial<Course>) => Promise<unknown>;
}

export function DescriptionTab({ course, onSave }: Props) {
  const [title, setTitle] = useState(course.title);
  const [description, setDescription] = useState(course.description || "");
  const [websiteUrl, setWebsiteUrl] = useState(course.websiteUrl || "");
  const [tags, setTags] = useState<string[]>(course.tags || []);
  const [tagInput, setTagInput] = useState("");

  useEffect(() => {
    setTitle(course.title);
    setDescription(course.description || "");
    setWebsiteUrl(course.websiteUrl || "");
    setTags(course.tags || []);
    setTagInput("");
  }, [course]);

  const handleAddTag = () => {
    const newTag = tagInput.trim();
    if (newTag && !tags.includes(newTag)) {
      setTags([...tags, newTag]);
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter((t) => t !== tagToRemove));
  };

  const handleSave = async () => {
    try {
      await onSave({ title, description, websiteUrl: websiteUrl || "", tags });
      toast("success", "Description saved");
    } catch {
      toast("error", "Failed to save description");
    }
  };

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-1">
          Course Description
        </h3>
        <p className="text-sm text-text-muted">
          Provide details about what this course covers
        </p>
      </div>

      <Input
        label="Course Title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Input
        label="Website URL"
        value={websiteUrl}
        onChange={(e) => setWebsiteUrl(e.target.value)}
        placeholder="https://..."
      />
      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe what learners will accomplish in this course..."
        className="h-48"
      />

      {/* Tags Section */}
      <div>
        <label className="block text-sm font-medium text-text-primary mb-2">
          Tags
        </label>
        <p className="text-xs text-text-muted mb-3">
          Add relevant tags to help learners find your course
        </p>

        <div className="flex gap-2 mb-3">
          <Input
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyPress={(e) =>
              e.key === "Enter" && (e.preventDefault(), handleAddTag())
            }
            placeholder="Enter a tag and press Enter or click Add"
          />
          <Button
            size="sm"
            variant="secondary"
            onClick={handleAddTag}
            disabled={!tagInput.trim()}
          >
            Add
          </Button>
        </div>

        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="primary"
                className="flex items-center gap-1.5"
              >
                {tag}
                <button
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-current"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="bg-surface-dim rounded-xl p-4 border border-border">
        <p className="text-xs font-medium text-text-muted mb-2">Tips</p>
        <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside">
          <li>Include learning objectives and prerequisites</li>
          <li>Mention the target audience</li>
          <li>
            Add relevant tags (e.g., "TypeScript", "Beginner", "Web
            Development")
          </li>
          <li>Add a website URL to embed course in external site</li>
          <li>Website URL is required before publishing</li>
        </ul>
      </div>

      <div className="flex justify-end">
        <Button icon={<Save className="h-4 w-4" />} onClick={handleSave}>
          Save Description
        </Button>
      </div>
    </div>
  );
}
