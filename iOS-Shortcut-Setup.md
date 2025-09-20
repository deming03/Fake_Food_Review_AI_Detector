# 📱 iOS Shortcuts Setup Guide

## 🎯 Create "Analyze Restaurant" Shortcut

### Step 1: Open Shortcuts App
1. Open the **Shortcuts** app on your iPhone
2. Tap the **"+"** button to create a new shortcut

### Step 2: Add Actions
1. **Search for "Share Sheet"** and add it
2. **Search for "Get URLs from Input"** and add it
3. **Search for "Open URL"** and add it

### Step 3: Configure the Actions

#### Action 1: Share Sheet
- **Receives:** URLs from Share Sheet
- **Used with:** Safari and other apps

#### Action 2: Get URLs from Input
- **Get URLs from:** Share Sheet

#### Action 3: Open URL
- **URL:** `fakefooddetector://analyze?url=[URLs]`
- Make sure to select **"URLs"** from the variable picker

### Step 4: Configure Shortcut Settings
1. Tap the settings icon (gear) at the top
2. **Name:** "Analyze Restaurant Reviews"
3. **Icon:** Choose a detective or food icon
4. **Color:** Orange (#FF6B35)
5. **Show in Share Sheet:** ON
6. **Use with:** Safari, Chrome, Maps

### Step 5: Set up Back Tap (Optional)
1. Go to **Settings > Accessibility > Touch > Back Tap**
2. Choose **Double Tap** or **Triple Tap**
3. Select **"Analyze Restaurant Reviews"** shortcut

## 🚀 How to Use

### Method 1: From Google Maps
1. **Open Google Maps** app
2. **Find a restaurant** and open its page
3. **Tap Share button**
4. **Select "Analyze Restaurant Reviews"**
5. **Your app will open** and start analysis!

### Method 2: From Safari
1. **Open restaurant page** in any browser
2. **Tap Share button**
3. **Select "Analyze Restaurant Reviews"**
4. **Analysis starts automatically**

### Method 3: Back Tap (if configured)
1. **Open any restaurant page**
2. **Double/Triple tap** back of phone
3. **Shortcut runs automatically**

## 🔗 URL Scheme Format

Your app responds to these URL schemes:
- `fakefooddetector://analyze?url=RESTAURANT_URL`
- `fakefooddetector://home`
- `fakefooddetector://history`

## ✅ Testing the Shortcut

1. **Find any restaurant** on Google Maps
2. **Share it** using your shortcut
3. **Check if your app opens** with the analysis screen
4. **Verify the URL is passed** correctly

The deep linking is now configured in your React Native app to automatically receive and process these URLs!
