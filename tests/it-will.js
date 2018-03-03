/* istanbul ignore file */

// This turns every call of `it` into a "convergent assertion." The
// assertion is run every 10ms until it is either true, or it times
// out. This makes it incredibly robust in the face of asynchronous
// operations which could happen instantly, or they could happen after
// 1.5 seconds. The assertion doesn't care until it's reflected
// in the UI.
//
// The only caveat is that all assertions should be "pure" that is to
// say, completely without side-effects.
//
// good:
//  it('has some state', function() {
//    expect(thing).to.be('awesome');
//  });
//
// bad:
//   it('twiddles when clicked', function() {
//     click('.a-button');
//     expect(thing).to.be('set');
//   });

/* eslint-disable no-use-before-define */

it.immediately = window.it;
it.skip = it.immediately.skip;
it.only = itOnly;
it.still = itStill;

export default it;

function it(name, assertion) {
  return !assertion ? it.immediately(name) :
    it.immediately(name, _convergeOn(assertion));
}

function itOnly(name, assertion) {
  return !assertion ? it.immediately.only(name) :
    it.immediately.only(name, _convergeOn(assertion));
}

function itStill(name, assertion, time = 50) {
  return !assertion ? it.immediately(name) :
    it.immediately(name, _convergeOn(assertion, time, true));
}

function _convergeOn(...args) {
  return function () {
    return convergeOn.apply(this, args);
  };
}


/**
 * Capture a promise that will only resolve once a give condition has been met.
 *
 * Asynchrony. Blech! Amirite?!?
 *
 * I don't care (99.9% of the time) when something happens only that
 * it _does_ happen. That's where convergence comes in. We want to
 * declare the state that we expect to see, and then just wait and see
 * if that happens. convergeOn() continously checks to see if a
 * condition is met, and then lets you take some action when it
 * has. It does this by returning a Promise that resolves when the
 * condition passes.
 *
 * After a given timeout, if the `assertion` does not pass, then it
 * will give up and reject the promise.
 *
 * By default, `convergeOn` checks that an assertion passes at least
 * once during the timeout window. Sometimes however, you want to
 * check the opposite: not that something has changed, but that
 * something remains constant. In that case you want to set `invert`
 * to true, and it will only resolve if the `assertion` is true for
 * the entire timeout period, not just once.
 *
 * If you're inverting your assertion, then you probably don't want to
 * wait for the entire test timeout period... maybe it's enough for
 * you to ensure that there are no changes for say, 500ms. In that
 * case, you'd want to pass an explicit timeout.
 *
 * @param {function} assertion - run to test condition repeatedly
 * @param {boolean} invert - if true, makes sure assertion passes throughout the entire tiemout period.
 * @param {number} time - milliseconds to check assertion
 * @returns {Promise} resolves if assertion passes at least once.
 */
export function convergeOn(assertion, timeout = 2000, always = false) {
  let context = this;
  let start = Date.now();
  let interval = 10;

  // track various stats
  let stats = {
    start,
    runs: 0,
    end: start,
    elapsed: 0,
    always,
    timeout,
    value: undefined
  };

  return new Promise((resolve, reject) => {
    (function loop() {
      // track stats
      stats.runs += 1;

      try {
        let results = assertion.call(context);

        // the timeout calculation comes after the assertion so that
        // the assertion's execution time is accounted for
        let doLoop = Date.now() - start < timeout;

        if (always && doLoop) {
          setTimeout(loop, interval);
        } else if (results === false) {
          throw new Error('convergent assertion returned `false`');
        } else if (!always && !doLoop) {
          throw new Error(
            'convergent assertion was successful, ' +
            `but exceeded the ${timeout}ms timeout`
          );
        } else {
          // calculate some stats right before resolving with them
          stats.end = Date.now();
          stats.elapsed = stats.end - start;
          stats.value = results;
          resolve(stats);
        }
      } catch (error) {
        let doLoop = Date.now() - start < timeout;

        if (!always && doLoop) {
          setTimeout(loop, interval);
        } else if (always || !doLoop) {
          reject(error);
        }
      }
    }());
  });
}
