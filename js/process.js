class Process {
  constructor(name, timing, frequency, tasks) {
    this.name = name;
    this.timing = timing;
    this.frequency = frequency;
    this.tasks = tasks;
    this.currentTaskIndex = 0;
  }
}
