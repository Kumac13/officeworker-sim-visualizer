class Simulation {
  constructor(visualizer) {
    this.workers = [];
    this.tasks = [];
    this.links = [];
    this.iterationCount = 0;
    this.simulationInterval = null;
    this.visualizer = visualizer;
    this.communicationMethods = ["slack", "email", "phone"];
    this.communicationNodes = [];
  }

  initialize() {
    this.createWorkers(3);
    this.createCommunicationNodes();
    this.createLinks();
    this.visualizer.updateWorkers(this.workers);
    this.visualizer.updateLinks(this.links);
    this.visualizer.updateCommunicationNodes(this.communicationNodes);
  }

  createWorkers(count) {
    this.workers = [];
    const svg = d3.select("#simulation-svg");
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.8;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * 2 * Math.PI - Math.PI / 2;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      this.workers.push(new Worker(i + 1, `Worker ${i + 1}`, "未分類", x, y));
    }
  }

  createCommunicationNodes() {
    const svg = d3.select("#simulation-svg");
    const width = svg.node().clientWidth;
    const height = svg.node().clientHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(centerX, centerY) * 0.4;

    this.communicationNodes = this.communicationMethods.map((method, index) => {
      const angle =
        ((index + 1) / (this.communicationMethods.length + 1)) * 2 * Math.PI -
        Math.PI / 2;
      return {
        id: method,
        x: centerX + radius * Math.cos(angle),
        y: centerY + radius * Math.sin(angle),
      };
    });
  }

  createLinks() {
    this.links = [];
    // Worker間のリンク
    for (let i = 0; i < this.workers.length; i++) {
      for (let j = i + 1; j < this.workers.length; j++) {
        this.links.push({
          source: this.workers[i],
          target: this.workers[j],
          type: "worker",
        });
      }
    }
    // WorkerとcommunicationNode間のリンク
    this.workers.forEach((worker) => {
      this.communicationNodes.forEach((node) => {
        this.links.push({
          source: worker,
          target: node,
          type: "communication",
        });
      });
    });
  }

  start() {
    this.simulationInterval = setInterval(() => this.simulateIteration(), 1000);
  }

  stop() {
    clearInterval(this.simulationInterval);
  }

  simulateIteration() {
    this.iterationCount++;
    document.getElementById("iteration-count").textContent =
      `Iteration: ${this.iterationCount}`;

    if (Math.random() < 0.5) {
      const newTask = this.createTask();
      const fromWorker = this.workers.find((w) => w.id === newTask.from);
      const toWorker = this.workers.find((w) => w.id === newTask.to);
      fromWorker.addTask(newTask);
      this.visualizer.updateTaskStacks(this.workers);
      this.moveTask(newTask, fromWorker, toWorker, () => {
        this.processTasks();
      });
    } else {
      this.processTasks();
    }
  }

  createTask() {
    const from =
      this.workers[Math.floor(Math.random() * this.workers.length)].id;
    let to;
    do {
      to = this.workers[Math.floor(Math.random() * this.workers.length)].id;
    } while (to === from);

    const communicationMethods = [null, ...this.communicationMethods];
    const by =
      communicationMethods[
        Math.floor(Math.random() * communicationMethods.length)
      ];

    return new Task(
      Date.now().toString(),
      "New Task",
      from,
      to,
      1,
      1,
      Math.floor(Math.random() * 10) + 1,
      "",
      "",
      by
    );
  }

  moveTask(task, fromWorker, toWorker, callback) {
    fromWorker.removeTask(task);
    this.visualizer.updateTaskStacks(this.workers);

    if (task.by) {
      const intermediateNode = this.communicationNodes.find(
        (node) => node.id === task.by
      );
      if (intermediateNode) {
        this.visualizer.moveTaskVisualWithIntermediate(
          task,
          fromWorker,
          toWorker,
          intermediateNode,
          () => {
            toWorker.addTask(task);
            this.visualizer.updateTaskStacks(this.workers);
            if (callback) callback();
          }
        );
      } else {
        console.error(`Communication method ${task.by} not found`);
        this.visualizer.moveTaskVisual(task, fromWorker, toWorker, () => {
          toWorker.addTask(task);
          this.visualizer.updateTaskStacks(this.workers);
          if (callback) callback();
        });
      }
    } else {
      this.visualizer.moveTaskVisual(task, fromWorker, toWorker, () => {
        toWorker.addTask(task);
        this.visualizer.updateTaskStacks(this.workers);
        if (callback) callback();
      });
    }
  }

  processTasks() {
    this.workers.forEach((worker) => {
      worker.processTask();
      this.visualizer.updateTaskStacks(this.workers);
    });
  }
}
