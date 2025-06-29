// const io = require('socket.io-client');

// class SocketTester {
//   constructor(serverUrl = 'http://localhost:5000') {
//     this.serverUrl = serverUrl;
//     this.socket = null;
//     this.testResults = [];
//   }

//   async runTests() {
//     console.log('🚀 Starting Socket.io tests...\n');

//     try {
//       await this.testConnection();
//       await this.testJoin();
//       await this.testSendMessage();
//       await this.testTyping();
//       await this.testMarkRead();
//       await this.testDisconnection();
//     } catch (error) {
//       console.error('❌ Test suite failed:', error.message);
//     }

//     this.printResults();
//   }

//   async testConnection() {
//     return new Promise((resolve, reject) => {
//       console.log('🔌 Testing connection...');
      
//       this.socket = io(this.serverUrl, {
//         transports: ['websocket', 'polling']
//       });

//       const timeout = setTimeout(() => {
//         this.recordTest('Connection', false, 'Timeout after 5 seconds');
//         reject(new Error('Connection timeout'));
//       }, 5000);

//       this.socket.on('connect', () => {
//         clearTimeout(timeout);
//         console.log('✅ Connected successfully');
//         this.recordTest('Connection', true);
//         resolve();
//       });

//       this.socket.on('connect_error', (error) => {
//         clearTimeout(timeout);
//         console.log('❌ Connection failed:', error.message);
//         this.recordTest('Connection', false, error.message);
//         reject(error);
//       });
//     });
//   }

//   async testJoin() {
//     return new Promise((resolve, reject) => {
//       console.log('👤 Testing user join...');

//       const timeout = setTimeout(() => {
//         this.recordTest('User Join', false, 'Timeout after 3 seconds');
//         reject(new Error('Join timeout'));
//       }, 3000);

//       this.socket.on('join_success', (data) => {
//         clearTimeout(timeout);
//         console.log('✅ Join successful:', data);
//         this.recordTest('User Join', true);
//         resolve();
//       });

//       this.socket.on('join_error', (error) => {
//         clearTimeout(timeout);
//         console.log('❌ Join failed:', error);
//         this.recordTest('User Join', false, error.error);
//         reject(new Error(error.error));
//       });

//       this.socket.emit('join', {
//         userId: '680b8c7eb9fed33e9c7f49b1',
//         userType: 'user',
//         name: 'Test User'
//       });
//     });
//   }

//   async testSendMessage() {
//     return new Promise((resolve, reject) => {
//       console.log('💬 Testing message sending...');

//       const timeout = setTimeout(() => {
//         this.recordTest('Send Message', false, 'Timeout after 5 seconds');
//         reject(new Error('Send message timeout'));
//       }, 5000);

//       this.socket.on('message_sent', (data) => {
//         clearTimeout(timeout);
//         console.log('✅ Message sent successfully:', data);
//         this.recordTest('Send Message', true);
//         resolve();
//       });

//       this.socket.on('message_error', (error) => {
//         clearTimeout(timeout);
//         console.log('❌ Message send failed:', error);
//         this.recordTest('Send Message', false, error.error);
//         reject(new Error(error.error));
//       });

//       this.socket.emit('send_message', {
//         senderId: '680b8c7eb9fed33e9c7f49b1',
//         senderType: 'user',
//         recipientId: '680b8c4cb9fed33e9c7f49ad',
//         message: 'Test message from automated test',
//         propertyTitle: 'Test Property'
//       });
//     });
//   }

//   async testTyping() {
//     return new Promise((resolve) => {
//       console.log('⌨️ Testing typing indicator...');

//       this.socket.emit('typing', {
//         conversationId: '680b8c4cb9fed33e9c7f49ad_680b8c7eb9fed33e9c7f49b1',
//         userId: '680b8c7eb9fed33e9c7f49b1',
//         isTyping: true
//       });

//       setTimeout(() => {
//         console.log('✅ Typing indicator sent');
//         this.recordTest('Typing Indicator', true);
//         resolve();
//       }, 1000);
//     });
//   }

//   async testMarkRead() {
//     return new Promise((resolve) => {
//       console.log('👁️ Testing mark as read...');

//       this.socket.emit('mark_read', {
//         conversationId: '680b8c4cb9fed33e9c7f49ad_680b8c7eb9fed33e9c7f49b1',
//         userId: '680b8c7eb9fed33e9c7f49b1',
//         userType: 'user'
//       });

//       setTimeout(() => {
//         console.log('✅ Mark as read sent');
//         this.recordTest('Mark as Read', true);
//         resolve();
//       }, 1000);
//     });
//   }

//   async testDisconnection() {
//     return new Promise((resolve) => {
//       console.log('🔌 Testing disconnection...');

//       this.socket.on('disconnect', () => {
//         console.log('✅ Disconnected successfully');
//         this.recordTest('Disconnection', true);
//         resolve();
//       });

//       this.socket.disconnect();
//     });
//   }

//   recordTest(testName, passed, error = null) {
//     this.testResults.push({
//       test: testName,
//       passed,
//       error
//     });
//   }

//   printResults() {
//     console.log('\n📊 Test Results:');
//     console.log('================');
    
//     let passed = 0;
//     let failed = 0;

//     this.testResults.forEach(result => {
//       const status = result.passed ? '✅ PASS' : '❌ FAIL';
//       const error = result.error ? ` (${result.error})` : '';
//       console.log(`${status} - ${result.test}${error}`);
      
//       if (result.passed) passed++;
//       else failed++;
//     });

//     console.log(`\nTotal: ${this.testResults.length} | Passed: ${passed} | Failed: ${failed}`);
    
//     if (failed === 0) {
//       console.log('🎉 All tests passed!');
//     } else {
//       console.log('⚠️ Some tests failed. Check your server setup.');
//     }
//   }
// }

// // Run the tests
// const tester = new SocketTester();
// tester.runTests().catch(console.error);
// Updated test client to match the fixed server

const io = require('socket.io-client');

class SocketTester {
  constructor(serverUrl = 'http://localhost:5000') {
    this.serverUrl = serverUrl;
    this.socket = null;
    this.testResults = [];
  }

  async runTests() {
    console.log('🚀 Starting Socket.io tests...\n');

    try {
      await this.testConnection();
      await this.testJoin();
      await this.testSendMessage();
      await this.testTyping();
      await this.testMarkRead();
      await this.testDisconnection();
    } catch (error) {
      console.error('❌ Test suite failed:', error.message);
    }

    this.printResults();
  }

  async testConnection() {
    return new Promise((resolve, reject) => {
      console.log('🔌 Testing connection...');
      
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling']
      });

      const timeout = setTimeout(() => {
        this.recordTest('Connection', false, 'Timeout after 5 seconds');
        reject(new Error('Connection timeout'));
      }, 5000);

      this.socket.on('connect', () => {
        clearTimeout(timeout);
        console.log('✅ Connected successfully');
        this.recordTest('Connection', true);
        resolve();
      });

      this.socket.on('connect_error', (error) => {
        clearTimeout(timeout);
        console.log('❌ Connection failed:', error.message);
        this.recordTest('Connection', false, error.message);
        reject(error);
      });
    });
  }

  async testJoin() {
    return new Promise((resolve, reject) => {
      console.log('👤 Testing user join...');

      const timeout = setTimeout(() => {
        this.recordTest('User Join', false, 'Timeout after 3 seconds');
        reject(new Error('Join timeout'));
      }, 3000);

      this.socket.on('join_success', (data) => {
        clearTimeout(timeout);
        console.log('✅ Join successful:', data);
        this.recordTest('User Join', true);
        resolve();
      });

      this.socket.on('join_error', (error) => {
        clearTimeout(timeout);
        console.log('❌ Join failed:', error);
        this.recordTest('User Join', false, error.error);
        reject(new Error(error.error));
      });

      this.socket.emit('join', {
        userId: '680b8c7eb9fed33e9c7f49b1',
        userType: 'user',
        name: 'Test User'
      });
    });
  }

  async testSendMessage() {
    return new Promise((resolve, reject) => {
      console.log('💬 Testing message sending...');

      const timeout = setTimeout(() => {
        this.recordTest('Send Message', false, 'Timeout after 5 seconds');
        reject(new Error('Send message timeout'));
      }, 5000);

      this.socket.on('message_sent', (data) => {
        clearTimeout(timeout);
        console.log('✅ Message sent successfully:', data);
        
        // Check if conversation ID is correct (not NaN_NaN)
        if (data.conversationId && data.conversationId !== 'NaN_NaN') {
          console.log('🎉 Conversation ID generated correctly:', data.conversationId);
          this.recordTest('Send Message', true);
        } else {
          console.log('❌ Conversation ID still broken:', data.conversationId);
          this.recordTest('Send Message', false, 'Invalid conversation ID');
        }
        resolve();
      });

      this.socket.on('message_error', (error) => {
        clearTimeout(timeout);
        console.log('❌ Message send failed:', error);
        this.recordTest('Send Message', false, error.error);
        reject(new Error(error.error));
      });

      this.socket.emit('send_message', {
        senderId: '680b8c7eb9fed33e9c7f49b1',
        senderType: 'user',
        recipientId: '680b8c4cb9fed33e9c7f49ad',
        message: 'Test message from automated test - ' + new Date().toISOString(),
        propertyTitle: 'Test Property'
      });
    });
  }

  async testTyping() {
    return new Promise((resolve) => {
      console.log('⌨️ Testing typing indicator...');

      // Generate correct conversation ID for typing test
      const userId1 = '680b8c7eb9fed33e9c7f49b1';
      const userId2 = '680b8c4cb9fed33e9c7f49ad';
      const conversationId = userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;

      this.socket.emit('typing', {
        conversationId: conversationId,
        userId: userId1,
        isTyping: true
      });

      setTimeout(() => {
        console.log('✅ Typing indicator sent');
        this.recordTest('Typing Indicator', true);
        resolve();
      }, 1000);
    });
  }

  async testMarkRead() {
    return new Promise((resolve) => {
      console.log('👁️ Testing mark as read...');

      // Generate correct conversation ID for mark read test
      const userId1 = '680b8c7eb9fed33e9c7f49b1';
      const userId2 = '680b8c4cb9fed33e9c7f49ad';
      const conversationId = userId1 < userId2 ? `${userId1}_${userId2}` : `${userId2}_${userId1}`;

      this.socket.on('marked_as_read', (data) => {
        console.log('✅ Mark as read confirmed:', data);
      });

      this.socket.emit('mark_read', {
        conversationId: conversationId,
        userId: userId1,
        userType: 'user'
      });

      setTimeout(() => {
        console.log('✅ Mark as read sent');
        this.recordTest('Mark as Read', true);
        resolve();
      }, 1000);
    });
  }

  async testDisconnection() {
    return new Promise((resolve) => {
      console.log('🔌 Testing disconnection...');

      this.socket.on('disconnect', () => {
        console.log('✅ Disconnected successfully');
        this.recordTest('Disconnection', true);
        resolve();
      });

      this.socket.disconnect();
    });
  }

  recordTest(testName, passed, error = null) {
    this.testResults.push({
      test: testName,
      passed,
      error
    });
  }

  printResults() {
    console.log('\n📊 Test Results:');
    console.log('================');
    
    let passed = 0;
    let failed = 0;

    this.testResults.forEach(result => {
      const status = result.passed ? '✅ PASS' : '❌ FAIL';
      const error = result.error ? ` (${result.error})` : '';
      console.log(`${status} - ${result.test}${error}`);
      
      if (result.passed) passed++;
      else failed++;
    });

    console.log(`\nTotal: ${this.testResults.length} | Passed: ${passed} | Failed: ${failed}`);
    
    if (failed === 0) {
      console.log('🎉 All tests passed! Check MongoDB Atlas for saved messages.');
    } else {
      console.log('⚠️ Some tests failed. Check your server setup.');
    }
  }
}

// Run the tests
const tester = new SocketTester();
tester.runTests().catch(console.error);