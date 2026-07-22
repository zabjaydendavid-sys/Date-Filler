const input = document.getElementById("input");
const output = document.getElementById("output");

// Paste button
document.getElementById("paste").addEventListener("click", async () => {
    try {
        input.value = await navigator.clipboard.readText();
    } catch {
        alert("Clipboard access denied.");
    }
});

// Process button
document.getElementById("process").addEventListener("click", () => {
    if (!input.value.trim()) {
        alert("Please paste your data first.");
        return;
    }

    // Placeholder until we add the parser
    output.value = "Processing...\n\n" + input.value;
});

// Copy Output button
document.getElementById("copy").addEventListener("click", async () => {
    if (!output.value.trim()) {
        alert("Nothing to copy.");
        return;
    }

    try {
        await navigator.clipboard.writeText(output.value);
        alert("Output copied!");
    } catch {
        alert("Failed to copy.");
    }
});
