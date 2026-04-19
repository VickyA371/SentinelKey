package com.sentinelkey.autofill

import android.service.autofill.*
import android.view.autofill.AutofillValue
import android.app.assist.AssistStructure
import android.os.Build
import android.os.CancellationSignal
import android.text.InputType
import android.view.autofill.AutofillId
import android.widget.RemoteViews
import androidx.annotation.RequiresApi
import android.view.View

@RequiresApi(Build.VERSION_CODES.O)
fun buildDataset(
    parsed: ParsedData,
    username: String?,
    password: String?
): Dataset? {

    val presentation = RemoteViews(
        "com.sentinelkey",
        android.R.layout.simple_list_item_1
    ).apply {
        setTextViewText(android.R.id.text1, "Autofill with SentinelKey")
    }

    val builder = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
        val presentations = Presentations.Builder()
            .setMenuPresentation(presentation)
            .build()

        Dataset.Builder(presentations)
    } else {
        Dataset.Builder(presentation)
    }

    var hasAtLeastOneField = false

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {

        parsed.usernameId?.let {
            val field = Field.Builder()
                .setValue(AutofillValue.forText(username))
                .build()

            builder.setField(it, field)
            hasAtLeastOneField = true
        }

        parsed.passwordId?.let {
            val field = Field.Builder()
                .setValue(AutofillValue.forText(password))
                .build()

            builder.setField(it, field)
            hasAtLeastOneField = true
        }

    } else {

        parsed.usernameId?.let {
            builder.setValue(it, AutofillValue.forText(username))
            hasAtLeastOneField = true
        }

        parsed.passwordId?.let {
            builder.setValue(it, AutofillValue.forText(password))
            hasAtLeastOneField = true
        }
    }

    // 🚨 CRITICAL FIX
    if (!hasAtLeastOneField) {
        return null // ⛔ DON'T build empty dataset
    }

    return builder.build()
}

data class ParsedData(
    var usernameId: AutofillId? = null,
    var passwordId: AutofillId? = null,
    var usernameValue: String? = null,
    var passwordValue: String? = null
)

@RequiresApi(Build.VERSION_CODES.O)
fun parseStructure(structure: AssistStructure): ParsedData {
    val parsed = ParsedData()

    val nodes = ArrayDeque<AssistStructure.ViewNode>()
    for (i in 0 until structure.windowNodeCount) {
        nodes.add(structure.getWindowNodeAt(i).rootViewNode)
    }

    while (nodes.isNotEmpty()) {
        val node = nodes.removeFirst()

        val hint = node.hint ?: ""
        val idEntry = node.idEntry ?: ""

        node.autofillHints?.forEach {
            when (it) {
                View.AUTOFILL_HINT_USERNAME,
                View.AUTOFILL_HINT_EMAIL_ADDRESS -> {
                    parsed.usernameId = node.autofillId
                    parsed.usernameValue = node.text?.toString()
                }

                View.AUTOFILL_HINT_PASSWORD -> {
                    parsed.passwordId = node.autofillId
                    parsed.passwordValue = node.text?.toString()
                }
            }
        }

        // Detect username
        if (hint.contains("email", true) || idEntry.contains("username", true)) {
            parsed.usernameId = node.autofillId
            parsed.usernameValue = node.text?.toString()
        }

        val inputType = node.inputType

        if ((inputType and InputType.TYPE_TEXT_VARIATION_PASSWORD) != 0 ||
            (inputType and InputType.TYPE_NUMBER_VARIATION_PASSWORD) != 0
        ) {
            parsed.passwordId = node.autofillId
            parsed.passwordValue = node.text?.toString()
        }
        for (i in 0 until node.childCount) {
            nodes.add(node.getChildAt(i))
        }
    }

    return parsed
}

@RequiresApi(Build.VERSION_CODES.O)
class MyAutofillService : AutofillService() {

    override fun onFillRequest(
        request: FillRequest,
        cancellationSignal: CancellationSignal,
        callback: FillCallback
    ) {
        val structure = request.fillContexts.last().structure
        val parsedData = parseStructure(structure)

        val (username, password) = CredentialStore.get(this)

        val dataset = buildDataset(parsedData, username, password)

        val responseBuilder = FillResponse.Builder()

        dataset?.let {
            responseBuilder.addDataset(it)
        }

        val ids = mutableListOf<AutofillId>()
        parsedData.usernameId?.let { ids.add(it) }
        parsedData.passwordId?.let { ids.add(it) }

        if (ids.isNotEmpty()) {
            val saveInfo = SaveInfo.Builder(
                SaveInfo.SAVE_DATA_TYPE_USERNAME or SaveInfo.SAVE_DATA_TYPE_PASSWORD,
                ids.toTypedArray()
            )
                .setFlags(SaveInfo.FLAG_SAVE_ON_ALL_VIEWS_INVISIBLE)
                .build()

            responseBuilder.setSaveInfo(saveInfo)
        }

        callback.onSuccess(responseBuilder.build())
    }

    override fun onSaveRequest(
        request: SaveRequest,
        callback: SaveCallback
    ) {
        val structure = request.fillContexts.last().structure

        val parsedData = parseStructure(structure)

        val username = parsedData.usernameValue
        val password = parsedData.passwordValue

        // TODO: Save securely (EncryptedSharedPrefs / Keystore)
        saveCredentials(username, password)

        callback.onSuccess()
    }

    fun saveCredentials(username: String?, password: String?) {
        // Use EncryptedSharedPreferences (recommended)
        if (!username.isNullOrEmpty() && !password.isNullOrEmpty()) {
            CredentialStore.save(this, username, password)
        }
    }
}