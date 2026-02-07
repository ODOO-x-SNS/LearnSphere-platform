# A1 – Courses Dashboard

## Purpose
Entry point for Admin/Instructor to manage all courses.

## Views
- Kanban View
- List View

## UI Sections
1. Header
   - Page title
   - "+ Create Course" button
2. View Toggle (Kanban / List)
3. Search Input (by course name)
4. Courses Container

## Course Card / Row Displays
- Course title
- Tags
- Views count
- Total lessons count
- Total duration
- Published badge (if published)

## Actions Per Course
- Edit → opens Course Form
- Share → copy/generate course link

## Create Course Flow
- Small modal popup
- Input: Course Name (required)
- CTA: Create → redirects to Course Form

## States
- Empty (no courses)
- Loading
- Error
