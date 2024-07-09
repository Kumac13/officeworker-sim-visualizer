class ProcessManager {
  constructor() {
    this.processes = [];
    this.activeProcesses = [];
    this.workers = [];
    this.communicationTools = [];
    this.links = [];
  }

  setProcesses(processes) {
    this.processes = processes;
  }

  createWorkerAndCommunicationTool() {
    const workerNames = new Set();
    const communicationToolNames = new Set();

    this.processes.forEach((process) => {
      process.tasks.forEach((task) => {
        workerNames.add(task.from);
        workerNames.add(task.to);
        if (task.by) {
          communicationToolNames.add(task.by);
        }
      });
    });

    this.workers = Array.from(workerNames).map((name, index) => {
      const angle = (index / workerNames.size) * 2 * Math.PI - Math.PI / 2;
      const svg = d3.select("#simulation-svg");
      const width = svg.node().clientWidth;
      const height = svg.node().clientHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(centerX, centerY) * 0.8;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      return new Worker(index + 1, name, x, y);
    });

    this.communicationTools = Array.from(communicationToolNames).map(
      (name, index) => {
        const angle =
          (index / communicationToolNames.size) * 2 * Math.PI - Math.PI / 2;
        const svg = d3.select("#simulation-svg");
        const width = svg.node().clientWidth;
        const height = svg.node().clientHeight;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(centerX, centerY) * 0.4;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        return { id: name, x: x, y: y };
      }
    );
  }

  createLinks() {
    this.links = [];
    for (let i = 0; i < this.workers.length; i++) {
      for (let j = i + 1; j < this.workers.length; j++) {
        this.links.push({
          source: this.workers[i],
          target: this.workers[j],
          type: "worker",
        });
      }
    }
    this.workers.forEach((worker) => {
      this.communicationTools.forEach((node) => {
        this.links.push({
          source: worker,
          target: node,
          type: "communication",
        });
      });
    });
  }

}
