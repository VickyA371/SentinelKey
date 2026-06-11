# ============================================================
# SentinelKey ProGuard / R8 Rules
# ============================================================

# ── React Native ─────────────────────────────────────────────
-keep class com.facebook.react.** { *; }
-keep class com.facebook.hermes.** { *; }
-keep class com.facebook.jni.** { *; }
-dontwarn com.facebook.react.**
-dontwarn com.facebook.hermes.**
-dontwarn com.facebook.jni.**

# ── React Native New Architecture (TurboModules / Fabric) ────
-keep class com.facebook.react.turbomodule.** { *; }
-keep class com.facebook.react.fabric.** { *; }
-keep class com.facebook.react.uimanager.** { *; }

# ── Firebase ─────────────────────────────────────────────────
-keep class com.google.firebase.** { *; }
-keep class com.google.android.gms.** { *; }
-dontwarn com.google.firebase.**
-dontwarn com.google.android.gms.**

# Required for Firebase Crashlytics
-keepattributes SourceFile,LineNumberTable
-keep public class * extends java.lang.Exception
-keep class com.google.firebase.crashlytics.** { *; }
-dontwarn com.google.firebase.crashlytics.**

# ── Reanimated / Worklets ────────────────────────────────────
-keep class com.swmansion.reanimated.** { *; }
-keep class com.swmansion.worklets.** { *; }
-dontwarn com.swmansion.reanimated.**
-dontwarn com.swmansion.worklets.**

# ── Gesture Handler ──────────────────────────────────────────
-keep class com.swmansion.gesturehandler.** { *; }
-dontwarn com.swmansion.gesturehandler.**

# ── React Native Screens ─────────────────────────────────────
-keep class com.swmansion.rnscreens.** { *; }
-dontwarn com.swmansion.rnscreens.**

# ── React Native Keychain ────────────────────────────────────
-keep class com.oblador.keychain.** { *; }
-dontwarn com.oblador.keychain.**

# ── React Native Biometrics ──────────────────────────────────
-keep class com.rnbiometrics.** { *; }
-dontwarn com.rnbiometrics.**

# ── React Native AES Crypto ──────────────────────────────────
-keep class com.tectiv3.aes.** { *; }
-dontwarn com.tectiv3.aes.**

# ── React Native Vector Icons ────────────────────────────────
-keep class com.oblador.vectoricons.** { *; }
-dontwarn com.oblador.vectoricons.**

# ── React Native Clipboard ───────────────────────────────────
-keep class com.reactnativecommunity.clipboard.** { *; }
-dontwarn com.reactnativecommunity.clipboard.**

# ── React Native Safe Area Context ───────────────────────────
-keep class com.th3rdwave.safeareacontext.** { *; }
-dontwarn com.th3rdwave.safeareacontext.**

# ── OkHttp (used internally by React Native / Firebase) ──────
-dontwarn okhttp3.**
-dontwarn okio.**
-keep class okhttp3.** { *; }
-keep interface okhttp3.** { *; }

# ── General Android / Java ───────────────────────────────────
# Keep native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# Keep Parcelable implementations
-keep class * implements android.os.Parcelable {
    public static final android.os.Parcelable$Creator *;
}

# Keep Serializable classes
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# Keep Enums
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep custom Application class
-keep class com.sentinelkey.** { *; }

# ── Debugging ────────────────────────────────────────────────
# Preserve source file names and line numbers for stack traces
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile
