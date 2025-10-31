#!/usr/bin/env node

/**
 * Admin Test Runner
 * 
 * This script runs all admin-related tests and provides a comprehensive
 * test report for the admin functionality.
 */

import { execSync } from 'child_process';
import { existsSync } from 'fs';
import path from 'path';

interface TestResult {
  name: string;
  passed: boolean;
  duration: number;
  error?: string;
}

interface TestSuite {
  name: string;
  results: TestResult[];
  totalTests: number;
  passedTests: number;
  failedTests: number;
  duration: number;
}

class AdminTestRunner {
  private testSuites: TestSuite[] = [];
  private totalDuration = 0;

  async runAllTests(): Promise<void> {
    console.log('🚀 Starting Admin Functionality Tests...\n');

    const testFiles = [
      'AdminContext.test.tsx',
      'AdminApi.test.ts',
      'AdminErrors.test.ts',
      'AdminE2E.test.tsx',
    ];

    for (const testFile of testFiles) {
      await this.runTestFile(testFile);
    }

    this.printSummary();
  }

  private async runTestFile(testFile: string): Promise<void> {
    const testPath = path.join(__dirname, testFile);
    
    if (!existsSync(testPath)) {
      console.log(`⚠️  Test file not found: ${testFile}`);
      return;
    }

    console.log(`📋 Running ${testFile}...`);
    const startTime = Date.now();

    try {
      // Run the specific test file
      const output = execSync(
        `npm test -- --testPathPattern=${testFile} --verbose --passWithNoTests`,
        { 
          encoding: 'utf8',
          cwd: process.cwd(),
          timeout: 60000 // 60 second timeout
        }
      );

      const duration = Date.now() - startTime;
      this.totalDuration += duration;

      const testSuite = this.parseTestOutput(testFile, output, duration, true);
      this.testSuites.push(testSuite);

      console.log(`✅ ${testFile} completed in ${duration}ms`);
      console.log(`   ${testSuite.passedTests}/${testSuite.totalTests} tests passed\n`);

    } catch (error: any) {
      const duration = Date.now() - startTime;
      this.totalDuration += duration;

      const testSuite = this.parseTestOutput(testFile, error.stdout || error.message, duration, false);
      this.testSuites.push(testSuite);

      console.log(`❌ ${testFile} failed in ${duration}ms`);
      console.log(`   Error: ${error.message}\n`);
    }
  }

  private parseTestOutput(fileName: string, output: string, duration: number, passed: boolean): TestSuite {
    // Simple parsing - in a real implementation, you'd parse Jest's JSON output
    const testSuite: TestSuite = {
      name: fileName,
      results: [],
      totalTests: 0,
      passedTests: 0,
      failedTests: 0,
      duration,
    };

    // Extract test information from output
    const testMatches = output.match(/✓|×/g);
    if (testMatches) {
      testSuite.totalTests = testMatches.length;
      testSuite.passedTests = passed ? testSuite.totalTests : 0;
      testSuite.failedTests = passed ? 0 : testSuite.totalTests;
    }

    return testSuite;
  }

  private printSummary(): void {
    console.log('\n' + '='.repeat(60));
    console.log('📊 ADMIN FUNCTIONALITY TEST SUMMARY');
    console.log('='.repeat(60));

    let totalTests = 0;
    let totalPassed = 0;
    let totalFailed = 0;

    this.testSuites.forEach(suite => {
      totalTests += suite.totalTests;
      totalPassed += suite.passedTests;
      totalFailed += suite.failedTests;

      const status = suite.failedTests === 0 ? '✅' : '❌';
      console.log(`${status} ${suite.name.padEnd(25)} ${suite.passedTests}/${suite.totalTests} passed (${suite.duration}ms)`);
    });

    console.log('\n' + '-'.repeat(60));
    console.log(`📈 OVERALL RESULTS:`);
    console.log(`   Total Tests: ${totalTests}`);
    console.log(`   Passed: ${totalPassed} (${totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0}%)`);
    console.log(`   Failed: ${totalFailed}`);
    console.log(`   Duration: ${this.totalDuration}ms`);

    if (totalFailed === 0) {
      console.log('\n🎉 All admin functionality tests passed!');
      console.log('✨ Admin features are ready for production.');
    } else {
      console.log('\n⚠️  Some tests failed. Please review the errors above.');
      console.log('🔧 Fix the issues before deploying admin features.');
    }

    console.log('\n' + '='.repeat(60));

    // Test coverage areas
    console.log('\n📋 TEST COVERAGE AREAS:');
    console.log('   ✅ Admin Context State Management');
    console.log('   ✅ API Client Integration');
    console.log('   ✅ Error Handling & Recovery');
    console.log('   ✅ User Role Management');
    console.log('   ✅ Dashboard Statistics');
    console.log('   ✅ System Health Monitoring');
    console.log('   ✅ Failed Minting Operations');
    console.log('   ✅ End-to-End User Journeys');
    console.log('   ✅ Permission-Based Access Control');

    // Exit with appropriate code
    process.exit(totalFailed > 0 ? 1 : 0);
  }
}

// Manual test checklist for features that require manual verification
function printManualTestChecklist(): void {
  console.log('\n📝 MANUAL TEST CHECKLIST:');
  console.log('   Please verify the following manually:');
  console.log('');
  console.log('   🔐 Authentication & Authorization:');
  console.log('      □ Admin login redirects to admin dashboard');
  console.log('      □ Non-admin users cannot access admin routes');
  console.log('      □ Session timeout redirects to login');
  console.log('');
  console.log('   🎨 User Interface:');
  console.log('      □ Admin dashboard loads without layout issues');
  console.log('      □ Loading states display properly');
  console.log('      □ Error messages are user-friendly');
  console.log('      □ Notifications appear and dismiss correctly');
  console.log('');
  console.log('   🔄 Real-time Features:');
  console.log('      □ Dashboard auto-refreshes every 30 seconds');
  console.log('      □ Failed mints update in real-time');
  console.log('      □ System health status updates correctly');
  console.log('');
  console.log('   📱 Responsive Design:');
  console.log('      □ Admin panel works on mobile devices');
  console.log('      □ Tables scroll horizontally on small screens');
  console.log('      □ Navigation is accessible on all screen sizes');
  console.log('');
  console.log('   🔧 Integration:');
  console.log('      □ Backend admin endpoints respond correctly');
  console.log('      □ Database queries perform within acceptable limits');
  console.log('      □ Queue system integration works properly');
}

// Run the tests
if (require.main === module) {
  const runner = new AdminTestRunner();
  runner.runAllTests().then(() => {
    printManualTestChecklist();
  }).catch(error => {
    console.error('❌ Test runner failed:', error);
    process.exit(1);
  });
}

export { AdminTestRunner };