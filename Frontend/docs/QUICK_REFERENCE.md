# Phase 1: Quick Reference Guide

## 🚀 New Imports

```javascript
// Access user data
import { useUserData } from '@hooks/useUserData';

// Show notifications
import { useNotification } from '@hooks/useNotification';

// Query data directly
import { QueryService } from '@services/queryService';
```

---

## 📌 Most Common Patterns

### Get User Data
```javascript
const { profile, stats, streak, todayProgress, lessonsCompleted } = useUserData();
```

### Show Notification
```javascript
const { success, error, warning, info } = useNotification();

success('Lesson completed!');
error('Something went wrong');
```

### Check if Lesson Completed
```javascript
const { isLessonCompleted } = useUserData();
const completed = isLessonCompleted('lesson_1');
```

### Mark Lesson Complete
```javascript
const { completeLesson } = useUserData();
await completeLesson(lessonId, score, stars, signsLearned);
```

### Update Progress
```javascript
const { updateProgress } = useUserData();
await updateProgress({ todayProgress: 50, ...otherData });
```

---

## 🎯 Redux State Access

```javascript
// Profile information
const profile = useSelector(selectUserProfile);

// All stats
const stats = useSelector(selectUserStats);

// Individual stats
const streak = useSelector(selectStreak);
const todayProgress = useSelector(selectTodayProgress);
const lessonsCompleted = useSelector(selectLessonsCompleted);

// Completed lessons
const completedLessons = useSelector(selectCompletedLessons);

// Loading and error states
const isLoading = useSelector(selectUserDataLoading);
const error = useSelector(selectUserDataError);
```

---

## 🔄 Data Flow

```
Component → useUserData() → Redux userData slice → dataService (cache) → Firebase
Component → useNotification() → Redux notifications slice → NotificationCenter
```

---

## ✨ Before & After Checklist

| Task | Before | After |
|------|--------|-------|
| Fetch user profile | 10 lines | 1 line |
| Get user stats | 5 separate calls | 1 hook call |
| Show error | `alert()` or `console.error()` | `error()` |
| Check lesson complete | Manual array search | `isLessonCompleted()` |
| Update progress | Direct DB call | `updateProgress()` |

---

## 🧪 Testing in Browser Console

```javascript
// See Redux state
store.getState().userData;

// Check cache stats
DataService.getCacheStats();

// Manually trigger notification
store.dispatch(showSuccess('Test notification'));

// Check notifications
store.getState().notifications.notifications;
```

---

## ⚡ Performance Tips

1. **Cache is automatic** - Don't worry about fetching twice
2. **Use selectors** - Better performance than accessing full state
3. **Batch queries** - Use `QueryService.batchFetchUserData()` for multiple data
4. **Disable Redux DevTools in production** - Already optimized

---

## 🐛 Quick Troubleshooting

| Problem | Solution |
|---------|----------|
| Data undefined | Check `isLoading` state first |
| Notifications don't appear | Verify `<NotificationCenter />` in App.jsx |
| Redux DevTools blank | Enable it and refresh, check Extension permissions |
| Cache not updating | Redux thunks handle this automatically |

---

## 📞 Help Quick Links

- **Implementation Details:** PHASE_1_SUMMARY.md
- **Component Migration:** MIGRATION_GUIDE.md
- **Status Report:** PHASE_1_STATUS.md
- **Redux DevTools:** https://github.com/reduxjs/redux-devtools

---

**Phase 1 Complete! Ready for component migration. 🎉**
