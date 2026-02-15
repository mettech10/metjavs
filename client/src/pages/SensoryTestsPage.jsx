import { useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiRequest } from '../services/api';

const fallbackModules = [
  {
    id: 'reaction-time',
    title: 'Reaction Time',
    description: 'Wait for green, then click as fast as possible.',
    scoringHint: 'Lower milliseconds = better'
  },
  {
    id: 'memory-sequence',
    title: 'Memory Sequence',
    description: 'Memorize and repeat an increasing number sequence.',
    scoringHint: 'Higher level = better'
  },
  {
    id: 'focus-score',
    title: 'Focus Score',
    description: 'Click as many focus targets as you can in 10 seconds.',
    scoringHint: 'Higher clicks = better'
  }
];

function SensoryTestsPage() {
  const { token } = useAuth();
  const [modules, setModules] = useState(fallbackModules);
  const [activeModule, setActiveModule] = useState('reaction-time');
  const [status, setStatus] = useState('Choose a module and start a test.');

  // reaction-time state
  const [reactionState, setReactionState] = useState('idle');
  const [reactionStartTime, setReactionStartTime] = useState(0);
  const reactionTimeoutRef = useRef(null);

  // memory state
  const [memoryLevel, setMemoryLevel] = useState(3);
  const [memorySequence, setMemorySequence] = useState('');
  const [memoryInput, setMemoryInput] = useState('');
  const [memoryVisible, setMemoryVisible] = useState(false);

  // focus state
  const [focusRunning, setFocusRunning] = useState(false);
  const [focusClicks, setFocusClicks] = useState(0);
  const [focusTimeLeft, setFocusTimeLeft] = useState(10);

  useEffect(() => {
    apiRequest('/sensory/modules', {}, token)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setModules(data);
          setActiveModule(data[0].id);
        }
      })
      .catch(() => {
        setStatus('Using offline module definitions. API modules unavailable right now.');
      });
  }, [token]);

  useEffect(() => {
    let interval;
    if (focusRunning) {
      interval = setInterval(() => {
        setFocusTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setFocusRunning(false);
            submitScore('focus-score', focusClicks, { durationSec: 10 });
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [focusRunning, focusClicks]);

  useEffect(
    () => () => {
      if (reactionTimeoutRef.current) {
        clearTimeout(reactionTimeoutRef.current);
      }
    },
    []
  );

  const moduleDetails = useMemo(
    () => modules.find((module) => module.id === activeModule) || modules[0],
    [modules, activeModule]
  );

  const submitScore = async (moduleType, score, metadata = {}) => {
    try {
      await apiRequest(
        '/sensory/results',
        {
          method: 'POST',
          body: JSON.stringify({ moduleType, score, metadata })
        },
        token
      );
      setStatus(`Saved ${moduleType} result: ${score}`);
    } catch (error) {
      setStatus(`Result could not be saved: ${error.message}`);
    }
  };

  const startReactionTest = () => {
    setReactionState('waiting');
    setStatus('Wait for green... then click immediately.');

    const delay = 1000 + Math.floor(Math.random() * 2500);
    reactionTimeoutRef.current = setTimeout(() => {
      setReactionState('ready');
      setReactionStartTime(performance.now());
      setStatus('NOW! Click the target!');
    }, delay);
  };

  const handleReactionClick = () => {
    if (reactionState === 'waiting') {
      setReactionState('idle');
      if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
      setStatus('Too early! Try again.');
      return;
    }

    if (reactionState === 'ready') {
      const elapsed = Math.round(performance.now() - reactionStartTime);
      setReactionState('done');
      setStatus(`Reaction recorded: ${elapsed} ms`);
      submitScore('reaction-time', elapsed, { unit: 'ms' });
    }
  };

  const startMemoryTest = () => {
    const sequence = Array.from({ length: memoryLevel }, () => Math.floor(Math.random() * 10)).join('');
    setMemorySequence(sequence);
    setMemoryInput('');
    setMemoryVisible(true);
    setStatus(`Memorize this ${memoryLevel}-digit sequence...`);

    setTimeout(() => {
      setMemoryVisible(false);
      setStatus('Enter the sequence from memory.');
    }, 2200);
  };

  const submitMemoryAnswer = () => {
    const isCorrect = memoryInput.trim() === memorySequence;
    if (isCorrect) {
      const nextLevel = memoryLevel + 1;
      setStatus(`Correct! Level ${memoryLevel} passed.`);
      submitScore('memory-sequence', memoryLevel, { sequenceLength: memoryLevel, correct: true });
      setMemoryLevel(nextLevel);
    } else {
      setStatus(`Incorrect. Correct sequence was ${memorySequence}.`);
      submitScore('memory-sequence', Math.max(memoryLevel - 1, 1), {
        sequenceLength: memoryLevel,
        correct: false
      });
      setMemoryLevel(3);
    }
    setMemoryInput('');
  };

  const startFocusTest = () => {
    setFocusClicks(0);
    setFocusTimeLeft(10);
    setFocusRunning(true);
    setStatus('Focus test started. Click targets quickly!');
  };

  const renderActiveTest = () => {
    if (!moduleDetails) return null;

    if (moduleDetails.id === 'reaction-time') {
      return (
        <div className="test-panel">
          <h3>Reaction Time Test</h3>
          <div
            className={`reaction-box ${reactionState}`}
            role="button"
            tabIndex={0}
            onClick={handleReactionClick}
            onKeyDown={(event) => event.key === 'Enter' && handleReactionClick()}
          >
            {reactionState === 'idle' && 'Click START'}
            {reactionState === 'waiting' && 'Wait...'}
            {reactionState === 'ready' && 'CLICK!'}
            {reactionState === 'done' && 'Done — click START for another round'}
          </div>
          <button type="button" onClick={startReactionTest}>
            Start Reaction Test
          </button>
        </div>
      );
    }

    if (moduleDetails.id === 'memory-sequence') {
      return (
        <div className="test-panel">
          <h3>Memory Sequence Test</h3>
          <p>Current level: {memoryLevel}</p>
          <div className="memory-display">{memoryVisible ? memorySequence : '••••'}</div>
          <div className="memory-actions">
            <button type="button" onClick={startMemoryTest}>
              Show Sequence
            </button>
            <input
              type="text"
              value={memoryInput}
              onChange={(event) => setMemoryInput(event.target.value.replace(/\D/g, ''))}
              placeholder="Type sequence"
            />
            <button type="button" onClick={submitMemoryAnswer} disabled={!memoryInput}>
              Submit Answer
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="test-panel">
        <h3>Focus Score Test</h3>
        <p>Time left: {focusTimeLeft}s</p>
        <p>Clicks: {focusClicks}</p>
        <button type="button" onClick={startFocusTest} disabled={focusRunning}>
          {focusRunning ? 'Running...' : 'Start Focus Test'}
        </button>
        <button
          type="button"
          className="focus-target"
          disabled={!focusRunning}
          onClick={() => setFocusClicks((prev) => prev + 1)}
        >
          {focusRunning ? 'CLICK TARGET' : 'Start test first'}
        </button>
      </div>
    );
  };

  return (
    <section>
      <h2>Sensory Test Modules</h2>
      <div className="stats-grid module-grid">
        {modules.map((module) => (
          <article
            key={module.id}
            className={`stat-card module-card ${activeModule === module.id ? 'active' : ''}`}
          >
            <h3>{module.title}</h3>
            <p>{module.description}</p>
            <small>{module.scoringHint}</small>
            <button type="button" onClick={() => setActiveModule(module.id)}>
              Open Test
            </button>
          </article>
        ))}
      </div>

      {renderActiveTest()}
      <p className="status-text">{status}</p>
    </section>
  );
}

export default SensoryTestsPage;
