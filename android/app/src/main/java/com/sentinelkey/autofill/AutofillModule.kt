package com.sentinelkey.autofill

import android.os.Build
import android.view.autofill.AutofillManager
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AutofillModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "Autofill"
    }

    private fun getAutofillManager(): AutofillManager? {
        return if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            currentActivity?.getSystemService(AutofillManager::class.java)
        } else {
            null
        }
    }

    @ReactMethod
    fun commit() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getAutofillManager()?.commit()
        }
    }

    @ReactMethod
    fun cancel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            getAutofillManager()?.cancel()
        }
    }
}
