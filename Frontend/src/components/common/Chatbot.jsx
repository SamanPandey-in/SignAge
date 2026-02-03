import { useState, useEffect } from 'react';
import { IoChatbubbles, IoClose, IoSend } from 'react-icons/io5';
import { useUserData } from '@hooks/useUserData';
import { auth, DatabaseService } from '@services/firebase';
import { LESSONS } from '@constants/lessons';

const normalize = (text = '') => text.trim().toLowerCase();

const Chatbot = () => {
  const { profile, lessonsCompleted, completedLessons, stats, streak, todayProgress } = useUserData();
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { from: 'bot', text: `Hi ${profile?.displayName || 'there'} — ask me about your progress or say "Help".` },
  ]);

  // Small helper to push bot message
  const pushBot = (text) => setMessages((m) => [...m, { from: 'bot', text }]);

  // Resolve user query using available data (graceful fallbacks)
  const handleQuery = async (query) => {
    const q = normalize(query);

    if (!q) {
      pushBot("Please type a question — e.g. 'Show my progress'.");
      return;
    }

    // Show my progress
    if (q.includes('show my progress') || q.includes('my progress')) {
      // Overall completion percentage: use total lessons count when available
      const totalLessons = LESSONS.length || 0;
      const completed = typeof lessonsCompleted === 'number' ? lessonsCompleted : (completedLessons || []).length;
      const completionPct = totalLessons > 0 ? Math.round((completed / totalLessons) * 100) : null;
      const accuracy = stats?.averageAccuracy ?? stats?.average_accuracy ?? null;

      pushBot(
        `Overall completion: ${completionPct !== null ? completionPct + '%' : 'Not available'}\n` +
          `Lessons completed: ${completed ?? 'Not available'}\n` +
          `Overall accuracy: ${accuracy !== null ? accuracy + '%' : 'Not available'}`
      );
      return;
    }

    // What is my streak?
    if (q.includes('what is my streak') || q.includes('my streak') || q.includes('streak')) {
      // Try to fetch lastPracticeDate from DatabaseService if available
      let lastPractice = null;
      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          const result = await DatabaseService.getUserData(uid);
          if (result.success && result.data?.progress?.lastPracticeDate) {
            const ts = result.data.progress.lastPracticeDate;
            // Firestore Timestamp may have toDate()
            lastPractice = ts?.toDate ? ts.toDate() : new Date(ts);
          }
        }
      } catch (err) {
        // ignore — we'll still show streak number
      }

      const streakCount = typeof streak === 'number' ? streak : stats?.streak ?? 'Not available';
      pushBot(
        `Current streak: ${streakCount} day(s)\n` +
          `Last practice: ${lastPractice ? lastPractice.toLocaleDateString() : 'Not available'}`
      );
      return;
    }

    // Which signs should I practice?
    if (q.includes('which signs') || q.includes('should i practice') || q.includes('signs should i')) {
      // Attempt to find per-sign accuracies in user data
      let signAccuracies = null;
      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          const result = await DatabaseService.getUserData(uid);
          if (result.success) {
            signAccuracies = result.data?.progress?.signAccuracies || result.data?.progress?.sign_accuracy || null;
          }
        }
      } catch (err) {
        signAccuracies = null;
      }

      if (signAccuracies && Object.keys(signAccuracies).length > 0) {
        // signAccuracies expected as { signId: accuracy }
        const sorted = Object.entries(signAccuracies).sort((a, b) => a[1] - b[1]);
        const picks = sorted.slice(0, 3).map(([id, acc]) => {
          // Try to find a readable name in LESSONS
          const sign = LESSONS.flatMap((l) => l.signs || []).find((s) => s.id === id);
          return `${sign?.word || id} (${acc}%)`;
        });
        pushBot(`Signs to practice: ${picks.join(', ')}`);
        return;
      }

      // Fallback: suggest 2-3 signs from lessons not yet completed
      const completedSet = new Set(completedLessons || []);
      const candidateSigns = [];
      for (const lesson of LESSONS) {
        if (!completedSet.has(lesson.id)) {
          for (const sign of lesson.signs || []) {
            candidateSigns.push(sign.word || sign.id);
            if (candidateSigns.length >= 3) break;
          }
        }
        if (candidateSigns.length >= 3) break;
      }

      if (candidateSigns.length > 0) {
        pushBot(`Try practicing: ${candidateSigns.slice(0, 3).join(', ')}.`);
      } else {
        pushBot('No sign accuracy data available and no remaining lessons found. Try practicing lessons you have started.');
      }
      return;
    }

    // Suggest next lesson
    if (q.includes('suggest next') || q.includes('next lesson') || q.includes('suggest a lesson')) {
      const completedSet = new Set(completedLessons || []);
      const next = LESSONS.find((l) => !completedSet.has(l.id));

      if (!next) {
        pushBot('Great work — you have completed all available lessons!');
        return;
      }

      // Reason: prefer not attempted; if accuracy data exists and is low for prerequisites, mention it
      let reason = 'You have not attempted this lesson yet.';
      try {
        const uid = auth.currentUser?.uid;
        if (uid) {
          const result = await DatabaseService.getUserData(uid);
          const signAcc = result.success ? result.data?.progress?.signAccuracies : null;
          if (signAcc) {
            // if lesson signs include ones with low accuracy, mention it
            const low = (next.signs || []).filter((s) => signAcc[s.id] && signAcc[s.id] < 70);
            if (low.length > 0) reason = `Low accuracy in prerequisites: ${low.map((s) => s.word).join(', ')}`;
          }
        }
      } catch (err) {}

      pushBot(`Next recommended lesson: ${next.title}\nReason: ${reason}`);
      return;
    }

    // My sign is not detected
    if (q.includes('not detected') || q.includes('not recognise') || q.includes("not detect")) {
      pushBot('Troubleshooting tips:\n• Ensure proper lighting\n• Maintain correct hand distance from the camera\n• Align the camera so your hand is clearly visible');
      return;
    }

    // Help
    if (q === 'help' || q.includes('help')) {
      pushBot('I can show your progress, streak, weak signs, and suggest what to learn next.');
      return;
    }

    // Default
    pushBot("Sorry — I didn't understand that. Try: 'Show my progress', 'What is my streak?', 'Which signs should I practice?', 'Suggest next lesson', or 'Help'.");
  };

  const handleSend = async () => {
    if (!input) return;
    setMessages((m) => [...m, { from: 'user', text: input }]);
    const q = input;
    setInput('');
    await handleQuery(q);
  };

  // open greeting update when profile loads
  useEffect(() => {
    setMessages((m) => {
      // replace first bot greeting if it referenced stale name
      const first = m[0] || {};
      if (first.from === 'bot') {
        const rest = m.slice(1);
        return [{ from: 'bot', text: `Hi ${profile?.displayName || 'there'} — ask me about your progress or say "Help".` }, ...rest];
      }
      return m;
    });
  }, [profile?.displayName]);

  return (
    <div>
      {/* Floating button */}
      <div className="fixed bottom-6 right-6 z-50">
        {!open && (
          <button
            onClick={() => setOpen(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-full shadow-lg flex items-center justify-center"
            aria-label="Open chat"
          >
            <IoChatbubbles className="text-2xl" />
          </button>
        )}

        {open && (
          <div className="w-80 md:w-96 bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2 bg-blue-600 text-white">
              <div className="flex items-center gap-3">
                <IoChatbubbles className="text-xl" />
                <div className="font-semibold">Coach</div>
              </div>
              <button onClick={() => setOpen(false)} aria-label="Close chat">
                <IoClose />
              </button>
            </div>

            <div className="p-3 h-64 overflow-auto space-y-3 bg-gray-50">
              {messages.map((m, i) => (
                <div key={i} className={`flex ${m.from === 'bot' ? 'justify-start' : 'justify-end'}`}>
                  <div className={`${m.from === 'bot' ? 'bg-white border' : 'bg-blue-600 text-white'} rounded-lg px-3 py-2 max-w-72`}>
                    {m.text.split('\n').map((line, idx) => (
                      <div key={idx}>{line}</div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-2 px-3 py-2 border-t bg-white">
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
                placeholder="Ask something..."
                className="flex-1 px-3 py-2 rounded-lg border border-gray-200 outline-none"
              />
              <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 p-2 rounded-lg text-white">
                <IoSend />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chatbot;
