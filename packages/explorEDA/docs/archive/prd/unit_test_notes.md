# Unit test notes

Create unit tests for my TypeScript and React project using Vite, following these preferences and best practices:

Place all unit tests in a dedicated tests folder, structured to mirror the component folder to ensure easy navigation.
Use snapshot tests extensively to produce clear, human-readable results.
Aim to reduce excessive use of assert statements; rely on snapshots to capture UI and logical state.
Adopt a naming scheme where test files mirror their component counterparts, prefixing with test-. For example, Button.tsx should correspond to a test-Button.test.tsx file.
Integrate Jest and React Testing Library for comprehensive and effective testing.
Ensure test consistency by using descriptive names within describe and it blocks to precisely outline the test scopes and expectations.
Validate that all tests are isolated and can be executed individually without dependencies on others.
Regularly update snapshot files and use version control to manage test changes efficiently.
