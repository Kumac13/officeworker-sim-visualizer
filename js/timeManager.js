class TimeManager {
  constructor() {
    this.minutes = 0;
    this.hours = 0;
    this.days = 0;
    this.weeks = 0;
    this.months = 0;
    this.years = 0;

    this.timeConfig = {
      minutesPerIteration: 1,
      minutesPerHour: 60,
      hoursPerDay: 8,
      daysPerWeek: 5,
      weeksPerMonth: 4,
      monthsPerYear: 12,
    };
  }

  incrementTime() {
    this.minutes += this.timeConfig.minutesPerIteration;

    if (this.minutes >= this.timeConfig.minutesPerHour) {
      this.minutes = 0;
      this.hours++;

      if (this.hours >= this.timeConfig.hoursPerDay) {
        this.hours = 0;
        this.days++;

        if (this.days >= this.timeConfig.daysPerWeek) {
          this.days = 0;
          this.weeks++;

          if (this.weeks >= this.timeConfig.weeksPerMonth) {
            this.weeks = 0;
            this.months++;

            if (this.months >= this.timeConfig.monthsPerYear) {
              this.months = 0;
              this.years++;
            }
          }
        }
      }
    }
  }

  getFormattedTime() {
    return `${this.years}y ${this.months}m ${this.weeks}w ${this.days}d ${this.hours}h ${this.minutes}m`;
  }
}
