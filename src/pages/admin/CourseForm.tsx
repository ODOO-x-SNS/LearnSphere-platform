import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

const TABS = ['Content', 'Description', 'Options', 'Quiz'] as const

export function CourseForm() {
  const { courseId } = useParams()
  const [activeTab, setActiveTab] = useState<(typeof TABS)[number]>('Content')
  const [published, setPublished] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <Link
          to="/admin/courses"
          className="text-slate-600 hover:text-primary"
        >
          ← Back to Courses
        </Link>
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-slate-300"
            />
            <span className="text-sm font-medium">Published</span>
          </label>
          <button className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
            Preview
          </button>
          <button className="px-4 py-2 text-slate-600 border border-slate-300 rounded-lg hover:bg-slate-50">
            Add Attendees
          </button>
          <button className="px-4 py-2 bg-primary text-white font-medium rounded-lg hover:bg-primary-dark">
            Save
          </button>
        </div>
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        <div className="border-b border-slate-200">
          <input
            type="text"
            placeholder="Course Title (required)"
            defaultValue="Introduction to React"
            className="w-full px-6 py-4 text-lg font-semibold border-0 focus:ring-2 focus:ring-primary focus:ring-inset"
          />
          <div className="flex gap-6 px-6 pb-4">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-2 font-medium ${
                  activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-slate-600'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
        <div className="p-6 min-h-[300px]">
          {activeTab === 'Content' && (
            <div>
              <p className="text-slate-600 mb-4">Lessons management - add, reorder, edit content.</p>
              <button className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200">
                Add Content
              </button>
            </div>
          )}
          {activeTab === 'Description' && (
            <div>
              <textarea
                placeholder="Course description..."
                rows={6}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          )}
          {activeTab === 'Options' && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Visibility</label>
                <select className="w-full max-w-xs px-4 py-2 border border-slate-300 rounded-lg">
                  <option>Everyone</option>
                  <option>Signed In</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Access Rule</label>
                <select className="w-full max-w-xs px-4 py-2 border border-slate-300 rounded-lg">
                  <option>Open</option>
                  <option>On Invitation</option>
                  <option>On Payment</option>
                </select>
              </div>
            </div>
          )}
          {activeTab === 'Quiz' && (
            <div>
              <p className="text-slate-600 mb-4">Quiz management - add and edit quizzes.</p>
              <button className="px-4 py-2 bg-slate-100 text-slate-700 font-medium rounded-lg hover:bg-slate-200">
                Add Quiz
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
