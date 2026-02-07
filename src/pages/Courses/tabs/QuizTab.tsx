import { useState } from "react";
import {
  Plus,
  HelpCircle,
  Trash2,
  Edit3,
  CheckCircle,
  XCircle,
  Award,
} from "lucide-react";
import {
  Button,
  Card,
  Badge,
  Modal,
  Input,
  EmptyState,
} from "../../../components/ui";
import { toast } from "../../../components/ui/Toast";
import {
  useCreateQuiz,
  useUpdateQuiz,
  useDeleteQuiz,
} from "../../../hooks/useApi";
import type { Course, Quiz, Question, QuizOption } from "../../../types";
import { clsx } from "clsx";
import { useNavigate } from "react-router-dom";

export function QuizTab({ course }: { course: Course }) {
  const navigate = useNavigate();
  const [createOpen, setCreateOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  // Quiz builder state
  const [quizTitle, setQuizTitle] = useState("");
  const [pointsFirst, setPointsFirst] = useState(100);
  const [questions, setQuestions] = useState<
    Array<{
      text: string;
      multipleSelection: boolean;
      options: Array<{ text: string; isCorrect: boolean }>;
    }>
  >([
    {
      text: "",
      multipleSelection: false,
      options: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
      ],
    },
  ]);

  const createQuiz = useCreateQuiz(course.id);
  const updateQuiz = useUpdateQuiz(course.id);
  const deleteQuiz = useDeleteQuiz(course.id);
  const quizzes = course.quizzes || [];

  const resetForm = () => {
    setQuizTitle("");
    setPointsFirst(100);
    setQuestions([
      {
        text: "",
        multipleSelection: false,
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ],
      },
    ]);
  };

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        multipleSelection: false,
        options: [
          { text: "", isCorrect: true },
          { text: "", isCorrect: false },
        ],
      },
    ]);
  };

  const updateQuestion = (idx: number, field: string, value: unknown) => {
    const updated = [...questions];
    (updated[idx] as Record<string, unknown>)[field] = value;
    setQuestions(updated);
  };

  const addOption = (qIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options.push({ text: "", isCorrect: false });
    setQuestions(updated);
  };

  const updateOption = (
    qIdx: number,
    oIdx: number,
    field: string,
    value: unknown,
  ) => {
    const updated = [...questions];
    (updated[qIdx].options[oIdx] as Record<string, unknown>)[field] = value;
    setQuestions(updated);
  };

  const removeOption = (qIdx: number, oIdx: number) => {
    const updated = [...questions];
    updated[qIdx].options = updated[qIdx].options.filter((_, i) => i !== oIdx);
    setQuestions(updated);
  };

  const removeQuestion = (idx: number) => {
    setQuestions(questions.filter((_, i) => i !== idx));
  };

  const handleCreate = () => {
    if (!quizTitle.trim()) return;
    const valid = questions.every(
      (q) =>
        q.text.trim() &&
        q.options.length >= 2 &&
        q.options.some((o) => o.isCorrect),
    );
    if (!valid) {
      toast(
        "error",
        "Each question needs text, at least 2 options, and a correct answer",
      );
      return;
    }

    if (editingId) {
      updateQuiz.mutate(
        {
          id: editingId,
          data: {
            title: quizTitle,
            pointsFirstTry: pointsFirst,
            questions: questions as unknown as Question[],
          },
        },
        {
          onSuccess: () => {
            toast("success", "Quiz updated!");
            setCreateOpen(false);
            setEditingId(null);
            resetForm();
          },
          onError: () => toast("error", "Failed to update quiz"),
        },
      );
    } else {
      createQuiz.mutate(
        {
          title: quizTitle,
          pointsFirstTry: pointsFirst,
          questions: questions as unknown as Question[],
        },
        {
          onSuccess: () => {
            toast("success", "Quiz created!");
            setCreateOpen(false);
            resetForm();
          },
          onError: () => toast("error", "Failed to create quiz"),
        },
      );
    }
  };

  const handleDelete = (id: string) => {
    deleteQuiz.mutate(id, {
      onSuccess: () => {
        toast("success", "Quiz deleted");
        setDeleteConfirm(null);
      },
      onError: () => toast("error", "Failed to delete quiz"),
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-text-primary">Quizzes</h3>
          <p className="text-[13px] text-text-muted">
            {quizzes.length} quiz{quizzes.length !== 1 ? "zes" : ""}
          </p>
        </div>
        <Button
          icon={<Plus className="h-4 w-4" />}
          onClick={() => setCreateOpen(true)}
        >
          Create Quiz
        </Button>
      </div>

      {quizzes.length === 0 ? (
        <EmptyState
          icon={<HelpCircle className="h-12 w-12" />}
          title="No quizzes yet"
          description="Create a quiz to test your learners' knowledge"
          action={
            <Button
              icon={<Plus className="h-4 w-4" />}
              onClick={() => setCreateOpen(true)}
            >
              Create Quiz
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {quizzes.map((quiz) => (
            <Card key={quiz.id} hover className="group">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center shadow-xs ring-1 ring-accent-100">
                    <HelpCircle className="h-5 w-5 text-accent-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-text-primary text-sm">
                      {quiz.title}
                    </p>
                    <p className="text-xs text-text-muted mt-0.5">
                      {quiz.questions?.length || 0} questions
                    </p>
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => {
                      setEditingId(quiz.id);
                      setQuizTitle(quiz.title);
                      setPointsFirst(quiz.pointsFirstTry || 100);
                      setQuestions(
                        (quiz.questions || []).map((q) => ({
                          text: q.text,
                          multipleSelection: q.multipleSelection,
                          options: q.options.map((o) => ({
                            text: o.text,
                            isCorrect: o.isCorrect,
                          })),
                        })),
                      );
                      setCreateOpen(true);
                    }}
                    className="p-1.5 rounded-lg text-text-muted hover:text-primary-600 hover:bg-primary-50 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(quiz.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-danger-500 hover:bg-danger-50 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-3 mt-4 pt-3 border-t border-border">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <Award className="h-3.5 w-3.5" />
                  {quiz.pointsFirstTry} pts
                </div>
                <Badge variant="primary">{quiz.questions?.length || 0}Q</Badge>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Quiz Modal */}
      <Modal
        open={createOpen}
        onClose={() => {
          setCreateOpen(false);
          setEditingId(null);
          resetForm();
        }}
        title={editingId ? "Edit Quiz" : "Create Quiz"}
        size="xl"
      >
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Quiz Title"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.target.value)}
              placeholder="e.g., Module 1 Assessment"
            />
            <Input
              label="Points (First Try)"
              type="number"
              value={String(pointsFirst)}
              onChange={(e) => setPointsFirst(parseInt(e.target.value) || 0)}
            />
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-text-primary">Questions</h4>
              <Button
                variant="secondary"
                size="sm"
                icon={<Plus className="h-3.5 w-3.5" />}
                onClick={addQuestion}
              >
                Add Question
              </Button>
            </div>

            {questions.map((q, qIdx) => (
              <Card key={qIdx} className="bg-surface-dim border-border">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-xs font-bold text-text-muted bg-white px-2 py-1 rounded-md">
                    Q{qIdx + 1}
                  </span>
                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(qIdx)}
                      className="text-text-muted hover:text-danger-500 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <Input
                  placeholder="Enter your question..."
                  value={q.text}
                  onChange={(e) => updateQuestion(qIdx, "text", e.target.value)}
                  className="mb-4"
                />
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => (
                    <div key={oIdx} className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateOption(qIdx, oIdx, "isCorrect", !opt.isCorrect)
                        }
                        className={clsx(
                          "w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors",
                          opt.isCorrect
                            ? "border-success-500 bg-success-500 text-white"
                            : "border-border bg-white hover:border-success-300",
                        )}
                      >
                        {opt.isCorrect && (
                          <CheckCircle className="h-3.5 w-3.5" />
                        )}
                      </button>
                      <input
                        type="text"
                        placeholder={`Option ${oIdx + 1}`}
                        value={opt.text}
                        onChange={(e) =>
                          updateOption(qIdx, oIdx, "text", e.target.value)
                        }
                        className="flex-1 px-3 py-2 rounded-xl border border-border text-sm shadow-xs focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-400 bg-white hover:border-gray-300 transition-all"
                      />
                      {q.options.length > 2 && (
                        <button
                          onClick={() => removeOption(qIdx, oIdx)}
                          className="text-text-muted hover:text-danger-500"
                        >
                          <XCircle className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(qIdx)}
                    className="text-xs text-primary-600 hover:text-primary-700 font-medium pl-8"
                  >
                    + Add Option
                  </button>
                </div>
              </Card>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-border">
            <Button
              variant="secondary"
              onClick={() => {
                setCreateOpen(false);
                setEditingId(null);
                resetForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              loading={editingId ? updateQuiz.isPending : createQuiz.isPending}
              disabled={!quizTitle.trim()}
            >
              {editingId ? "Update Quiz" : "Create Quiz"}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <Modal
        open={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Quiz?"
        size="sm"
      >
        <p className="text-sm text-text-secondary mb-6">
          This quiz and all its questions will be permanently removed.
        </p>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
            loading={deleteQuiz.isPending}
          >
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
