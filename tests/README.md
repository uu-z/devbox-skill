# Tests

Comprehensive test suite for devbox-skill core functionality.

## Structure

```
tests/
├── unit/              # Unit tests for individual components
│   ├── session.test.ts    # Session management tests
│   ├── routing.test.ts    # Message routing tests
│   └── container.test.ts  # Container lifecycle tests
└── integration/       # Integration tests
    └── e2e.test.ts        # End-to-end workflow tests
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- session.test.ts

# Run tests matching pattern
npm test -- --testNamePattern="Session Creation"
```

## Coverage

Current coverage targets:
- Branches: 70%
- Functions: 70%
- Lines: 70%
- Statements: 70%

## Test Categories

### Unit Tests

**Session Management** (`session.test.ts`)
- Session creation with unique IDs
- Context persistence across messages
- 90-minute timeout mechanism
- Resource cleanup on expiration

**Message Routing** (`routing.test.ts`)
- Platform-specific message parsing (Discord, Slack, Telegram)
- Channel routing logic
- Thread isolation
- Message validation

**Container Lifecycle** (`container.test.ts`)
- Docker container creation and configuration
- Command execution and output streaming
- Resource limits and security options
- Cleanup and error handling

### Integration Tests

**End-to-End** (`e2e.test.ts`)
- Complete message-to-response workflow
- Multi-message conversations with context
- Error recovery and retry logic

## Writing Tests

### Example Test

```typescript
describe('Feature Name', () => {
  it('should do something specific', () => {
    // Arrange
    const input = 'test data';
    
    // Act
    const result = processInput(input);
    
    // Assert
    expect(result).toBe('expected output');
  });
});
```

### Best Practices

1. **Descriptive Names** - Test names should clearly describe what is being tested
2. **Arrange-Act-Assert** - Follow AAA pattern for clarity
3. **One Assertion** - Each test should verify one specific behavior
4. **Isolation** - Tests should not depend on each other
5. **Mock External Dependencies** - Use mocks for Docker, API calls, etc.

## Continuous Integration

Tests run automatically on:
- Pull requests
- Commits to main branch
- Pre-commit hooks (optional)

## Future Improvements

- [ ] Add mocking for Docker API
- [ ] Add performance benchmarks
- [ ] Add load testing for concurrent sessions
- [ ] Add security testing
- [ ] Increase coverage to 80%+
