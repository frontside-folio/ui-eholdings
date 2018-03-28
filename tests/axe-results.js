class Violation {
  constructor(violation) {
    this.violation = violation;
  }

  get impact() {
    return this.violation.impact;
  }

  get helpText() {
    return this.violation.help;
  }

  get helpUrl() {
    return this.violation.helpUrl;
  }

  get description() {
    return this.violation.description;
  }

  get violationNodes() {
    return this.violation.nodes
      .map(node => node.html);
  }

  printViolation() {
    return `
     ${this.helpText}
     ${this.description}
     The violating HTML: ${this.violationNodes}
     For more information: ${this.helpUrl}
     -------------------------
   `;
  }

}

class AxeResults {
  constructor(results) {
    this.results = results;
  }

  get violations() {
    return this.results.violations.map(violation => new Violation(violation));
  }

  get violationCount() {
    return this.violations.length;
  }

  printViolations() {
    return `There were ${this.violationCount} violations.
     ${this.violations.map(violation => violation.printViolation())}
    `;
  }
}

export default AxeResults;
