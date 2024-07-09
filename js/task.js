class Task {
  constructor(
    id,
    subject,
    from,
    to,
    occurrenceRate,
    successRate,
    amount,
    returnTo,
    skipTo,
    by
  ) {
    this.id = id;
    this.subject = subject;
    this.from = from;
    this.to = to;
    this.occurrenceRate = occurrenceRate;
    this.successRate = successRate;
    this.amount = amount;
    this.returnTo = returnTo;
    this.skipTo = skipTo;
    this.by = by || null;
  }
}
