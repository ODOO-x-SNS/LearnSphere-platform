import { useParams, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import {
  ArrowLeft, Globe, Eye, Users, Save, Send,
  BookText, Settings2, FileText, HelpCircle, Loader2,
} from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { Button, Badge, Modal, Input, Tabs } from '../../components/ui';
import { toast } from '../../components/ui/Toast';
import { useCourse, useUpdateCourse, useTogglePublish, useInviteToCourse } from '../../hooks/useApi';
import { ContentTab } from './tabs/ContentTab';
import { DescriptionTab } from './tabs/DescriptionTab';
import { OptionsTab } from './tabs/OptionsTab';
import { QuizTab } from './tabs/QuizTab';

export function CourseFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: course, isLoading } = useCourse(id!);
  const updateCourse = useUpdateCourse(id!);
  const togglePublish = useTogglePublish(id!);
  const inviteMutation = useInviteToCourse(id!);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteEmails, setInviteEmails] = useState('');

  if (isLoading || !course) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  const handlePublishToggle = () => {
    togglePublish.mutate(!course.published, {
      onSuccess: () => toast('success', course.published ? 'Course unpublished' : 'Course published!'),
      onError: (err: any) => {
        const msg = err?.response?.data?.message || 'Failed to toggle publish status.';
        toast('error', msg);
      },
    });
  };

  const handleInvite = () => {
    const emails = inviteEmails.split(/[,\n]/).map((e) => e.trim()).filter(Boolean);
    if (emails.length === 0) return;
    inviteMutation.mutate(emails, {
      onSuccess: () => {
        toast('success', `Invited ${emails.length} user(s)`);
        setInviteOpen(false);
        setInviteEmails('');
      },
      onError: () => toast('error', 'Failed to send invitations'),
    });
  };

  return (
    <div>
      <Header
        title={course.title}
        subtitle={`Course ID: ${course.id.slice(0, 8)}...`}
        actions={
          <div className="flex items-center gap-3">
            <Badge variant={course.published ? 'success' : 'default'}>
              {course.published ? 'Published' : 'Draft'}
            </Badge>
            <Button variant="secondary" size="sm" icon={<Eye className="h-3.5 w-3.5" />}
              onClick={() => window.open(`/courses/${course.slug}`, '_blank')}>
              Preview
            </Button>
            <Button variant="secondary" size="sm" icon={<Send className="h-3.5 w-3.5" />}
              onClick={() => setInviteOpen(true)}>
              Invite
            </Button>
            <Button
              variant={course.published ? 'secondary' : 'success'}
              size="sm"
              icon={<Globe className="h-3.5 w-3.5" />}
              onClick={handlePublishToggle}
              loading={togglePublish.isPending}
            >
              {course.published ? 'Unpublish' : 'Publish'}
            </Button>
          </div>
        }
      />

      <div className="p-8">
        {/* Back nav */}
        <button
          onClick={() => navigate('/admin/courses')}
          className="flex items-center gap-2 text-[13px] text-text-muted hover:text-text-primary transition-colors mb-6 font-medium group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-0.5 transition-transform" /> Back to Courses
        </button>

        {/* Tabs */}
        <Tabs
          tabs={[
            {
              id: 'content',
              label: 'Content',
              icon: <BookText className="h-4 w-4" />,
              content: <ContentTab course={course} />,
            },
            {
              id: 'description',
              label: 'Description',
              icon: <FileText className="h-4 w-4" />,
              content: <DescriptionTab course={course} onSave={(data) => updateCourse.mutateAsync(data)} />,
            },
            {
              id: 'options',
              label: 'Options',
              icon: <Settings2 className="h-4 w-4" />,
              content: <OptionsTab course={course} onSave={(data) => updateCourse.mutateAsync(data)} />,
            },
            {
              id: 'quizzes',
              label: 'Quizzes',
              icon: <HelpCircle className="h-4 w-4" />,
              content: <QuizTab course={course} />,
            },
          ]}
          defaultTab="content"
        />
      </div>

      {/* Invite Modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite Learners" size="md">
        <div className="space-y-4">
          <p className="text-sm text-text-secondary">
            Enter email addresses separated by commas or new lines.
          </p>
          <textarea
            value={inviteEmails}
            onChange={(e) => setInviteEmails(e.target.value)}
            placeholder="learner1@example.com, learner2@example.com"
            className="w-full h-32 px-3.5 py-2.5 rounded-xl border border-border text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 resize-none hover:border-gray-300 transition-all"
          />
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setInviteOpen(false)}>Cancel</Button>
            <Button onClick={handleInvite} loading={inviteMutation.isPending} icon={<Send className="h-4 w-4" />}>
              Send Invitations
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
