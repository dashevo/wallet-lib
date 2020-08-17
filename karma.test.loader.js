const testsContext = require.context('./src', true, /spec.js$/);
const integrationTestsContext = require.context('./tests/integration', true, /spec.js$/);

testsContext.keys().forEach(testsContext);
integrationTestsContext.keys().forEach(integrationTestsContext);
