class Process {
  constructor(id, name, timing, frequency, tasks) {
    this.id = id;
    this.name = name;
    this.timing = timing;
    this.frequency = frequency;
    this.tasks = tasks;
    this.currentTaskIndex = 0;
  }

  isStartTiming(iterationCount, timeManager) {
    const totalMinutes =
      iterationCount * timeManager.timeConfig.minutesPerIteration;
    const minutesPerHour = timeManager.timeConfig.minutesPerHour;
    const hoursPerDay = timeManager.timeConfig.hoursPerDay;
    const daysPerWeek = timeManager.timeConfig.daysPerWeek;
    const weeksPerMonth = timeManager.timeConfig.weeksPerMonth;
    const monthsPerYear = timeManager.timeConfig.monthsPerYear;

    switch (this.timing) {
      case "perminutes":
        return totalMinutes % this.frequency === 0;
      case "hourly":
        return totalMinutes % (minutesPerHour / this.frequency) === 0;
      case "daily":
        return (
          totalMinutes %
            ((minutesPerHour * hoursPerDay) / this.frequency) ===
          0
        );
      case "weekly":
        return (
          totalMinutes %
            ((minutesPerHour * hoursPerDay * daysPerWeek) /
              this.frequency) ===
          0
        );
      case "monthly":
        return (
          totalMinutes %
            ((minutesPerHour * hoursPerDay * daysPerWeek * weeksPerMonth) /
              this.frequency) ===
          0
        );
      case "yearly":
        return (
          totalMinutes %
            ((minutesPerHour *
              hoursPerDay *
              daysPerWeek *
              weeksPerMonth *
              monthsPerYear) /
              this.frequency) ===
          0
        );
      default:
        return false;
    }
  }
}
