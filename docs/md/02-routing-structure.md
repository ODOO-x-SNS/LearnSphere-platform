# Routing Structure

## Admin / Instructor
/admin
/admin/courses
/admin/courses/:courseId/edit
/admin/courses/:courseId/quizzes
/admin/courses/:courseId/reporting

## Learner
/
/courses
/courses/:courseSlug
/courses/:courseSlug/player/:lessonId
/my-courses

## Guards
- Admin routes → Admin OR Instructor
- Learner routes → Logged-in Learner
- Player routes → Enrollment + Access rules
