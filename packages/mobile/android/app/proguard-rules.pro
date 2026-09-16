# Add project specific ProGuard rules here.
# By default, the flags in this file are appended to flags specified
# in /usr/local/Cellar/android-sdk/24.3.3/tools/proguard/proguard-android.txt
# You can edit the include path and order by changing the proguardFiles
# directive in build.gradle.
#
# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# Add any project specific keep options here:

# --- SentinelKey: keep security-critical native modules from R8 stripping ---
# These are reached across the RN JNI bridge; R8 can't see those call sites.
# (React Native core, Reanimated, and Firebase ship their own consumer rules.)
-keep class com.tectiv3.aes.** { *; }      # react-native-aes-crypto
-keep class com.oblador.keychain.** { *; } # react-native-keychain
-keep class com.rnbiometrics.** { *; }     # react-native-biometrics
# If a release build misbehaves, add targeted -keep rules for the offending lib.
