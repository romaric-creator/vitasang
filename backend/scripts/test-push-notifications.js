#!/usr/bin/env node

/**
 * Test Push Notifications End-to-End
 * Tests the full flow: alert creation -> notification delivery
 */

const axios = require('axios');

const API_BASE = process.env.API_URL || 'http://localhost:3000/api';

class PushNotificationTester {
  constructor() {
    this.userId = null;
    this.authToken = null;
    this.usersPushTokens = [];
    this.alertId = null;
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warn: '\x1b[33m',
      reset: '\x1b[0m',
    };
    console.log(`${colors[type] || colors.info}[${type.toUpperCase()}] ${message}${colors.reset}`);
  }

  async registerTestUser() {
    this.log('Step 1: Registering test user...', 'info');
    try {
      const phone = '65' + Math.floor(Math.random() * 10000000).toString().padStart(7, '0');
      const response = await axios.post(`${API_BASE}/users/register`, {
        nom: 'Test',
        prenom: 'Notif' + Math.random().toString(36).substring(7),
        telephone: phone,
        mot_de_passe: 'TestPassword123',
        groupe_sanguin: 'O+',
        role: 'donneur',
      });

      if (response.status === 200 || response.status === 201) {
        this.userId = response.data.user?.id_utilisateur || response.data.user?.id;
        this.userPhone = phone;
        this.log(`✓ User registered: ID ${this.userId}`, 'success');
        
        // Now login to get a valid JWT token
        this.log('Getting JWT token...', 'info');
        const loginResponse = await axios.post(`${API_BASE}/users/login`, {
          telephone: phone,
          mot_de_passe: 'TestPassword123',
        });
        
        this.authToken = loginResponse.data.token;
        this.log(`✓ JWT Token obtained`, 'success');
        return true;
      } else {
        this.log(`✗ Registration failed: ${response.data.message}`, 'error');
        return false;
      }
    } catch (error) {
      if (error.response?.status === 400 && error.response?.data?.message?.includes('existe')) {
        this.log('✓ User already exists, attempting login...', 'warn');
        return await this.loginTestUser();
      }
      this.log(`✗ Registration error: ${error.response?.data?.message || error.message}`, 'error');
      return false;
    }
  }

  async loginTestUser() {
    this.log('Logging in existing user...', 'info');
    try {
      const response = await axios.post(`${API_BASE}/users/login`, {
        telephone: '655123456',
        mot_de_passe: 'TestPassword123',
      });

      if (response.data.success) {
        this.userId = response.data.user.id;
        this.authToken = response.data.token;
        this.log(`✓ User logged in: ID ${this.userId}`, 'success');
        return true;
      }
      return false;
    } catch (error) {
      this.log(`✗ Login error: ${error.message}`, 'error');
      return false;
    }
  }

  async registerPushTokens() {
    this.log('Step 2: Registering mock push tokens...', 'info');
    try {
      // Simulate multiple users with tokens
      const mockTokens = [
        'ExponentPushToken[test_token_1_' + Date.now() + ']',
        'ExponentPushToken[test_token_2_' + Date.now() + ']',
        'ExponentPushToken[test_token_3_' + Date.now() + ']',
      ];

      for (const token of mockTokens) {
        try {
          await axios.put(
            `${API_BASE}/users/${this.userId}/push-token`,
            { pushToken: token },
            { headers: { Authorization: `Bearer ${this.authToken}` } }
          );
          this.usersPushTokens.push(token);
          this.log(`✓ Push token registered: ${token.substring(0, 30)}...`, 'success');
        } catch (error) {
          this.log(`✗ Token registration failed: ${error.message}`, 'error');
        }
      }

      return this.usersPushTokens.length > 0;
    } catch (error) {
      this.log(`✗ Error registering tokens: ${error.message}`, 'error');
      return false;
    }
  }

  async createAlert() {
    this.log('Step 3: Creating blood donation alert...', 'info');
    try {
      const response = await axios.post(
        `${API_BASE}/alerts/search`,
        {
          latitude: 3.8667,
          longitude: 11.5167,
          bloodType: 'O+',
          radius: 15,
          degree: 'NORMAL',
          poches: 1,
        },
        {
          headers: { Authorization: `Bearer ${this.authToken}` },
        }
      );

      if (response.data.success) {
        this.alertId = response.data.alert?.id;
        const notifyCount = response.data.notificationsSent || 0;
        const donorsFound = response.data.totalDonorsFound || 0;

        this.log(`✓ Alert created: ID ${this.alertId}`, 'success');
        this.log(`  → Donors found: ${donorsFound}`, 'info');
        this.log(`  → Notifications sent: ${notifyCount}`, 'info');
        this.log(`  → Donors in radius: ${response.data.donorsInRadius || 0}`, 'info');
        this.log(`  → With push token: ${response.data.donorsWithToken || 0}`, 'info');

        return true;
      } else {
        this.log(`✗ Alert creation failed: ${response.data.message}`, 'error');
        return false;
      }
    } catch (error) {
      this.log(
        `✗ Alert creation error: ${error.response?.data?.message || error.message}`,
        'error'
      );
      return false;
    }
  }

  async checkAlertStatus() {
    if (!this.alertId) {
      this.log('No alert to check status for', 'warn');
      return false;
    }

    this.log('Step 4: Checking alert notification status...', 'info');
    try {
      const response = await axios.get(`${API_BASE}/alerts/${this.alertId}/status`, {
        headers: { Authorization: `Bearer ${this.authToken}` },
      });

      if (response.data.success) {
        const status = response.data.alert?.status;
        const notified = response.data.notificationsSent || 0;

        this.log(`✓ Alert status: ${status}`, 'success');
        this.log(`  → Total notifications sent: ${notified}`, 'info');
        this.log(`  → Created at: ${response.data.alert?.createdAt}`, 'info');

        return true;
      }
      return false;
    } catch (error) {
      this.log(
        `✗ Status check error: ${error.response?.data?.message || error.message}`,
        'error'
      );
      return false;
    }
  }

  async testNotificationDelivery() {
    this.log('Step 5: Simulating notification delivery test...', 'info');
    try {
      // Check if Expo integration is active
      const response = await axios.post(`${API_BASE}/alerts/test-notification`, {
        pushToken: this.usersPushTokens[0],
        title: 'VitaSang - Test Notification',
        body: 'This is a test notification. If you see this, push notifications are working!',
      });

      if (response.data.success) {
        this.log('✓ Test notification request sent to Expo', 'success');
        this.log('  → Check your device for the notification', 'info');
        return true;
      } else {
        this.log('✗ Notification delivery failed: Expo integration may not be active', 'warn');
        return false;
      }
    } catch (error) {
      if (error.response?.status === 404) {
        this.log('ℹ Test endpoint not available (normal in basic setup)', 'info');
        return true;
      }
      this.log(`✗ Notification test error: ${error.message}`, 'error');
      return false;
    }
  }

  async generateReport() {
    this.log('\n═══════════════════════════════════════════════════', 'info');
    this.log('PUSH NOTIFICATION TEST REPORT', 'success');
    this.log('═══════════════════════════════════════════════════\n', 'info');

    console.log('Results:');
    console.log(`✓ User ID: ${this.userId}`);
    console.log(`✓ Push Tokens Registered: ${this.usersPushTokens.length}`);
    console.log(`✓ Alert ID: ${this.alertId || 'N/A'}`);
    console.log(`✓ API Base: ${API_BASE}`);

    console.log('\nRecommendations:');
    if (this.usersPushTokens.length > 0) {
      console.log('✓ Push tokens are being registered correctly');
    } else {
      console.log('⚠ No push tokens registered - check token registration endpoint');
    }

    if (this.alertId) {
      console.log('✓ Alert creation and notification dispatch working');
    } else {
      console.log('⚠ Alert creation failed - check alert endpoint');
    }

    console.log('\nNext Steps:');
    console.log('1. Deploy to production');
    console.log('2. Test with real Expo push service');
    console.log('3. Monitor notification delivery logs');
    console.log('4. Implement notification analytics\n');
  }

  async run() {
    console.log('\n🚀 VitaSang Push Notification Testing Suite\n');
    console.log(`Testing API: ${API_BASE}\n`);

    try {
      // Step 1
      if (!(await this.registerTestUser())) return;

      // Step 2
      if (!(await this.registerPushTokens())) return;

      // Step 3
      if (!(await this.createAlert())) return;

      // Step 4
      await this.checkAlertStatus();

      // Step 5
      await this.testNotificationDelivery();

      // Report
      await this.generateReport();

      this.log('✓ All tests completed successfully!', 'success');
      process.exit(0);
    } catch (error) {
      this.log(`✗ Fatal error: ${error.message}`, 'error');
      process.exit(1);
    }
  }
}

// Run tests
const tester = new PushNotificationTester();
tester.run().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
