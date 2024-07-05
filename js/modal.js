document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("settingsModal");
  const settingsBtn = document.getElementById("settingsBtn");
  const applyBtn = document.getElementById("applySettings");
  const cancelBtn = document.getElementById("cancelSettings");

  settingsBtn.onclick = () => {
    modal.style.display = "block";
    loadCurrentSettings();
  };

  applyBtn.onclick = () => {
    applySettings();
    modal.style.display = "none";
  };

  cancelBtn.onclick = () => {
    modal.style.display = "none";
  };

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  function loadCurrentSettings() {
    document.getElementById("workerCount").value = simulation.workers.length;
    document.getElementById("minutesPerIteration").value =
      simulation.timeManager.timeConfig.minutesPerIteration;
    document.getElementById("minutesPerHour").value =
      simulation.timeManager.timeConfig.minutesPerHour;
    document.getElementById("hoursPerDay").value =
      simulation.timeManager.timeConfig.hoursPerDay;
    document.getElementById("daysPerWeek").value =
      simulation.timeManager.timeConfig.daysPerWeek;
    document.getElementById("weeksPerMonth").value =
      simulation.timeManager.timeConfig.weeksPerMonth;
    document.getElementById("monthsPerYear").value =
      simulation.timeManager.timeConfig.monthsPerYear;
  }

  function applySettings() {
    const workerCount = parseInt(document.getElementById("workerCount").value);
    simulation.createWorkers(workerCount);
    simulation.createCommunicationNodes();
    simulation.createLinks();
    visualizer.updateWorkers(simulation.workers);
    visualizer.updateLinks(simulation.links);
    visualizer.updateCommunicationNodes(simulation.communicationNodes);

    simulation.timeManager.timeConfig = {
      minutesPerIteration: parseInt(
        document.getElementById("minutesPerIteration").value
      ),
      minutesPerHour: parseInt(document.getElementById("minutesPerHour").value),
      hoursPerDay: parseInt(document.getElementById("hoursPerDay").value),
      daysPerWeek: parseInt(document.getElementById("daysPerWeek").value),
      weeksPerMonth: parseInt(document.getElementById("weeksPerMonth").value),
      monthsPerYear: parseInt(document.getElementById("monthsPerYear").value),
    };
  }
});
