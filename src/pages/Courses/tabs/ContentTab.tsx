import { useState } from 'react';
import { Plus, GripVertical, Video, FileText, Image, HelpCircle, Trash2, Edit3, Clock, Download } from 'lucide-react';
import { Button, Card, Modal, Input, Select, Badge, EmptyState } from '../../../components/ui';
import { toast } from '../../../components/ui/Toast';
import { useCreateLesson, useUpdateLesson, useDeleteLesson } from '../../../hooks/useApi';
import type { Course, Lesson } from '../../../types';
import { clsx } from 'clsx';

const typeIcons: Record<string, React.ReactNode> = {
  VIDEO: <Video className="h-4 w-4" />,
  DOCUMENT: <FileText className="h-4 w-4" />,
  IMAGE: <Image className="h-4 w-4" />,
  QUIZ: <HelpCircle className="h-4 w-4" />,
};

const typeColors: Record<string, string> = {
  VIDEO: 'bg-primary-50 text-primary-600',
  DOCUMENT: 'bg-accent-50 text-accent-600',
  IMAGE: 'bg-success-50 text-success-600',
  QUIZ: 'bg-warning-50 text-warning-500',
};

export function ContentTab({ course }: { course: Course }) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [form, setForm] = useState({ title: '', type: 'VIDEO', externalUrl: '', durationSec: 0, description: '', allowDownload: false });

  const createLesson = useCreateLesson(course.id);
  const updateLesson = useUpdateLesson(course.id);
  const deleteLesson = useDeleteLesson(course.id);

  const lessons = [...(course.lessons || [])].sort((a, b) => a.sortOrder - b.sortOrder);

  const openCreate = () => {
    setEditingLesson(null);
    setForm({ title: '', type: 'VIDEO', externalUrl: '', durationSec: 0, description: '', allowDownload: false });
    setModalOpen(true);
  };

  const openEdit = (lesson: Lesson) => {
    setEditingLesson(lesson);
    setForm({
      title: lesson.title,
      type: lesson.type,
      externalUrl: lesson.externalUrl || '',
      durationSec: lesson.durationSec,
      description: lesson.description || '',
      allowDownload: lesson.allowDownload,
    });
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    const payload = {
      title: form.title,
      type: form.type as Lesson['type'],
      externalUrl: form.externalUrl || undefined,
      durationSec: Number(form.durationSec),
      description: form.description || undefined,
      allowDownload: form.allowDownload,
      sortOrder: editingLesson ? editingLesson.sortOrder : lessons.length,
    };

    if (editingLesson) {
      updateLesson.mutate(
        { id: editingLesson.id, data: payload },
        {
          onSuccess: () => { setModalOpen(false); toast('success', 'Lesson updated'); },
          onError: () => toast('error', 'Failed to update lesson'),
        }
      );
    } else {
      createLesson.mutate(payload, {
        onSuccess: () => { setModalOpen(false); toast('success', 'Lesson added'); },
        onError: () => toast('error', 'Failed to add lesson'),
      });
    }
  };

  const handleDelete = (id: string) => {
    deleteLesson.mutate(id, {
      onSuccess: () => { setDeleteConfirm(null); toast('success', 'Lesson deleted'); },
      onError: () => toast('error', 'Failed to delete lesson'),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Course Content</h3>
          <p className="text-[13px] text-text-muted">{lessons.length} lesson{lessons.length !== 1 ? 's' : ''} &middot; {Math.round(course.totalDurationSec / 60)} min total</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Lesson</Button>
      </div>

      {lessons.length === 0 ? (
        <EmptyState
          icon={<FileText className="h-12 w-12" />}
          title="No lessons yet"
          description="Add your first lesson to start building course content"
          action={<Button icon={<Plus className="h-4 w-4" />} onClick={openCreate}>Add Lesson</Button>}
        />
      ) : (
        <div className="space-y-2">
          {lessons.map((lesson, i) => (
            <Card key={lesson.id} padding={false} className="animate-fade-in group" hover>
              <div className="flex items-center gap-4 px-4 py-3">
                <div className="cursor-grab text-text-muted hover:text-text-secondary">
                  <GripVertical className="h-4 w-4" />
                </div>
                <span className="text-xs font-bold text-text-muted w-6">{String(i + 1).padStart(2, '0')}</span>
                <div className={clsx('w-9 h-9 rounded-lg flex items-center justify-center', typeColors[lesson.type])}>
                  {typeIcons[lesson.type]}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-text-primary truncate">{lesson.title}</p>
                  <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
                    <Badge variant="default">{lesson.type}</Badge>
                    {lesson.durationSec > 0 && (
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{Math.round(lesson.durationSec / 60)}m</span>
                    )}
                    {lesson.allowDownload && (
                      <span className="flex items-center gap-1"><Download className="h-3 w-3" />Downloadable</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => openEdit(lesson)}
                    className="p-2 rounded-lg text-text-muted hover:text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(lesson.id)}
                    className="p-2 rounded-lg text-text-muted hover:text-danger-500 hover:bg-danger-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Lesson Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editingLesson ? 'Edit Lesson' : 'Add Lesson'} size="lg">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Input label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Lesson title" />
          </div>
          <Select
            label="Type"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            options={[
              { value: 'VIDEO', label: 'Video' },
              { value: 'DOCUMENT', label: 'Document' },
              { value: 'IMAGE', label: 'Image' },
              { value: 'QUIZ', label: 'Quiz' },
            ]}
          />
          <Input
            label="Duration (seconds)"
            type="number"
            value={String(form.durationSec)}
            onChange={(e) => setForm({ ...form, durationSec: parseInt(e.target.value) || 0 })}
          />
          {form.type === 'VIDEO' && (
            <div className="col-span-2">
              <Input
                label="External URL"
                value={form.externalUrl}
                onChange={(e) => setForm({ ...form, externalUrl: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>
          )}
          <div className="col-span-2">
            <label className="block text-[13px] font-semibold text-text-secondary mb-1.5">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Optional lesson description..."
              className="w-full h-24 px-3.5 py-2.5 rounded-xl border border-border text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 resize-none hover:border-gray-300 transition-all"
            />
          </div>
          <div className="col-span-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={form.allowDownload}
                onChange={(e) => setForm({ ...form, allowDownload: e.target.checked })}
                className="rounded border-border"
              />
              <span className="text-sm text-text-secondary">Allow file download</span>
            </label>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-border">
          <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
          <Button onClick={handleSave} loading={createLesson.isPending || updateLesson.isPending} disabled={!form.title.trim()}>
            {editingLesson ? 'Save Changes' : 'Add Lesson'}
          </Button>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Lesson?" size="sm">
        <p className="text-sm text-text-secondary mb-6">This lesson will be permanently removed from the course.</p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => deleteConfirm && handleDelete(deleteConfirm)} loading={deleteLesson.isPending}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
