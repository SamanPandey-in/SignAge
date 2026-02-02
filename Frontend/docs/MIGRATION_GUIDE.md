## Phase 1: Migration Guide - How to Update Existing Components

### Quick Reference

This guide helps you update components to use the new Redux consolidation system.

---

## 📋 Comparison: Before vs After

### Home.jsx Migration Example

#### **BEFORE (Multiple Sources)**
```javascript
import { useState, useEffect } from 'react';
import { useAuth } from '@hooks/useAuth';
import { useProgress } from '@hooks/useProgress';
import { DatabaseService, AuthService } from '@services/firebase';

const Home = () => {
  const { user } = useAuth();
  const { streak, todayProgress, totalLessonsCompleted, loadProgress, loadStreak } = useProgress();
  const [userName, setUserName] = useState('User');
  const [dbStats, setDbStats] = useState({...});

  useEffect(() => {
    loadProgress();
    loadStreak();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    if (user) {
      try {
        const userData = await DatabaseService.getUserData(user.uid);
        setUserName(userData.data.displayName || 'User');
      } catch (error) {
        console.error('Error:', error);
      }
    }
  };

  return (
    <div>
      <h1>Welcome, {userName}!</h1>
      <p>Streak: {streak}</p>
      <p>Progress: {todayProgress}%</p>
    </div>
  );
};
```

#### **AFTER (Single Redux Source)**
```javascript
import { useUserData } from '@hooks/useUserData';
import { useNotification } from '@hooks/useNotification';

const Home = () => {
  const { profile, streak, todayProgress, isLoading, error } = useUserData();
  const { error: showError } = useNotification();

  // Data is automatically loaded and cached!
  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Welcome, {profile.displayName}!</h1>
      <p>Streak: {streak}</p>
      <p>Progress: {todayProgress}%</p>
    </div>
  );
};
```

**Changes:**
- ✅ Removed 4 hooks → 2 hooks
- ✅ Removed 3 useState calls → 0 useState calls
- ✅ Removed useEffect with manual fetching → automatic
- ✅ Removed try-catch → automatic error handling

---

## 🔄 Common Migration Patterns

### Pattern 1: Fetching User Data

#### Before
```javascript
const [user, setUser] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadUser = async () => {
    try {
      const user = AuthService.getCurrentUser();
      const userData = await DatabaseService.getUserData(user.uid);
      setUser(userData.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  loadUser();
}, []);
```

#### After
```javascript
const { profile, isLoading } = useUserData();
// And use profile directly!
```

---

### Pattern 2: Handling Errors

#### Before
```javascript
try {
  await doSomething();
  alert('Success!');
} catch (error) {
  alert(error.message);
}
```

#### After
```javascript
const { success, error } = useNotification();

try {
  await doSomething();
  success('Operation completed!');
} catch (err) {
  error(err.message); // Shows notification automatically
}
```

---

### Pattern 3: Marking Lesson Complete

#### Before (LessonContent.jsx)
```javascript
const handleLessonComplete = async () => {
  try {
    const user = AuthService.getCurrentUser();
    const result = await DatabaseService.markLessonCompleted(
      user.uid,
      lesson.id,
      score,
      stars,
      signsLearned
    );
    
    if (result.success) {
      setShowCompletionModal(true);
    }
  } catch (error) {
    alert('Error: ' + error.message);
  }
};
```

#### After (LessonContent.jsx)
```javascript
const { completeLesson } = useUserData();
const { success, error } = useNotification();

const handleLessonComplete = async () => {
  const result = await completeLesson(lessonId, score, stars, signsLearned);
  
  if (result.success) {
    success('🎉 Lesson Complete! You earned ' + stars + ' stars!');
    setShowCompletionModal(true);
  } else {
    error(result.error);
  }
};
```

---

### Pattern 4: Using Stats

#### Before (Progress.jsx)
```javascript
const [stats, setStats] = useState({...});

useEffect(() => {
  const loadStats = async () => {
    const user = AuthService.getCurrentUser();
    const result = await DatabaseService.getUserStats(user.uid);
    setStats(result.stats);
  };
  loadStats();
}, []);

// Use: stats.lessonsCompleted, stats.streak, etc.
```

#### After (Progress.jsx)
```javascript
const { 
  stats,
  lessonsCompleted,
  streak,
  starsEarned,
  totalPracticeTime 
} = useUserData();

// Direct access to all stats!
```

---

### Pattern 5: Checking if Lesson Completed

#### Before
```javascript
const [completedLessons, setCompletedLessons] = useState([]);

useEffect(() => {
  const load = async () => {
    const result = await DatabaseService.getCompletedLessons(uid);
    setCompletedLessons(result.lessons);
  };
  load();
}, [uid]);

const isCompleted = completedLessons.includes(lessonId);
```

#### After
```javascript
const { isLessonCompleted } = useUserData();

const isCompleted = isLessonCompleted(lessonId);
// That's it!
```

---

## 📝 Step-by-Step Migration for Learn.jsx

### Step 1: Replace Hooks

```javascript
// REMOVE
import { useLessons } from '@hooks/useLessons';
import { DatabaseService, AuthService } from '@services/firebase';

const { completedLessons, isLoading: lessonsLoading } = useLessons();
const [loadedCompletedLessons, setLoadedCompletedLessons] = useState([]);

// ADD
import { useUserData } from '@hooks/useUserData';

const { completedLessons, isLoading } = useUserData();
```

### Step 2: Remove Manual Fetching

```javascript
// REMOVE
useEffect(() => {
  loadCompletedLessons();
}, []);

const loadCompletedLessons = async () => {
  try {
    const user = AuthService.getCurrentUser();
    if (user) {
      const result = await DatabaseService.getCompletedLessons(user.uid);
      if (result.success) {
        setLoadedCompletedLessons(result.lessons || []);
      }
    }
  } catch (error) {
    console.error('Error loading completed lessons:', error);
  }
};
```

### Step 3: Update UI State

```javascript
// BEFORE
return (
  <div>
    {lessonsLoading ? <LoadingSpinner /> : <LessonsList />}
  </div>
);

// AFTER
return (
  <div>
    {isLoading ? <LoadingSpinner /> : <LessonsList />}
  </div>
);
```

### Step 4: Update Helper Methods

```javascript
// BEFORE
const isLessonCompleted = (lessonId) => {
  return completedLessons.includes(lessonId) || loadedCompletedLessons.includes(lessonId);
};

// AFTER
const isLessonCompleted = (lessonId) => {
  return completedLessons.includes(lessonId);
};

// Or even better - use the hook's built-in method
const { isLessonCompleted } = useUserData();
```

---

## ✅ Migration Checklist

Use this checklist when migrating each component:

```
Component: _______________

□ Replace import statements (remove DatabaseService, etc.)
□ Replace multiple hooks with useUserData / useNotification
□ Remove manual useState declarations for user data
□ Remove useEffect fetching logic
□ Update error handling (use notification system)
□ Update success messages (use notification system)
□ Test component still loads data
□ Test error scenarios
□ Check Redux DevTools to see state updates
□ Verify no console errors

Notes:
_________________________
```

---

## 🎯 Components to Migrate (Priority Order)

### High Priority (Most Complex)
1. **Home.jsx** - Multiple data sources, complex state
2. **Progress.jsx** - Fetches stats, calculations
3. **LessonContent.jsx** - Lesson completion logic

### Medium Priority
4. **Learn.jsx** - Lesson list, filtering
5. **Profile.jsx** - User profile updates
6. **Camera.jsx** - ML model integration

### Low Priority
7. **LessonDetail.jsx** - Static lesson display
8. **Landing.jsx** - No user data needed

---

## 🧪 Testing Your Migration

### Before Committing

```javascript
// 1. Check Redux DevTools
// Open Redux DevTools browser extension
// Verify userData slice is being populated
// Check that actions are dispatched correctly

// 2. Test data loading
console.log('User Data:', useUserData());
// Should show all stats immediately

// 3. Test errors
// Temporarily break network or auth
// Should see error notifications

// 4. Test caching
console.log(DataService.getCacheStats());
// Refresh page, stats should show 'cached: true'
```

---

## 🐛 Common Issues & Solutions

### Issue 1: "profile is undefined"
**Cause:** Data not loaded yet
**Solution:** Check `isLoading` state
```javascript
if (isLoading) return <LoadingSpinner />;
return <div>{profile.displayName}</div>;
```

### Issue 2: Notifications don't appear
**Cause:** NotificationCenter not rendered
**Solution:** Verify in App.jsx:
```javascript
<NotificationCenter />  // Must be at top level
```

### Issue 3: Data doesn't update after action
**Cause:** Cache not invalidated
**Solution:** Redux thunks handle this automatically
```javascript
// Your code
await completeLesson(...);
// Redux automatically updates cache
```

### Issue 4: Redux DevTools shows no userData
**Cause:** Selector using wrong path
**Solution:** Check store configuration
```javascript
// store/index.js
reducer: {
  userData: userDataReducer,  // Must match slice name
}
```

---

## 📚 Reference Documentation

- **useUserData Hook:** Returns { profile, stats, completedLessons, isLoading, error, completeLesson, updateProgress }
- **useNotification Hook:** Returns { success, error, warning, info, remove, clearAll, notifications }
- **DataService:** Handles caching and data aggregation
- **QueryService:** Provides query interface for data access

---

## 💡 Pro Tips

1. **Use Redux DevTools** - Install Redux DevTools browser extension to debug state
2. **Check Cache Stats** - `DataService.getCacheStats()` shows what's cached
3. **Clear Cache on Logout** - Already done in useAuth hook
4. **Batch Operations** - Use `QueryService.batchFetchUserData()` for multiple queries
5. **Test with Redux DevTools** - Time-travel debug Redux state changes

---

**Happy Migrating! 🚀**
