/**
 * FCM Credentials Validator
 * Tests Firebase Cloud Messaging credentials using ONLY REST APIs
 * No third-party libraries required!
 */

/**
 * Base64URL encode (RFC 4648)
 */
function base64urlEncode(str) {
    return btoa(str)
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

/**
 * Import private key for signing (Browser Web Crypto API)
 */
async function importPrivateKey(privateKeyPem) {
    try {
        // Remove PEM header/footer and whitespace
        const pemContent = privateKeyPem
            .replace('-----BEGIN PRIVATE KEY-----', '')
            .replace('-----END PRIVATE KEY-----', '')
            .replace(/\s/g, '');
        
        // Convert base64 to binary
        const binaryKey = atob(pemContent);
        const keyData = new Uint8Array(binaryKey.length);
        for (let i = 0; i < binaryKey.length; i++) {
            keyData[i] = binaryKey.charCodeAt(i);
        }

        // Import the key
        return await crypto.subtle.importKey(
            'pkcs8',
            keyData,
            {
                name: 'RSASSA-PKCS1-v1_5',
                hash: 'SHA-256',
            },
            false,
            ['sign']
        );
    } catch (error) {
        throw new Error('Failed to import private key');
    }
}

/**
 * Create and sign JWT using Web Crypto API (Browser native)
 */
async function createSignedJWT(serviceAccount) {
    try {
        const now = Math.floor(Date.now() / 1000);
        
        // JWT Header
        const header = {
            alg: 'RS256',
            typ: 'JWT',
            kid: serviceAccount.private_key_id
        };

        // JWT Payload
        const payload = {
            iss: serviceAccount.client_email,
            sub: serviceAccount.client_email,
            aud: serviceAccount.token_uri,
            iat: now,
            exp: now + 3600,
            scope: 'https://www.googleapis.com/auth/firebase.messaging'
        };

        // Encode header and payload
        const encodedHeader = base64urlEncode(JSON.stringify(header));
        const encodedPayload = base64urlEncode(JSON.stringify(payload));
        const unsignedToken = `${encodedHeader}.${encodedPayload}`;

        // Import private key
        const privateKey = await importPrivateKey(serviceAccount.private_key);

        // Sign the token
        const encoder = new TextEncoder();
        const data = encoder.encode(unsignedToken);
        const signature = await crypto.subtle.sign(
            'RSASSA-PKCS1-v1_5',
            privateKey,
            data
        );

        // Convert signature to base64url
        const signatureArray = new Uint8Array(signature);
        let signatureStr = '';
        for (let i = 0; i < signatureArray.length; i++) {
            signatureStr += String.fromCharCode(signatureArray[i]);
        }
        const encodedSignature = base64urlEncode(signatureStr);

        // Return complete JWT
        return `${unsignedToken}.${encodedSignature}`;
    } catch (error) {
        throw new Error('Failed to create JWT: ' + error?.message);
    }
}

/**
 * Get OAuth2 Access Token from Google
 * Pure REST API call - no libraries needed
 */
async function getOAuthAccessToken(jwt, serviceAccount) {
    try {
        const response = await fetch(serviceAccount.token_uri, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: new URLSearchParams({
                grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
                assertion: jwt
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error_description || 'Failed to get access token');
        }

        const data = await response.json();
        return data.access_token;
    } catch (error) {
        throw new Error('Failed to get OAuth token: ' + error?.message);
    }
}

/**
 * Test FCM API Access
 * Pure REST API call to Firebase Cloud Messaging
 */
async function testFCMAPIAccess(accessToken, projectId) {
    try {
        const fcmUrl = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`;
        
        const response = await fetch(fcmUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                validate_only: true,
                message: {
                    token: 'test_device_token_for_validation',
                    notification: {
                        title: 'Test Notification',
                        body: 'Testing FCM credentials'
                    }
                }
            })
        });

        const responseData = await response.json();

        // Check response status
        if (response?.status === 401 || response?.status === 403) {
            throw new Error('Authentication failed. Please check your service account has FCM permissions.');
        }

        // 400 with validation error is actually SUCCESS - means we have access but invalid token
        if (response?.status === 400) {
            // Check if it's an authentication error or validation error
            if (responseData?.error?.status === 'UNAUTHENTICATED') {
                throw new Error('Invalid credentials');
            }
            // If it's a validation error about the token, that's actually good!
            // It means we authenticated successfully
            return {
                success: true,
                message: 'FCM credentials verified successfully! Authentication works.',
                hasAccess: true
            };
        }

        // 200 means everything worked perfectly
        if (response?.status === 200) {
            return {
                success: true,
                message: 'FCM credentials verified successfully!',
                hasAccess: true
            };
        }

        // Other errors
        throw new Error(responseData.error?.message || 'Unknown error occurred');

    } catch (error) {
        throw error;
    }
}

/**
 * Main function: Validate FCM Credentials
 * Complete flow using only REST APIs and Web Crypto
 * 
 * @param {Object} serviceAccount - Firebase service account JSON
 * @returns {Promise<Object>} - Validation result
 */
export async function validateFCMCredentials(serviceAccount) {
    try {
        // Step 1: Validate service account structure
        const requiredFields = [
            'type', 'project_id', 'private_key_id', 'private_key',
            'client_email', 'client_id', 'auth_uri', 'token_uri',
            'auth_provider_x509_cert_url', 'client_x509_cert_url'
        ];

        const missingFields = requiredFields.filter((field) => serviceAccount?.[field] == null || serviceAccount?.[field] === '');
        if (missingFields.length > 0) {
            throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
        }

        if (serviceAccount?.type !== 'service_account') {
            throw new Error('Invalid service account type');
        }

        // Step 2: Create signed JWT
                const jwt = await createSignedJWT(serviceAccount);

        // Step 3: Get OAuth access token
                const accessToken = await getOAuthAccessToken(jwt, serviceAccount);

        // Step 4: Test FCM API access
                const result = await testFCMAPIAccess(accessToken, serviceAccount?.project_id);

        return {
            success: true,
            message: result?.message ?? '',
            data: {
                project_id: serviceAccount?.project_id,
                client_email: serviceAccount?.client_email,
                has_fcm_access: true,
                tested_at: new Date().toISOString()
            }
        };

    } catch (error) {
        return {
            success: false,
            message: error?.message || 'Failed to validate FCM credentials',
            error: error.toString()
        };
    }
}

/**
 * Alternative: Simplified validation (checks OAuth only)
 * Faster but less comprehensive
 */
export async function quickValidateFCMCredentials(serviceAccount) {
    try {
        // Just check if we can get an OAuth token
        const jwt = await createSignedJWT(serviceAccount);
        const accessToken = await getOAuthAccessToken(jwt, serviceAccount);

        if (accessToken) {
            return {
                success: true,
                message: 'OAuth authentication successful! Credentials are valid.',
                data: {
                    project_id: serviceAccount.project_id,
                    has_oauth_access: true
                }
            };
        }
    } catch (error) {
        return {
            success: false,
            message: error?.message || 'Failed to validate credentials'
        };
    }
}

export default {
    validateFCMCredentials,
    quickValidateFCMCredentials
};

