# Unit Testing

[Unit testing](http://en.wikipedia.org/wiki/Unit_testing) allows you to test each unit of your code in isolation. This facilitates [Test Driven Development](http://en.wikipedia.org/wiki/Test-driven_development), and helps to modularise your codebase. Unit tests stub out the service's API, typically using a library such as [nock](https://github.com/pgte/nock) to mock the response. For this reason unit tests are often fast, and can be run automatically.

Unit tests are for your own benefit, and are not mandatory for the service to be submitted for validation.

## Writing Unit Tests

Unit test files are stored in the `tests/` folder at the root of the service. A test file has the `.spec.js` file suffix. By default, some tests are scaffolded when the service is created, and when new methods are added. These tests will need to be updated by you as, untouched, they will fail.

The default layout is to have one test file per method and additionally one service-level test, but you are welcome to organise them as you wish (all `.spec.js` files under the `tests/` folder will be picked up automatically wherever they are located).

Tests are standard Node.js [mocha](http://mochajs.org/) tests, supported by [chai](http://chaijs.com/api/bdd/), [sinon](http://sinonjs.org/) and [sinon-chai](https://github.com/domenic/sinon-chai).

A number of useful things are available to your test scripts:

``` js
describe('A Spec', function() {
  it('is a spec', function() {
    // Get the service
    var service = this.service;

    // Check the service configuration is valid.
    expect(service).to.be.a.flowxo.service;

    // Run a service script
    var serviceScript = 'ping';
    var serviceOptions = {
      input: {
        // Input data goes here
      },
      credentials: {
        // Credentials go here
      }
    }
    this.runner.run(serviceScript, serviceOptions function(err, output) {
      // `err` if there was an error running the script
      // otherwise `output` contains the script's output
    });

    // Run a service script without options
    this.runner.run(serviceScript, function(err, output) {
      // `err` if there was an error running the script
      // otherwise `output` contains the script's output
    });

    // Check method configuration is valid
    var methodSlug = 'some_method';
    var method = service.getMethod(methodSlug);
    expect(method).to.be.a.flowxo.method;

    // Run a method script
    var methodScript = 'run'; // One of 'run', 'input', 'output'
    var methodOptions = {
      input: {
        // Input data goes here
      },
      credentials: {
        // Credentials go here
      }
    };
    this.runner.run(methodSlug, methodScript, methodOptions, function(err, output) {
      // `err` if there was an error running the script
      // otherwise `output` contains the script's output
    });

    // Run a method script without options
    this.runner.run(methodSlug, methodScript, function(err, output) {
      // `err` if there was an error running the script
      // otherwise `output` contains the script's output
    });

    // Initialise the poll cache with empty data.
    // Important if you expect a poller method to respond to 'new' data,
    // since by default the script runner will populate the poll cache
    // on first run.
    this.runner.setPollerCache(methodSlug, []);
  });
});
```

Refer to the [Trello Example Service](https://github.com/flowxo/flowxo-services-trello-example) for an example of how to architect your code to be unit testable. In particular, try to follow these guidelines:

- Concentrate on providing small blocks of code, which can be fed inputs, and return outputs. This will make unit testing easier.
- Mock the service's API using a library such as [nock](https://github.com/pgte/nock), so your unit tests do not require 'real' data to run. This will ensure your tests will run fast, as there will be no network latency.

## Running Unit Tests

```
# Run your specs
grunt test

# Watch code for changes, and automatically run specs
grunt watch
```

## Mocking API Calls

The integration test runner is designed for and encourages you to connect to your _real_ service in order to validate your service performs as expected. Whilst this is obviously a crucial part of integration testing, it can be undesirable for a unit test to establish a connection to a remote server.

For unit testing, one approach is to try and structure your service code into separate units that can be tested independently. By mocking calls to the API, these individual units can then be tested in isolation, without the need for a connection to the live API.

A useful library for mocking APIs is [nock](https://github.com/pgte/nock). An example test case:

``` js
'use strict';

var sdk = require('flowxo-sdk'),
    nock = require('nock');

// Before each test, reset nock
beforeEach(nock.cleanAll);

describe('Get Person',function(){
  it('should throw authentication error on 401', function(done){
    // Setup our mocked 401 response
    var scope = nock('https://my.service.com')
                .get('/persons/1')
                .reply(401);

    this.runner('get_person', 'run', { input: {person_id: 1} }, function(err, output){
      expect(err).to.be.defined;
      expect(err).to.be.instanceof(sdk.Error.AuthError);
      expect(scope.isDone()).to.be.true;
      done();
    });
  });
});
```