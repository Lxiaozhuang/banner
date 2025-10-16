// 示例单元测试文件

// 被测试的函数
function add(a: number, b: number): number {
  return a + b;
}

function subtract(a: number, b: number): number {
  return a - b;
}

// 简单的测试框架模拟
type TestFunction = () => void | Promise<void>;

class TestRunner {
  private tests: Array<{ name: string; fn: TestFunction }> = [];

  public test(name: string, fn: TestFunction) {
    this.tests.push({ name, fn });
  }

  public async run() {
    let passed = 0;
    let failed = 0;

    for (const { name, fn } of this.tests) {
      try {
        await fn();
        console.log(`✓ ${name}`);
        passed++;
      } catch (error) {
        console.error(`✗ ${name}: ${error}`);
        failed++;
      }
    }

    console.log(`\nResults: ${passed} passed, ${failed} failed`);
  }
}

// 创建测试实例
const testRunner = new TestRunner();

// 定义测试用例
testRunner.test('add function returns correct sum', () => {
  const result = add(2, 3);
  if (result !== 5) {
    throw new Error(`Expected 5, got ${result}`);
  }
});

testRunner.test('add function works with negative numbers', () => {
  const result = add(-1, 1);
  if (result !== 0) {
    throw new Error(`Expected 0, got ${result}`);
  }
});

testRunner.test('subtract function returns correct difference', () => {
  const result = subtract(5, 3);
  if (result !== 2) {
    throw new Error(`Expected 2, got ${result}`);
  }
});

testRunner.test('subtract function works with negative results', () => {
  const result = subtract(3, 5);
  if (result !== -2) {
    throw new Error(`Expected -2, got ${result}`);
  }
});

// 运行测试（在 Node.js 环境中）
if (typeof require !== 'undefined' && require.main === module) {
  testRunner.run().catch(console.error);
}

export { add, subtract, testRunner };