// CCA-F Exam Prep - Interactive App
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

// State
let state = JSON.parse(localStorage.getItem('ccaf-state') || 'null') || {
  chaptersCompleted: {},
  chapterQuizScores: {},
  mockScores: {},
  currentView: 'chapters'
};

function saveState() {
  localStorage.setItem('ccaf-state', JSON.stringify(state));
}

// Navigation
$$('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.currentView = btn.dataset.view;
    render();
  });
});

function render() {
  const content = $('#content');
  switch(state.currentView) {
    case 'chapters': renderChapters(content); break;
    case 'exams': renderExams(content); break;
    case 'mocks': renderMocks(content); break;
    case 'progress': renderProgress(content); break;
  }
}

// Chapter List View
function renderChapters(el) {
  el.innerHTML = COURSE_DATA.chapters.map(ch => {
    const progress = getChapterProgress(ch.id);
    const locked = ch.id > 1 && !isChapterUnlocked(ch.id);
    return `
      <div class="chapter-card ${locked ? 'locked' : ''}" data-id="${ch.id}">
        <div class="chapter-header">
          <span class="chapter-num">${ch.icon} Chapter ${ch.id}</span>
          <span class="chapter-weight">${ch.weight}</span>
        </div>
        <div class="chapter-title">${ch.title}</div>
        <div class="chapter-desc">${ch.description}</div>
        <div class="chapter-progress">
          <div class="chapter-progress-fill" style="width:${progress}%"></div>
        </div>
        ${locked ? '<small style="color:var(--text-dim)">🔒 Pass previous chapter quiz to unlock</small>' : ''}
      </div>
    `;
  }).join('');

  el.querySelectorAll('.chapter-card:not(.locked)').forEach(card => {
    card.addEventListener('click', () => openChapter(+card.dataset.id));
  });
}

function isChapterUnlocked(chId) {
  if (chId === 1) return true;
  // Previous chapter quiz must be passed (60%+)
  const prevScore = state.chapterQuizScores[chId - 1];
  return prevScore !== undefined && prevScore >= 60;
}

function getChapterProgress(chId) {
  const ch = COURSE_DATA.chapters.find(c => c.id === chId);
  const totalSections = ch.sections.length;
  const completed = state.chaptersCompleted[chId] || 0;
  return Math.round((completed / totalSections) * 100);
}

// Open Chapter - Show Sections
function openChapter(chId) {
  const ch = COURSE_DATA.chapters.find(c => c.id === chId);
  const content = $('#content');
  
  content.innerHTML = `
    <button class="back-btn" onclick="render()">← Back to Chapters</button>
    <h2 style="color:var(--accent-light); margin-bottom:4px;">${ch.icon} ${ch.title}</h2>
    <p style="color:var(--text-dim); margin-bottom:20px;">${ch.weight} of exam weight</p>
    ${ch.sections.map((sec, i) => `
      <div class="chapter-card" data-ch="${chId}" data-sec="${i}">
        <div class="chapter-header">
          <span class="chapter-num">${sec.type === 'quiz' ? '📝' : '📖'} ${i + 1}</span>
          <span class="badge ${getSectionStatus(chId, i)}">${getSectionLabel(chId, i)}</span>
        </div>
        <div class="chapter-title">${sec.title}</div>
      </div>
    `).join('')}
  `;
  
  content.querySelectorAll('.chapter-card').forEach(card => {
    card.addEventListener('click', () => {
      const chIdx = +card.dataset.ch;
      const secIdx = +card.dataset.sec;
      openSection(chIdx, secIdx);
    });
  });
}

function getSectionStatus(chId, secIdx) {
  const completed = state.chaptersCompleted[chId] || 0;
  if (secIdx < completed) return 'badge-pass';
  if (secIdx === completed) return 'badge-pending';
  return '';
}

function getSectionLabel(chId, secIdx) {
  const completed = state.chaptersCompleted[chId] || 0;
  if (secIdx < completed) return '✓ Done';
  if (secIdx === completed) return '→ Current';
  return 'Upcoming';
}

// Open Section - Lesson or Quiz
function openSection(chId, secIdx) {
  const ch = COURSE_DATA.chapters.find(c => c.id === chId);
  const sec = ch.sections[secIdx];
  const content = $('#content');
  
  if (sec.type === 'lesson') {
    renderLesson(content, ch, sec, chId, secIdx);
  } else if (sec.type === 'quiz') {
    renderQuiz(content, sec.questions, `Chapter ${chId} Quiz`, (score) => {
      state.chapterQuizScores[chId] = score;
      // Mark all sections of this chapter as completed
      state.chaptersCompleted[chId] = ch.sections.length;
      saveState();
    }, () => openChapter(chId));
  }
}

function renderLesson(el, ch, sec, chId, secIdx) {
  el.innerHTML = `
    <button class="back-btn" onclick="openChapter(${chId})">← Back to ${ch.title}</button>
    <div class="section content-view">
      ${sec.content}
    </div>
    <button class="submit-btn" id="mark-done">
      ${secIdx < ch.sections.length - 1 ? '✓ Mark as Read & Continue →' : '✓ Complete Section'}
    </button>
  `;
  
  document.getElementById('mark-done').addEventListener('click', () => {
    const current = state.chaptersCompleted[chId] || 0;
    if (secIdx >= current) {
      state.chaptersCompleted[chId] = secIdx + 1;
      saveState();
    }
    // Go to next section or back to chapter
    if (secIdx < ch.sections.length - 1) {
      openSection(chId, secIdx + 1);
    } else {
      openChapter(chId);
    }
  });
  
  // Scroll to top
  window.scrollTo(0, 0);
}

// Quiz Renderer (reusable for chapter quizzes and mock tests)
function renderQuiz(el, questions, title, onComplete, onBack) {
  let answers = new Array(questions.length).fill(null);
  let submitted = false;
  
  function drawQuiz() {
    el.innerHTML = `
      <button class="back-btn" id="quiz-back">← Back</button>
      <h2 style="color:var(--accent-light); margin-bottom:16px;">${title}</h2>
      <div class="quiz-container">
        ${questions.map((q, i) => `
          <div class="question-card" id="q${i}">
            <div class="question-num">Question ${i + 1} of ${questions.length}</div>
            <div class="question-text">${q.q}</div>
            <div class="options">
              ${q.options.map((opt, j) => `
                <div class="option ${getOptionClass(i, j)}" data-q="${i}" data-opt="${j}">
                  <strong>${String.fromCharCode(65 + j)}.</strong> ${opt}
                </div>
              `).join('')}
            </div>
            <div class="explanation ${submitted ? 'show' : ''}" id="exp${i}">
              ${submitted ? (answers[i] === q.correct ? '✅' : '❌') + ' ' + q.explanation : ''}
            </div>
          </div>
        `).join('')}
        ${!submitted ? `
          <button class="submit-btn" id="submit-quiz" ${answers.includes(null) ? 'disabled' : ''}>
            Submit Answers (${answers.filter(a => a !== null).length}/${questions.length} answered)
          </button>
        ` : `
          <div class="results-card">
            <div class="score-label">Your Score</div>
            <div class="score ${getScoreClass(answers, questions)}">${calculateScore(answers, questions)}/1000</div>
            <p>${calculateScore(answers, questions) >= 720 ? '🎉 PASSED! You scored above 720.' : '📚 Below 720. Review the explanations and try again.'}</p>
          </div>
          <button class="submit-btn" id="retry-quiz">Try Again</button>
        `}
      </div>
    `;
    
    // Event listeners
    document.getElementById('quiz-back').addEventListener('click', onBack);
    
    if (!submitted) {
      el.querySelectorAll('.option').forEach(opt => {
        opt.addEventListener('click', () => {
          const qi = +opt.dataset.q;
          const oi = +opt.dataset.opt;
          answers[qi] = oi;
          drawQuiz();
        });
      });
      
      const submitBtn = document.getElementById('submit-quiz');
      if (submitBtn) {
        submitBtn.addEventListener('click', () => {
          submitted = true;
          const score = calculateScore(answers, questions);
          const pct = Math.round((answers.filter((a, i) => a === questions[i].correct).length / questions.length) * 100);
          if (onComplete) onComplete(pct);
          drawQuiz();
          window.scrollTo(0, el.querySelector('.results-card').offsetTop - 100);
        });
      }
    } else {
      const retryBtn = document.getElementById('retry-quiz');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          answers = new Array(questions.length).fill(null);
          submitted = false;
          drawQuiz();
          window.scrollTo(0, 0);
        });
      }
    }
  }
  
  function getOptionClass(qi, oi) {
    if (!submitted) return answers[qi] === oi ? 'selected' : '';
    if (oi === questions[qi].correct) return 'correct';
    if (answers[qi] === oi) return 'wrong';
    return '';
  }
  
  drawQuiz();
}

function calculateScore(answers, questions) {
  const correct = answers.filter((a, i) => a === questions[i].correct).length;
  return Math.round((correct / questions.length) * 1000);
}

function getScoreClass(answers, questions) {
  return calculateScore(answers, questions) >= 720 ? 'pass' : 'fail';
}

// Exams View - Chapter-end quizzes status
function renderExams(el) {
  el.innerHTML = `
    <h2 style="color:var(--accent-light); margin-bottom:16px;">📝 Chapter Exams</h2>
    <p style="color:var(--text-dim); margin-bottom:20px;">Pass each chapter exam (60%+) to unlock the next chapter.</p>
    ${COURSE_DATA.chapters.map(ch => {
      const score = state.chapterQuizScores[ch.id];
      const passed = score !== undefined && score >= 60;
      const available = isChapterUnlocked(ch.id);
      return `
        <div class="chapter-card ${!available ? 'locked' : ''}" data-exam-ch="${ch.id}">
          <div class="chapter-header">
            <span class="chapter-num">${ch.icon} Ch ${ch.id}</span>
            ${score !== undefined ? `<span class="badge ${passed ? 'badge-pass' : 'badge-fail'}">${score}%</span>` : '<span class="badge badge-pending">Not taken</span>'}
          </div>
          <div class="chapter-title">${ch.title} - End of Chapter Quiz</div>
          <div class="chapter-desc">${ch.sections.filter(s => s.type === 'quiz')[0]?.questions.length || 5} questions</div>
        </div>
      `;
    }).join('')}
  `;
  
  el.querySelectorAll('.chapter-card:not(.locked)').forEach(card => {
    card.addEventListener('click', () => {
      const chId = +card.dataset.examCh;
      const ch = COURSE_DATA.chapters.find(c => c.id === chId);
      const quizSection = ch.sections.find(s => s.type === 'quiz');
      if (quizSection) {
        renderQuiz($('#content'), quizSection.questions, `${ch.title} - Exam`, (score) => {
          state.chapterQuizScores[chId] = score;
          state.chaptersCompleted[chId] = ch.sections.length;
          saveState();
        }, () => renderExams($('#content')));
      }
    });
  });
}

// Mocks View
function renderMocks(el) {
  const allChaptersPassed = COURSE_DATA.chapters.every(ch => 
    state.chapterQuizScores[ch.id] >= 60
  );
  const allMocksPassed = COURSE_DATA.mockTests.slice(0, 4).every(mt =>
    state.mockScores[mt.id] >= 720
  );
  const finalPassed = state.mockScores['final'] >= 720;
  
  let html = `<h2 style="color:var(--accent-light); margin-bottom:16px;">🎯 Mock Tests</h2>`;
  
  if (!allChaptersPassed) {
    html += `<div class="warning-point">🔒 Complete all chapter exams first to unlock mock tests.</div>`;
  }
  
  html += COURSE_DATA.mockTests.map((mt, i) => {
    const isLocked = !allChaptersPassed || (mt.id === 'final' && !allMocksPassed);
    const score = state.mockScores[mt.id];
    const passed = score >= 720;
    return `
      <div class="mock-card ${isLocked ? 'locked' : ''}" data-mock="${mt.id}">
        <div class="chapter-header">
          <span class="chapter-num">${mt.id === 'final' ? '🏆' : '📋'} ${mt.id === 'final' ? 'FINAL' : 'Mock ' + (i+1)}</span>
          ${score ? `<span class="badge ${passed ? 'badge-pass' : 'badge-fail'}">${score}/1000</span>` : '<span class="badge badge-pending">Not taken</span>'}
        </div>
        <div class="chapter-title">${mt.title}</div>
        <div class="chapter-desc">${mt.description} · ${mt.timeLimit} min · Pass: ${mt.passingScore}/1000</div>
        ${isLocked && mt.id === 'final' ? '<small style="color:var(--text-dim)">🔒 Pass all 4 mock tests to unlock final</small>' : ''}
      </div>
    `;
  }).join('');
  
  // Ready banner
  if (finalPassed) {
    html += `
      <div class="ready-banner">
        <h2>🎉 YOU'RE READY!</h2>
        <p>You've passed all chapters, all mock tests, and the final assessment. Time to book the real exam!</p>
      </div>
      <div class="enroll-guide">
        <h3>📋 How to Register</h3>
        <ol>
          ${COURSE_DATA.enrollmentGuide.steps.map(s => `<li><strong>${s.title}</strong><br><span style="color:var(--text-dim)">${s.detail}</span></li>`).join('')}
        </ol>
        <h3 style="margin-top:16px;">🔗 Links</h3>
        <ul>
          ${COURSE_DATA.enrollmentGuide.links.map(l => `<li><a href="${l.url}" target="_blank">${l.label}</a></li>`).join('')}
        </ul>
      </div>
    `;
  }
  
  el.innerHTML = html;
  
  el.querySelectorAll('.mock-card:not(.locked)').forEach(card => {
    card.addEventListener('click', () => {
      const mockId = card.dataset.mock;
      const mock = COURSE_DATA.mockTests.find(m => m.id === mockId);
      renderQuiz($('#content'), mock.questions, mock.title, (pct) => {
        state.mockScores[mockId] = Math.round(pct * 10); // Convert % to /1000
        saveState();
      }, () => renderMocks($('#content')));
    });
  });
}

// Progress View
function renderProgress(el) {
  const domains = COURSE_DATA.chapters.map(ch => ({
    name: ch.title,
    weight: ch.weight,
    quizScore: state.chapterQuizScores[ch.id] || 0,
    lessonsRead: (state.chaptersCompleted[ch.id] || 0),
    totalLessons: ch.sections.length
  }));
  
  const overallProgress = Math.round(
    domains.reduce((sum, d) => sum + (d.lessonsRead / d.totalLessons), 0) / domains.length * 100
  );
  
  const mocksTaken = Object.keys(state.mockScores).length;
  const mocksPassed = Object.values(state.mockScores).filter(s => s >= 720).length;
  
  el.innerHTML = `
    <h2 style="color:var(--accent-light); margin-bottom:16px;">📊 Your Progress</h2>
    
    <div class="progress-card">
      <div style="text-align:center; margin-bottom:12px;">
        <div style="font-size:2.5rem; font-weight:700; color:var(--accent-light);">${overallProgress}%</div>
        <div style="color:var(--text-dim);">Overall Course Completion</div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${overallProgress}%; background:var(--accent);"></div>
      </div>
    </div>
    
    <h3 style="color:var(--text); margin: 20px 0 12px;">Domain Breakdown</h3>
    ${domains.map(d => `
      <div class="progress-card">
        <div class="progress-domain">
          <span>${d.name}</span>
          <span>${d.weight} · Quiz: ${d.quizScore}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" style="width:${Math.round(d.lessonsRead/d.totalLessons*100)}%; background:${d.quizScore >= 60 ? 'var(--success)' : 'var(--accent)'};"></div>
        </div>
      </div>
    `).join('')}
    
    <h3 style="color:var(--text); margin: 20px 0 12px;">Mock Tests</h3>
    <div class="progress-card">
      <p>Tests taken: ${mocksTaken} / ${COURSE_DATA.mockTests.length}</p>
      <p>Tests passed (720+): ${mocksPassed} / ${mocksTaken || 1}</p>
      ${Object.entries(state.mockScores).map(([id, score]) => `
        <div class="progress-domain" style="margin-top:8px;">
          <span>${id === 'final' ? '🏆 Final' : 'Mock ' + id.replace('mock','')}</span>
          <span class="${score >= 720 ? 'badge badge-pass' : 'badge badge-fail'}">${score}/1000</span>
        </div>
      `).join('')}
    </div>
    
    <h3 style="color:var(--text); margin: 20px 0 12px;">Readiness Assessment</h3>
    <div class="progress-card">
      ${getReadinessHtml()}
    </div>
    
    <button class="submit-btn" style="background:var(--danger); margin-top:20px;" id="reset-btn">
      🗑️ Reset All Progress
    </button>
  `;
  
  document.getElementById('reset-btn').addEventListener('click', () => {
    if (confirm('Reset ALL progress? This cannot be undone.')) {
      state = { chaptersCompleted: {}, chapterQuizScores: {}, mockScores: {}, currentView: 'progress' };
      saveState();
      render();
    }
  });
}

function getReadinessHtml() {
  const checks = [
    { label: 'All chapters read', done: COURSE_DATA.chapters.every(ch => (state.chaptersCompleted[ch.id] || 0) >= ch.sections.length) },
    { label: 'All chapter quizzes passed (60%+)', done: COURSE_DATA.chapters.every(ch => state.chapterQuizScores[ch.id] >= 60) },
    { label: 'Mock Tests 1-4 passed (720+)', done: COURSE_DATA.mockTests.slice(0,4).every(mt => state.mockScores[mt.id] >= 720) },
    { label: 'Final Mock passed (720+)', done: state.mockScores['final'] >= 720 }
  ];
  
  const ready = checks.every(c => c.done);
  
  return `
    ${checks.map(c => `
      <p style="margin:6px 0;">${c.done ? '✅' : '⬜'} ${c.label}</p>
    `).join('')}
    <div style="margin-top:12px; padding-top:12px; border-top:1px solid var(--border);">
      ${ready 
        ? '<p style="color:var(--success); font-weight:600;">🎉 You are READY to take the exam! Go to the Mocks tab for enrollment instructions.</p>'
        : '<p style="color:var(--warning);">Keep studying! Complete all checkpoints above to confirm readiness.</p>'
      }
    </div>
  `;
}

// Make functions globally accessible for onclick handlers
window.openChapter = openChapter;
window.render = render;

// Initial render
render();

// Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').catch(() => {});
}
