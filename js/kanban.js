window.Studio = window.Studio || {};

window.Studio.KanbanStore = (function () {
  const STORAGE_KEY = "sunbeam_studio_kanban_v1";

  const DEFAULT_TASKS = [
    {
      id: "task-101",
      title: "Kids Reward Badge & Star Pop-Up UI",
      assigneeId: "agent-03", // Isaac
      priority: "High",
      status: "IN_PROGRESS",
      progress: 62,
      qaNotes: ""
    },
    {
      id: "task-102",
      title: "Isometric Prop Palette & Cozy Planter Art",
      assigneeId: "agent-05", // Anis
      priority: "Medium",
      status: "IN_PROGRESS",
      progress: 78,
      qaNotes: ""
    },
    {
      id: "task-103",
      title: "Gentle Marimba UI Chime & Footstep SFX",
      assigneeId: "agent-06", // Abang
      priority: "Medium",
      status: "QA_REVIEW",
      progress: 100,
      qaNotes: "Sofea verifying volume levels for ages 4–6"
    },
    {
      id: "task-104",
      title: "Weighted Dijkstra Doorway Navigation",
      assigneeId: "agent-04", // Hayyan
      priority: "High",
      status: "DONE",
      progress: 100,
      qaNotes: "Verified zero wall clipping"
    },
    {
      id: "task-105",
      title: "Age 4–6 Mini-Game Difficulty Curve",
      assigneeId: "agent-02", // Izzy
      priority: "High",
      status: "BACKLOG",
      progress: 0,
      qaNotes: ""
    },
    {
      id: "task-106",
      title: "Sprint 3 Milestone Sign-Off & Budget",
      assigneeId: "agent-01", // Izmi
      priority: "Medium",
      status: "BACKLOG",
      progress: 0,
      qaNotes: ""
    }
  ];

  let tasks = [];
  let listeners = [];

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          tasks = parsed;
          return;
        }
      }
    } catch (e) {
      // Fallback to defaults if storage unavailable
    }
    tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
    save();
  }

  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
      // Ignore quota errors
    }
  }

  function notify() {
    listeners.forEach((fn) => fn(tasks));
  }

  function subscribe(fn) {
    listeners.push(fn);
  }

  function getTasks() {
    return tasks;
  }

  function getActiveTaskForAgent(agentId) {
    if (agentId === "agent-07") {
      // Sofea handles QA_REVIEW items
      return tasks.find((t) => t.status === "QA_REVIEW") || null;
    }
    return tasks.find((t) => t.assigneeId === agentId && t.status === "IN_PROGRESS") || null;
  }

  function claimNextBacklogTask(agentId) {
    if (agentId === "agent-07") return null;
    const existing = getActiveTaskForAgent(agentId);
    if (existing) return existing;

    const next = tasks.find((t) => t.assigneeId === agentId && t.status === "BACKLOG");
    if (next) {
      next.status = "IN_PROGRESS";
      next.progress = Math.max(5, next.progress);
      save();
      notify();
      return next;
    }
    return null;
  }

  function advanceAgentWork(agentId, deltaProgress) {
    // Sofea reviews QA_REVIEW tasks
    if (agentId === "agent-07") {
      const qaTask = tasks.find((t) => t.status === "QA_REVIEW");
      if (!qaTask) return null;

      qaTask.qaProgress = (qaTask.qaProgress || 0) + deltaProgress * 1.4;
      if (qaTask.qaProgress >= 100) {
        qaTask.qaProgress = 0;
        // 20% chance Sofea finds a minor polish issue and sends back to developer
        if (!qaTask.reworked && Math.random() < 0.2) {
          qaTask.reworked = true;
          qaTask.status = "IN_PROGRESS";
          qaTask.progress = 72;
          qaTask.qaNotes = "QA Polish: Adjust padding & touch target";
          save();
          notify();
          return { event: "QA_RETURNED", task: qaTask };
        } else {
          qaTask.status = "DONE";
          qaTask.progress = 100;
          qaTask.qaNotes = "Approved by Sofea (QA)";
          save();
          notify();
          return { event: "QA_APPROVED", task: qaTask };
        }
      }
      return { event: "QA_TESTING", task: qaTask };
    }

    // Standard creators & developers advance IN_PROGRESS tasks
    let active = getActiveTaskForAgent(agentId);
    if (!active) {
      active = claimNextBacklogTask(agentId);
    }
    if (!active) return null;

    active.progress = Math.min(100, active.progress + deltaProgress);
    if (active.progress >= 100) {
      active.status = "QA_REVIEW";
      active.qaProgress = 0;
      active.qaNotes = "Waiting for Sofea's QA check";
      save();
      notify();
      return { event: "READY_FOR_QA", task: active };
    }

    save();
    return { event: "PROGRESS", task: active };
  }

  function addTask(title, assigneeId, priority = "Medium") {
    const cleanTitle = String(title || "").trim();
    if (!cleanTitle) return null;

    const newTask = {
      id: "task-" + Date.now(),
      title: cleanTitle,
      assigneeId,
      priority,
      status: "BACKLOG",
      progress: 0,
      qaNotes: ""
    };
    tasks.unshift(newTask);
    save();
    notify();
    return newTask;
  }

  function moveTask(taskId, newStatus) {
    const t = tasks.find((item) => item.id === taskId);
    if (!t) return;
    t.status = newStatus;
    if (newStatus === "BACKLOG") t.progress = 0;
    if (newStatus === "IN_PROGRESS" && t.progress >= 100) t.progress = 50;
    if (newStatus === "DONE") t.progress = 100;
    save();
    notify();
  }

  function deleteTask(taskId) {
    tasks = tasks.filter((t) => t.id !== taskId);
    save();
    notify();
  }

  function resetBoard() {
    tasks = JSON.parse(JSON.stringify(DEFAULT_TASKS));
    save();
    notify();
  }

  load();

  return {
    getTasks,
    getActiveTaskForAgent,
    claimNextBacklogTask,
    advanceAgentWork,
    addTask,
    moveTask,
    deleteTask,
    resetBoard,
    subscribe
  };
})();
