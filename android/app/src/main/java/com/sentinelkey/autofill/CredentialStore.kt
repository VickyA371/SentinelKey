package com.sentinelkey.autofill

import android.content.Context
import androidx.security.crypto.EncryptedSharedPreferences
import androidx.security.crypto.MasterKey

object CredentialStore {

    private const val FILE_NAME = "sentinel_secure_prefs"

    private fun getPrefs(context: Context): EncryptedSharedPreferences {
        val masterKey = MasterKey.Builder(context)
            .setKeyScheme(MasterKey.KeyScheme.AES256_GCM)
            .build()

        return EncryptedSharedPreferences.create(
            context,
            FILE_NAME,
            masterKey,
            EncryptedSharedPreferences.PrefKeyEncryptionScheme.AES256_SIV,
            EncryptedSharedPreferences.PrefValueEncryptionScheme.AES256_GCM
        ) as EncryptedSharedPreferences
    }

    // ✅ Save credentials
    fun save(context: Context, username: String, password: String) {
        val prefs = getPrefs(context)

        prefs.edit()
            .putString("username", username)
            .putString("password", password)
            .apply()
    }

    // ✅ Retrieve credentials
    fun get(context: Context): Pair<String?, String?> {
        val prefs = getPrefs(context)

        val username = prefs.getString("username", null)
        val password = prefs.getString("password", null)

        return Pair(username, password)
    }

    // ❌ Optional: clear data
    fun clear(context: Context) {
        getPrefs(context).edit().clear().apply()
    }
}